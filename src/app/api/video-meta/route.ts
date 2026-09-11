import { getCurrentUser } from "@/lib/auth";
import { toBn } from "@/lib/bangla";
import { extractDriveId } from "@/lib/drive";
import { extractYouTubeId } from "@/lib/video";

export const dynamic = "force-dynamic";

/**
 * ভিডিও মেটাডেটা প্রক্সি — অ্যাডমিন ফর্মে লিংক পেস্ট করলে স্বয়ংক্রিয়ভাবে
 * শিরোনাম ও সময় আনার জন্য।
 *
 * - YouTube: oEmbed API (শিরোনাম) + ওয়াচ পেজের lengthSeconds (সময়)
 * - Google Drive: পাবলিক ফাইলের <title> থেকে ফাইলনাম (সময় নির্ধারণ করা যায় না)
 *
 * নিরাপত্তা: ইউজারের দেওয়া URL কখনো সরাসরি fetch করা হয় না — শুধু
 * স্বীকৃত প্যাটার্ন থেকে YouTube/Drive আইডি বের করে আমাদের তৈরি নির্দিষ্ট
 * URL-গুলোই আনা হয় (SSRF-নিরাপদ)। শুধুমাত্র লগইন-করা অ্যাডমিন ব্যবহার করতে পারেন।
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function decodeEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/** সেকেন্ড → বাংলা পঠনযোগ্য সময় (যেমন "২৫ মিনিট", "১ ঘণ্টা ৫ মিনিট") */
function formatSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${toBn(h)} ঘণ্টা`);
  if (m > 0) parts.push(`${toBn(m)} মিনিট`);
  if (h === 0 && m === 0 && s > 0) parts.push(`${toBn(s)} সেকেন্ড`);
  return parts.join(" ");
}

async function fetchYouTubeMeta(videoId: string) {
  let title = "";
  let duration = "";

  // ১) শিরোনাম — কী-ছাড়া পাবলিক oEmbed API
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${videoId}`
      )}&format=json`,
      { cache: "no-store", signal: AbortSignal.timeout(6000) }
    );
    if (res.ok) {
      const json = (await res.json()) as { title?: string };
      title = (json.title ?? "").trim();
    }
  } catch {
    // নেটওয়ার্ক/টাইমআউট — চুপচাপ ফলব্যাক
  }

  // ২) সময় — ওয়াচ পেজের ytInitialPlayerResponse থেকে lengthSeconds
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
      headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" },
    });
    if (res.ok) {
      const html = await res.text();
      const match = html.match(/"lengthSeconds":"(\d+)"/);
      if (match) duration = formatSeconds(Number(match[1]));
    }
  } catch {
    // চুপচাপ ফলব্যাক — সময় ম্যানুয়ালি দেওয়া যাবে
  }

  return { provider: "youtube", title, duration };
}

/**
 * ড্রাইভ ফাইলনামের শেষে থাকা সাধারণ ভিডিও/ফাইল এক্সটেনশন বাদ দেয়।
 * যেমন "Course Outline Part 1.mp4" → "Course Outline Part 1"
 */
const FILE_EXTENSION_RE =
  /\.(mp4|m4v|ts|mkv|avi|mov|webm|flv|wmv|vob|mpg|mpeg|3gp|mp3|wav|m4a|aac|pdf|docx?|xlsx?|pptx?|csv|zip|rar|7z|txt)\s*$/i;

function cleanFileName(name: string): string {
  return name.replace(FILE_EXTENSION_RE, "").trim();
}

/**
 * ── ড্রাইভ ভিডিওর সময় — MP4 বাইনারি প্রোব ──
 * ফাইল বাইটের শুধু শুরু/শেষ চাংক পড়ে mvhd অ্যাটম পার্স করে, তাই
 * ৫০০MB ফাইলেও সবচেয়ে বেশি ~৩২০KB ডাউনলোড হয়। ভাইরাস-স্ক্যান
 * ইন্টারমিডিয়েট পেজের uuid টোকেন অবলম্বন করে আসল ফাইল আনা হয়
 * (gdown-এর মতোই প্রবাহ — পাবলিক ফাইলে নির্ভরযোগ্য)।
 */

const PROBE_BYTES = 160 * 1024; // প্রতিটি প্রোবে পড়ব ~১৬০KB

/** ব্যাখুকুহবারি স্ট্রিমের শুধু প্রথম maxBytes পড়ে বাকি বাতিল করে */
async function readPrefix(res: Response, maxBytes: number): Promise<Uint8Array> {
  if (!res.body) return new Uint8Array(0);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (total < maxBytes) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      total += value.length;
    }
  } catch {
    // আংশিক বাইট রাখেই থামি
  } finally {
    try {
      await reader.cancel();
    } catch {
      // উপেক্ষা
    }
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** বাফারে ascii প্যাটার্নের প্রথম অবস্থান খুঁজে দেয় */
function findBytes(buf: Uint8Array, pattern: number[], from = 0): number {
  outer: for (let i = from; i <= buf.length - pattern.length; i++) {
    for (let j = 0; j < pattern.length; j++) {
      if (buf[i + j] !== pattern[j]) continue outer;
    }
    return i;
  }
  return -1;
}

/** MP4/MOV: mvhd অ্যাটম থেকে সময় (সেকেন্ডে) */
function parseMvhd(buf: Uint8Array): number | null {
  const MVHD = [0x6d, 0x76, 0x68, 0x64]; // 'mvhd'
  const i = findBytes(buf, MVHD);
  if (i < 0) return null;
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const version = buf[i + 4];
  try {
    let timescale = 0;
    let duration = 0;
    if (version === 0) {
      timescale = view.getUint32(i + 16); // BE
      duration = view.getUint32(i + 20);
    } else if (version === 1) {
      timescale = view.getUint32(i + 28);
      duration = Number(view.getBigUint64(i + 32));
    } else {
      return null;
    }
    if (timescale <= 0 || duration <= 0) return null;
    const seconds = duration / timescale;
    // অযৌক্তিক মান বাদ (৭ দিনের বেশি ভিডিও নয়)
    if (seconds <= 0 || seconds > 7 * 24 * 3600) return null;
    return seconds;
  } catch {
    return null;
  }
}

/** EBML (MKV/WebM): Duration এলিমেন্ট থেকে সময় — ডিফল্ট টাইমস্কেল ১ms */
function parseEbmlDuration(buf: Uint8Array): number | null {
  const EB = [0x44, 0x89]; // Duration element id (parent info)
  let from = 0;
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  while (true) {
    const i = findBytes(buf, EB, from);
    if (i < 0 || i + 3 >= buf.length) return null;
    const size = buf[i + 2];
    try {
      let val = 0;
      if (size === 0x84) val = view.getFloat32(i + 3);
      else if (size === 0x88) val = view.getFloat64(i + 3);
      else {
        from = i + 2;
        continue;
      }
      if (val > 0 && val < 1e9) return val / 1000; // ms → sec
    } catch {
      return null;
    }
    from = i + 2;
  }
}

/** ভিডিও মেটাডেটা বাইট থেকে পার্স — MP4 হোক বা MKV/WebM */
function parseDurationFromBytes(buf: Uint8Array): number | null {
  return parseMvhd(buf) ?? parseEbmlDuration(buf);
}

/** Content-Range হেডার থেকে মোট ফাইলের আকার বের করে */
function totalFromContentRange(res: Response): number | null {
  const cr = res.headers.get("content-range") ?? "";
  const match = cr.match(/\/(\d+)\s*$/);
  return match ? Number(match[1]) : null;
}

/** undici getSetCookie()-এর টাইপ-সেফ র‍্যাপার স্থিত */
function setCookieHeader(res: Response): string {
  const headers = res.headers as unknown as { getSetCookie?: () => string[] };
  const cookies =
    typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  return cookies.join("; ");
}

/**
 * ড্রাইভ ফাইলের সময় নির্ণয় — সর্বোচ্চ ৩টি ছোট রিকোয়েস্ট (হেড চাংক + টেইল চাংক)।
 * ১) uc?export=download → (বাইনারি হলেই সরাসরি, HTML হলে uuid পার্স)
 * ২) হেড চাংক পার্স; না পেলে Content-Length জেনে টেইল চাংক পার্স
 */
async function probeDriveDuration(fileId: string): Promise<number | null> {
  // ── লেভেল ১: uc ডাউনলোড প্রবেশপথ ──
  const first = await fetch(
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
      headers: { "user-agent": UA, Range: `bytes=0-${PROBE_BYTES - 1}` },
    }
  ).catch(() => null);
  if (!first || !first.ok) return null;

  const ctype = (first.headers.get("content-type") ?? "").toLowerCase();
  let headBytes: Uint8Array;
  let totalSize: number | null = null;
  let binaryUrl: string;

  if (ctype.includes("text/html")) {
    // ভাইরাস-স্ক্যান পেজ → uuid টোকেন বের করে আসল ফাইলের URL
    const html = await first.text();
    const uuid = html.match(/name="uuid" value="([a-f0-9-]{36})"/i)?.[1];
    if (!uuid) return null;

    binaryUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t&uuid=${uuid}`;
    const cookies = setCookieHeader(first);

    const binaryRes = await fetch(binaryUrl, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
      headers: {
        "user-agent": UA,
        Range: `bytes=0-${PROBE_BYTES - 1}`,
        ...(cookies ? { Cookie: cookies } : {}),
      },
    }).catch(() => null);
    if (!binaryRes || !binaryRes.ok) return null;

    const btype = (binaryRes.headers.get("content-type") ?? "").toLowerCase();
    if (btype.includes("text/html")) return null; // এখনো পেজ — বাইটে পাইনি
    totalSize = totalFromContentRange(binaryRes);
    headBytes = await readPrefix(binaryRes, PROBE_BYTES);
  } else if (ctype.includes("video/") || ctype.includes("application/octet-stream")) {
    // সরাসরি বাইনারির হেড — Range চলুক বা না, readPrefix সীমা রাখে
    totalSize = totalFromContentRange(first);
    headBytes = await readPrefix(first, PROBE_BYTES);
    binaryUrl = first.url || `https://drive.google.com/uc?export=download&id=${fileId}`;
  } else {
    return null;
  }

  // ── লেভেল ২: হেড চাংক পার্স ──
  const headHit = parseDurationFromBytes(headBytes);
  if (headHit) return headHit;

  // ── লেভেল ৩: moov গন্তব্য শেষে থাকলে টেইল চাংক ──
  if (totalSize && totalSize > PROBE_BYTES) {
    const start = Math.max(0, totalSize - PROBE_BYTES);
    const tailRes = await fetch(binaryUrl, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
      headers: { "user-agent": UA, Range: `bytes=${start}-${totalSize - 1}` },
    }).catch(() => null);
    if (tailRes && tailRes.ok) {
      const tailBytes = await readPrefix(tailRes, PROBE_BYTES);
      const tailHit = parseDurationFromBytes(tailBytes);
      if (tailHit) return tailHit;
    }
  }

  return null;
}

async function fetchDriveMeta(fileId: string) {
  let title = "";
  let duration = "";

  try {
    const res = await fetch(`https://drive.google.com/file/d/${fileId}/view`, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
      headers: { "user-agent": UA },
    });
    if (res.ok) {
      const html = await res.text();

      // ১) প্রধান উৎস: og:title (পাবলিক ফাইলে সাধারণত পরিষ্কার ফাইলনাম থাকে)
      const og = html.match(
        /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i
      );
      if (og) title = decodeEntities(og[1]);

      // ২) ফলব্যাক: <title> ট্যাগ ("FILENAME - Google Drive")
      if (!title) {
        const tag = html.match(/<title>([^<]+)<\/title>/i);
        if (tag) {
          title = decodeEntities(tag[1])
            .replace(/\s*-\s*Google Drive\s*$/i, "")
            .trim();
        }
      }

      // প্রাইভেট/অ্যাক্সেস-নেই এমন ফাইলের বার্তা শিরোনাম নয়
      if (
        /unable to open|sign[\s-]?in|request access|access denied|not found/i.test(title)
      )
        title = "";

      // এক্সটেনশন বাদ দিয়ে পরিষ্কার নাম রাখি
      title = cleanFileName(title);
    }
  } catch {
    // চুপচাপ ফলব্যাক
  }

  // নতুন: পাবলিক ভিডিওর সময়ও বাইনারি প্রোবে নির্ণয় করি
  // (ব্যর্থ হলে চুপচাপ খালি থাকবে — আগের মতোই graceful)
  try {
    const seconds = await probeDriveDuration(fileId);
    if (seconds) duration = formatSeconds(Math.round(seconds));
  } catch {
    // চুপচাপ ফলব্যাক
  }

  return { provider: "drive", title, duration };
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const raw = (new URL(req.url).searchParams.get("url") ?? "").trim();

  const ytId = extractYouTubeId(raw);
  if (ytId) {
    const meta = await fetchYouTubeMeta(ytId);
    return Response.json(meta);
  }

  const driveId = extractDriveId(raw);
  if (driveId) {
    const meta = await fetchDriveMeta(driveId);
    return Response.json(meta);
  }

  return Response.json({ provider: "unknown", title: "", duration: "" });
}

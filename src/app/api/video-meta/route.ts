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

async function fetchDriveMeta(fileId: string) {
  let title = "";

  try {
    const res = await fetch(`https://drive.google.com/file/d/${fileId}/view`, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
      headers: { "user-agent": UA },
    });
    if (res.ok) {
      const html = await res.text();
      const match = html.match(/<title>([^<]+)<\/title>/i);
      if (match) {
        title = decodeEntities(match[1])
          .replace(/\s*-\s*Google Drive\s*$/i, "")
          .trim();
        // প্রাইভেট/অ্যাক্সেস-নেই এমন ফাইলে যে বার্তা আসে, সেটা শিরোনাম নয়
        if (/unable to open|sign in|request access/i.test(title)) title = "";
      }
    }
  } catch {
    // চুপচাপ ফলব্যাক
  }

  // Drive থেকে ভিডিওর সময় নির্ধারণ করা যায় না — ফিল্ড ম্যানুয়ালি এডিটযোগ্য থাকে
  return { provider: "drive", title, duration: "" };
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

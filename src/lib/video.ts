/**
 * Unified video source handling — Google Drive & YouTube.
 * YouTube links play through youtube-nocookie with modest branding so the
 * learning experience feels fully native to the site.
 */
import { driveEmbedUrl, driveViewUrl, extractDriveId } from "@/lib/drive";

export type VideoProvider = "youtube" | "drive" | "unknown";

export type VideoSource = {
  provider: VideoProvider;
  /** Iframe-ready embed URL (null when we cannot embed) */
  embedUrl: string | null;
  /** Direct watch/open URL */
  watchUrl: string;
  /** Best-effort thumbnail URL for cards */
  thumbnail: string | null;
};

const YT_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (YT_ID_RE.test(trimmed)) return trimmed;

  // youtu.be/{id}
  const short = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return short[1];

  // watch?v={id}
  const watch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watch) return watch[1];

  // /embed/{id}, /shorts/{id}, /live/{id}, /v/{id}
  const embed = trimmed.match(
    /youtube(?:-nocookie)?\.com\/(?:embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/
  );
  if (embed) return embed[1];

  return null;
}

export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null || /youtu\.?be/.test(url);
}

export function isDriveUrl(url: string): boolean {
  return /drive\.google\.com/.test(url) || extractDriveId(url) !== null;
}

export function youtubeEmbedUrl(id: string): string {
  const params = new URLSearchParams({
    rel: "0", // শেষে অপ্রাসঙ্গিক ভিডিও সাজেশন বন্ধ
    modestbranding: "1", // ইউটিউব লোগো মিনিমাইজ
    iv_load_policy: "3", // অ্যানোটেশন বন্ধ
    fs: "1",
    playsinline: "1",
    color: "white",
    hl: "bn",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function parseVideoSource(rawUrl: string): VideoSource {
  const url = (rawUrl ?? "").trim();

  const ytId = extractYouTubeId(url);
  if (ytId) {
    return {
      provider: "youtube",
      embedUrl: youtubeEmbedUrl(ytId),
      watchUrl: `https://youtu.be/${ytId}`,
      thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
    };
  }

  const driveId = extractDriveId(url);
  if (driveId) {
    return {
      provider: "drive",
      embedUrl: driveEmbedUrl(url),
      watchUrl: driveViewUrl(url),
      thumbnail: `https://drive.google.com/thumbnail?id=${driveId}&sz=w640`,
    };
  }

  return {
    provider: "unknown",
    embedUrl: url || null,
    watchUrl: url,
    thumbnail: null,
  };
}

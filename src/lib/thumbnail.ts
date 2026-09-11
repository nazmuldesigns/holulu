import { extractDriveId } from "@/lib/drive";
import { extractYouTubeId } from "@/lib/video";

/**
 * যেকোনো ইনপুট (Google Drive লিংক, YouTube লিংক, সরাসরি ইমেজ URL, বা
 * /images/... লোকাল পাথ) থেকে থাম্বনেইলের সম্ভাব্য URL-গুলোর তালিকা বানায়।
 *
 * একটি URL লোড না হলে ব্রাউজারে পরেরটি চেষ্টা করা হয় (SmartImage কম্পোনেন্ট)।
 */
export function thumbnailCandidates(value: string, width = 1280): string[] {
  const raw = (value ?? "").trim();
  if (!raw) return [];

  // YouTube — সবচেয়ে ভালো রেজোলিউশন থেকে শুরু
  const ytId = extractYouTubeId(raw);
  if (ytId) {
    return [
      `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${ytId}/sddefault.jpg`,
      `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
      `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`,
    ];
  }

  // Google Drive — একাধিক হোস্ট ফলব্যাক (কিছু ফাইলে একটি কাজ করে, অন্যটি নয়)
  const isDriveLink = /drive\.google\.com|docs\.google\.com/.test(raw);
  const looksLikeBareId = /^[a-zA-Z0-9_-]{25,}$/.test(raw);
  if (isDriveLink || looksLikeBareId) {
    const id = extractDriveId(raw);
    if (id) {
      return [
        `https://lh3.googleusercontent.com/d/${id}=w${width}`,
        `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`,
        `https://drive.google.com/thumbnail?id=${id}`,
        `https://lh3.googleusercontent.com/d/${id}`,
      ];
    }
  }

  // সরাসরি ইমেজ URL বা লোকাল পাথ
  return [raw];
}

/** সার্ভার-সাইডে প্রথম পছন্দের URL (SSR/মেটাডেটার জন্য) */
export function primaryThumbnail(value: string, width = 1280): string {
  return thumbnailCandidates(value, width)[0] ?? "";
}

/**
 * Google Drive helper utilities.
 * Accepts drive share links in any common format and converts them
 * to embed / thumbnail / download URLs.
 */

export function extractDriveId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // /file/d/{id}/...
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (fileMatch) return fileMatch[1];

  // open?id={id} or uc?id={id}
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (idMatch) return idMatch[1];

  // /folders/d/{id}
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{10,})/);
  if (folderMatch) return folderMatch[1];

  // Bare file id
  if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed)) return trimmed;

  return null;
}

export function driveEmbedUrl(url: string): string | null {
  const id = extractDriveId(url);
  if (!id) return null;
  return `https://drive.google.com/file/d/${id}/preview`;
}

export function driveViewUrl(url: string): string {
  const id = extractDriveId(url);
  if (!id) return url;
  return `https://drive.google.com/file/d/${id}/view`;
}

export function driveDownloadUrl(url: string): string {
  const id = extractDriveId(url);
  if (!id) return url;
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

export function driveThumbnailUrl(url: string, _size = "w1280"): string {
  const id = extractDriveId(url);
  if (!id) return url;
  // Google User ContentCDN ব্যবহার করলে ওয়েবসাইটে ছবি একদম দ্রুত ও সঠিকভাবে লোড হয়
  return `https://lh3.googleusercontent.com/d/${id}`;
}

/** Convert any stored thumbnail value (drive link or direct url) to a src. */
export function thumbnailSrc(value: string, size = "w1280"): string {
  if (!value) return "";
  if (value.includes("drive.google.com") || /^[a-zA-Z0-9_-]{25,}$/.test(value.trim())) {
    return driveThumbnailUrl(value, size);
  }
  return value;
}
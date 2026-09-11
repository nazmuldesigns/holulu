import { NextResponse, type NextRequest } from "next/server";

/**
 * প্রোটেক্টেড রাউটের অথ-গার্ড।
 *
 * রুট-লেভেল loading.tsx থাকায় পেজ কম্পোনেন্টের redirect() স্ট্রিমিং শুরুর পরে
 * পড়ে — তখন HTTP স্ট্যাটাস 200 হয়ে যায়। middleware রেন্ডারের আগেই চলে,
 * তাই লগইন না থাকলে সঠিক 307 রিডিরেক্ট পাওয়া যায়।
 *
 * নোট: এখানে শুধু কুকির উপস্থিতি চেক হয়; সেশন বৈধতা ও অ্যাডমিন রোল
 * পেজ/অ্যাকশন লেভেলে (server-side) যাচাই হয় — সেই নিরাপত্তা অক্ষত আছে।
 */
export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get("tms_session")?.value);

  if (hasSession) return NextResponse.next();

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = `next=${encodeURIComponent(req.nextUrl.pathname)}`;
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/checkout/:path*", "/admin/:path*"],
};

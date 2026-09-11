import type { Metadata } from "next";
import { GraduationCap, ShieldCheck, Sparkles, Star } from "lucide-react";
import { LoginForm } from "@/components/auth-forms";
import { toBn } from "@/lib/bangla";

export const metadata: Metadata = { title: "লগইন" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="w-full max-w-md animate-rise">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/85 p-7 shadow-2xl shadow-brand-900/10 backdrop-blur-xl sm:p-9">
        {/* কার্ডের উপরে ব্র্যান্ড অ্যাকসেন্ট */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-600 via-gold-400 to-brand-600"
        />
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-100/60 blur-2xl"
        />

        <div className="relative">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30">
            <GraduationCap className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-ink-900">
            আবারও স্বাগতম!
          </h1>
          <p className="mt-1.5 text-center text-sm text-ink-400">
            তোমার অ্যাকাউন্টে লগইন করে শেখা চালিয়ে যাও
          </p>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-400">
            <span className="flex items-center gap-0.5 text-gold-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            {toBn(4.9)}/৫ · {toBn(1200)}+ শিক্ষার্থী
          </div>

          <div className="mt-7">
            <LoginForm next={next ?? ""} />
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-ink-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            তোমার তথ্য সম্পূর্ণ নিরাপদ — এনক্রিপ্টেড সেশন
          </p>
        </div>
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
        <Sparkles className="h-3.5 w-3.5 text-brand-400" />
        একবার লগইন করলে ৯০ দিন পর্যন্ত লগইন থাকবে
      </p>
    </div>
  );
}

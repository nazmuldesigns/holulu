import type { Metadata } from "next";
import { BadgeCheck, Sparkles, UserPlus } from "lucide-react";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "রেজিস্টার" };

const BENEFITS = [
  "সম্পূর্ণ ফ্রি অ্যাকাউন্ট",
  "ফ্রি প্রিভিউ ক্লাস দেখা যায়",
  "কোর্সের অগ্রগতি ট্র্যাক হয়",
];

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="w-full max-w-md animate-rise">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/85 p-7 shadow-2xl shadow-brand-900/10 backdrop-blur-xl sm:p-9">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-600 via-gold-400 to-brand-600"
        />
        <div
          aria-hidden
          className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-gold-300/30 blur-2xl"
        />

        <div className="relative">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30">
            <UserPlus className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-ink-900">
            ফ্রি অ্যাকাউন্ট খুলুন
          </h1>
          <p className="mt-1.5 text-center text-sm text-ink-400">
            মাত্র ৩০ সেকেন্ডেই শুরু হোক তোমার শেখার যাত্রা
          </p>

          <ul className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {BENEFITS.map((b) => (
              <li
                key={b}
                className="flex items-center gap-1.5 rounded-full border border-ink-100 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-ink-500"
              >
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> {b}
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <RegisterForm next={next ?? ""} />
          </div>
        </div>
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
        <Sparkles className="h-3.5 w-3.5 text-brand-400" />
        অ্যাডমিন আগে থেকে এক্সেস দিয়ে রাখলে সাথে সাথেই কোর্স যুক্ত হবে
      </p>
    </div>
  );
}

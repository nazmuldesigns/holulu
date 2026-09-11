"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  CircleX,
  GraduationCap,
  Infinity as InfinityIcon,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import { bnPrice } from "@/lib/bangla";
import { SmartImage } from "@/components/smart-image";
import { thumbnailCandidates } from "@/lib/thumbnail";

type CheckoutCourse = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  thumbnail: string;
};

const METHODS = [
  {
    id: "bkash" as const,
    name: "বিকাশ",
    enName: "bKash",
    tagline: "মোবাইল ব্যাংকিং পেমেন্ট",
    card: "from-[#ee3d8f] to-[#b50e57]",
    ring: "ring-[#e2136e]",
    iconBg: "bg-white/20",
  },
  {
    id: "nagad" as const,
    name: "নগদ",
    enName: "Nagad",
    tagline: "ডাক বিভাগের ডিজিটাল সেবা",
    card: "from-[#f7981e] to-[#ee4023]",
    ring: "ring-[#f6921e]",
    iconBg: "bg-white/20",
  },
];

type MethodId = (typeof METHODS)[number]["id"];

export function CheckoutClient({ course }: { course: CheckoutCourse }) {
  const [method, setMethod] = useState<MethodId | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);

  const selected = METHODS.find((m) => m.id === method) ?? null;

  const openNotice = () => setNoticeOpen(true);

  const pickMethod = (id: MethodId) => {
    setMethod(id);
    // পেমেন্ট মাধ্যমে ক্লিক করলে ভর্তি-সম্পন্ন নোটিশ দেখাবে
    window.setTimeout(openNotice, 280);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ---------- Step indicator ---------- */}
      <div className="mx-auto flex max-w-xl items-center justify-center gap-2 text-xs font-bold sm:text-sm">
        <span className="flex items-center gap-1.5 text-emerald-600">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
          কোর্স নির্বাচন
        </span>
        <span className="h-px w-8 bg-emerald-300 sm:w-12" />
        <span className="flex items-center gap-1.5 text-brand-600">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
            ২
          </span>
          পেমেন্ট
        </span>
        <span className="h-px w-8 bg-ink-200 sm:w-12" />
        <span className="flex items-center gap-1.5 text-ink-300">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-200 text-white">
            ৩
          </span>
          ফুল এক্সেস
        </span>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        {/* ---------- Payment methods ---------- */}
        <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="flex items-center gap-2.5 text-xl font-bold text-ink-900 sm:text-2xl">
            <Wallet className="h-6 w-6 text-brand-500" /> পেমেন্ট মাধ্যম বেছে নিন
          </h1>
          <p className="mt-1.5 text-sm text-ink-400">
            আপনার পছন্দের মোবাইল ব্যাংকিং সার্ভিসে ক্লিক করে পেমেন্ট সম্পন্ন করুন
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {METHODS.map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => pickMethod(m.id)}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${m.card} p-5 text-left text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl focus:outline-none ${
                    active ? `ring-4 ${m.ring} ring-offset-2` : ""
                  }`}
                >
                  <div
                    aria-hidden
                    className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15 blur-md"
                  />
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${m.iconBg} backdrop-blur-sm`}
                  >
                    <Smartphone className="h-6 w-6" />
                  </span>
                  <span className="mt-4 block text-2xl font-bold tracking-tight">
                    {m.name}
                  </span>
                  <span className="block text-sm text-white/80">{m.enName}</span>
                  <span className="mt-2 block text-xs text-white/70">{m.tagline}</span>

                  {active && (
                    <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-500 shadow">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!method}
            onClick={openNotice}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-4 text-base font-bold text-white shadow-xl shadow-brand-500/30 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <LockKeyhole className="h-5 w-5" />
            {method
              ? `${selected?.name} দিয়ে ${bnPrice(course.price)} পে করুন`
              : "আগে একটি পেমেন্ট মাধ্যম বেছে নিন"}
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> সুরক্ষিত এনক্রিপ্টেড পেমেন্ট
            গেটওয়ে
          </p>
        </div>

        {/* ---------- Order summary ---------- */}
        <aside>
          <div className="sticky top-24 overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-lg shadow-ink-900/5">
            <div className="relative">
              <SmartImage
                candidates={thumbnailCandidates(course.thumbnail, 800)}
                alt={course.title}
                fallbackLabel={course.title}
                className="aspect-video w-full object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-600 backdrop-blur">
                চেকআউট
              </span>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-bold leading-snug text-ink-900">{course.title}</h2>
              {course.subtitle && (
                <p className="mt-1 line-clamp-2 text-sm text-ink-400">{course.subtitle}</p>
              )}

              <div className="mt-5 space-y-2.5 border-t border-ink-50 pt-5 text-sm">
                <div className="flex items-center justify-between text-ink-500">
                  <span>কোর্স ফি</span>
                  <span className="font-semibold text-ink-800">{bnPrice(course.price)}</span>
                </div>
                <div className="flex items-center justify-between text-ink-500">
                  <span>সার্ভিস চার্জ</span>
                  <span className="font-semibold text-emerald-600">৳০</span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-ink-100 pt-3">
                  <span className="font-bold text-ink-800">সর্বমোট</span>
                  <span className="text-xl font-bold text-brand-600">
                    {bnPrice(course.price)}
                  </span>
                </div>
              </div>

              <ul className="mt-5 space-y-2 rounded-2xl bg-ink-50/70 p-4 text-xs text-ink-500">
                <li className="flex items-center gap-2">
                  <InfinityIcon className="h-4 w-4 shrink-0 text-brand-500" /> লাইফটাইম
                  এক্সেস, কোনো রিনিউ ফি নেই
                </li>
                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-brand-500" /> সব ভিডিও
                  ক্লাস, বোনাস ভিডিও ও পিডিএফ নোট
                </li>
                <li className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 shrink-0 text-brand-500" /> মোবাইল ও
                  কম্পিউটার — উভয়ে দেখা যাবে
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* ---------- ভর্তি সম্পন্ন notice modal ---------- */}
      {noticeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="ভর্তি সম্পন্ন নোটিশ"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={() => setNoticeOpen(false)}
        >
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-md animate-rise overflow-hidden rounded-[1.75rem] bg-white text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-gold-400 via-brand-500 to-gold-400" />

            <button
              type="button"
              aria-label="বন্ধ করুন"
              onClick={() => setNoticeOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-ink-50 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-7 pb-7 pt-8 sm:px-9">
              <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/20 text-gold-500">
                <UsersRound className="h-8 w-8" />
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white shadow">
                  <CircleX className="h-4 w-4" />
                </span>
              </span>

              <h3 className="mt-4 text-xl font-bold text-ink-900 sm:text-2xl">
                এই ব্যাচের ভর্তি সম্পন্ন হয়েছে
              </h3>

              <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
                দুঃখিত, এই ব্যাচের সকল শিক্ষার্থীর ভর্তি সম্পন্ন হয়েছে! আপাতত নতুন
                শিক্ষার্থী ভর্তি নেওয়া হচ্ছে না। পরবর্তী ব্যাচের জন্য সাথেই থাকুন।
              </p>

              <div className="mt-5 rounded-2xl border border-gold-400/40 bg-gold-400/10 px-4 py-3 text-xs font-semibold text-ink-600">
                পরবর্তী ব্যাচের ঘোষণা খুব শীঘ্রই ওয়েবসাইট ও ফেসবুক পেজে জানানো হবে
              </div>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setNoticeOpen(false)}
                  className="rounded-xl border border-ink-200 px-4 py-3 text-sm font-bold text-ink-600 transition hover:border-brand-300 hover:text-brand-600"
                >
                  ঠিক আছে
                </button>
                <Link
                  href="/#courses"
                  className="rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600"
                >
                  অন্যান্য কোর্স দেখুন
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

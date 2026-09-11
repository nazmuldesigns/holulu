import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Infinity as InfinityIcon, MonitorPlay, Star } from "lucide-react";
import { Logo } from "@/components/logo";
import { getSettings } from "@/lib/settings";
import { toBn } from "@/lib/bangla";

const PERKS = [
  { icon: MonitorPlay, text: "ধারাবাহিক ভিডিও ক্লাস — ১ম ক্লাস থেকেই" },
  { icon: BadgeCheck, text: "বোনাস ভিডিও ও পিডিএফ নোট ফ্রি" },
  { icon: InfinityIcon, text: "একবার এক্সেস নিলেই লাইফটাইম শেখা" },
];

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* ------------------------- Brand panel (desktop) ------------------------- */}
      <aside className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-ink-950 p-10 text-white lg:flex xl:w-[46%]">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-600/30 blur-[100px]"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-gold-500/20 blur-[110px]"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative">
          <Logo dark />
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-brand-300 backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-current" /> {toBn(4.9)}/৫ রেটিং ·{" "}
            {toBn(1200)}+ শিক্ষার্থী
          </span>
          <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight">
            {settings.hero_title}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/60">
            {settings.site_name}-এ অ্যাকাউন্ট খুলে আজই শুরু করুন — প্রথম ক্লাসটা একদম
            ফ্রি দেখে নিন।
          </p>

          <ul className="mt-8 space-y-3.5">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300 ring-1 ring-white/10">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3 text-xs text-white/40">
          <div className="flex -space-x-2.5">
            {["আ", "স", "র", "ম"].map((ch, i) => (
              <span
                key={ch}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink-950 text-[11px] font-bold text-white ${
                  ["bg-brand-500", "bg-ink-600", "bg-gold-500", "bg-brand-700"][i]
                }`}
              >
                {ch}
              </span>
            ))}
          </div>
          <p>হাজারো শিক্ষার্থী প্রতিদিন এখানেই শেখে</p>
        </div>
      </aside>

      {/* ------------------------- Form panel ------------------------- */}
      <main className="relative flex flex-1 flex-col bg-gradient-to-br from-brand-50/70 via-white to-gold-300/20">
        <div className="hero-grid-bg absolute inset-0" aria-hidden />

        <header className="relative flex items-center justify-between px-5 py-5 sm:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full border border-ink-200 bg-white/80 px-4 py-2 text-sm font-semibold text-ink-600 shadow-sm backdrop-blur transition hover:border-brand-300 hover:text-brand-600 lg:ml-auto"
          >
            <ArrowLeft className="h-4 w-4" /> হোমে ফিরুন
          </Link>
        </header>

        <div className="relative flex flex-1 items-center justify-center px-4 pb-14 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}

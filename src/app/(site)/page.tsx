import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpenCheck,
  ChevronDown,
  FileText,
  GraduationCap,
  Infinity as InfinityIcon,
  MonitorPlay,
  MousePointerClick,
  Play,
  Sparkles,
  Star,
  UserPlus,
  Users,
} from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getCategories, getCoursesWithCounts, getPlatformStats } from "@/lib/courses";
import { toBn } from "@/lib/bangla";
import CourseExplorer from "@/components/course-explorer";
import { HeroIllustration } from "@/components/hero-illustration";
import { SmartImage } from "@/components/smart-image";

export const dynamic = "force-dynamic";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category }, settings, courseList, categories, stats] = await Promise.all([
    searchParams,
    getSettings(),
    getCoursesWithCounts(true),
    getCategories(),
    getPlatformStats(),
  ]);

  return (
    <div className="overflow-x-clip">
      {/* ------------------------------ HERO ------------------------------ */}
      <section className="relative">
        <div className="hero-grid-bg absolute inset-0" aria-hidden />
        <div
          aria-hidden
          className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-brand-200/50 blur-[110px]"
        />
        <div
          aria-hidden
          className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-gold-300/40 blur-[120px]"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-8 lg:pt-20">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-[13px] font-semibold text-brand-600 shadow-sm">
              <Sparkles className="h-4 w-4" />
              {settings.site_tagline}
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-[1.2] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.4rem]">
              {settings.hero_title}
            </h1>

            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-500">
              {settings.hero_subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <a
                href="#courses"
                className="group flex items-center gap-2 rounded-full bg-brand-500 px-7 py-4 text-[16px] font-bold text-white shadow-xl shadow-brand-500/30 transition hover:-translate-y-0.5 hover:bg-brand-600"
              >
                এখনই শেখা শুরু করুন
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#how-it-works"
                className="flex items-center gap-2.5 rounded-full border border-ink-200 bg-white/80 px-6 py-4 text-[16px] font-bold text-ink-800 backdrop-blur transition hover:border-brand-300 hover:text-brand-600"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                </span>
                কীভাবে কাজ করে
              </a>
            </div>

            <div className="mt-9 flex items-center gap-4">
              <div className="flex -space-x-3">
                {["আ", "স", "র", "ন"].map((ch, i) => (
                  <span
                    key={ch}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white text-sm font-bold text-white shadow-md ${
                      ["bg-brand-500", "bg-ink-700", "bg-gold-500", "bg-brand-700"][i]
                    }`}
                  >
                    {ch}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-gold-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-1.5 text-sm font-bold text-ink-800">৪.৯/৫</span>
                </div>
                <p className="text-sm text-ink-400">
                  {toBn(Math.max(stats.enrollments, 1200))}+ শিক্ষার্থীর আস্থার নাম
                </p>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative animate-rise lg:justify-self-end" style={{ animationDelay: "120ms" }}>
            <div className="relative overflow-hidden rounded-[2rem] border-8 border-white bg-ink-100 shadow-2xl shadow-brand-900/20">
              {/* ইনলাইন SVG ইলাস্ট্রেশন — কোনো ইমেজ ফাইল লাগে না, সব হোস্টে হুবহু দেখায় */}
              <HeroIllustration className="h-auto w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/10 via-transparent to-transparent" />
            </div>

            <div className="absolute -left-6 top-8 animate-float rounded-2xl border border-ink-100 bg-white/95 p-3.5 pr-5 shadow-xl shadow-ink-900/10 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                  <MonitorPlay className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">{toBn(stats.classes)}+ ভিডিও ক্লাস</p>
                  <p className="text-xs text-ink-400">HD কোয়ালিটি, যেকোনো ডিভাইসে</p>
                </div>
              </div>
            </div>

            <div
              className="absolute -bottom-6 right-6 animate-float-slow rounded-2xl border border-ink-100 bg-white/95 p-3.5 pr-5 shadow-xl shadow-ink-900/10 backdrop-blur"
              style={{ animationDelay: "1.2s" }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/20 text-gold-500">
                  <Award className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">পিডিএফ নোট ও ফাইল</p>
                  <p className="text-xs text-ink-400">প্রতিটি ক্লাসের সাথে ফ্রি</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 -top-5 -z-10 h-40 w-40 rounded-[2rem] bg-gradient-to-br from-brand-500 to-brand-700 opacity-90" />
          </div>
        </div>
      </section>

      {/* --------------------------- STATS STRIP --------------------------- */}
      <section className="relative z-10 mx-auto -mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ink-100 bg-ink-100 shadow-lg shadow-ink-900/5 lg:grid-cols-4">
          {[
            { icon: GraduationCap, value: stats.courses, label: "চলমান কোর্স" },
            { icon: MonitorPlay, value: stats.classes, label: "ভিডিও ক্লাস" },
            { icon: FileText, value: stats.materials, label: "নোট ও পিডিএফ" },
            { icon: Users, value: stats.students, label: "শিক্ষার্থী" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-4 bg-white px-6 py-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-2xl font-bold text-ink-900">{toBn(value)}+</p>
                <p className="text-sm text-ink-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------ COURSES ---------------------------- */}
      <section id="courses" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3.5 py-1 text-xs font-bold text-brand-600">
              <BookOpenCheck className="h-3.5 w-3.5" /> আমাদের কোর্সসমূহ
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              তোমার পছন্দের কোর্সটি বেছে নাও
            </h2>
            <p className="mt-2 max-w-xl text-ink-400">
              প্রতিটি কোর্সে রয়েছে ধাপে ধাপে সাজানো ভিডিও ক্লাস, পিডিএফ নোট ও প্র্যাকটিস ফাইল
            </p>
          </div>
        </div>

        <CourseExplorer
          courses={courseList}
          categories={categories}
          initialCategory={category ?? "সব"}
        />
      </section>

      {/* --------------------------- HOW IT WORKS -------------------------- */}
      <section id="how-it-works" className="scroll-mt-24 bg-gradient-to-b from-white to-brand-50/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3.5 py-1 text-xs font-bold text-brand-600">
              <MousePointerClick className="h-3.5 w-3.5" /> মাত্র ৩টি ধাপ
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              কীভাবে শেখা শুরু করবে?
            </h2>
            <p className="mt-2 text-ink-400">
              সহজ ৩টি ধাপেই শুরু হোক তোমার শেখার যাত্রা — একদম ঝামেলাহীন
            </p>
          </div>

          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            <div
              aria-hidden
              className="absolute left-[16%] right-[16%] top-12 hidden border-t-2 border-dashed border-brand-200 md:block"
            />
            {[
              {
                icon: UserPlus,
                step: "১",
                title: "ফ্রি অ্যাকাউন্ট খুলুন",
                desc: "নাম, ইমেইল আর পাসওয়ার্ড দিয়ে মাত্র ৩০ সেকেন্ডে অ্যাকাউন্ট তৈরি করুন",
              },
              {
                icon: MousePointerClick,
                step: "২",
                title: "কোর্সে এক্সেস নিন",
                desc: "পছন্দের কোর্সে গিয়ে “এক্সেস নিন” বাটনে ক্লিক করলেই সব ক্লাস আনলক",
              },
              {
                icon: MonitorPlay,
                step: "৩",
                title: "ক্লাস শুরু করুন",
                desc: "১ম ক্লাস থেকে ধাপে ধাপে ভিডিও দেখুন, পিডিএফ নোট ডাউনলোড করুন",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div
                key={step}
                className="group relative rounded-3xl border border-ink-100 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <span className="absolute -top-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-500/40 ring-4 ring-white">
                  {step}
                </span>
                <span className="mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 transition group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
                  <Icon className="h-8 w-8" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-ink-900">{title}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-ink-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- FEATURES ---------------------------- */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3.5 py-1 text-xs font-bold text-brand-600">
              <Sparkles className="h-3.5 w-3.5" /> কেন আমাদের প্ল্যাটফর্ম?
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-snug tracking-tight text-ink-900 sm:text-4xl">
              একবার এক্সেস নিলেই <span className="text-brand-600">লাইফটাইম</span> শেখার সুযোগ
            </h2>
            <p className="mt-3 leading-relaxed text-ink-400">
              ঘরে বসেই দেশের সেরা মেন্টরদের ক্লাস করার সুযোগ। প্রতিটি কোর্স সাজানো হয়েছে
              শিক্ষার্থীদের বাস্তব প্রয়োজন ভেবে।
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: MonitorPlay,
                  title: "ড্রাইভ ভিডিও ক্লাস",
                  desc: "১ম ক্লাস থেকে ধারাবাহিকভাবে সাজানো HD ভিডিও",
                },
                {
                  icon: FileText,
                  title: "পিডিএফ নোট ও ফাইল",
                  desc: "প্রতিটি টপিকের লেকচার শীট ও প্র্যাকটিস ফাইল",
                },
                {
                  icon: InfinityIcon,
                  title: "লাইফটাইম এক্সেস",
                  desc: "একবার এক্সেস নিলেই সারাজীবনের জন্য তোমার",
                },
                {
                  icon: BadgeCheck,
                  title: "ফ্রি প্রিভিউ ক্লাস",
                  desc: "কোর্স কেনার আগেই ফ্রি ক্লাস দেখে নেওয়ার সুযোগ",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-3.5 font-bold text-ink-900">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-ink-100 shadow-2xl shadow-brand-900/15">
              <SmartImage
                candidates={["/images/feature.png"]}
                alt="অনলাইন ক্লাস করছে শিক্ষার্থী"
                fallbackLabel="অনলাইন ক্লাস"
                className="aspect-[4/4.2] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-7 -left-7 animate-float rounded-2xl bg-brand-600 p-6 text-white shadow-2xl shadow-brand-600/40">
              <p className="text-4xl font-bold">{toBn(95)}%</p>
              <p className="mt-1 text-sm text-white/80">শিক্ষার্থী সাফল্যের গল্প বলছে</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------- FAQ ------------------------------- */}
      <section id="faq" className="scroll-mt-24 bg-ink-950 py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-brand-300">
              <ChevronDown className="h-3.5 w-3.5" /> সচরাচর জিজ্ঞাসা
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              যা যা জানতে চান
            </h2>
          </div>

          <div className="mt-10 space-y-3.5">
            {[
              {
                q: "কোর্সের এক্সেস কীভাবে পাবো?",
                a: "প্রথমে ফ্রি অ্যাকাউন্ট খুলুন। তারপর পছন্দের কোর্স পেজে গিয়ে “এক্সেস নিন” বাটনে ক্লিক করুন। সাথে সাথেই সব ক্লাস ও নোট আনলক হয়ে যাবে।",
              },
              {
                q: "ভিডিও ক্লাসগুলো কীভাবে দেখবো?",
                a: "কোর্স পেজে ১ম ক্লাস, ২য় ক্লাস এভাবে ধারাবাহিকভাবে সাজানো থাকে। যেকোনো ক্লাসে ক্লিক করলেই Google Drive প্লেয়ারে ভিডিও চলবে — মোবাইল ও কম্পিউটার দুটোতেই।",
              },
              {
                q: "পিডিএফ নোট কি ডাউনলোড করা যায়?",
                a: "হ্যাঁ! প্রতিটি কোর্সের “পিডিএফ ও নোট” সেকশন থেকে লেকচার শীট, প্র্যাকটিস ফাইল ও বই ডাউনলোড করতে পারবেন।",
              },
              {
                q: "কোর্স কেনার আগে দেখে নেওয়া যায়?",
                a: "অবশ্যই। প্রতিটি কোর্সের শুরুর কিছু ক্লাস “ফ্রি প্রিভিউ” হিসেবে চিহ্নিত — অ্যাকাউন্ট ছাড়াই যে কেউ দেখতে পারবে।",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur transition open:border-brand-500/40 open:bg-white/[0.08]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-bold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 transition group-open:rotate-180 group-open:bg-brand-500">
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-white/60">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- CTA ------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 px-6 py-16 text-center text-white shadow-2xl shadow-brand-500/30 sm:px-12">
          <div
            aria-hidden
            className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-ink-950/20 blur-2xl"
          />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-bold leading-snug sm:text-4xl">
            আজই শুরু করো তোমার শেখার যাত্রা
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/80">
            হাজারো শিক্ষার্থীর সাথে যুক্ত হও — প্রথম ক্লাসটাই ফ্রি দেখে নিতে পারো
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="rounded-full bg-white px-8 py-4 text-[16px] font-bold text-brand-600 shadow-xl shadow-ink-950/20 transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              ফ্রি অ্যাকাউন্ট খুলুন
            </Link>
            <a
              href="#courses"
              className="rounded-full border-2 border-white/40 px-8 py-4 text-[16px] font-bold text-white transition hover:border-white hover:bg-white/10"
            >
              কোর্সগুলো দেখুন
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

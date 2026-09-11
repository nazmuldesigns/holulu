import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Compass,
  Flame,
  Gift,
  GraduationCap,
  Play,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { bnDate, toBn } from "@/lib/bangla";
import { getEnrolledCoursesForUser } from "@/lib/courses";
import { ProgressBar } from "@/components/progress-bar";
import { thumbnailCandidates } from "@/lib/thumbnail";
import { SmartImage } from "@/components/smart-image";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "আমার কোর্সসমূহ" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const enrolled = await getEnrolledCoursesForUser(user.id);

  const totalClasses = enrolled.reduce((s, c) => s + c.classCount, 0);
  const totalCompleted = enrolled.reduce((s, c) => s + c.completedCount, 0);
  const totalBonus = enrolled.reduce((s, c) => s + c.bonusCount, 0);
  const fullyCompleted = enrolled.filter(
    (c) => c.classCount > 0 && c.completedCount >= c.classCount
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      {/* Profile hero */}
      <div className="flex flex-col items-start justify-between gap-5 rounded-[2rem] border border-ink-100 bg-gradient-to-br from-white via-white to-brand-50/70 p-7 shadow-sm sm:flex-row sm:items-center sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white shadow-lg shadow-brand-500/30">
            {user.name.slice(0, 1)}
          </span>
          <div>
            <p className="text-sm text-ink-400">শেখা চালিয়ে যান,</p>
            <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">{user.name}</h1>
          </div>
        </div>
        <div className="grid w-full grid-cols-3 gap-3 sm:w-auto">
          <div className="rounded-2xl border border-ink-100 bg-white px-4 py-3 text-center shadow-sm sm:px-5">
            <p className="text-xl font-bold text-brand-600">{toBn(enrolled.length)}</p>
            <p className="text-[11px] text-ink-400 sm:text-xs">চলমান কোর্স</p>
          </div>
          <div className="rounded-2xl border border-ink-100 bg-white px-4 py-3 text-center shadow-sm sm:px-5">
            <p className="text-xl font-bold text-emerald-600">{toBn(totalCompleted)}</p>
            <p className="text-[11px] text-ink-400 sm:text-xs">ক্লাস শেষ</p>
          </div>
          <div className="rounded-2xl border border-ink-100 bg-white px-4 py-3 text-center shadow-sm sm:px-5">
            <p className="text-xl font-bold text-gold-500">{toBn(fullyCompleted)}</p>
            <p className="text-[11px] text-ink-400 sm:text-xs">কোর্স সম্পন্ন</p>
          </div>
        </div>
      </div>

      {/* Overall progress banner */}
      {enrolled.length > 0 && (
        <div className="mt-6 flex flex-col gap-4 rounded-[2rem] bg-ink-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-300">
              <Flame className="h-6 w-6" />
            </span>
            <div>
              <p className="font-bold">সামগ্রিক অগ্রগতি</p>
              <p className="text-sm text-white/50">
                মোট {toBn(totalClasses)}টি ক্লাসের মধ্যে {toBn(totalCompleted)}টি সম্পন্ন করেছেন
              </p>
            </div>
          </div>
          <div className="w-full sm:w-72 [&_.text-ink-500]:text-white/60">
            <ProgressBar completed={totalCompleted} total={totalClasses} />
          </div>
        </div>
      )}

      <h2 className="mt-12 flex items-center gap-2.5 text-2xl font-bold text-ink-900">
        <GraduationCap className="h-6 w-6 text-brand-500" /> আমার কোর্সসমূহ
      </h2>

      {enrolled.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrolled.map((course) => {
            const pct =
              course.classCount > 0
                ? Math.round((course.completedCount / course.classCount) * 100)
                : 0;
            const complete = course.classCount > 0 && course.completedCount >= course.classCount;

            return (
              <div
                key={course.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <Link href={`/courses/${course.id}`} className="relative block aspect-[16/9] overflow-hidden bg-ink-100">
                  <SmartImage
                    candidates={thumbnailCandidates(course.thumbnail, 800)}
                    alt={course.title}
                    fallbackLabel={course.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
                  {complete ? (
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" /> সম্পন্ন
                    </span>
                  ) : (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink-700 backdrop-blur">
                      {toBn(pct)}% শেষ
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-900/40 transition group-hover:scale-110">
                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <Link
                    href={`/courses/${course.id}`}
                    className="line-clamp-2 text-[17px] font-bold leading-snug text-ink-900 transition group-hover:text-brand-600"
                  >
                    {course.title}
                  </Link>
                  <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-400">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> এনরোলড
                    </span>
                    এক্সেস নিয়েছেন {bnDate(course.enrolledAt)}
                  </p>

                  <div className="mt-4">
                    <ProgressBar completed={course.completedCount} total={course.classCount} size="sm" />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-medium text-ink-400">
                    <span className="flex items-center gap-1.5">
                      <BookOpenCheck className="h-4 w-4 text-brand-500" />
                      {toBn(course.classCount)}টি ক্লাস
                    </span>
                    {course.bonusCount > 0 && (
                      <span className="flex items-center gap-1.5 text-gold-500">
                        <Gift className="h-4 w-4" />
                        {toBn(course.bonusCount)}টি বোনাস
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/courses/${course.id}`}
                    className={`mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-lg transition ${
                      complete
                        ? "bg-emerald-500 text-white shadow-emerald-500/25 hover:bg-emerald-600"
                        : "bg-brand-500 text-white shadow-brand-500/25 hover:bg-brand-600"
                    }`}
                  >
                    {complete ? (
                      <>
                        আবার দেখুন <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        ক্লাস চালিয়ে যান <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-ink-200 bg-white py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <BookOpenCheck className="h-8 w-8" />
          </span>
          <div>
            <p className="text-xl font-bold text-ink-800">এখনো কোনো কোর্সে এক্সেস নেননি</p>
            <p className="mt-1 text-sm text-ink-400">
              পছন্দের কোর্সে এক্সেস নিয়ে আজই শেখা শুরু করুন
            </p>
          </div>
          <Link
            href="/#courses"
            className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
          >
            <Compass className="h-5 w-5" /> কোর্স ঘুরে দেখুন
          </Link>
        </div>
      )}
    </div>
  );
}

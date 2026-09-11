import type { Metadata } from "next";
import Link from "next/link";
import { Eye, PencilLine, Plus } from "lucide-react";
import { getCoursesWithCounts } from "@/lib/courses";
import { bnPrice, toBn } from "@/lib/bangla";
import { thumbnailCandidates } from "@/lib/thumbnail";
import { SmartImage } from "@/components/smart-image";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "কোর্স ব্যবস্থাপনা" };

export default async function AdminCoursesPage() {
  const courseList = await getCoursesWithCounts(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">কোর্স ব্যবস্থাপনা</h1>
          <p className="mt-1 text-sm text-ink-400">
            মোট {toBn(courseList.length)}টি কোর্স — ক্লাস, নোট ও মূল্য নিয়ন্ত্রণ করুন
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> নতুন কোর্স যুক্ত করুন
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
        <ul className="divide-y divide-ink-50">
          {courseList.map((course) => (
            <li
              key={course.id}
              className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-brand-50/30"
            >
              <span className="h-14 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-100">
                <SmartImage
                  candidates={thumbnailCandidates(course.thumbnail, 400)}
                  alt={course.title}
                  fallbackLabel=""
                  className="h-full w-full object-cover"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink-900">{course.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-400">
                  {course.isUpcoming && (
                    <span className="rounded-full bg-gold-400/20 px-2 py-0.5 font-bold text-gold-600">
                      আপকামিং
                    </span>
                  )}
                  <span>
                    {course.category} · {toBn(course.classCount)}টি ক্লাস ·{" "}
                    {toBn(course.materialCount)}টি ফাইল
                  </span>
                </p>
              </div>
              <span className="hidden shrink-0 rounded-full bg-ink-50 px-3 py-1 text-xs font-bold text-ink-600 sm:block">
                {bnPrice(course.price)}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/courses/${course.id}`}
                  target="_blank"
                  aria-label="পূর্বরূপ"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition hover:border-brand-300 hover:text-brand-600"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-600"
                >
                  <PencilLine className="h-3.5 w-3.5" /> ম্যানেজ করুন
                </Link>
              </div>
            </li>
          ))}
          {courseList.length === 0 && (
            <li className="px-6 py-16 text-center text-sm text-ink-400">
              এখনো কোনো কোর্স যুক্ত হয়নি — উপরের “নতুন কোর্স” বাটনে ক্লিক করুন
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

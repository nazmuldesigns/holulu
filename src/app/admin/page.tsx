import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import {
  ArrowRight,
  BookOpenCheck,
  FileText,
  GraduationCap,
  MonitorPlay,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { db } from "@/db";
import { courses, enrollments, users } from "@/db/schema";
import { getPlatformStats } from "@/lib/courses";
import { bnDate, bnPrice, toBn } from "@/lib/bangla";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "অ্যাডমিন ড্যাশবোর্ড" };

export default async function AdminDashboard() {
  const stats = await getPlatformStats();
  const recentCourses = await db
    .select()
    .from(courses)
    .orderBy(desc(courses.createdAt))
    .limit(5);

  const recentEnrollments = await db
    .select({
      id: enrollments.id,
      createdAt: enrollments.createdAt,
      userName: users.name,
      courseTitle: courses.title,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .orderBy(desc(enrollments.createdAt))
    .limit(6);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="mt-1 text-sm text-ink-400">
            আপনার প্ল্যাটফর্মের সার্বিক চিত্র এক নজরে
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> নতুন কোর্স
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: BookOpenCheck, label: "মোট কোর্স", value: stats.courses },
          { icon: MonitorPlay, label: "মোট ভিডিও ক্লাস", value: stats.classes },
          { icon: Users, label: "মোট শিক্ষার্থী", value: stats.students },
          { icon: FileText, label: "নোট ও ফাইল", value: stats.materials },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-2xl font-bold text-ink-900">{toBn(value)}</p>
            <p className="text-sm text-ink-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Recent courses */}
        <div className="rounded-2xl border border-ink-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-ink-50 px-6 py-4">
            <h2 className="flex items-center gap-2 font-bold text-ink-900">
              <GraduationCap className="h-5 w-5 text-brand-500" /> সাম্প্রতিক কোর্স
            </h2>
            <Link
              href="/admin/courses"
              className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
            >
              সব দেখুন <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-ink-50">
            {recentCourses.map((course) => (
              <li key={course.id}>
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-brand-50/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-800">{course.title}</p>
                    <p className="text-xs text-ink-400">
                      {course.category} · {course.isPublished ? "প্রকাশিত" : "ড্রাফট"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-brand-600">
                    {bnPrice(course.price)}
                  </span>
                </Link>
              </li>
            ))}
            {recentCourses.length === 0 && (
              <li className="px-6 py-10 text-center text-sm text-ink-400">
                এখনো কোনো কোর্স নেই
              </li>
            )}
          </ul>
        </div>

        {/* Recent enrollments */}
        <div className="rounded-2xl border border-ink-100 bg-white shadow-sm">
          <div className="border-b border-ink-50 px-6 py-4">
            <h2 className="flex items-center gap-2 font-bold text-ink-900">
              <Users className="h-5 w-5 text-brand-500" /> সাম্প্রতিক এনরোলমেন্ট
            </h2>
          </div>
          <ul className="divide-y divide-ink-50">
            {recentEnrollments.map((row) => (
              <li key={row.id} className="px-6 py-3.5">
                <p className="truncate text-sm font-semibold text-ink-800">{row.userName}</p>
                <p className="truncate text-xs text-ink-400">
                  {row.courseTitle} · {bnDate(row.createdAt)}
                </p>
              </li>
            ))}
            {recentEnrollments.length === 0 && (
              <li className="px-6 py-10 text-center text-sm text-ink-400">
                এখনো কেউ এনরোল করেনি
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/settings"
          className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-bold text-ink-700 shadow-sm transition hover:border-brand-300 hover:text-brand-600"
        >
          <Settings className="h-4 w-4" /> সাইটের নাম ও লোগো বদলান
        </Link>
      </div>
    </div>
  );
}

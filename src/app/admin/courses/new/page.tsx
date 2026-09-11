import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCourseAction } from "@/app/actions/admin";
import { CourseForm } from "@/components/admin-forms";

export const metadata: Metadata = { title: "নতুন কোর্স" };

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 transition hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> কোর্স তালিকায় ফিরুন
      </Link>

      <div className="rounded-3xl border border-ink-100 bg-white p-7 shadow-sm sm:p-9">
        <h1 className="text-2xl font-bold text-ink-900">নতুন কোর্স যুক্ত করুন</h1>
        <p className="mt-1 text-sm text-ink-400">
          কোর্স তৈরি করার পর এর ভেতরে ক্লাস ও পিডিএফ ফাইল যুক্ত করতে পারবেন
        </p>
        <div className="mt-7">
          <CourseForm action={createCourseAction} submitLabel="কোর্স তৈরি করুন" />
        </div>
      </div>
    </div>
  );
}

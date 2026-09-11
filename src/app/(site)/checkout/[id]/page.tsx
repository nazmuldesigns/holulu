import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { courses, enrollments } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutClient } from "@/components/checkout-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "চেকআউট" };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/checkout/${id}`)}`);
  }

  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  if (!course || !course.isPublished) notFound();

  // আপকামিং, ফ্রি বা আগে থেকেই এনরোল করা কোর্সে চেকআউট প্রযোজ্য নয়
  if (course.isUpcoming || course.price <= 0) redirect(`/courses/${id}`);

  if (user.role !== "admin") {
    const [row] = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, id)))
      .limit(1);
    if (row) redirect(`/courses/${id}`);
  }

  return (
    <div className="relative min-h-[70vh]">
      <div className="hero-grid-bg absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 transition hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> কোর্সে ফিরে যান
        </Link>
      </div>
      <div className="relative">
        <CheckoutClient
          course={{
            id: course.id,
            title: course.title,
            subtitle: course.subtitle,
            price: course.price,
            thumbnail: course.thumbnail,
          }}
        />
      </div>
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function enrollInCourse(courseId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/courses/${courseId}`)}`);
  }

  // আপকামিং কোর্সে কেউ এক্সেস নিতে পারবে না
  const [course] = await db
    .select({ isUpcoming: courses.isUpcoming })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);
  if (!course || course.isUpcoming) {
    redirect(`/courses/${courseId}`);
  }

  await db
    .insert(enrollments)
    .values({ userId: user.id, courseId })
    .onConflictDoNothing();

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/dashboard");
}

"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { classProgress, enrollments } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function toggleClassComplete(
  classId: string,
  courseId: string
): Promise<{ completed: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { completed: false };

  const isAdmin = user.role === "admin";
  if (!isAdmin) {
    const [enrolled] = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, courseId)))
      .limit(1);
    if (!enrolled) return { completed: false };
  }

  const [existing] = await db
    .select({ id: classProgress.id })
    .from(classProgress)
    .where(and(eq(classProgress.userId, user.id), eq(classProgress.classId, classId)))
    .limit(1);

  if (existing) {
    await db.delete(classProgress).where(eq(classProgress.id, existing.id));
  } else {
    await db
      .insert(classProgress)
      .values({ userId: user.id, classId, courseId })
      .onConflictDoNothing();
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/dashboard");
  return { completed: !existing };
}

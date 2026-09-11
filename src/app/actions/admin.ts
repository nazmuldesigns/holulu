"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, max } from "drizzle-orm";
import { db } from "@/db";
import {
  accessGrants,
  bonusVideos,
  classes,
  courses,
  enrollments,
  materials,
  users,
} from "@/db/schema";
import { claimPendingGrants, normalizePhone } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { setSetting, SETTING_KEYS } from "@/lib/settings";

export type AdminFormState = { error?: string; success?: string } | null;

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/");
  return user;
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/* ---------------------------------- courses ---------------------------------- */

export async function createCourseAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const title = text(formData, "title");
  if (!title) return { error: "কোর্সের নাম লিখুন" };

  const [course] = await db
    .insert(courses)
    .values({
      title,
      subtitle: text(formData, "subtitle"),
      description: text(formData, "description"),
      category: text(formData, "category") || "স্কিলস",
      thumbnail: text(formData, "thumbnail"),
      badge: text(formData, "badge"),
      price: Number(text(formData, "price") || "0") || 0,
      isPublished: formData.get("isPublished") === "on",
      isUpcoming: formData.get("isUpcoming") === "on",
      launchNote: text(formData, "launchNote"),
    })
    .returning({ id: courses.id });

  revalidatePath("/");
  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}`);
}

export async function updateCourseAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const id = text(formData, "id");
  const title = text(formData, "title");
  if (!id || !title) return { error: "কোর্সের নাম লিখুন" };

  await db
    .update(courses)
    .set({
      title,
      subtitle: text(formData, "subtitle"),
      description: text(formData, "description"),
      category: text(formData, "category") || "স্কিলস",
      thumbnail: text(formData, "thumbnail"),
      badge: text(formData, "badge"),
      price: Number(text(formData, "price") || "0") || 0,
      isPublished: formData.get("isPublished") === "on",
      isUpcoming: formData.get("isUpcoming") === "on",
      launchNote: text(formData, "launchNote"),
    })
    .where(eq(courses.id, id));

  revalidatePath("/");
  revalidatePath(`/courses/${id}`);
  revalidatePath("/admin/courses");
  return { success: "কোর্স আপডেট হয়েছে" };
}

export async function deleteCourseAction(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(courses).where(eq(courses.id, id));
  revalidatePath("/");
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

/* ---------------------------------- classes ---------------------------------- */

export async function addClassAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const courseId = text(formData, "courseId");
  const title = text(formData, "title");
  const driveUrl = text(formData, "driveUrl");
  if (!courseId || !title) return { error: "ক্লাসের নাম লিখুন" };
  if (!driveUrl) return { error: "Google Drive লিংক দিন" };

  const [row] = await db
    .select({ value: max(classes.orderIndex) })
    .from(classes)
    .where(eq(classes.courseId, courseId));
  const nextOrder = (row?.value ?? 0) + 1;

  await db.insert(classes).values({
    courseId,
    title,
    driveUrl,
    type: text(formData, "type") || "video",
    duration: text(formData, "duration"),
    orderIndex: nextOrder,
    isFree: formData.get("isFree") === "on",
  });

  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: `"${title}" ক্লাস যুক্ত হয়েছে` };
}

export async function deleteClassAction(id: string, courseId: string): Promise<void> {
  await requireAdmin();
  await db.delete(classes).where(eq(classes.id, id));
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}`);
}

/* -------------------------------- bonus videos -------------------------------- */

export async function addBonusVideoAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const courseId = text(formData, "courseId");
  const title = text(formData, "title");
  const videoUrl = text(formData, "videoUrl");
  if (!courseId || !title) return { error: "বোনাস ভিডিওর নাম লিখুন" };
  if (!videoUrl) return { error: "YouTube বা Google Drive লিংক দিন" };

  const [row] = await db
    .select({ value: max(bonusVideos.orderIndex) })
    .from(bonusVideos)
    .where(eq(bonusVideos.courseId, courseId));
  const nextOrder = (row?.value ?? 0) + 1;

  await db.insert(bonusVideos).values({
    courseId,
    title,
    videoUrl,
    duration: text(formData, "duration"),
    orderIndex: nextOrder,
    isFree: formData.get("isFree") === "on",
  });

  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: `"${title}" বোনাস ভিডিও যুক্ত হয়েছে` };
}

export async function deleteBonusVideoAction(
  id: string,
  courseId: string
): Promise<void> {
  await requireAdmin();
  await db.delete(bonusVideos).where(eq(bonusVideos.id, id));
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}`);
}

/* ---------------------------------- materials ---------------------------------- */

export async function addMaterialAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const courseId = text(formData, "courseId");
  const title = text(formData, "title");
  const driveUrl = text(formData, "driveUrl");
  if (!courseId || !title) return { error: "ফাইলের নাম লিখুন" };
  if (!driveUrl) return { error: "Google Drive লিংক দিন" };

  await db.insert(materials).values({
    courseId,
    title,
    driveUrl,
    type: text(formData, "type") || "pdf",
  });

  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: `"${title}" ফাইল যুক্ত হয়েছে` };
}

export async function deleteMaterialAction(id: string, courseId: string): Promise<void> {
  await requireAdmin();
  await db.delete(materials).where(eq(materials.id, id));
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}`);
}

/* --------------------------------- enrollments -------------------------------- */

export async function removeEnrollmentAction(
  id: string,
  courseId: string
): Promise<void> {
  await requireAdmin();
  await db
    .delete(enrollments)
    .where(and(eq(enrollments.id, id), eq(enrollments.courseId, courseId)));
  revalidatePath(`/admin/courses/${courseId}`);
}

/* ------------------------- শিক্ষার্থীকে এক্সেস দেওয়া ------------------------- */

export async function grantEnrollmentByEmailAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const courseId = text(formData, "courseId");
  const email = text(formData, "email").toLowerCase();
  if (!courseId || !email) return { error: "শিক্ষার্থীর ইমেইল লিখুন" };

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return { error: "এই ইমেইলে কোনো অ্যাকাউন্ট নেই — আগে ওয়েবসাইটে রেজিস্টার করতে বলুন" };
  }

  await db
    .insert(enrollments)
    .values({ userId: user.id, courseId })
    .onConflictDoNothing();

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/users");
  return { success: `${user.name}-কে এই কোর্সের এক্সেস দেওয়া হয়েছে` };
}

/**
 * ইমেইল/ফোন + একাধিক কোর্স নিয়ে "প্রি-অ্যাপ্রুভড এক্সেস" তৈরি করে।
 * অ্যাকাউন্ট আগে থেকেই থাকলে সাথে সাথে এনরোল হয়ে যায়,
 * না থাকলে ওই ইমেইল/ফোনে রেজিস্টার করামাত্র কোর্সগুলো যুক্ত হবে।
 */
export async function createAccessGrantsAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const email = text(formData, "email").toLowerCase();
  const phone = normalizePhone(text(formData, "phone"));
  const note = text(formData, "note");
  const courseIds = formData.getAll("courseIds").map((v) => String(v));

  if (!email && !phone) return { error: "ইমেইল অথবা মোবাইল নম্বর — অন্তত একটি দিন" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "সঠিক ইমেইল ঠিকানা লিখুন" };
  if (courseIds.length === 0) return { error: "অন্তত একটি কোর্স সিলেক্ট করুন" };

  await db
    .insert(accessGrants)
    .values(courseIds.map((courseId) => ({ email, phone, note, courseId })));

  // অ্যাকাউন্ট আগে থেকেই থাকলে এখনই এনরোল করে দিই
  let matchedUser: { id: string; email: string; phone: string | null } | undefined;
  if (email) {
    [matchedUser] = await db
      .select({ id: users.id, email: users.email, phone: users.phone })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
  }
  if (!matchedUser && phone) {
    [matchedUser] = await db
      .select({ id: users.id, email: users.email, phone: users.phone })
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);
  }

  let instant = 0;
  if (matchedUser) {
    instant = await claimPendingGrants(
      matchedUser.id,
      matchedUser.email,
      matchedUser.phone
    );
  }

  revalidatePath("/admin/users");
  revalidatePath("/dashboard");

  return {
    success:
      instant > 0
        ? `${courseIds.length}টি কোর্সের এক্সেস দেওয়া হয়েছে — অ্যাকাউন্টে সাথে সাথে যুক্ত হয়েছে`
        : `${courseIds.length}টি কোর্সের এক্সেস সংরক্ষিত হয়েছে — এই ইমেইল/নম্বরে অ্যাকাউন্ট খুললেই যুক্ত হয়ে যাবে`,
  };
}

export async function deleteAccessGrantAction(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(accessGrants).where(eq(accessGrants.id, id));
  revalidatePath("/admin/users");
}

export async function grantAllCoursesAction(userId: string): Promise<void> {
  await requireAdmin();

  const allCourses = await db.select({ id: courses.id }).from(courses);
  if (allCourses.length > 0) {
    await db
      .insert(enrollments)
      .values(allCourses.map((c) => ({ userId, courseId: c.id })))
      .onConflictDoNothing();
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function revokeAllCoursesAction(userId: string): Promise<void> {
  await requireAdmin();
  await db.delete(enrollments).where(eq(enrollments.userId, userId));
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function toggleUserRoleAction(userId: string): Promise<void> {
  const admin = await requireAdmin();
  if (admin.id === userId) return; // নিজের রোল পরিবর্তন করা যাবে না

  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return;

  await db
    .update(users)
    .set({ role: target.role === "admin" ? "student" : "admin" })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
}

/* ---------------------------------- settings ---------------------------------- */

export async function updateSettingsAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  for (const key of SETTING_KEYS) {
    const value = String(formData.get(key) ?? "");
    await setSetting(key, value.trim());
  }

  revalidatePath("/", "layout");
  return { success: "সেটিংস সেভ হয়েছে" };
}

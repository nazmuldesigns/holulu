import { cache } from "react";
import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  bonusVideos,
  classProgress,
  classes,
  courses,
  enrollments,
  materials,
  users,
} from "@/db/schema";
import type { CourseCardData } from "@/components/course-card";

export const getCoursesWithCounts = cache(
  async (publishedOnly = true): Promise<CourseCardData[]> => {
    const classCounts = db
      .select({
        courseId: classes.courseId,
        value: count().as("class_count"),
      })
      .from(classes)
      .groupBy(classes.courseId)
      .as("class_counts");

    const materialCounts = db
      .select({
        courseId: materials.courseId,
        value: count().as("material_count"),
      })
      .from(materials)
      .groupBy(materials.courseId)
      .as("material_counts");

    const bonusCounts = db
      .select({
        courseId: bonusVideos.courseId,
        value: count().as("bonus_count"),
      })
      .from(bonusVideos)
      .groupBy(bonusVideos.courseId)
      .as("bonus_counts");

    const rows = await db
      .select({
        id: courses.id,
        title: courses.title,
        subtitle: courses.subtitle,
        category: courses.category,
        thumbnail: courses.thumbnail,
        badge: courses.badge,
        price: courses.price,
        isUpcoming: courses.isUpcoming,
        launchNote: courses.launchNote,
        classCount: sql<number>`coalesce(${classCounts.value}, 0)`,
        materialCount: sql<number>`coalesce(${materialCounts.value}, 0)`,
        bonusCount: sql<number>`coalesce(${bonusCounts.value}, 0)`,
      })
      .from(courses)
      .leftJoin(classCounts, eq(classCounts.courseId, courses.id))
      .leftJoin(materialCounts, eq(materialCounts.courseId, courses.id))
      .leftJoin(bonusCounts, eq(bonusCounts.courseId, courses.id))
      .where(publishedOnly ? eq(courses.isPublished, true) : undefined)
      .orderBy(desc(courses.createdAt));

    return rows;
  }
);

export const getCategories = cache(async (): Promise<string[]> => {
  const rows = await db
    .selectDistinct({ category: courses.category })
    .from(courses)
    .where(eq(courses.isPublished, true));
  return rows.map((r) => r.category).filter(Boolean);
});

export type EnrolledCourseData = CourseCardData & {
  completedCount: number;
  enrolledAt: Date;
};

export async function getEnrolledCoursesForUser(
  userId: string
): Promise<EnrolledCourseData[]> {
  const all = await getCoursesWithCounts(false);

  const enrollRows = await db
    .select({ courseId: enrollments.courseId, createdAt: enrollments.createdAt })
    .from(enrollments)
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.createdAt));

  if (enrollRows.length === 0) return [];

  const progressRows = await db
    .select({
      courseId: classProgress.courseId,
      value: count(),
    })
    .from(classProgress)
    .where(eq(classProgress.userId, userId))
    .groupBy(classProgress.courseId);

  const progressMap = new Map(progressRows.map((r) => [r.courseId, r.value]));

  return enrollRows
    .map((enroll) => {
      const course = all.find((c) => c.id === enroll.courseId);
      if (!course) return null;
      return {
        ...course,
        completedCount: progressMap.get(course.id) ?? 0,
        enrolledAt: enroll.createdAt,
      };
    })
    .filter((c): c is EnrolledCourseData => c !== null);
}

export async function getPlatformStats() {
  const [courseCount] = await db.select({ value: count() }).from(courses);
  const [classCount] = await db.select({ value: count() }).from(classes);
  const [bonusCount] = await db.select({ value: count() }).from(bonusVideos);
  const [studentCount] = await db.select({ value: count() }).from(users);
  const [enrollmentCount] = await db.select({ value: count() }).from(enrollments);
  const [materialCount] = await db.select({ value: count() }).from(materials);

  return {
    courses: courseCount?.value ?? 0,
    classes: (classCount?.value ?? 0) + (bonusCount?.value ?? 0),
    students: studentCount?.value ?? 0,
    enrollments: enrollmentCount?.value ?? 0,
    materials: materialCount?.value ?? 0,
  };
}

import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("student"), // 'admin' | 'student'
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default("স্কিলস"),
  thumbnail: text("thumbnail").notNull().default(""),
  badge: text("badge").notNull().default(""),
  price: integer("price").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  // আপকামিং কোর্স: সাইটে দেখা যাবে কিন্তু কেউ এক্সেস নিতে পারবে না
  isUpcoming: boolean("is_upcoming").notNull().default(false),
  launchNote: text("launch_note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const classes = pgTable("classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  driveUrl: text("drive_url").notNull(),
  type: text("type").notNull().default("video"), // 'video' | 'pdf'
  duration: text("duration").notNull().default(""),
  orderIndex: integer("order_index").notNull().default(0),
  isFree: boolean("is_free").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const bonusVideos = pgTable("bonus_videos", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  videoUrl: text("video_url").notNull(), // Google Drive / YouTube link
  duration: text("duration").notNull().default(""),
  orderIndex: integer("order_index").notNull().default(0),
  isFree: boolean("is_free").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const classProgress = pgTable(
  "class_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("class_progress_user_class_unique").on(t.userId, t.classId)],
);

export const materials = pgTable("materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  driveUrl: text("drive_url").notNull(),
  type: text("type").notNull().default("pdf"), // 'pdf' | 'doc' | 'sheet' | 'slide' | 'other'
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("enrollments_user_course_unique").on(t.userId, t.courseId)],
);

/**
 * অ্যাডমিন আগে থেকেই ইমেইল/ফোন + কোর্স যুক্ত করে রাখতে পারেন।
 * ওই ইমেইল বা ফোন দিয়ে কেউ অ্যাকাউন্ট খুললে (বা লগইন করলে)
 * কোর্সগুলো স্বয়ংক্রিয়ভাবে তার অ্যাকাউন্টে যুক্ত হয়ে যাবে।
 */
export const accessGrants = pgTable("access_grants", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  note: text("note").notNull().default(""),
  claimedByUserId: uuid("claimed_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type AccessGrant = typeof accessGrants.$inferSelect;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type CourseClass = typeof classes.$inferSelect;
export type BonusVideo = typeof bonusVideos.$inferSelect;
export type Material = typeof materials.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;

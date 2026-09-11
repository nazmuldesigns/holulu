import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  Eye,
  FileText,
  Gift,
  GraduationCap,
  MonitorPlay,
  Users,
} from "lucide-react";
import { db } from "@/db";
import { bonusVideos, classes, courses, enrollments, materials, users } from "@/db/schema";
import {
  addBonusVideoAction,
  addBonusVideosBulkAction,
  addClassesBulkAction,
  addClassAction,
  addMaterialAction,
  deleteBonusVideoAction,
  deleteClassAction,
  deleteCourseAction,
  deleteMaterialAction,
  grantEnrollmentByEmailAction,
  removeEnrollmentAction,
  updateBonusVideoAction,
  updateClassAction,
  updateCourseAction,
  requireAdmin,
} from "@/app/actions/admin";
import {
  BonusAddForm,
  ClassAddForm,
  CourseForm,
  GrantAccessForm,
  MaterialAddForm,
} from "@/components/admin-forms";
import {
  BonusBulkForm,
  BonusEditButton,
  ClassBulkForm,
  ClassEditButton,
} from "@/components/admin-class-forms";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import { bnDate, bnOrdinal, toBn } from "@/lib/bangla";
import { driveViewUrl } from "@/lib/drive";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "কোর্স ম্যানেজ" };

export default async function ManageCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  if (!course) notFound();

  const [classRows, bonusRows, materialRows, studentRows] = await Promise.all([
    db.select().from(classes).where(eq(classes.courseId, id)).orderBy(asc(classes.orderIndex), asc(classes.createdAt)),
    db.select().from(bonusVideos).where(eq(bonusVideos.courseId, id)).orderBy(asc(bonusVideos.orderIndex), asc(bonusVideos.createdAt)),
    db.select().from(materials).where(eq(materials.courseId, id)).orderBy(asc(materials.createdAt)),
    db
      .select({ id: enrollments.id, name: users.name, email: users.email, createdAt: enrollments.createdAt })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .where(eq(enrollments.courseId, id))
      .orderBy(desc(enrollments.createdAt)),
  ]);

  const boundUpdate = updateCourseAction.bind(null);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 transition hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> কোর্স তালিকায় ফিরুন
        </Link>
        <Link
          href={`/courses/${course.id}`}
          target="_blank"
          className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-4 py-2 text-xs font-bold text-ink-600 transition hover:border-brand-300 hover:text-brand-600"
        >
          <Eye className="h-3.5 w-3.5" /> সাইটে দেখুন
        </Link>
      </div>

      {/* Course edit */}
      <section className="rounded-3xl border border-ink-100 bg-white p-7 shadow-sm sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 text-xl font-bold text-ink-900">
            <GraduationCap className="h-6 w-6 text-brand-500" /> কোর্সের তথ্য
          </h2>
          <ConfirmActionButton
            action={deleteCourseAction.bind(null, course.id)}
            message={`"${course.title}" কোর্সটি সব ক্লাস ও ফাইলসহ মুছে যাবে। নিশ্চিত?`}
            label="কোর্স মুছুন"
          />
        </div>
        <div className="mt-6">
          <CourseForm
            action={boundUpdate}
            defaults={{
              id: course.id,
              title: course.title,
              subtitle: course.subtitle,
              description: course.description,
              category: course.category,
              thumbnail: course.thumbnail,
              badge: course.badge,
              price: course.price,
              isPublished: course.isPublished,
              isUpcoming: course.isUpcoming,
              launchNote: course.launchNote,
            }}
            submitLabel="পরিবর্তন সেভ করুন"
          />
        </div>
      </section>

      {/* Classes */}
      <section className="rounded-3xl border border-ink-100 bg-white p-7 shadow-sm sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 text-xl font-bold text-ink-900">
            <MonitorPlay className="h-6 w-6 text-brand-500" /> ভিডিও ক্লাস
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
              {toBn(classRows.length)}টি
            </span>
          </h2>
        </div>

        <ul className="mt-6 space-y-2.5">
          {classRows.map((cls, i) => (
            <li
              key={cls.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50/40 px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-ink-700 shadow-sm">
                {toBn(i + 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-800">
                  {bnOrdinal(i + 1)} ক্লাস: {cls.title}
                </p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-400">
                  {cls.duration && (
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3 w-3" /> {cls.duration}
                    </span>
                  )}
                  {cls.isFree && (
                    <span className="font-bold text-emerald-600">ফ্রি প্রিভিউ</span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ClassEditButton
                  action={updateClassAction.bind(null)}
                  courseId={course.id}
                  item={{
                    id: cls.id,
                    title: cls.title,
                    url: cls.driveUrl,
                    duration: cls.duration,
                    orderIndex: cls.orderIndex,
                    isFree: cls.isFree,
                  }}
                />
                <a
                  href={driveViewUrl(cls.driveUrl)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="ড্রাইভে খুলুন"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 transition hover:border-brand-300 hover:text-brand-600"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <ConfirmActionButton
                  action={deleteClassAction.bind(null, cls.id, course.id)}
                  message="ক্লাসটি মুছে ফেলবেন?"
                  iconOnly
                />
              </div>
            </li>
          ))}
          {classRows.length === 0 && (
            <li className="rounded-2xl border border-dashed border-ink-200 py-8 text-center text-sm text-ink-400">
              এখনো কোনো ক্লাস নেই — নিচের ফর্ম থেকে যুক্ত করুন
            </li>
          )}
        </ul>

        <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
          <h3 className="font-bold text-ink-900">নতুন ক্লাস যুক্ত করুন</h3>
          <p className="mb-4 mt-0.5 text-xs text-ink-400">
            একবারে সর্বোচ্চ ৫টি ক্লাস যুক্ত করা যায় · ক্রম খালি রাখলে শেষের ক্লাসের পরে
            অটো সাজবে (১ম, ২য়, ৩য়...)
          </p>
          <ClassBulkForm
            action={addClassesBulkAction.bind(null)}
            courseId={course.id}
          />
        </div>
      </section>

      {/* Bonus videos */}
      <section className="rounded-3xl border border-gold-400/40 bg-white p-7 shadow-sm sm:p-9">
        <h2 className="flex items-center gap-2.5 text-xl font-bold text-ink-900">
          <Gift className="h-6 w-6 text-gold-500" /> বোনাস ভিডিও
          <span className="rounded-full bg-gold-400/15 px-3 py-1 text-xs font-bold text-gold-500">
            {toBn(bonusRows.length)}টি
          </span>
        </h2>
        <p className="mt-1 text-sm text-ink-400">
          মূল সিলেবাসের বাইরে অতিরিক্ত ভিডিও — শিক্ষার্থীরা ওয়েবসাইটের ভেতরেই প্লে করতে পারবে
        </p>

        <ul className="mt-6 space-y-2.5">
          {bonusRows.map((bonus, i) => (
            <li
              key={bonus.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-gold-400/30 bg-gold-400/5 px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-gold-500 shadow-sm">
                <Gift className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-800">
                  বোনাস {toBn(i + 1)}: {bonus.title}
                </p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-400">
                  {bonus.duration && (
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3 w-3" /> {bonus.duration}
                    </span>
                  )}
                  {bonus.isFree && <span className="font-bold text-emerald-600">ফ্রি প্রিভিউ</span>}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <BonusEditButton
                  action={updateBonusVideoAction.bind(null)}
                  courseId={course.id}
                  item={{
                    id: bonus.id,
                    title: bonus.title,
                    url: bonus.videoUrl,
                    duration: bonus.duration,
                    orderIndex: bonus.orderIndex,
                    isFree: bonus.isFree,
                  }}
                />
                <a
                  href={bonus.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="লিংক খুলুন"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 transition hover:border-brand-300 hover:text-brand-600"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <ConfirmActionButton
                  action={deleteBonusVideoAction.bind(null, bonus.id, course.id)}
                  message="বোনাস ভিডিওটি মুছে ফেলবেন?"
                  iconOnly
                />
              </div>
            </li>
          ))}
          {bonusRows.length === 0 && (
            <li className="rounded-2xl border border-dashed border-gold-400/50 py-8 text-center text-sm text-ink-400">
              এখনো কোনো বোনাস ভিডিও নেই — নিচের ফর্ম থেকে যুক্ত করুন
            </li>
          )}
        </ul>

        <div className="mt-6 rounded-2xl border border-gold-400/40 bg-gold-400/10 p-5">
          <h3 className="font-bold text-ink-900">নতুন বোনাস ভিডিও যুক্ত করুন</h3>
          <p className="mb-4 mt-0.5 text-xs text-ink-400">
            একবারে সর্বোচ্চ ৫টি বোনাস ভিডিও যুক্ত করা যায় (YouTube / Drive)
          </p>
          <div className="mt-4">
            <BonusBulkForm
              action={addBonusVideosBulkAction.bind(null)}
              courseId={course.id}
            />
          </div>
        </div>
      </section>

      {/* Materials */}
      <section className="rounded-3xl border border-ink-100 bg-white p-7 shadow-sm sm:p-9">
        <h2 className="flex items-center gap-2.5 text-xl font-bold text-ink-900">
          <FileText className="h-6 w-6 text-brand-500" /> পিডিএফ ও ক্লাস ফাইল
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
            {toBn(materialRows.length)}টি
          </span>
        </h2>

        <ul className="mt-6 space-y-2.5">
          {materialRows.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50/40 px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-800">{m.title}</p>
                <p className="text-xs uppercase tracking-wide text-ink-300">{m.type}</p>
              </div>
              <a
                href={driveViewUrl(m.driveUrl)}
                target="_blank"
                rel="noreferrer"
                aria-label="ড্রাইভে খুলুন"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 transition hover:border-brand-300 hover:text-brand-600"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <ConfirmActionButton
                action={deleteMaterialAction.bind(null, m.id, course.id)}
                message="ফাইলটি মুছে ফেলবেন?"
                iconOnly
              />
            </li>
          ))}
          {materialRows.length === 0 && (
            <li className="rounded-2xl border border-dashed border-ink-200 py-8 text-center text-sm text-ink-400">
              এখনো কোনো ফাইল নেই — নিচের ফর্ম থেকে যুক্ত করুন
            </li>
          )}
        </ul>

        <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
          <h3 className="font-bold text-ink-900">নতুন ফাইল যুক্ত করুন</h3>
          <div className="mt-4">
            <MaterialAddForm action={addMaterialAction.bind(null)} courseId={course.id} />
          </div>
        </div>
      </section>

      {/* Students */}
      <section className="rounded-3xl border border-ink-100 bg-white p-7 shadow-sm sm:p-9">
        <h2 className="flex items-center gap-2.5 text-xl font-bold text-ink-900">
          <Users className="h-6 w-6 text-brand-500" /> এনরোল করা শিক্ষার্থী
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
            {toBn(studentRows.length)}জন
          </span>
        </h2>

        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
          <h3 className="font-bold text-ink-900">শিক্ষার্থীকে এক্সেস দিন</h3>
          <div className="mt-3">
            <GrantAccessForm
              action={grantEnrollmentByEmailAction.bind(null)}
              courseId={course.id}
            />
          </div>
        </div>

        <ul className="mt-6 divide-y divide-ink-50">
          {studentRows.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 font-bold text-brand-600">
                {s.name.slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-800">{s.name}</p>
                <p className="truncate text-xs text-ink-400">
                  {s.email} · যুক্ত হয়েছে {bnDate(s.createdAt)}
                </p>
              </div>
              <ConfirmActionButton
                action={removeEnrollmentAction.bind(null, s.id, course.id)}
                message={`${s.name}-এর এক্সেস বাতিল করবেন?`}
                label="এক্সেস বাতিল"
              />
            </li>
          ))}
          {studentRows.length === 0 && (
            <li className="py-8 text-center text-sm text-ink-400">
              এখনো কেউ এই কোর্সে এক্সেস নেয়নি
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

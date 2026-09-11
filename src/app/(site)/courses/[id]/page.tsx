import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, count, eq } from "drizzle-orm";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  CalendarClock,
  Gift,
  Infinity as InfinityIcon,
  LockKeyhole,
  MonitorPlay,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import { db } from "@/db";
import { bonusVideos, classes, classProgress, courses, enrollments, materials } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { bnOrdinal, bnPrice, toBn } from "@/lib/bangla";
import { driveDownloadUrl, driveViewUrl } from "@/lib/drive";
import { thumbnailCandidates } from "@/lib/thumbnail";
import { SmartImage } from "@/components/smart-image";
import { parseVideoSource } from "@/lib/video";
import { EnrollButton } from "@/components/enroll-button";
import { CompleteButton } from "@/components/complete-button";
import { ProgressBar } from "@/components/progress-bar";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ class?: string; bonus?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return { title: course ? course.title : "কোর্স" };
}

export default async function CourseDetailPage({ params, searchParams }: Props) {
  const [{ id }, { class: selectedClassId, bonus: selectedBonusId }] = await Promise.all([
    params,
    searchParams,
  ]);

  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  if (!course || !course.isPublished) notFound();

  const [classRows, bonusRows, materialRows, user, [studentRow]] = await Promise.all([
    db.select().from(classes).where(eq(classes.courseId, id)).orderBy(asc(classes.orderIndex), asc(classes.createdAt)),
    db.select().from(bonusVideos).where(eq(bonusVideos.courseId, id)).orderBy(asc(bonusVideos.orderIndex), asc(bonusVideos.createdAt)),
    db.select().from(materials).where(eq(materials.courseId, id)).orderBy(asc(materials.createdAt)),
    getCurrentUser(),
    db.select({ value: count() }).from(enrollments).where(eq(enrollments.courseId, id)),
  ]);

  const isAdmin = user?.role === "admin";
  let enrolled = isAdmin;
  if (user && !enrolled) {
    const [row] = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, id)))
      .limit(1);
    enrolled = Boolean(row);
  }

  // এই ইউজারের সম্পন্ন ক্লাসগুলো
  let completedIds = new Set<string>();
  if (user) {
    const progressRows = await db
      .select({ classId: classProgress.classId })
      .from(classProgress)
      .where(and(eq(classProgress.userId, user.id), eq(classProgress.courseId, id)));
    completedIds = new Set(progressRows.map((r) => r.classId));
  }

  const isUpcoming = course.isUpcoming;
  const canAccess = (isFree: boolean) => !isUpcoming && (enrolled || isFree);

  // সক্রিয় কনটেন্ট নির্বাচন: বোনাস > নির্বাচিত ক্লাস > প্রথম অ্যাক্সেসযোগ্য
  const activeBonus = selectedBonusId
    ? (bonusRows.find((b) => b.id === selectedBonusId) ?? null)
    : null;
  const firstAccessibleClass = classRows.find((c) => canAccess(c.isFree)) ?? classRows[0];
  const activeClass = activeBonus
    ? null
    : (classRows.find((c) => c.id === selectedClassId) ?? firstAccessibleClass ?? null);

  const activeUnlocked = activeBonus
    ? canAccess(activeBonus.isFree)
    : activeClass
      ? canAccess(activeClass.isFree)
      : false;

  const activeIndex = activeClass ? classRows.indexOf(activeClass) : -1;
  const prevClass = activeIndex > 0 ? classRows[activeIndex - 1] : null;
  const nextClass =
    activeIndex >= 0 && activeIndex < classRows.length - 1 ? classRows[activeIndex + 1] : null;

  const videoSource = activeBonus
    ? parseVideoSource(activeBonus.videoUrl)
    : activeClass
      ? parseVideoSource(activeClass.driveUrl)
      : null;

  const students = studentRow?.value ?? 0;
  const completedCount = completedIds.size;

  return (
    <div>
      {/* ------------------------- COURSE HEADER ------------------------- */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div
          aria-hidden
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-[100px]"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-brand-900/40 blur-[90px]"
        />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8 lg:py-14">
          <div>
            <nav className="flex items-center gap-1.5 text-sm text-white/50">
              <Link href="/" className="transition hover:text-white">
                হোম
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/#courses" className="transition hover:text-white">
                কোর্সসমূহ
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-brand-300">{course.category}</span>
            </nav>

            {isUpcoming ? (
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gold-400/20 px-3.5 py-1 text-xs font-bold text-gold-300 ring-1 ring-gold-400/40">
                <CalendarClock className="h-3.5 w-3.5" /> আপকামিং কোর্স
              </span>
            ) : (
              course.badge && (
                <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3.5 py-1 text-xs font-bold text-white shadow-lg shadow-brand-500/40">
                  <BadgeCheck className="h-3.5 w-3.5" /> {course.badge}
                </span>
              )
            )}

            <h1 className="mt-3 text-2xl font-bold leading-snug tracking-tight sm:text-4xl lg:text-[2.5rem]">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/60 sm:text-[17px]">
                {course.subtitle}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <BookOpenCheck className="h-4 w-4 text-brand-300" />
                {toBn(classRows.length)}টি ক্লাস
              </span>
              {bonusRows.length > 0 && (
                <span className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-gold-400" />
                  {toBn(bonusRows.length)}টি বোনাস
                </span>
              )}
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-300" />
                {toBn(materialRows.length)}টি নোট
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-300" />
                {toBn(Math.max(students, 47))}+ শিক্ষার্থী
              </span>
              <span className="flex items-center gap-2">
                <InfinityIcon className="h-4 w-4 text-brand-300" />
                লাইফটাইম এক্সেস
              </span>
            </div>

            {enrolled && !isUpcoming && classRows.length > 0 && (
              <div className="mt-6 max-w-sm rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-white/60">
                  <Sparkles className="h-3.5 w-3.5 text-gold-400" /> আপনার অগ্রগতি
                </p>
                <div className="[&_.text-ink-500]:text-white/70">
                  <ProgressBar completed={completedCount} total={classRows.length} />
                </div>
              </div>
            )}
          </div>

          {/* Pricing card (desktop) */}
          <div className="hidden lg:block">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
              <div className="overflow-hidden rounded-2xl">
                <SmartImage
                  candidates={thumbnailCandidates(course.thumbnail, 800)}
                  alt={course.title}
                  fallbackLabel={course.title}
                  eager
                  className="aspect-video w-full object-cover"
                />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-white/50">কোর্স ফি</p>
                  <p className="text-3xl font-bold text-white">{bnPrice(course.price)}</p>
                </div>
                {enrolled && !isUpcoming && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" /> এনরোলড
                  </span>
                )}
              </div>
              {isUpcoming ? (
                <div className="mt-4 rounded-2xl border border-gold-400/40 bg-gold-400/10 p-4 text-center">
                  <p className="flex items-center justify-center gap-2 font-bold text-gold-300">
                    <CalendarClock className="h-5 w-5" /> শীঘ্রই আসছে
                  </p>
                  <p className="mt-1 text-xs text-white/55">
                    {course.launchNote || "কোর্সটি এখনো চালু হয়নি — খুব শীঘ্রই আসছে"}
                  </p>
                </div>
              ) : (
                !enrolled && (
                  <div className="mt-4">
                    <EnrollButton courseId={course.id} price={course.price} fullWidth />
                    <p className="mt-3 text-center text-xs text-white/45">
                      একবার এক্সেস নিলেই সারাজীবনের জন্য
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------- PLAYER + SYLLABUS ------------------------ */}
      <section id="player" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6 lg:py-12 lg:px-8">
        {/* Mobile pricing card */}
        {!enrolled && !isUpcoming && (
          <div className="mb-6 rounded-3xl border border-ink-100 bg-white p-5 shadow-lg shadow-ink-900/5 lg:hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-400">কোর্স ফি</p>
                <p className="text-2xl font-bold text-brand-600">{bnPrice(course.price)}</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-400">
                <InfinityIcon className="h-4 w-4" /> লাইফটাইম
              </span>
            </div>
            <div className="mt-3">
              <EnrollButton courseId={course.id} price={course.price} fullWidth />
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr]">
          {/* Player */}
          <div>
            {(activeClass || activeBonus) && activeUnlocked && videoSource?.embedUrl ? (
              <div>
                <div className="relative overflow-hidden rounded-2xl border border-ink-100 bg-black shadow-2xl shadow-ink-900/20 sm:rounded-3xl">
                  <iframe
                    key={(activeBonus ?? activeClass)?.id}
                    src={videoSource.embedUrl}
                    title={(activeBonus ?? activeClass)?.title ?? "ভিডিও প্লেয়ার"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    className="aspect-video w-full"
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className={`flex items-center gap-1.5 text-sm font-semibold ${activeBonus ? "text-gold-500" : "text-brand-600"}`}>
                      {activeBonus ? (
                        <>
                          <Gift className="h-4 w-4" /> বোনাস ক্লাস
                        </>
                      ) : (
                        <>{bnOrdinal(activeIndex + 1)} ক্লাস</>
                      )}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-ink-900 sm:text-2xl">
                      {(activeBonus ?? activeClass)?.title}
                    </h2>
                    {(activeBonus ?? activeClass)?.duration && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-400">
                        <Clock3 className="h-4 w-4" /> {(activeBonus ?? activeClass)?.duration}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {activeBonus ? (
                      <Link
                        href={`/courses/${id}#player`}
                        className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-600"
                      >
                        <ArrowLeft className="h-4 w-4" /> মূল ক্লাসে ফিরুন
                      </Link>
                    ) : prevClass ? (
                      <Link
                        href={`/courses/${id}?class=${prevClass.id}#player`}
                        className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-600"
                      >
                        <ArrowLeft className="h-4 w-4" /> আগের ক্লাস
                      </Link>
                    ) : null}

                    {activeClass && nextClass && (
                      <Link
                        href={`/courses/${id}?class=${nextClass.id}#player`}
                        className="flex items-center gap-2 rounded-xl bg-ink-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-600"
                      >
                        পরের ক্লাস <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>

                  {enrolled && activeClass && (
                    <CompleteButton
                      classId={activeClass.id}
                      courseId={course.id}
                      completed={completedIds.has(activeClass.id)}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Locked state */
              <div className="relative overflow-hidden rounded-2xl border border-ink-100 bg-ink-950 shadow-2xl shadow-ink-900/20 sm:rounded-3xl">
                <SmartImage
                  candidates={thumbnailCandidates(course.thumbnail, 1280)}
                  alt=""
                  fallbackLabel=""
                  className="absolute inset-0 h-full w-full object-cover opacity-25 blur-sm"
                />
                <div className="relative flex aspect-video flex-col items-center justify-center gap-4 p-8 text-center text-white">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                    {isUpcoming ? (
                      <CalendarClock className="h-8 w-8 text-gold-300" />
                    ) : (
                      <LockKeyhole className="h-8 w-8" />
                    )}
                  </span>
                  {isUpcoming ? (
                    <>
                      <h2 className="max-w-md text-xl font-bold sm:text-2xl">
                        কোর্সটি শীঘ্রই আসছে
                      </h2>
                      <p className="max-w-sm text-sm text-white/60">
                        {course.launchNote ||
                          "কোর্সটি এখনো চালু হয়নি। চালু হলেই এখানে সব ক্লাস দেখতে পাবেন।"}
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="max-w-md text-xl font-bold sm:text-2xl">
                        এই ক্লাসগুলো দেখতে কোর্সের এক্সেস প্রয়োজন
                      </h2>
                      <p className="max-w-sm text-sm text-white/60">
                        এক্সেস নিলেই {toBn(classRows.length)}টি ক্লাস
                        {bonusRows.length > 0 && `, ${toBn(bonusRows.length)}টি বোনাস ভিডিও`} ও{" "}
                        {toBn(materialRows.length)}টি নোট সাথে সাথে আনলক হয়ে যাবে
                      </p>
                      <EnrollButton courseId={course.id} price={course.price} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {course.description && (
              <div className="mt-10 rounded-3xl border border-ink-100 bg-white p-6 shadow-sm sm:p-7">
                <h3 className="text-xl font-bold text-ink-900">কোর্স সম্পর্কে</h3>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-500">
                  {course.description}
                </p>
              </div>
            )}
          </div>

          {/* Class list */}
          <aside>
            <div className="sticky top-24 rounded-3xl border border-ink-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-lg font-bold text-ink-900">
                  <MonitorPlay className="h-5 w-5 text-brand-500" /> ক্লাস লিস্ট
                </h3>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
                  {toBn(classRows.length)}টি
                </span>
              </div>

              {enrolled && !isUpcoming && classRows.length > 0 && (
                <div className="mt-4 rounded-2xl bg-ink-50/70 p-3.5">
                  <ProgressBar completed={completedCount} total={classRows.length} size="sm" />
                </div>
              )}

              <ul className="no-scrollbar mt-4 max-h-[24rem] space-y-2 overflow-y-auto pr-1">
                {classRows.map((cls, i) => {
                  const unlocked = canAccess(cls.isFree);
                  const active = activeClass?.id === cls.id;
                  const done = completedIds.has(cls.id);
                  return (
                    <li key={cls.id}>
                      <Link
                        href={`/courses/${id}?class=${cls.id}#player`}
                        className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                          active
                            ? "border-brand-500 bg-brand-50 shadow-sm shadow-brand-500/10"
                            : "border-ink-100 bg-white hover:border-brand-200 hover:bg-brand-50/50"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                            done
                              ? "bg-emerald-500 text-white"
                              : active
                                ? "bg-brand-500 text-white"
                                : unlocked
                                  ? "bg-ink-900/5 text-ink-800"
                                  : "bg-ink-50 text-ink-300"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : unlocked ? (
                            active ? (
                              <Play className="h-4 w-4 fill-current" />
                            ) : (
                              toBn(i + 1)
                            )
                          ) : (
                            <LockKeyhole className="h-4 w-4" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-sm font-semibold ${
                              active ? "text-brand-700" : "text-ink-800"
                            }`}
                          >
                            {bnOrdinal(i + 1)} ক্লাস: {cls.title}
                          </span>
                          <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-400">
                            {cls.duration && (
                              <span className="flex items-center gap-1">
                                <Clock3 className="h-3 w-3" /> {cls.duration}
                              </span>
                            )}
                            {done && <span className="font-bold text-emerald-600">শেষ ✓</span>}
                            {cls.isFree && !enrolled && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600">
                                ফ্রি প্রিভিউ
                              </span>
                            )}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
                {classRows.length === 0 && (
                  <li className="rounded-2xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">
                    শীঘ্রই ক্লাস যুক্ত হবে
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* ----------------------------- BONUS VIDEOS ----------------------------- */}
      {bonusRows.length > 0 && (
        <section className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-14 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-gold-400/30 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950 text-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6 sm:px-8">
              <h3 className="flex items-center gap-2.5 text-xl font-bold sm:text-2xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/15 text-gold-400">
                  <Gift className="h-5 w-5" />
                </span>
                বোনাস ভিডিও
                <span className="rounded-full bg-gold-400/15 px-3 py-1 text-xs font-bold text-gold-300">
                  {toBn(bonusRows.length)}টি
                </span>
              </h3>
              <p className="text-sm text-white/50">কোর্সের সাথে একদম ফ্রি অতিরিক্ত ক্লাস</p>
            </div>

            <div className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-7 sm:grid sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
              {bonusRows.map((bonus) => {
                const source = parseVideoSource(bonus.videoUrl);
                const unlocked = canAccess(bonus.isFree);
                const active = activeBonus?.id === bonus.id;

                return (
                  <Link
                    key={bonus.id}
                    href={`/courses/${id}?bonus=${bonus.id}#player`}
                    className={`group relative flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border text-left transition sm:w-auto ${
                      active
                        ? "border-gold-400 shadow-lg shadow-gold-500/20"
                        : "border-white/10 hover:border-gold-400/50"
                    }`}
                  >
                    <span className="relative block aspect-video overflow-hidden bg-ink-800">
                      {source.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={source.thumbnail}
                          alt={bonus.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold-500/40 to-brand-700">
                          <Gift className="h-8 w-8 text-white/70" />
                        </span>
                      )}
                      <span className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                      <span
                        className={`absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur transition group-hover:scale-110 ${
                          unlocked ? "bg-brand-500/90" : "bg-ink-950/70"
                        }`}
                      >
                        {unlocked ? (
                          <Play className="ml-0.5 h-5 w-5 fill-current text-white" />
                        ) : (
                          <LockKeyhole className="h-5 w-5 text-white/80" />
                        )}
                      </span>
                      {bonus.duration && (
                        <span className="absolute bottom-2 right-2 rounded-md bg-ink-950/80 px-2 py-0.5 text-[11px] font-bold text-white">
                          {bonus.duration}
                        </span>
                      )}
                      {bonus.isFree && !enrolled && (
                        <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                          ফ্রি প্রিভিউ
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2 px-4 py-3.5">
                      <span className="line-clamp-2 flex-1 text-sm font-bold leading-snug text-white/90">
                        {bonus.title}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>

            {!enrolled && !isUpcoming && (
              <div className="border-t border-white/10 px-6 py-4 sm:px-8">
                <p className="flex flex-wrap items-center gap-2 text-sm text-white/60">
                  <LockKeyhole className="h-4 w-4 text-gold-400" />
                  কোর্সের এক্সেস নিলেই সব বোনাস ভিডিও আনলক হয়ে যাবে
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---------------------------- MATERIALS ---------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-ink-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-50 bg-gradient-to-r from-brand-50/80 to-transparent px-6 py-5 sm:px-7">
            <h3 className="flex items-center gap-2.5 text-xl font-bold text-ink-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                <FileText className="h-5 w-5" />
              </span>
              পিডিএফ ও ক্লাস ফাইল
            </h3>
            <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink-500 shadow-sm">
              {toBn(materialRows.length)}টি ফাইল
            </span>
          </div>

          {enrolled ? (
            materialRows.length > 0 ? (
              <ul className="divide-y divide-ink-50">
                {materialRows.map((m, i) => (
                  <li
                    key={m.id}
                    className="group flex flex-wrap items-center gap-3 px-5 py-4 transition hover:bg-brand-50/40 sm:flex-nowrap sm:gap-4 sm:px-7"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                      <p className="truncate font-semibold text-ink-800">{m.title}</p>
                      <p className="text-xs uppercase tracking-wide text-ink-300">
                        {m.type} ফাইল · নম্বর {toBn(i + 1)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={driveViewUrl(m.driveUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-ink-200 px-3.5 py-2 text-xs font-bold text-ink-600 transition hover:border-brand-300 hover:text-brand-600"
                      >
                        দেখুন
                      </a>
                      <a
                        href={driveDownloadUrl(m.driveUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand-600"
                      >
                        <Download className="h-3.5 w-3.5" /> ডাউনলোড
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-7 py-10 text-center text-sm text-ink-400">
                এই কোর্সে এখনো কোনো ফাইল যুক্ত হয়নি
              </p>
            )
          ) : (
            <div className="flex flex-col items-center gap-3 px-7 py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                <LockKeyhole className="h-7 w-7" />
              </span>
              <p className="text-lg font-bold text-ink-800">
                {isUpcoming ? "কোর্সটি এখনো চালু হয়নি" : "নোট ও ফাইলগুলো লক করা আছে"}
              </p>
              <p className="max-w-sm text-sm text-ink-400">
                {isUpcoming
                  ? course.launchNote || "কোর্স চালু হলেই সব নোট ও ফাইল এখানে পাবেন"
                  : "কোর্সের এক্সেস নিলেই সব পিডিএফ নোট, লেকচার শীট ও প্র্যাকটিস ফাইল ডাউনলোড করা যাবে"}
              </p>
              {!isUpcoming && (
                <div className="mt-2">
                  <EnrollButton courseId={course.id} price={course.price} />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* --------------------- MOBILE STICKY ENROLL BAR --------------------- */}
      {!enrolled && !isUpcoming && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-ink-500">{course.title}</p>
              <p className="text-lg font-bold leading-tight text-brand-600">
                {bnPrice(course.price)}
              </p>
            </div>
            <EnrollButton courseId={course.id} price={course.price} />
          </div>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, BookOpenCheck, CalendarClock, FileText, Gift } from "lucide-react";
import { bnPrice, toBn } from "@/lib/bangla";
import { thumbnailCandidates } from "@/lib/thumbnail";
import { SmartImage } from "@/components/smart-image";

export type CourseCardData = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  thumbnail: string;
  badge: string;
  price: number;
  isUpcoming: boolean;
  launchNote: string;
  classCount: number;
  materialCount: number;
  bonusCount: number;
};

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm shadow-ink-900/5 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/10"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-100">
        <SmartImage
          candidates={thumbnailCandidates(course.thumbnail, 800)}
          alt={course.title}
          fallbackLabel={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {course.isUpcoming ? (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1 text-xs font-bold text-gold-400 shadow-lg">
            <CalendarClock className="h-3.5 w-3.5" /> আপকামিং
          </span>
        ) : (
          course.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-brand-900/30">
              {course.badge}
            </span>
          )
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink-700 backdrop-blur">
          {course.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-[17px] font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand-600">
          {course.title}
        </h3>
        {course.subtitle && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-400">
            {course.subtitle}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-ink-500">
          <span className="flex items-center gap-1.5">
            <BookOpenCheck className="h-4 w-4 text-brand-500" />
            {toBn(course.classCount)}টি ক্লাস
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-brand-500" />
            {toBn(course.materialCount)}টি নোট
          </span>
          {course.bonusCount > 0 && (
            <span className="flex items-center gap-1.5 text-gold-500">
              <Gift className="h-4 w-4" />
              {toBn(course.bonusCount)}টি বোনাস
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-ink-50 pt-4">
          {course.isUpcoming ? (
            <p className="line-clamp-1 text-sm font-bold text-ink-500">
              {course.launchNote || "শীঘ্রই আসছে"}
            </p>
          ) : (
            <p className="text-lg font-bold text-brand-600">{bnPrice(course.price)}</p>
          )}
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-800 transition-all group-hover:gap-2 group-hover:text-brand-600">
            বিস্তারিত <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

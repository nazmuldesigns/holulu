"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SearchX } from "lucide-react";
import { CourseCard, type CourseCardData } from "@/components/course-card";
import { toBn } from "@/lib/bangla";

function normalize(text: string): string {
  return text.toLowerCase().replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
}

/**
 * ক্যাটাগরি প্যারাম এখন ক্লায়েন্টে পড়া হয় — ফলে ল্যান্ডিং পেজটি
 * সম্পূর্ণ স্ট্যাটিকভাবে প্রি-রেন্ডার/ISR করা যায় (দ্রুত লোড)।
 */
export default function CourseExplorer({
  courses,
  categories,
}: {
  courses: CourseCardData[];
  categories: string[];
}) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("সব");

  // URL-এ ?category= থাকলে সেটি প্রয়োগ করি (ফুটার/বাইরের ডিপ-লিংক)
  useEffect(() => {
    const c = searchParams.get("category");
    if (c && categories.includes(c)) setCategory(c);
  }, [searchParams, categories]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return courses.filter((c) => {
      const matchesCategory = category === "সব" || c.category === category;
      const text = normalize(`${c.title} ${c.subtitle} ${c.category}`);
      return matchesCategory && (!q || text.includes(q));
    });
  }, [courses, query, category]);

  return (
    <div>
      <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="কোর্স খুঁজুন — যেমন: Spoken English"
            className="w-full rounded-full border border-ink-100 bg-white py-3 pl-12 pr-4 text-[15px] text-ink-900 shadow-sm outline-none transition placeholder:text-ink-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
          />
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {["সব", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                category === c
                  ? "border-brand-500 bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                  : "border-ink-100 bg-white text-ink-600 hover:border-brand-200 hover:text-brand-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm text-ink-400">
        {toBn(filtered.length)}টি কোর্স পাওয়া গেছে
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-ink-200 bg-white py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <SearchX className="h-7 w-7" />
          </span>
          <p className="text-lg font-bold text-ink-800">কোনো কোর্স পাওয়া যায়নি</p>
          <p className="text-sm text-ink-400">
            অন্য কিছু লিখে খুঁজে দেখুন অথবা ক্যাটাগরি পরিবর্তন করুন
          </p>
        </div>
      )}
    </div>
  );
}

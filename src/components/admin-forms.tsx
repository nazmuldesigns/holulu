"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ImagePlus,
  Link2,
  Mail,
  Phone,
  Plus,
  UserPlus,
} from "lucide-react";
import type { AdminFormState } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { SmartImage } from "@/components/smart-image";
import { thumbnailCandidates } from "@/lib/thumbnail";

type CourseDefaults = {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  badge?: string;
  price?: number;
  isPublished?: boolean;
  isUpcoming?: boolean;
  launchNote?: string;
};

const CATEGORIES = [
  "ইংরেজি",
  "একাডেমিক",
  "স্কিলস",
  "পরীক্ষা প্রস্তুতি",
  "ভর্তি প্রস্তুতি",
  "ফ্রি",
];

const labelCls = "mb-1.5 block text-sm font-bold text-ink-700";
const inputCls =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-[15px] text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10";

function FormMessage({ state }: { state: AdminFormState }) {
  if (!state) return null;
  if (state.error)
    return (
      <p className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
        <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
      </p>
    );
  if (state.success)
    return (
      <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
        <CheckCircle2 className="h-4 w-4 shrink-0" /> {state.success}
      </p>
    );
  return null;
}

export function CourseForm({
  action,
  defaults = {},
  submitLabel,
}: {
  action: (prev: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  defaults?: CourseDefaults;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(action, null);
  const [thumb, setThumb] = useState(defaults.thumbnail ?? "");
  const isPublished = defaults.isPublished ?? true;

  return (
    <form action={formAction} className="space-y-5">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <FormMessage state={state} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className={labelCls}>
            কোর্সের নাম *
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={defaults.title}
            placeholder="যেমন: ঘরে বসে Spoken English"
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="subtitle" className={labelCls}>
            সংক্ষিপ্ত বিবরণ
          </label>
          <input
            id="subtitle"
            name="subtitle"
            defaultValue={defaults.subtitle}
            placeholder="কার্ডে দেখানোর জন্য ১-২ লাইন"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="category" className={labelCls}>
            ক্যাটাগরি
          </label>
          <select
            id="category"
            name="category"
            defaultValue={defaults.category ?? "স্কিলস"}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className={labelCls}>
            মূল্য (টাকা) — ০ হলে ফ্রি
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            defaultValue={defaults.price ?? 0}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="badge" className={labelCls}>
            ব্যাজ (ঐচ্ছিক)
          </label>
          <input
            id="badge"
            name="badge"
            defaultValue={defaults.badge}
            placeholder="যেমন: বেস্ট সেলার"
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="thumbnail" className={labelCls}>
            থাম্বনেইল — ইমেজ URL, Google Drive বা YouTube লিংক
          </label>
          <input
            id="thumbnail"
            name="thumbnail"
            value={thumb}
            onChange={(e) => setThumb(e.target.value)}
            placeholder="https://drive.google.com/file/d/... অথবা YouTube লিংক"
            className={inputCls}
          />
          <p className="mt-1.5 text-xs text-ink-400">
            ড্রাইভের ছবি ব্যবহার করলে ফাইলটি অবশ্যই “Anyone with the link” শেয়ার করা থাকতে হবে
          </p>
          {thumb.trim() && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/50 p-3">
              <span className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                <SmartImage
                  candidates={thumbnailCandidates(thumb, 400)}
                  alt="প্রিভিউ"
                  fallbackLabel="লোড হয়নি"
                  className="h-full w-full object-cover"
                />
              </span>
              <p className="text-xs text-ink-400">
                ↑ থাম্বনেইল প্রিভিউ — ছবি না এলে লিংকের শেয়ার সেটিং ঠিক করুন
              </p>
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelCls}>
            বিস্তারিত বিবরণ
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={defaults.description}
            placeholder="কোর্সে যা যা থাকছে, কাদের জন্য উপযুক্ত ইত্যাদি লিখুন"
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="launchNote" className={labelCls}>
            আপকামিং নোট (যেমন: “১ জানুয়ারি থেকে শুরু”)
          </label>
          <input
            id="launchNote"
            name="launchNote"
            defaultValue={defaults.launchNote}
            placeholder="আপকামিং কোর্সে কার্ডে ও পেজে এই লেখাটি দেখাবে"
            className={inputCls}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3.5 sm:col-span-2">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={isPublished}
            className="h-5 w-5 rounded accent-brand-600"
          />
          <span className="text-sm font-semibold text-ink-700">
            কোর্সটি ওয়েবসাইটে প্রকাশ করুন (Published)
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gold-400/50 bg-gold-400/10 px-4 py-3.5 sm:col-span-2">
          <input
            type="checkbox"
            name="isUpcoming"
            defaultChecked={defaults.isUpcoming ?? false}
            className="mt-0.5 h-5 w-5 rounded accent-gold-500"
          />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-bold text-ink-800">
              <CalendarClock className="h-4 w-4 text-gold-500" /> আপকামিং কোর্স (Coming Soon)
            </span>
            <span className="mt-0.5 block text-xs text-ink-500">
              টিক দিলে কোর্সটি সবাই দেখতে পাবে, কিন্তু কেউ এক্সেস নিতে বা ক্লাস দেখতে পারবে না
            </span>
          </span>
        </label>
      </div>

      <SubmitButton className="w-full sm:w-auto">{submitLabel}</SubmitButton>
    </form>
  );
}

export function ClassAddForm({
  action,
  courseId,
}: {
  action: (prev: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  courseId: string;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="courseId" value={courseId} />
      <FormMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>ক্লাসের নাম *</label>
          <input name="title" required placeholder="যেমন: পরিচিতি ও কোর্স আউটলাইন" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>ভিডিওর সময়</label>
          <input name="duration" placeholder="যেমন: ২৫ মিনিট" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Google Drive / YouTube লিংক *</label>
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
            <input
              name="driveUrl"
              required
              placeholder="ড্রাইভ ফাইল লিংক অথবা YouTube ভিডিও লিংক"
              className={`${inputCls} pl-12`}
            />
          </div>
          <p className="mt-1.5 text-xs text-ink-400">
            YouTube লিংক দিলে ওয়েবসাইটের নিজস্ব প্লেয়ারে প্লে হবে · ড্রাইভ ফাইল “Anyone with
            the link” হিসেবে শেয়ার করা থাকতে হবে
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-700">
          <input type="checkbox" name="isFree" className="h-4.5 w-4.5 rounded accent-brand-600" />
          ফ্রি প্রিভিউ ক্লাস
        </label>
        <input type="hidden" name="type" value="video" />
        <SubmitButton className="!px-5 !py-2.5 text-sm">
          <Plus className="h-4 w-4" /> ক্লাস যুক্ত করুন
        </SubmitButton>
      </div>
    </form>
  );
}

export function BonusAddForm({
  action,
  courseId,
}: {
  action: (prev: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  courseId: string;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="courseId" value={courseId} />
      <FormMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>বোনাস ভিডিওর নাম *</label>
          <input
            name="title"
            required
            placeholder="যেমন: বোনাস — উচ্চারণ মাস্টারক্লাস"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>ভিডিওর সময়</label>
          <input name="duration" placeholder="যেমন: ৪৫ মিনিট" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>YouTube / Google Drive লিংক *</label>
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
            <input
              name="videoUrl"
              required
              placeholder="https://youtube.com/watch?v=... অথবা ড্রাইভ লিংক"
              className={`${inputCls} pl-12`}
            />
          </div>
          <p className="mt-1.5 text-xs text-ink-400">
            সব ধরনের YouTube লিংক (watch, youtu.be, shorts) সাপোর্টেড — সাইটের ভেতরেই প্লে হবে
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-700">
          <input type="checkbox" name="isFree" className="h-4.5 w-4.5 rounded accent-brand-600" />
          ফ্রি প্রিভিউ
        </label>
        <SubmitButton className="!px-5 !py-2.5 text-sm">
          <Plus className="h-4 w-4" /> বোনাস ভিডিও যুক্ত করুন
        </SubmitButton>
      </div>
    </form>
  );
}

export function MaterialAddForm({
  action,
  courseId,
}: {
  action: (prev: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  courseId: string;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="courseId" value={courseId} />
      <FormMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
        <div>
          <label className={labelCls}>ফাইলের নাম *</label>
          <input name="title" required placeholder="যেমন: লেকচার শীট — Use of Articles" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>ফাইলের ধরন</label>
          <select name="type" defaultValue="pdf" className={inputCls}>
            <option value="pdf">PDF</option>
            <option value="doc">ডকুমেন্ট</option>
            <option value="sheet">স্প্রেডশীট</option>
            <option value="slide">স্লাইড</option>
            <option value="other">অন্যান্য</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Google Drive লিংক *</label>
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
            <input
              name="driveUrl"
              required
              placeholder="https://drive.google.com/file/d/.../view"
              className={`${inputCls} pl-12`}
            />
          </div>
        </div>
      </div>

      <SubmitButton className="!px-5 !py-2.5 text-sm">
        <ImagePlus className="h-4 w-4" /> ফাইল যুক্ত করুন
      </SubmitButton>
    </form>
  );
}

export function GrantAccessForm({
  action,
  courseId,
}: {
  action: (prev: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  courseId: string;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="courseId" value={courseId} />
      <FormMessage state={state} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          placeholder="শিক্ষার্থীর ইমেইল (যেমন: student@mail.com)"
          className={`${inputCls} flex-1`}
        />
        <SubmitButton className="!px-5 !py-3 text-sm shrink-0">
          <Plus className="h-4 w-4" /> এক্সেস দিন
        </SubmitButton>
      </div>
      <p className="text-xs text-ink-400">
        শিক্ষার্থীকে আগে ওয়েবসাইটে ফ্রি অ্যাকাউন্ট খুলতে হবে — তারপর তার ইমেইল দিয়ে এখান থেকে
        এক্সেস দিন
      </p>
    </form>
  );
}

export function AccessGrantForm({
  action,
  courses,
}: {
  action: (prev: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  courses: Array<{ id: string; title: string; isUpcoming: boolean }>;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setSelected([]);
    }
  }, [state]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const allIds = courses.map((c) => c.id);
  const allSelected = selected.length === allIds.length && allIds.length > 0;

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <FormMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>ইমেইল ঠিকানা</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
            <input
              name="email"
              type="email"
              placeholder="student@mail.com"
              className={`${inputCls} pl-12`}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>মোবাইল নম্বর</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
            <input
              name="phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              className={`${inputCls} pl-12`}
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>নোট (ঐচ্ছিক — যেমন: “বিকাশে পেমেন্ট করেছে”)</label>
          <input name="note" placeholder="নিজের মনে রাখার জন্য" className={inputCls} />
        </div>
      </div>

      <p className="-mt-2 text-xs text-ink-400">
        ইমেইল অথবা মোবাইল — অন্তত একটি দিন। দুটো দিলে যেকোনো একটি দিয়ে অ্যাকাউন্ট খুললেই এক্সেস
        পাবে।
      </p>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className={labelCls + " !mb-0"}>
            কোন কোন কোর্সের এক্সেস দেবেন? ({selected.length}টি সিলেক্টেড)
          </span>
          <button
            type="button"
            onClick={() => setSelected(allSelected ? [] : allIds)}
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            {allSelected ? "সব বাদ দিন" : "সব সিলেক্ট করুন"}
          </button>
        </div>

        <div className="no-scrollbar max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-ink-200 bg-white p-3">
          {courses.map((course) => (
            <label
              key={course.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition ${
                selected.includes(course.id)
                  ? "border-brand-400 bg-brand-50"
                  : "border-ink-100 hover:border-brand-200 hover:bg-brand-50/40"
              }`}
            >
              <input
                type="checkbox"
                name="courseIds"
                value={course.id}
                checked={selected.includes(course.id)}
                onChange={() => toggle(course.id)}
                className="h-4.5 w-4.5 rounded accent-brand-600"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-800">
                {course.title}
              </span>
              {course.isUpcoming && (
                <span className="shrink-0 rounded-full bg-gold-400/20 px-2 py-0.5 text-[11px] font-bold text-gold-600">
                  আপকামিং
                </span>
              )}
            </label>
          ))}
          {courses.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-400">এখনো কোনো কোর্স নেই</p>
          )}
        </div>
      </div>

      <SubmitButton className="w-full sm:w-auto">
        <UserPlus className="h-4 w-4" /> এক্সেস যুক্ত করুন
      </SubmitButton>
    </form>
  );
}

export function SettingsForm({
  action,
  defaults,
}: {
  action: (prev: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  defaults: Record<string, string>;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>সাইটের নাম (কোচিং সেন্টার / ব্র্যান্ড)</label>
          <input name="site_name" defaultValue={defaults.site_name} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>ট্যাগলাইন</label>
          <input name="site_tagline" defaultValue={defaults.site_tagline} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>লোগো URL (ঐচ্ছিক — খালি রাখলে ডিফল্ট লোগো)</label>
          <input
            name="logo_url"
            defaultValue={defaults.logo_url}
            placeholder="https://... অথবা Google Drive লিংক"
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>হিরো শিরোনাম</label>
          <input name="hero_title" defaultValue={defaults.hero_title} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>হিরো সাবটাইটেল</label>
          <textarea
            name="hero_subtitle"
            rows={3}
            defaultValue={defaults.hero_subtitle}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>হটলাইন / ফোন</label>
          <input name="phone" defaultValue={defaults.phone} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>ফুটারে প্রতিষ্ঠান সম্পর্কে</label>
          <input name="footer_about" defaultValue={defaults.footer_about} className={inputCls} />
        </div>
      </div>

      <SubmitButton className="w-full sm:w-auto">সেটিংস সেভ করুন</SubmitButton>
    </form>
  );
}

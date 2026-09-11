"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Link2,
  Loader2,
  PencilLine,
  Plus,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import type { AdminFormState } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { isDriveUrl, isYouTubeUrl } from "@/lib/video";

/* ------------------------------ shared styles ------------------------------ */

const labelCls = "mb-1.5 block text-sm font-bold text-ink-700";
const inputCls =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-[15px] text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10";

type Action = (prev: AdminFormState, formData: FormData) => Promise<AdminFormState>;

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

type Row = { title: string; url: string; duration: string; order: string; isFree: boolean };

const emptyRow: Row = { title: "", url: "", duration: "", order: "", isFree: false };

/* --------------------------- bulk add (max 5 rows) --------------------------- */

function BulkForm({
  action,
  courseId,
  urlLabel,
  addLabel,
  showFreePreview = true,
}: {
  action: Action;
  courseId: string;
  urlLabel: string;
  addLabel: string;
  showFreePreview?: boolean;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(action, null);
  const [rows, setRows] = useState<Row[]>([{ ...emptyRow }]);
  // প্রতি সারির অটো-মেটাডেটা অবস্থা: লোডিং + ফলাফল (সারিগুলো স্বাধীন)
  const [meta, setMeta] = useState<
    Record<number, { loading: boolean; status: "idle" | "ok" | "fail" }>
  >({});
  // কোন মানগুলো আমরা অটো-ফিল করেছি তার হিসাব — ম্যানুয়ালি লেখা মান কখনো মুছবে না
  const lastAuto = useRef<Record<number, { title?: string; duration?: string }>>({});

  useEffect(() => {
    if (state?.success) setRows([{ ...emptyRow }]);
  }, [state]);

  const update = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const canAdd = rows.length < 5;

  /**
   * URL ঘর থেকে ফোকাস সরলে (onBlur) লিংক থেকে ভিডিওর নাম ও সময় আনার চেষ্টা।
   * - শুধু খালি ঘর বা আগে অটো-ফিল হওয়া ঘরে লেখে (ম্যানুয়াল লেখা সুরক্ষিত)
   * - ব্যর্থ হলে কোনো ব্লকিং এরর নয় — ম্যানুয়াল এন্ট্রি চালু থাকে
   */
  const handleUrlBlur = async (i: number, url: string) => {
    const trimmed = url.trim();

    if (!trimmed || (!isYouTubeUrl(trimmed) && !isDriveUrl(trimmed))) {
      setMeta((m) => ({ ...m, [i]: { loading: false, status: "idle" } }));
      return;
    }

    setMeta((m) => ({ ...m, [i]: { loading: true, status: "idle" } }));

    try {
      const res = await fetch(`/api/video-meta?url=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as { title?: string; duration?: string };

      const auto = lastAuto.current[i] ?? {};
      setRows((prev) =>
        prev.map((r, idx) => {
          if (idx !== i) return r;
          const next = { ...r };
          if (data.title && (r.title === "" || r.title === auto.title)) {
            next.title = data.title;
          }
          if (data.duration && (r.duration === "" || r.duration === auto.duration)) {
            next.duration = data.duration;
          }
          return next;
        })
      );
      lastAuto.current[i] = {
        title: data.title || auto.title,
        duration: data.duration || auto.duration,
      };
      setMeta((m) => ({ ...m, [i]: { loading: false, status: "ok" } }));
    } catch {
      setMeta((m) => ({ ...m, [i]: { loading: false, status: "fail" } }));
    }

    // ইঙ্গিতটি কিছুক্ষণ পরে মিলিয়ে যাবে
    window.setTimeout(() => {
      setMeta((m) => (m[i] ? { ...m, [i]: { loading: false, status: "idle" } } : m));
    }, 2800);
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="courseId" value={courseId} />
      <FormMessage state={state} />

      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-bold text-ink-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                  {i + 1}
                </span>
                ভিডিও #{i + 1}
              </span>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                  className="flex items-center gap-1 rounded-lg border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600 transition hover:bg-brand-100"
                  aria-label={`সারি ${i + 1} মুছুন`}
                >
                  <Trash2 className="h-3.5 w-3.5" /> সারি বাদ দিন
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>ভিডিওর নাম *</label>
                <input
                  name={`title${i}`}
                  value={row.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  placeholder="যেমন: পরিচিতি ও কোর্স আউটলাইন"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>সময়</label>
                  <input
                    name={`duration${i}`}
                    value={row.duration}
                    onChange={(e) => update(i, { duration: e.target.value })}
                    placeholder="২৫ মিনিট"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>ক্রম</label>
                  <input
                    name={`order${i}`}
                    type="number"
                    min={1}
                    value={row.order}
                    onChange={(e) => update(i, { order: e.target.value })}
                    placeholder="অটো"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {urlLabel} *
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-500">
                      <Wand2 className="h-3 w-3" /> লিংক দিলে নাম-সময় স্বয়ংক্রিয়ভাবে আসবে
                    </span>
                  </span>
                </label>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
                  <input
                    name={`url${i}`}
                    value={row.url}
                    onChange={(e) => update(i, { url: e.target.value })}
                    onBlur={(e) => handleUrlBlur(i, e.target.value)}
                    placeholder="https://drive.google.com/file/d/... অথবা YouTube লিংক"
                    className={`${inputCls} pl-12 pr-10`}
                  />
                  {meta[i]?.loading && (
                    <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-[11px] font-semibold text-ink-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      মেটাডেটা লোড হচ্ছে...
                    </span>
                  )}
                </div>
                {meta[i]?.status === "ok" && (
                  <p className="mt-1.5 text-[11px] font-semibold text-emerald-600">
                    ✓ ভিডিওর তথ্য পূরণ হয়েছে — দরকার হলে বদলে নিতে পারেন
                  </p>
                )}
                {meta[i]?.status === "fail" && (
                  <p className="mt-1.5 text-[11px] font-semibold text-ink-400">
                    স্বয়ংক্রিয় তথ্য আনা যায়নি — নাম ও সময় নিজে লিখে নিন
                  </p>
                )}
              </div>
              {showFreePreview && (
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-700 sm:col-span-2">
                  <input
                    type="checkbox"
                    name={`free${i}`}
                    checked={row.isFree}
                    onChange={(e) => update(i, { isFree: e.target.checked })}
                    className="h-4.5 w-4.5 rounded accent-brand-600"
                  />
                  ফ্রি প্রিভিউ (এক্সেস ছাড়াই সবাই দেখতে পারবে)
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => setRows((prev) => [...prev, { ...emptyRow }])}
          className="flex items-center gap-1.5 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/50 px-4 py-2.5 text-sm font-bold text-brand-600 transition hover:border-brand-500 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          {canAdd ? `আরেকটি সারি যোগ করুন (${rows.length}/৫)` : "সর্বোচ্চ ৫টি সারি"}
        </button>

        <SubmitButton className="!px-5 !py-2.5 text-sm">
          <Plus className="h-4 w-4" /> {addLabel}
        </SubmitButton>
      </div>
    </form>
  );
}

export function ClassBulkForm({
  action,
  courseId,
}: {
  action: Action;
  courseId: string;
}) {
  return (
    <BulkForm
      action={action}
      courseId={courseId}
      urlLabel="Google Drive / YouTube লিংক"
      addLabel="সব ক্লাস যুক্ত করুন"
    />
  );
}

export function BonusBulkForm({
  action,
  courseId,
}: {
  action: Action;
  courseId: string;
}) {
  return (
    <BulkForm
      action={action}
      courseId={courseId}
      urlLabel="YouTube / Google Drive লিংক"
      addLabel="সব বোনাস ভিডিও যুক্ত করুন"
    />
  );
}

/* ------------------------------- edit modal ------------------------------- */

function EditModal({
  open,
  onClose,
  action,
  courseId,
  item,
  urlName,
  urlLabel,
  title,
}: {
  open: boolean;
  onClose: () => void;
  action: Action;
  courseId: string;
  item: { id: string; title: string; url: string; duration: string; orderIndex: number; isFree: boolean };
  urlName: string;
  urlLabel: string;
  title: string;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(action, null);

  useEffect(() => {
    if (state?.success) {
      const t = window.setTimeout(onClose, 700);
      return () => window.clearTimeout(t);
    }
  }, [state, onClose]);

  // Escape চাপলে বন্ধ হবে
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" />

      <div
        className="relative max-h-[92vh] w-full max-w-lg animate-rise overflow-y-auto rounded-t-[1.75rem] bg-white p-6 shadow-2xl sm:rounded-[1.75rem] sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-ink-900">
              <PencilLine className="h-5 w-5 text-brand-500" /> {title}
            </h3>
            <p className="mt-0.5 text-xs text-ink-400">
              পরিবর্তন সেভ করলে সাথে সাথেই ওয়েবসাইটে দেখা যাবে
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={formAction} className="mt-5 space-y-4">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="courseId" value={courseId} />
          <FormMessage state={state} />

          <div>
            <label className={labelCls}>ভিডিওর নাম *</label>
            <input
              name="title"
              required
              defaultValue={item.title}
              placeholder="ভিডিওর নাম লিখুন"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>{urlLabel} *</label>
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
              <input
                name={urlName}
                required
                defaultValue={item.url}
                placeholder="https://drive.google.com/... অথবা YouTube লিংক"
                className={`${inputCls} pl-12`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-ink-400" /> সময়
                </span>
              </label>
              <input
                name="duration"
                defaultValue={item.duration}
                placeholder="২৫ মিনিট"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>ক্রম (Order)</label>
              <input
                name="orderIndex"
                type="number"
                min={1}
                defaultValue={item.orderIndex}
                className={inputCls}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-700">
            <input
              type="checkbox"
              name="isFree"
              defaultChecked={item.isFree}
              className="h-4.5 w-4.5 rounded accent-brand-600"
            />
            ফ্রি প্রিভিউ (এক্সেস ছাড়াই সবাই দেখতে পারবে)
          </label>

          <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-ink-200 px-4 py-3 text-sm font-bold text-ink-600 transition hover:border-brand-300 hover:text-brand-600"
            >
              বাতিল
            </button>
            <SubmitButton className="flex-1 !py-3 text-sm">পরিবর্তন সেভ করুন</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ClassEditButton({
  action,
  courseId,
  item,
}: {
  action: Action;
  courseId: string;
  item: { id: string; title: string; url: string; duration: string; orderIndex: number; isFree: boolean };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="এডিট করুন"
        title="এডিট করুন"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 transition hover:border-brand-300 hover:text-brand-600"
      >
        <PencilLine className="h-4 w-4" />
      </button>

      <EditModal
        open={open}
        onClose={() => setOpen(false)}
        action={action}
        courseId={courseId}
        item={item}
        urlName="driveUrl"
        urlLabel="Google Drive / YouTube লিংক"
        title="ক্লাস এডিট করুন"
      />
    </>
  );
}

export function BonusEditButton({
  action,
  courseId,
  item,
}: {
  action: Action;
  courseId: string;
  item: { id: string; title: string; url: string; duration: string; orderIndex: number; isFree: boolean };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="এডিট করুন"
        title="এডিট করুন"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 transition hover:border-brand-300 hover:text-brand-600"
      >
        <PencilLine className="h-4 w-4" />
      </button>

      <EditModal
        open={open}
        onClose={() => setOpen(false)}
        action={action}
        courseId={courseId}
        item={item}
        urlName="videoUrl"
        urlLabel="YouTube / Google Drive লিংক"
        title="বোনাস ভিডিও এডিট করুন"
      />
    </>
  );
}

"use client";

import { useOptimistic, useTransition } from "react";
import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";
import { toggleClassComplete } from "@/app/actions/progress";

export function CompleteButton({
  classId,
  courseId,
  completed,
}: {
  classId: string;
  courseId: string;
  completed: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(completed);

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await toggleClassComplete(classId, courseId);
        })
      }
      className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition disabled:opacity-60 ${
        optimistic
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600"
      }`}
    >
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : optimistic ? (
        <CheckCircle2 className="h-5 w-5" />
      ) : (
        <CircleDashed className="h-5 w-5" />
      )}
      {optimistic ? "সম্পন্ন হয়েছে ✓" : "সম্পন্ন হিসেবে মার্ক করুন"}
    </button>
  );
}

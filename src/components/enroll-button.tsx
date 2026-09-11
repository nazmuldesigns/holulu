"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole, Unlock } from "lucide-react";
import { enrollInCourse } from "@/app/actions/enroll";

export function EnrollButton({
  courseId,
  price,
  fullWidth = false,
}: {
  courseId: string;
  price: number;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    if (price > 0) {
      // পেইড কোর্সে → চেকআউট/পেমেন্ট পেজে নিয়ে যাই
      router.push(`/checkout/${courseId}`);
      return;
    }
    // ফ্রি কোর্সে → আগের মতোই সরাসরি এক্সেস (existing flow অক্ষত)
    startTransition(() => enrollInCourse(courseId));
  };

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/40 disabled:opacity-60 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Unlock className="h-5 w-5" />
      )}
      {price > 0 ? "এখনই এক্সেস নিন" : "ফ্রি-তে এক্সেস নিন"}
    </button>
  );
}

export function LockedBadge() {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-400">
      <LockKeyhole className="h-3.5 w-3.5" /> লকড
    </span>
  );
}

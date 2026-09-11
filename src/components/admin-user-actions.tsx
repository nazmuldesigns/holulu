"use client";

import { useTransition } from "react";
import { GraduationCap, Loader2, ShieldCheck, ShieldOff, UserRoundX } from "lucide-react";
import {
  grantAllCoursesAction,
  revokeAllCoursesAction,
  toggleUserRoleAction,
} from "@/app/actions/admin";

function ActionButton({
  onClick,
  disabled,
  className,
  pending,
  icon,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  className: string;
  pending: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${className}`}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
      {label}
    </button>
  );
}

export function AdminUserActions({
  userId,
  role,
  isSelf,
  courseCount,
}: {
  userId: string;
  role: string;
  isSelf: boolean;
  courseCount: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton
        pending={pending}
        disabled={courseCount === 0}
        label="সব কোর্সের এক্সেস দিন"
        icon={<GraduationCap className="h-3.5 w-3.5" />}
        className="bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
        onClick={() => {
          if (
            window.confirm(
              `এই শিক্ষার্থীকে সব ${courseCount}টি কোর্সের এক্সেস দিতে চান?`
            )
          ) {
            startTransition(() => grantAllCoursesAction(userId));
          }
        }}
      />
      <ActionButton
        pending={pending}
        disabled={false}
        label="সব এক্সেস বাতিল"
        icon={<UserRoundX className="h-3.5 w-3.5" />}
        className="border border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100"
        onClick={() => {
          if (window.confirm("এই শিক্ষার্থীর সব কোর্সের এক্সেস বাতিল করবেন?")) {
            startTransition(() => revokeAllCoursesAction(userId));
          }
        }}
      />
      {!isSelf && (
        <ActionButton
          pending={pending}
          disabled={false}
          label={role === "admin" ? "অ্যাডমিন থেকে সরান" : "অ্যাডমিন বানান"}
          icon={
            role === "admin" ? (
              <ShieldOff className="h-3.5 w-3.5" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )
          }
          className="border border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-600"
          onClick={() => {
            const msg =
              role === "admin"
                ? "এই ব্যবহারকারীর অ্যাডমিন রোল সরিয়ে স্টুডেন্ট করবেন?"
                : "এই ব্যবহারকারীকে অ্যাডমিন বানাবেন? (অ্যাডমিন সব কোর্স দেখতে পায়)";
            if (window.confirm(msg)) {
              startTransition(() => toggleUserRoleAction(userId));
            }
          }}
        />
      )}
    </div>
  );
}

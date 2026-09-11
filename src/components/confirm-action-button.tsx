"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

export function ConfirmActionButton({
  action,
  message = "আপনি কি নিশ্চিতভাবে মুছে ফেলতে চান?",
  label,
  iconOnly = false,
}: {
  action: () => Promise<void>;
  message?: string;
  label?: string;
  iconOnly?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(message)) {
          startTransition(() => action());
        }
      }}
      className="flex items-center gap-1.5 rounded-lg border border-brand-100 bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-100 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      {!iconOnly && (label ?? "মুছুন")}
    </button>
  );
}

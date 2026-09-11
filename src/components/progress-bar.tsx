import { toBn } from "@/lib/bangla";

export function ProgressBar({
  completed,
  total,
  size = "md",
}: {
  completed: number;
  total: number;
  size?: "sm" | "md";
}) {
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-ink-500">
          {toBn(completed)}/{toBn(total)}টি ক্লাস শেষ
        </span>
        <span className={percent >= 100 ? "text-emerald-600" : "text-brand-600"}>
          {toBn(percent)}%
        </span>
      </div>
      <div
        className={`mt-1.5 w-full overflow-hidden rounded-full bg-ink-100 ${
          size === "sm" ? "h-1.5" : "h-2.5"
        }`}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            percent >= 100
              ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
              : "bg-gradient-to-r from-brand-400 to-brand-600"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

/**
 * থাম্বনেইল দেখানোর নিরাপদ ইমেজ কম্পোনেন্ট।
 * - Google Drive / YouTube লিংকের একাধিক URL ফলব্যাক হিসেবে চেষ্টা করে
 * - সব ব্যর্থ হলে সুন্দর একটি প্লেসহোল্ডার দেখায় (ভাঙা ছবির আইকন নয়)
 */
export function SmartImage({
  candidates,
  alt,
  className = "",
  fallbackLabel,
}: {
  candidates: string[];
  alt: string;
  className?: string;
  fallbackLabel?: string;
}) {
  const list = useMemo(() => candidates.filter(Boolean), [candidates]);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (list.length === 0 || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 ${className}`}
        aria-label={alt}
      >
        <span className="px-3 text-center text-sm font-bold text-white/85">
          {fallbackLabel ?? alt}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={list[index]}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={className}
      onError={() => {
        if (index < list.length - 1) {
          setIndex(index + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

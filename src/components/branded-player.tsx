"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";

/**
 * ব্র্যান্ডেড ভিডিও প্লেয়ার — পোস্টার-ফার্স্ট ডিজাইন।
 *
 * - প্রথমে শুধু সাইটের নিজস্ব কভার (থাম্বনেইল + কাস্টম প্লে বাটন) দেখায়;
 *   পেজ লোডে YouTube/Google-এর কোনো এলিমেন্ট বা লোগোই রেন্ডর হয় না।
 * - "প্লে" চাপলে মাত্র সারারা ইসথিমাম যুক্ত প্লেয়ার লোড হয়
 *   (youtube-nocookie + মিনিমাল ব্র্যান্ডিং প্যারাম) এবং autoplay সরে যায়,
 *   ফলে কোনো চাপুন বাটন স্লট দুই বাটন চাপতে হয় না।
 * - মোবাইল/ডেস্কটপ দুটোতেই aspect-ratio অনুযায়ী পুরো প্রস্থে বসে।
 */
export function BrandedPlayer({
  embedUrl,
  title,
  thumbnail,
  playerKey,
}: {
  embedUrl: string;
  title: string;
  thumbnail?: string | null;
  playerKey?: string;
}) {
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);

  const autoplaySrc = embedUrl.includes("?")
    ? `${embedUrl}&autoplay=1`
    : `${embedUrl}?autoplay=1`;

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-ink-950">
      {!started ? (
        <button
          type="button"
          onClick={() => setStarted(true)}
          aria-label={`${title} — ভিডিও চালান`}
          className="group relative block h-full w-full cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40"
        >
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900"
            />
          )}

          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/10 to-ink-950/25"
          />

          {/* কাস্টম প্লে বাটন */}
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-600/95 text-white shadow-2xl shadow-brand-500/40 ring-8 ring-white/15 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
            <Play className="ml-1 h-7 w-7 fill-current sm:h-9 sm:w-9" aria-hidden />
          </span>

          {/* নিচে টাইটেল স্ট্রিপ */}
          <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pb-3.5 text-left sm:px-5 sm:pb-4">
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white/90 sm:text-[15px]">
              {title}
            </span>
            <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur sm:text-[11px]">
              চালাতে চাপুন
            </span>
          </span>
        </button>
      ) : (
        <>
          {!ready && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-950/90">
              <Loader2 className="h-9 w-9 animate-spin text-brand-400" aria-hidden />
              <span className="sr-only">ভিডিও লোড হচ্ছে</span>
            </div>
          )}
          <iframe
            key={playerKey ?? embedUrl}
            src={autoplaySrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            onLoad={() => setReady(true)}
            className="h-full w-full border-0"
          />
        </>
      )}
    </div>
  );
}

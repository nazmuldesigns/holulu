import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { thumbnailSrc } from "@/lib/drive";

export async function Logo({ dark = false }: { dark?: boolean }) {
  const settings = await getSettings();
  const name = settings.site_name || "১০ মিনিট স্কুল";
  const parts = name.split(" ");
  const mark = parts.length > 1 ? parts[0] : name.slice(0, 2);
  const rest = parts.length > 1 ? parts.slice(1).join(" ") : name;

  return (
    <Link href="/" prefetch={true} className="group flex items-center gap-2.5">
      {settings.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailSrc(settings.logo_url, "w200")}
          alt={name}
          className="h-10 w-10 rounded-xl object-contain"
        />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-lg shadow-brand-500/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
          {mark}
        </span>
      )}
      <span className="leading-tight">
        <span
          className={`block text-lg font-bold tracking-tight ${
            dark ? "text-white" : "text-ink-900"
          }`}
        >
          {settings.logo_url ? name : rest}
        </span>
        <span
          className={`block text-[11px] font-medium ${
            dark ? "text-white/60" : "text-ink-400"
          }`}
        >
          {settings.site_tagline}
        </span>
      </span>
    </Link>
  );
}

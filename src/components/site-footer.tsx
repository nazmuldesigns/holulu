import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { Logo } from "@/components/logo";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M13.5 21v-8.2h2.76l.41-3.2H13.5V7.55c0-.93.26-1.56 1.58-1.56h1.69V3.14c-.29-.04-1.3-.13-2.47-.13-2.44 0-4.11 1.49-4.11 4.23v2.36H7.41v3.2h2.78V21h3.31Z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.28 5 12 5 12 5s-6.28 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26.2 26.2 0 0 0 2 12a26.2 26.2 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.72 19 12 19 12 19s6.28 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26.2 26.2 0 0 0 22 12a26.2 26.2 0 0 0-.4-4.8ZM10 15.14V8.86L15.5 12 10 15.14Z" />
    </svg>
  );
}

export async function SiteFooter() {
  const settings = await getSettings();

  return (
    <footer className="border-t border-ink-800 bg-ink-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
            {settings.footer_about}
          </p>
          <div className="mt-5 flex gap-2.5">
            {[
              { icon: FacebookIcon, label: "ফেসবুক" },
              { icon: YoutubeIcon, label: "ইউটিউব" },
              { icon: Mail, label: "ইমেইল" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-brand-500 hover:bg-brand-500 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white/40">
            কুইক লিংক
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            {[
              { href: "/#courses", label: "সকল কোর্স" },
              { href: "/#how-it-works", label: "কীভাবে শিখবে" },
              { href: "/register", label: "অ্যাকাউন্ট খুলুন" },
              { href: "/dashboard", label: "আমার কোর্স" },
            ].map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="transition hover:text-brand-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white/40">
            জনপ্রিয় ক্যাটাগরি
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            {["ইংরেজি", "একাডেমিক", "স্কিলস", "পরীক্ষা প্রস্তুতি"].map((c) => (
              <li key={c}>
                <Link
                  href={`/?category=${encodeURIComponent(c)}#courses`}
                  className="transition hover:text-brand-400"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white/40">
            যোগাযোগ
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-brand-400" /> হটলাইন: {settings.phone}
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-brand-400" /> support@school.com
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> ঢাকা, বাংলাদেশ
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/40 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {settings.site_name} — সর্বস্বত্ব সংরক্ষিত</p>
          <p>ভালোবাসা দিয়ে তৈরি, বাংলাদেশে</p>
        </div>
      </div>
    </footer>
  );
}

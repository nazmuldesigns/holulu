import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpenCheck, ExternalLink, LayoutDashboard, Settings, Users } from "lucide-react";
import { requireAdmin } from "@/app/actions/admin";
import { Logo } from "@/components/logo";

const ADMIN_LINKS = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/admin/courses", label: "কোর্স ব্যবস্থাপনা", icon: BookOpenCheck },
  { href: "/admin/users", label: "শিক্ষার্থী", icon: Users },
  { href: "/admin/settings", label: "সাইট সেটিংস", icon: Settings },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-ink-50/60">
      <div className="mx-auto flex max-w-[110rem]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-ink-100 bg-white p-5 lg:flex">
          <Logo />
          <nav className="mt-8 flex-1 space-y-1.5">
            {ADMIN_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold text-ink-600 transition hover:bg-brand-50 hover:text-brand-600"
              >
                <Icon className="h-5 w-5" /> {label}
              </Link>
            ))}
          </nav>
          <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">
              অ্যাডমিন
            </p>
            <p className="mt-1 truncate text-sm font-bold text-ink-800">{admin.name}</p>
            <Link
              href="/"
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> ওয়েবসাইট দেখুন
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
            <Logo />
            <nav className="flex gap-1.5">
              {ADMIN_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-100 bg-white text-ink-600 transition hover:border-brand-200 hover:text-brand-600"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </nav>
          </header>
          <main className="p-4 sm:p-6 lg:p-9">{children}</main>
        </div>
      </div>
    </div>
  );
}

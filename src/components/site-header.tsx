import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/logo";
import HeaderUserMenu from "@/components/header-user-menu";

const NAV_LINKS = [
  { href: "/#courses", label: "কোর্সসমূহ" },
  { href: "/#how-it-works", label: "কীভাবে শিখবে" },
  { href: "/#features", label: "সুবিধাসমূহ" },
  { href: "/#faq", label: "জিজ্ঞাসা" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className="rounded-full px-4 py-2 text-[15px] font-medium text-ink-600 transition hover:bg-brand-50 hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <HeaderUserMenu
              name={user.name}
              email={user.email}
              isAdmin={user.role === "admin"}
            />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 sm:flex"
              >
                <LogIn className="h-4 w-4" /> লগইন
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30"
              >
                <UserPlus className="h-4 w-4" /> ফ্রি অ্যাকাউন্ট খুলুন
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

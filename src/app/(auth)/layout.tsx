import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-brand-50/80 via-white to-gold-300/20">
      <div className="hero-grid-bg absolute inset-0" aria-hidden />
      <header className="relative flex items-center justify-between px-5 py-5 sm:px-10">
        <Logo />
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-full border border-ink-200 bg-white/70 px-4 py-2 text-sm font-semibold text-ink-600 backdrop-blur transition hover:border-brand-300 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> হোমে ফিরুন
        </Link>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  );
}

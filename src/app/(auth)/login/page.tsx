import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "লগইন" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="w-full max-w-md animate-rise">
      <div className="rounded-[2rem] border border-ink-100 bg-white/90 p-8 shadow-2xl shadow-brand-900/10 backdrop-blur sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
          <GraduationCap className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-center text-2xl font-bold text-ink-900">
          আবারও স্বাগতম!
        </h1>
        <p className="mt-1.5 text-center text-sm text-ink-400">
          তোমার অ্যাকাউন্টে লগইন করে শেখা চালিয়ে যাও
        </p>
        <div className="mt-7">
          <LoginForm next={next ?? ""} />
        </div>
      </div>
    </div>
  );
}

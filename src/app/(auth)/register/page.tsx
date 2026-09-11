import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "রেজিস্টার" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="w-full max-w-md animate-rise">
      <div className="rounded-[2rem] border border-ink-100 bg-white/90 p-8 shadow-2xl shadow-brand-900/10 backdrop-blur sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
          <Sparkles className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-center text-2xl font-bold text-ink-900">
          ফ্রি অ্যাকাউন্ট খুলুন
        </h1>
        <p className="mt-1.5 text-center text-sm text-ink-400">
          মাত্র ৩০ সেকেন্ডেই শুরু হোক তোমার শেখার যাত্রা
        </p>
        <div className="mt-7">
          <RegisterForm next={next ?? ""} />
        </div>
      </div>
    </div>
  );
}

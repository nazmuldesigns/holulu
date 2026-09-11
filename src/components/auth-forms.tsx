"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, Lock, Mail, Phone, UserRound } from "lucide-react";
import { loginAction, registerAction, type AuthFormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";

function ErrorBox({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
      <AlertCircle className="h-4 w-4 shrink-0" /> {message}
    </p>
  );
}

const inputCls =
  "w-full rounded-xl border border-ink-200 bg-white py-3.5 pl-12 pr-4 text-[15px] text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <ErrorBox message={state?.error} />

      <div className="relative">
        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
        <input
          name="email"
          type="email"
          required
          placeholder="ইমেইল ঠিকানা"
          className={inputCls}
        />
      </div>

      <div className="relative">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
        <input
          name="password"
          type="password"
          required
          placeholder="পাসওয়ার্ড"
          className={inputCls}
        />
      </div>

      <SubmitButton className="w-full !py-4 text-base">লগইন করুন</SubmitButton>

      <p className="text-center text-sm text-ink-400">
        অ্যাকাউন্ট নেই?{" "}
        <Link
          href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-bold text-brand-600 hover:underline"
        >
          ফ্রি রেজিস্টার করুন
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(registerAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <ErrorBox message={state?.error} />

      <div className="relative">
        <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
        <input name="name" required placeholder="আপনার নাম" className={inputCls} />
      </div>

      <div className="relative">
        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
        <input
          name="email"
          type="email"
          required
          placeholder="ইমেইল ঠিকানা"
          className={inputCls}
        />
      </div>

      <div className="relative">
        <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
        <input
          name="phone"
          type="tel"
          placeholder="মোবাইল নম্বর (ঐচ্ছিক)"
          className={inputCls}
        />
      </div>

      <div className="relative">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
          className={inputCls}
        />
      </div>

      <SubmitButton className="w-full !py-4 text-base">অ্যাকাউন্ট খুলুন</SubmitButton>

      <p className="text-center text-sm text-ink-400">
        ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
        <Link
          href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-bold text-brand-600 hover:underline"
        >
          লগইন করুন
        </Link>
      </p>
    </form>
  );
}

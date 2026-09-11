"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, Lock, Mail, Phone, UserRound } from "lucide-react";
import { loginAction, registerAction, type AuthFormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";

function ErrorBox({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {message}
    </p>
  );
}

const inputCls =
  "w-full rounded-xl border border-ink-200 bg-white/90 py-3.5 pl-12 pr-11 text-[15px] text-ink-900 outline-none transition-all duration-200 placeholder:text-ink-300 hover:border-ink-300 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10";

function PasswordInput() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300 transition-colors" />
      <input
        name="password"
        type={visible ? "text" : "password"}
        required
        minLength={6}
        placeholder="পাসওয়ার্ড"
        className={inputCls}
        autoComplete="current-password"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-300 transition hover:bg-ink-50 hover:text-ink-600"
      >
        {visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
      </button>
    </div>
  );
}

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
          autoComplete="email"
          placeholder="ইমেইল ঠিকানা"
          className={inputCls}
        />
      </div>

      <PasswordInput />

      <SubmitButton className="w-full !rounded-2xl !py-4 text-base transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0">
        লগইন করুন
      </SubmitButton>

      <p className="text-center text-sm text-ink-400">
        অ্যাকাউন্ট নেই?{" "}
        <Link
          href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-bold text-brand-600 transition hover:text-brand-700 hover:underline"
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
        <input
          name="name"
          required
          autoComplete="name"
          placeholder="আপনার নাম"
          className={inputCls}
        />
      </div>

      <div className="relative">
        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="ইমেইল ঠিকানা"
          className={inputCls}
        />
      </div>

      <div className="relative">
        <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="মোবাইল নম্বর (ঐচ্ছিক)"
          className={inputCls}
        />
      </div>

      <PasswordInput />

      <SubmitButton className="w-full !rounded-2xl !py-4 text-base transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0">
        অ্যাকাউন্ট খুলুন
      </SubmitButton>

      <p className="text-center text-sm text-ink-400">
        ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
        <Link
          href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-bold text-brand-600 transition hover:text-brand-700 hover:underline"
        >
          লগইন করুন
        </Link>
      </p>
    </form>
  );
}

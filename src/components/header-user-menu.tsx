"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export default function HeaderUserMenu({
  name,
  email,
  isAdmin,
}: {
  name: string;
  email: string;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-ink-100 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:border-brand-200 hover:shadow-md"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
          {name.slice(0, 1)}
        </span>
        <span className="max-w-[110px] truncate text-sm font-semibold text-ink-800">
          {name.split(" ")[0]}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xl shadow-ink-900/10">
          <div className="border-b border-ink-50 bg-ink-50/60 px-4 py-3">
            <p className="truncate text-sm font-bold text-ink-900">{name}</p>
            <p className="truncate text-xs text-ink-400">{email}</p>
          </div>
          <div className="p-1.5">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-600"
            >
              <GraduationCap className="h-4 w-4" /> আমার কোর্সসমূহ
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-600"
              >
                <ShieldCheck className="h-4 w-4" /> অ্যাডমিন প্যানেল
              </Link>
            )}
            <button
              onClick={() => logoutAction()}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-brand-600 transition hover:bg-brand-50"
            >
              <LogOut className="h-4 w-4" /> লগ আউট
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

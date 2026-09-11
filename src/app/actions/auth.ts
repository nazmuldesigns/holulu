"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { claimPendingGrants, normalizePhone } from "@/lib/access";

export type AuthFormState = { error?: string } | null;

function safeNext(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/";
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!name || name.length < 2) return { error: "সঠিক নাম লিখুন" };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "সঠিক ইমেইল ঠিকানা লিখুন" };
  if (!password || password.length < 6)
    return { error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" };

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0)
    return { error: "এই ইমেইলে ইতিমধ্যে একটি অ্যাকাউন্ট আছে। লগইন করুন।" };

  const phone = normalizePhone(phoneRaw);

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      phone: phone || null,
      passwordHash: hashPassword(password),
    })
    .returning({ id: users.id });

  // অ্যাডমিন আগে থেকে এই ইমেইল/ফোনে কোর্স বরাদ্দ করে রাখলে সাথে সাথে যুক্ত হবে
  const claimed = await claimPendingGrants(user.id, email, phone);

  await createSession(user.id);
  redirect(claimed > 0 ? "/dashboard" : safeNext(next));
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) return { error: "ইমেইল ও পাসওয়ার্ড দিন" };

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "ইমেইল বা পাসওয়ার্ড সঠিক নয়" };
  }

  // লগইনের সময়ও নতুন বরাদ্দ থাকলে যুক্ত হয়ে যাবে
  await claimPendingGrants(user.id, user.email, user.phone);

  await createSession(user.id);
  redirect(safeNext(next));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

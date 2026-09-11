import type { Metadata } from "next";
import { asc, count, desc, eq, isNull } from "drizzle-orm";
import {
  CheckCircle2,
  Clock3,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { db } from "@/db";
import { accessGrants, courses, enrollments, users } from "@/db/schema";
import {
  createAccessGrantsAction,
  deleteAccessGrantAction,
  requireAdmin,
} from "@/app/actions/admin";
import { AdminUserActions } from "@/components/admin-user-actions";
import { AccessGrantForm } from "@/components/admin-forms";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import { bnDate, toBn } from "@/lib/bangla";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "শিক্ষার্থী ব্যবস্থাপনা" };

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  const [userRows, enrollCounts, courseRows, grantRows] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db
      .select({ userId: enrollments.userId, value: count() })
      .from(enrollments)
      .groupBy(enrollments.userId),
    db
      .select({
        id: courses.id,
        title: courses.title,
        isUpcoming: courses.isUpcoming,
      })
      .from(courses)
      .orderBy(asc(courses.title)),
    db
      .select({
        id: accessGrants.id,
        email: accessGrants.email,
        phone: accessGrants.phone,
        note: accessGrants.note,
        claimedAt: accessGrants.claimedAt,
        createdAt: accessGrants.createdAt,
        courseTitle: courses.title,
      })
      .from(accessGrants)
      .innerJoin(courses, eq(accessGrants.courseId, courses.id))
      .orderBy(desc(accessGrants.createdAt))
      .limit(60),
  ]);

  const enrollMap = new Map(enrollCounts.map((r) => [r.userId, r.value]));
  const totalCourses = courseRows.length;

  const [pendingRow] = await db
    .select({ value: count() })
    .from(accessGrants)
    .where(isNull(accessGrants.claimedByUserId));
  const pendingCount = pendingRow?.value ?? 0;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">শিক্ষার্থী ব্যবস্থাপনা</h1>
        <p className="mt-1 text-sm text-ink-400">
          মোট {toBn(userRows.length)}টি অ্যাকাউন্ট · {toBn(totalCourses)}টি কোর্স ·{" "}
          {toBn(pendingCount)}টি এক্সেস অপেক্ষমাণ
        </p>
      </div>

      {/* ---------------- প্রি-অ্যাপ্রুভড এক্সেস ---------------- */}
      <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="flex items-center gap-2.5 text-xl font-bold text-ink-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Ticket className="h-5 w-5" />
          </span>
          ইমেইল / নম্বর দিয়ে এক্সেস দিন
        </h2>
        <p className="mt-1.5 text-sm text-ink-400">
          ইমেইল বা মোবাইল নম্বর আর কোর্স সিলেক্ট করে রাখুন। ওই তথ্য দিয়ে কেউ অ্যাকাউন্ট খুললে বা
          লগইন করলে কোর্সগুলো <strong>স্বয়ংক্রিয়ভাবে</strong> তার অ্যাকাউন্টে যুক্ত হয়ে যাবে।
        </p>

        <div className="mt-6">
          <AccessGrantForm
            action={createAccessGrantsAction.bind(null)}
            courses={courseRows}
          />
        </div>

        {grantRows.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-400">
              সাম্প্রতিক এক্সেস তালিকা
            </h3>
            <ul className="divide-y divide-ink-50 overflow-hidden rounded-2xl border border-ink-100">
              {grantRows.map((grant) => (
                <li
                  key={grant.id}
                  className="flex flex-wrap items-center gap-3 bg-white px-4 py-3"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      grant.claimedAt
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gold-400/15 text-gold-600"
                    }`}
                  >
                    {grant.claimedAt ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock3 className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-3 text-sm font-bold text-ink-800">
                      {grant.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-ink-300" /> {grant.email}
                        </span>
                      )}
                      {grant.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-ink-300" /> {grant.phone}
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-ink-400">
                      {grant.courseTitle}
                      {grant.note ? ` · ${grant.note}` : ""} ·{" "}
                      {grant.claimedAt ? (
                        <span className="font-bold text-emerald-600">
                          এক্সেস নিয়েছে ({bnDate(grant.claimedAt)})
                        </span>
                      ) : (
                        <span className="font-bold text-gold-600">
                          অ্যাকাউন্ট খোলার অপেক্ষায়
                        </span>
                      )}
                    </p>
                  </div>
                  <ConfirmActionButton
                    action={deleteAccessGrantAction.bind(null, grant.id)}
                    message="এই এক্সেস এন্ট্রিটি মুছে ফেলবেন? (ইতিমধ্যে যুক্ত হয়ে থাকলে কোর্স থাকবে)"
                    iconOnly
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---------------- সব অ্যাকাউন্ট ---------------- */}
      <section className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-ink-50 px-6 py-4">
          <h2 className="flex items-center gap-2 font-bold text-ink-900">
            <Users className="h-5 w-5 text-brand-500" /> রেজিস্টার্ড অ্যাকাউন্ট
          </h2>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
            {toBn(userRows.length)}জন
          </span>
        </div>
        <ul className="divide-y divide-ink-50">
          {userRows.map((user) => {
            const enrolledCount =
              user.role === "admin" ? totalCourses : (enrollMap.get(user.id) ?? 0);
            const isSelf = user.id === admin.id;

            return (
              <li key={user.id} className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-6">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                    user.role === "admin"
                      ? "bg-brand-500 text-white"
                      : "bg-brand-500/10 text-brand-600"
                  }`}
                >
                  {user.name.slice(0, 1)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-bold text-ink-900">{user.name}</span>
                    {user.role === "admin" && (
                      <span className="flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-[11px] font-bold text-brand-600">
                        <ShieldCheck className="h-3 w-3" /> অ্যাডমিন
                      </span>
                    )}
                    {isSelf && (
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-bold text-ink-500">
                        আপনি
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-ink-400">
                    {user.email}
                    {user.phone ? ` · ${user.phone}` : ""} · যুক্ত {bnDate(user.createdAt)}
                  </p>
                </div>

                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1.5 text-xs font-bold text-ink-600">
                  <GraduationCap className="h-3.5 w-3.5 text-brand-500" />
                  {user.role === "admin"
                    ? "সব কোর্স"
                    : `${toBn(enrolledCount)}/${toBn(totalCourses)} কোর্স`}
                </span>

                <div className="shrink-0">
                  <AdminUserActions
                    userId={user.id}
                    role={user.role}
                    isSelf={isSelf}
                    courseCount={totalCourses}
                  />
                </div>
              </li>
            );
          })}
          {userRows.length === 0 && (
            <li className="px-6 py-14 text-center text-sm text-ink-400">
              এখনো কোনো অ্যাকাউন্ট খোলা হয়নি
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

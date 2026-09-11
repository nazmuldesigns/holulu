import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { accessGrants, enrollments } from "@/db/schema";

/**
 * ফোন নম্বরকে একটি সাধারণ ফরম্যাটে আনে যাতে
 * "+8801712345678", "8801712345678", "01712345678", "1712345678"
 * — সবগুলোই একই হিসেবে মিলে যায়। ফলাফল: 01XXXXXXXXX
 */
export function normalizePhone(phone: string): string {
  let digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";

  // দেশের কোড (৮৮০) বাদ দিই
  if (digits.length > 11 && digits.startsWith("880")) digits = digits.slice(3);

  // ১০ ডিজিট হয়ে "1" দিয়ে শুরু হলে সামনে 0 যোগ করি → 01XXXXXXXXX
  if (digits.length === 10 && digits.startsWith("1")) digits = `0${digits}`;

  return digits;
}

/**
 * কোনো ইউজার লগইন/রেজিস্টার করলে তার ইমেইল বা ফোনের সাথে মিল থাকা
 * pre-approved গ্রান্টগুলো খুঁজে এনরোলমেন্টে রূপান্তর করে।
 * @returns কতটি নতুন কোর্স যুক্ত হলো
 */
export async function claimPendingGrants(
  userId: string,
  email: string,
  phone?: string | null
): Promise<number> {
  const normalizedEmail = (email ?? "").trim().toLowerCase();
  const normalizedPhone = normalizePhone(phone ?? "");

  const conditions = [];
  if (normalizedEmail) conditions.push(eq(accessGrants.email, normalizedEmail));
  if (normalizedPhone) conditions.push(eq(accessGrants.phone, normalizedPhone));
  if (conditions.length === 0) return 0;

  const pending = await db
    .select()
    .from(accessGrants)
    .where(and(isNull(accessGrants.claimedByUserId), or(...conditions)));

  if (pending.length === 0) return 0;

  await db
    .insert(enrollments)
    .values(pending.map((g) => ({ userId, courseId: g.courseId })))
    .onConflictDoNothing();

  for (const grant of pending) {
    await db
      .update(accessGrants)
      .set({ claimedByUserId: userId, claimedAt: new Date() })
      .where(eq(accessGrants.id, grant.id));
  }

  return pending.length;
}

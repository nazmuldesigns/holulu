import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

export const SETTING_KEYS = [
  "site_name",
  "site_tagline",
  "logo_url",
  "hero_title",
  "hero_subtitle",
  "phone",
  "footer_about",
] as const;

export type SiteSettings = Record<(typeof SETTING_KEYS)[number], string>;

export const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "১০ মিনিট স্কুল",
  site_tagline: "দেশের সবচেয়ে বড় অনলাইন শিক্ষা প্ল্যাটফর্ম",
  logo_url: "",
  hero_title: "শেখার নতুন ঠিকানা, এখন তোমার হাতের মুঠোয়",
  hero_subtitle:
    "দক্ষ মেন্টরদের সাথে ভিডিও ক্লাস, পিডিএফ নোট আর লাইফটাইম এক্সেস — সব এক জায়গায়। আজই শুরু করো তোমার শেখার যাত্রা।",
  phone: "১৬৯১০",
  footer_about:
    "প্রযুক্তির সহায়তায় দেশের প্রতিটি শিক্ষার্থীর কাছে মানসম্মত শিক্ষা পৌঁছে দেওয়াই আমাদের লক্ষ্য।",
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await db.select().from(settings);
  const map: Partial<SiteSettings> = {};
  for (const row of rows) {
    if ((SETTING_KEYS as readonly string[]).includes(row.key)) {
      map[row.key as keyof SiteSettings] = row.value;
    }
  }
  return { ...DEFAULT_SETTINGS, ...map };
});

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

export async function getSetting(key: keyof SiteSettings): Promise<string> {
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return rows[0]?.value ?? DEFAULT_SETTINGS[key];
}

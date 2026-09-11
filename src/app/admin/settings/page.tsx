import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { updateSettingsAction } from "@/app/actions/admin";
import { SettingsForm } from "@/components/admin-forms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "সাইট সেটিংস" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">সাইট সেটিংস</h1>
        <p className="mt-1 text-sm text-ink-400">
          আপনার কোচিং সেন্টারের নাম, লোগো, হিরো টেক্সট — সব এখান থেকে বদলান
        </p>
      </div>

      <div className="rounded-3xl border border-ink-100 bg-white p-7 shadow-sm sm:p-9">
        <h2 className="flex items-center gap-2.5 text-xl font-bold text-ink-900">
          <Settings className="h-6 w-6 text-brand-500" /> ব্র্যান্ডিং ও কনটেন্ট
        </h2>
        <div className="mt-7">
          <SettingsForm
            action={updateSettingsAction.bind(null)}
            defaults={settings as unknown as Record<string, string>}
          />
        </div>
      </div>
    </div>
  );
}

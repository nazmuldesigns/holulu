import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Hind_Siliguri } from "next/font/google";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const hind = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: `${settings.site_name} — ${settings.site_tagline}`,
      template: `%s | ${settings.site_name}`,
    },
    description: settings.hero_subtitle,
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" className={hind.variable}>
      <body className="bg-[#fbfbfd] font-sans text-ink-900 antialiased">
        {children}
      </body>
    </html>
  );
}

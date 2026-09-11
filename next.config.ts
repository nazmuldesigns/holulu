import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // X-Powered-By হেডার বন্ধ — রেসপন্স সামান্য হালকা হয়
  poweredByHeader: false,

  // ক্লায়েন্ট রাউটার ক্যাশ — ব্যাক/ফরোয়ার্ড ও রি-ভিজিটে ইনস্ট্যান্ট নেভিগেশন
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 120,
    },
  },

  async headers() {
    return [
      {
        // /public/images-এর স্ট্যাটিক অ্যাসেট দীর্ঘ সময় ব্রাউজার ক্যাশে থাকবে
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

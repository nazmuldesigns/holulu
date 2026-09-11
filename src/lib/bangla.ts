const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBn(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

export function bnPrice(amount: number): string {
  if (amount <= 0) return "ফ্রি";
  return `৳${toBn(amount.toLocaleString("en-IN"))}`;
}

const ORDINAL_SUFFIX: Record<number, string> = {
  1: "ম",
  2: "য়",
  3: "য়",
  4: "র্থ",
  5: "ম",
  6: "ষ্ঠ",
  7: "ম",
  8: "ম",
  9: "ম",
};

export function bnOrdinal(n: number): string {
  const suffix = ORDINAL_SUFFIX[n] ?? "তম";
  return `${toBn(n)}${suffix}`;
}

export function bnDate(date: Date): string {
  const months = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];
  return `${toBn(date.getDate())} ${months[date.getMonth()]} ${toBn(date.getFullYear())}`;
}

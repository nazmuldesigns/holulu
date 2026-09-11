/**
 * গ্লোবাল লোডিং ইন্ডিকেটর — নেভিগেশনের সময় পাতার উপরে পাতলা ব্র্যান্ড-বার
 * চলে; ব্যবহারকারী সাথে সাথে রেসপন্স পায় বলে মনে হয়।
 */
export default function Loading() {
  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-brand-500/15">
      <div className="animate-loading-bar h-full w-2/5 rounded-full bg-gradient-to-r from-brand-600 via-gold-400 to-brand-600" />
    </div>
  );
}

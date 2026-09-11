/**
 * হিরো সেকশনের কার্টুন ইলাস্ট্রেশন — সম্পূর্ণ ইনলাইন SVG।
 * কোনো এক্সটার্নাল ইমেজ ফাইলের উপর নির্ভর করে না, তাই কোনো হোস্টিং
 * এনভায়রনমেন্টেই হুবহু রেন্ডার হবে (404/ইমেজ মিসিং সমস্যা থাকে না)।
 */
export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="অনলাইনে পড়াশোনা করছে একজন শিক্ষার্থী"
      className={className}
    >
      <defs>
        <linearGradient id="hbg" x1="0" y1="0" x2="480" y2="420" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF7EF" />
          <stop offset="1" stopColor="#FFEDE0" />
        </linearGradient>
        <linearGradient id="hred" x1="140" y1="260" x2="340" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF4D6D" />
          <stop offset="1" stopColor="#C8112F" />
        </linearGradient>
        <linearGradient id="hgold" x1="180" y1="180" x2="300" y2="290" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFC95C" />
          <stop offset="1" stopColor="#FF9E2E" />
        </linearGradient>
        <linearGradient id="hink" x1="175" y1="250" x2="305" y2="310" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2B3A63" />
          <stop offset="1" stopColor="#131C36" />
        </linearGradient>
        <linearGradient id="hscreen" x1="180" y1="252" x2="300" y2="300" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E01A3C" />
          <stop offset="1" stopColor="#8A1027" />
        </linearGradient>
      </defs>

      {/* ব্যাকগ্রাউন্ড */}
      <rect width="480" height="420" fill="url(#hbg)" />
      <circle cx="404" cy="64" r="92" fill="#FFD9E4" opacity="0.55" />
      <circle cx="70" cy="346" r="72" fill="#FFF0D9" opacity="0.8" />
      <circle cx="52" cy="88" r="5" fill="#F7C3CF" />
      <circle cx="118" cy="54" r="4" fill="#FFD98A" />
      <circle cx="430" cy="196" r="5" fill="#F7C3CF" />
      <circle cx="56" cy="230" r="4" fill="#FFD98A" />
      <circle cx="416" cy="330" r="4" fill="#FBE3E9" />

      {/* মেঝের ছায়া */}
      <ellipse cx="244" cy="354" rx="152" ry="16" fill="#1E2A4A" opacity="0.08" />

      {/* ভাসমান ভিডিও কার্ড (উপরে-বামে) */}
      <g className="animate-float">
        <rect x="42" y="62" width="96" height="66" rx="14" fill="white" />
        <rect x="42" y="62" width="96" height="66" rx="14" stroke="#F7C3CF" strokeWidth="2" />
        <circle cx="90" cy="95" r="15" fill="#E01A3C" />
        <path d="M86 88.5 L100 95 L86 101.5 Z" fill="white" />
        <rect x="58" y="118" width="64" height="5" rx="2.5" fill="#E9EDF6" />
      </g>

      {/* ভাসমান খোলা বই (উপরে-ডানে) */}
      <g className="animate-float-slow">
        <path
          d="M352 78 C368 69 388 69 400 75 L400 122 C388 116 368 116 352 124 C336 116 316 116 304 122 L304 75 C316 69 336 69 352 78 Z"
          fill="white"
          stroke="#D4DCEE"
          strokeWidth="2"
        />
        <path d="M352 78 L352 124" stroke="#D4DCEE" strokeWidth="2" />
        <path d="M314 86 L342 86 M314 96 L342 96 M314 106 L334 106" stroke="#D4DCEE" strokeWidth="3" strokeLinecap="round" />
        <path d="M362 86 L390 86 M362 96 L390 96 M362 106 L382 106" stroke="#F7C3CF" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* ভাসমান PDF নোট (নিচে-ডানে) */}
      <g className="animate-float" style={{ animationDelay: "0.9s" }}>
        <rect x="330" y="248" width="74" height="92" rx="10" fill="white" stroke="#D4DCEE" strokeWidth="2" />
        <rect x="342" y="264" width="34" height="6" rx="3" fill="#E01A3C" opacity="0.85" />
        <rect x="342" y="278" width="50" height="4" rx="2" fill="#E9EDF6" />
        <rect x="342" y="288" width="50" height="4" rx="2" fill="#E9EDF6" />
        <rect x="342" y="298" width="38" height="4" rx="2" fill="#E9EDF6" />
        <circle cx="392" cy="248" r="15" fill="#FFB52E" />
        <text x="392" y="253" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">
          PDF
        </text>
      </g>

      {/* ভাসমান স্পার্কল */}
      <g className="animate-float-slow" style={{ animationDelay: "1.6s" }}>
        <path d="M120 170 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 z" fill="#FFC95C" />
      </g>
      <g className="animate-float" style={{ animationDelay: "2.2s" }}>
        <path d="M398 168 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#F09AAC" />
      </g>

      {/* ক্রসড পায়ে বন্থু — প্যান্ট */}
      <path
        d="M150 304 C160 272 198 260 240 260 C282 260 320 272 330 304 C340 334 316 344 240 344 C164 344 140 334 150 304 Z"
        fill="url(#hred)"
      />
      <ellipse cx="160" cy="330" rx="18" ry="10" fill="#F4C99A" />
      <ellipse cx="320" cy="330" rx="18" ry="10" fill="#F4C99A" />

      {/* হুডি (ধড়) */}
      <path
        d="M186 292 L186 230 C186 200 210 186 240 186 C270 186 294 200 294 230 L294 292 Z"
        fill="url(#hgold)"
      />
      <path d="M222 190 C222 178 232 172 240 172 C248 172 258 178 258 190" stroke="#FF9E2E" strokeWidth="8" strokeLinecap="round" />

      {/* বাহু — হাত ল্যাপটপের দিকে */}
      <path d="M192 232 C172 244 164 262 176 276" stroke="#FF9E2E" strokeWidth="16" strokeLinecap="round" />
      <path d="M288 232 C308 244 316 262 304 276" stroke="#FF9E2E" strokeWidth="16" strokeLinecap="round" />
      <circle cx="177" cy="278" r="9" fill="#F4C99A" />
      <circle cx="303" cy="278" r="9" fill="#F4C99A" />

      {/* মাথা */}
      <circle cx="240" cy="152" r="28" fill="#F7D5AE" />
      <path d="M213 150 C211 122 224 108 240 108 C256 108 269 122 267 150 L267 140 C262 126 250 121 240 121 C230 121 218 126 213 140 Z" fill="#131C36" />
      <circle cx="240" cy="103" r="11" fill="#131C36" />
      <circle cx="230" cy="152" r="2.6" fill="#131C36" />
      <circle cx="250" cy="152" r="2.6" fill="#131C36" />
      <path d="M233 162 C237 167 243 167 247 162" stroke="#C98A4B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="222" cy="159" r="4" fill="#F09AAC" opacity="0.55" />
      <circle cx="258" cy="159" r="4" fill="#F09AAC" opacity="0.55" />

      {/* ল্যাপটপ */}
      <rect x="172" y="246" width="136" height="58" rx="10" fill="url(#hink)" />
      <rect x="180" y="254" width="120" height="42" rx="6" fill="url(#hscreen)" />
      <path d="M232 266 L256 275 L232 284 Z" fill="white" />
      <rect x="162" y="304" width="156" height="10" rx="5" fill="#131C36" />
      <rect x="216" y="304" width="48" height="10" fill="#0A0F1F" opacity="0.5" />
    </svg>
  );
}

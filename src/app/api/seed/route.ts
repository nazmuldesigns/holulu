import { db } from "@/db";
import {
  bonusVideos,
  classes,
  classProgress,
  courses,
  enrollments,
  materials,
  users,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { DEFAULT_SETTINGS, SETTING_KEYS, setSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

function d(id: string) {
  return `https://drive.google.com/file/d/${id}/view`;
}

function yt(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export async function GET() {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length > 0) {
    return Response.json({ seeded: false, message: "Database already seeded." });
  }

  // ---- settings ----
  for (const key of SETTING_KEYS) {
    await setSetting(key, DEFAULT_SETTINGS[key]);
  }

  // ---- users ----
  await db.insert(users).values({
    name: "অ্যাডমিন",
    email: "admin@10minuteschool.com",
    passwordHash: hashPassword("admin123"),
    role: "admin",
  });

  const [studentUser] = await db
    .insert(users)
    .values({
      name: "ডেমো শিক্ষার্থী",
      email: "student@demo.com",
      passwordHash: hashPassword("123456"),
      role: "student",
    })
    .returning({ id: users.id });

  // ---- courses with classes, bonus videos & materials ----
  const seedCourses: Array<{
    course: typeof courses.$inferInsert;
    classes: Array<Omit<typeof classes.$inferInsert, "courseId">>;
    bonus: Array<Omit<typeof bonusVideos.$inferInsert, "courseId">>;
    materials: Array<Omit<typeof materials.$inferInsert, "courseId">>;
  }> = [
    {
      course: {
        title: "ঘরে বসে Spoken English",
        subtitle: "ইংরেজিতে দ্বিধাহীনে কথা বলার সম্পূর্ণ গাইডলাইন — একদম শূন্য থেকে",
        description:
          "যারা ইংরেজি বোঝেন কিন্তু কথা বলতে পারেন না — এই কোর্সটি তাদের জন্য। প্রতিদিনের ব্যবহারিক বাক্য, উচ্চারণ অনুশীলন, ভুল শুধরে ফ্লুয়েন্টলি কথা বলার টেকনিক শিখুন ঘরে বসেই।\n\nকোর্সটি করে যা পাবেন:\n• ৫০+ ব্যবহারিক স্পিকিং টপিক\n• বোনাস উচ্চারণ মাস্টারক্লাস\n• প্রতিটি ক্লাসের পিডিএফ নোট\n• লাইফটাইম এক্সেস",
        category: "ইংরেজি",
        thumbnail: "/images/course-spoken.jpg",
        badge: "বেস্ট সেলার",
        price: 550,
      },
      classes: [
        { title: "কোর্স পরিচিতি ও শেখার রোডম্যাপ", driveUrl: yt("jNQXAC9IVRw"), duration: "১২ মিনিট", orderIndex: 1, isFree: true },
        { title: "প্রতিদিনের ৫০টি জরুরি বাক্য", driveUrl: d("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs75"), duration: "২৮ মিনিট", orderIndex: 2, isFree: true },
        { title: "নিজের পরিচয় ইংরেজিতে দেওয়া", driveUrl: d("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs76"), duration: "৩২ মিনিট", orderIndex: 3 },
        { title: "দোকানে ও রেস্টুরেন্টে কথা বলা", driveUrl: d("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs77"), duration: "২৬ মিনিট", orderIndex: 4 },
        { title: "ফোনে ও অনলাইনে কথোপকথন", driveUrl: d("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs78"), duration: "৩০ মিনিট", orderIndex: 5 },
        { title: "সাক্ষাৎকারে আত্মবিশ্বাসের সাথে কথা বলা", driveUrl: d("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs79"), duration: "৩৫ মিনিট", orderIndex: 6 },
      ],
      bonus: [
        { title: "বোনাস: উচ্চারণ মাস্টারক্লাস", videoUrl: yt("PkZNo7MFNFg"), duration: "৪৫ মিনিট", orderIndex: 1, isFree: true },
        { title: "বোনাস: শ্যাডোয়িং টেকনিক লাইভ সেশন", videoUrl: yt("rfscVS0vtbw"), duration: "৫২ মিনিট", orderIndex: 2 },
        { title: "বোনাস: ফ্লুয়েন্সি চ্যালেঞ্জ — দিন ১", videoUrl: d("1SpkMVs0XRA5nFMdKvBdBZjgmUUqpt2201"), duration: "৩০ মিনিট", orderIndex: 3 },
      ],
      materials: [
        { title: "স্পোকেন ইংলিশ চিটশীট (৫০৫ বাক্য)", driveUrl: d("1SpkMVs0XRA5nFMdKvBdBZjgmUUqpt2101"), type: "pdf" },
        { title: "উচ্চারণ প্র্যাকটিস ওয়ার্কবুক", driveUrl: d("1SpkMVs0XRA5nFMdKvBdBZjgmUUqpt2102"), type: "pdf" },
        { title: "প্রতিদিনের প্র্যাকটিস প্ল্যানার", driveUrl: d("1SpkMVs0XRA5nFMdKvBdBZjgmUUqpt2103"), type: "doc" },
      ],
    },
    {
      course: {
        title: "IELTS Complete Preparation",
        subtitle: "Listening, Reading, Writing ও Speaking — ৪ মডিউলের পূর্ণাঙ্গ প্রস্তুতি",
        description:
          "ব্যান্ড ৭+ স্কোর করার টার্গেট নিয়ে সাজানো এই কোর্সে পাবেন প্রতিটি মডিউলের স্ট্র্যাটেজি, মক টেস্ট ও টাস্ক-২ রাইটিং টেমপ্লেট।\n\nকোর্সটি করে যা পাবেন:\n• মডিউলভিত্তিক স্ট্র্যাটেজি ক্লাস\n• ৩টি মক টেস্ট ও সলভ\n• বোনাস ব্যান্ড ৯ স্পিকিং ডেমো",
        category: "ইংরেজি",
        thumbnail: "/images/course-ielts.jpg",
        badge: "নতুন",
        price: 1500,
        isUpcoming: true,
        launchNote: "আগামী ১ ফেব্রুয়ারি থেকে ক্লাস শুরু",
      },
      classes: [
        { title: "IELTS পরীক্ষার ফরম্যাট ও মার্কিং", driveUrl: d("1IelMVs0XRA5nFMdKvBdBZjgmUUqpt3001"), duration: "১৮ মিনিট", orderIndex: 1, isFree: true },
        { title: "Listening: সেকশন ১-৪ স্ট্র্যাটেজি", driveUrl: d("1IelMVs0XRA5nFMdKvBdBZjgmUUqpt3002"), duration: "৪০ মিনিট", orderIndex: 2 },
        { title: "Reading: True/False/Not Given মাস্টারি", driveUrl: d("1IelMVs0XRA5nFMdKvBdBZjgmUUqpt3003"), duration: "৪৫ মিনিট", orderIndex: 3 },
        { title: "Writing Task 2: Essay স্ট্রাকচার", driveUrl: d("1IelMVs0XRA5nFMdKvBdBZjgmUUqpt3004"), duration: "৫০ মিনিট", orderIndex: 4 },
        { title: "Speaking: কিউ কার্ড হ্যান্ডলিং", driveUrl: d("1IelMVs0XRA5nFMdKvBdBZjgmUUqpt3005"), duration: "৩৮ মিনিট", orderIndex: 5 },
      ],
      bonus: [
        { title: "বোনাস: ব্যান্ড ৯ স্পিকিং মক টেস্ট", videoUrl: yt("1Rs2ND1ryYc"), duration: "৪০ মিনিট", orderIndex: 1, isFree: true },
        { title: "বোনাস: ভোকাবুলারি বুস্টার সেশন", videoUrl: d("1IelMVs0XRA5nFMdKvBdBZjgmUUqpt3201"), duration: "৩৫ মিনিট", orderIndex: 2 },
      ],
      materials: [
        { title: "ব্যান্ড ৭+ রাইটিং স্যাম্পল প্যাক", driveUrl: d("1IelMVs0XRA5nFMdKvBdBZjgmUUqpt3101"), type: "pdf" },
        { title: "Vocabulary বুস্টার শিট", driveUrl: d("1IelMVs0XRA5nFMdKvBdBZjgmUUqpt3102"), type: "pdf" },
        { title: "মক টেস্ট লিস্টেনিং অডিও", driveUrl: d("1IelMVs0XRA5nFMdKvBdBZjgmUUqpt3103"), type: "other" },
      ],
    },
    {
      course: {
        title: "HSC ২০২৬: পদার্থবিজ্ঞান ১ম পত্র",
        subtitle: "পূর্ণ সিলেবাসের ধারাবাহিক ক্লাস + বোর্ড প্রশ্ন সমাধান",
        description:
          "এইচএসসি ২০২৬ পরীক্ষার্থীদের জন্য পদার্থবিজ্ঞান ১ম পত্রের পূর্ণাঙ্গ অনলাইন ব্যাচ। প্রতিটি অধ্যায়ের তত্ত্ব, সৃজনশীল প্রশ্ন প্র্যাকটিস ও বোর্ড প্রশ্নের বিশ্লেষণ।\n\nকোর্সটি করে যা পাবেন:\n• অধ্যায়ভিত্তিক তত্ত্ব ক্লাস\n• সৃজনশীল সমাধান পিডিএফ\n• বোনাস MCQ সলভ ম্যারাথন",
        category: "একাডেমিক",
        thumbnail: "/images/course-physics.jpg",
        badge: "HSC ২০২৬",
        price: 2500,
      },
      classes: [
        { title: "ভৌত জগৎ ও পরিমাপ", driveUrl: d("1PhyMVs0XRA5nFMdKvBdBZjgmUUqpt4001"), duration: "৪২ মিনিট", orderIndex: 1, isFree: true },
        { title: "ভেক্টর — পর্ব ১", driveUrl: d("1PhyMVs0XRA5nFMdKvBdBZjgmUUqpt4002"), duration: "৪৮ মিনিট", orderIndex: 2 },
        { title: "ভেক্টর — পর্ব ২ (প্র্যাকটিস)", driveUrl: d("1PhyMVs0XRA5nFMdKvBdBZjgmUUqpt4003"), duration: "৩৯ মিনিট", orderIndex: 3 },
        { title: "গতিবিদ্যা — সৃজনশীল অংশ", driveUrl: d("1PhyMVs0XRA5nFMdKvBdBZjgmUUqpt4004"), duration: "৫২ মিনিট", orderIndex: 4 },
        { title: "নিউটনিয়ান বলবিদ্যা", driveUrl: d("1PhyMVs0XRA5nFMdKvBdBZjgmUUqpt4005"), duration: "৫৫ মিনিট", orderIndex: 5 },
        { title: "কাজ, শক্তি ও ক্ষমতা", driveUrl: d("1PhyMVs0XRA5nFMdKvBdBZjgmUUqpt4006"), duration: "৪৭ মিনিট", orderIndex: 6 },
      ],
      bonus: [
        { title: "বোনাস: MCQ সলভ ম্যারাথন", videoUrl: d("1PhyMVs0XRA5nFMdKvBdBZjgmUUqpt4201"), duration: "৬০ মিনিট", orderIndex: 1, isFree: true },
        { title: "বোনাস: গাণিতিক সমস্যা শর্টকাট", videoUrl: yt("PkZNo7MFNFg"), duration: "৪২ মিনিট", orderIndex: 2 },
      ],
      materials: [
        { title: "অধ্যায় ১-২ লেকচার শীট", driveUrl: d("1PhyMVs0XRA5nFMdKvBdBZjgmUUqpt4101"), type: "pdf" },
        { title: "সৃজনশীল প্রশ্নব্যাংক ২০২৫", driveUrl: d("1PhyMVs0XRA5nFMdKvBdBZjgmUUqpt4102"), type: "pdf" },
        { title: "ফর্মুলা হ্যান্ডনোট", driveUrl: d("1PhyMVs0XRA5nFMdKvBdBZjgmUUqpt4103"), type: "pdf" },
      ],
    },
    {
      course: {
        title: "SSC গণিতের খুঁটিনাটি",
        subtitle: "দুর্বল বেস থেকে A+ — সাধারণ গণিতের সম্পূর্ণ ফ্রি কোর্স",
        description:
          "গণিতে ভয় পান? এই ফ্রি কোর্সে বেসিক থেকে অ্যাডভান্সড পর্যন্ত প্রতিটি সূত্র ভেঙে ভেঙে শেখানো হয়েছে।\n\nকোর্সটি করে যা পাবেন:\n• ৩০+ টপিকভিত্তিক ক্লাস\n• প্র্যাকটিস শিট ও সমাধান\n• একদম ফ্রি!",
        category: "একাডেমিক",
        thumbnail: "/images/course-math.jpg",
        badge: "ফ্রি কোর্স",
        price: 0,
      },
      classes: [
        { title: "বীজগাণিতিক সূত্রাবলি — হাতেখড়ি", driveUrl: yt("jNQXAC9IVRw"), duration: "৩৫ মিনিট", orderIndex: 1, isFree: true },
        { title: "উৎপাদকে বিশ্লেষণ সহজ উপায়", driveUrl: d("1MthMVs0XRA5nFMdKvBdBZjgmUUqpt5002"), duration: "৪০ মিনিট", orderIndex: 2, isFree: true },
        { title: "ল সা গু ও গ সা গু", driveUrl: d("1MthMVs0XRA5nFMdKvBdBZjgmUUqpt5003"), duration: "৩০ মিনিট", orderIndex: 3, isFree: true },
        { title: "জ্যামিতির ম্যাজিক ট্রিকস", driveUrl: d("1MthMVs0XRA5nFMdKvBdBZjgmUUqpt5004"), duration: "৪৪ মিনিট", orderIndex: 4, isFree: true },
        { title: "মেইন বুক vs টেস্ট পেপার — স্ট্র্যাটেজি", driveUrl: d("1MthMVs0XRA5nFMdKvBdBZjgmUUqpt5005"), duration: "২৫ মিনিট", orderIndex: 5, isFree: true },
      ],
      bonus: [
        { title: "বোনাস: মেন্টাল ম্যাথ ট্রিকস", videoUrl: yt("1Rs2ND1ryYc"), duration: "২৮ মিনিট", orderIndex: 1, isFree: true },
      ],
      materials: [
        { title: "সকল সূত্র একসাথে", driveUrl: d("1MthMVs0XRA5nFMdKvBdBZjgmUUqpt5101"), type: "pdf" },
        { title: "প্র্যাকটিস শিট (সমাধানসহ)", driveUrl: d("1MthMVs0XRA5nFMdKvBdBZjgmUUqpt5102"), type: "pdf" },
      ],
    },
    {
      course: {
        title: "প্রফেশনাল কম্পিউটার ও ICT স্কিল",
        subtitle: "MS Word, Excel, PowerPoint থেকে ফ্রিল্যান্সিং বেসিক — অফিস স্কিল প্যাকেজ",
        description:
          "চাকরি বা ফ্রিল্যান্সিংয়ের জন্য দরকারি সব অফিস স্কিল এক কোর্সে। একদম বেসিক থেকে অ্যাডভান্সড লেভেল পর্যন্ত।\n\nকোর্সটি করে যা পাবেন:\n• Word, Excel, PowerPoint হাতে-কলমে\n• সার্টিফিকেট উপযোগী প্রজেক্ট\n• CV তৈরির টেমপ্লেট",
        category: "স্কিলস",
        thumbnail: "/images/course-ict.jpg",
        badge: "",
        price: 350,
      },
      classes: [
        { title: "কম্পিউটার ও অপারেটিং সিস্টেম বেসিক", driveUrl: d("1IctMVs0XRA5nFMdKvBdBZjgmUUqpt6001"), duration: "২২ মিনিট", orderIndex: 1, isFree: true },
        { title: "MS Word: প্রফেশনাল ডকুমেন্ট", driveUrl: d("1IctMVs0XRA5nFMdKvBdBZjgmUUqpt6002"), duration: "৪৫ মিনিট", orderIndex: 2 },
        { title: "MS Excel: ফর্মুলা ও ডাটা এন্ট্রি", driveUrl: d("1IctMVs0XRA5nFMdKvBdBZjgmUUqpt6003"), duration: "৫০ মিনিট", orderIndex: 3 },
        { title: "PowerPoint: কিলার প্রেজেন্টেশন", driveUrl: d("1IctMVs0XRA5nFMdKvBdBZjgmUUqpt6004"), duration: "৩৬ মিনিট", orderIndex: 4 },
        { title: "CV ও মার্কেটপ্লেস প্রোফাইল", driveUrl: d("1IctMVs0XRA5nFMdKvBdBZjgmUUqpt6005"), duration: "৩০ মিনিট", orderIndex: 5 },
      ],
      bonus: [
        { title: "বোনাস: AI টুলস দিয়ে অফিস কাজ ১০x", videoUrl: yt("rfscVS0vtbw"), duration: "৩৮ মিনিট", orderIndex: 1, isFree: true },
      ],
      materials: [
        { title: "Excel শর্টকাট চিটশীট", driveUrl: d("1IctMVs0XRA5nFMdKvBdBZjgmUUqpt6101"), type: "pdf" },
        { title: "CV টেমপ্লেট প্যাক", driveUrl: d("1IctMVs0XRA5nFMdKvBdBZjgmUUqpt6102"), type: "doc" },
      ],
    },
    {
      course: {
        title: "English Grammar Crash Course",
        subtitle: "Tense, Article, Voice, Narration — যাবতীয় ভুল শুধরে A+ নিশ্চিত",
        description:
          "SSC, HSC বা যেকোনো পরীক্ষার গ্রামার অংশে ফুল মার্কস পাওয়ার শর্টকাট। রুলস + এক্সাম হ্যাকস একসাথে।\n\nকোর্সটি করে যা পাবেন:\n• গ্রামারের সব টপিক এক জায়গায়\n• ১০০০+ MCQ প্রশ্নব্যাংক\n• পরীক্ষার আগের রিভিশন শিট",
        category: "পরীক্ষা প্রস্তুতি",
        thumbnail: "/images/course-grammar.jpg",
        badge: "",
        price: 250,
      },
      classes: [
        { title: "Sentence এর খুঁটিনাটি", driveUrl: d("1GrmMVs0XRA5nFMdKvBdBZjgmUUqpt7001"), duration: "৩২ মিনিট", orderIndex: 1, isFree: true },
        { title: "Tense মাস্টারি — ১ ঘণ্টায়", driveUrl: d("1GrmMVs0XRA5nFMdKvBdBZjgmUUqpt7002"), duration: "৫৮ মিনিট", orderIndex: 2 },
        { title: "Use of Articles (a, an, the)", driveUrl: d("1GrmMVs0XRA5nFMdKvBdBZjgmUUqpt7003"), duration: "৪০ মিনিট", orderIndex: 3 },
        { title: "Voice Change ট্রিকস", driveUrl: d("1GrmMVs0XRA5nFMdKvBdBZjgmUUqpt7004"), duration: "৪৪ মিনিট", orderIndex: 4 },
        { title: "Narration / Speech", driveUrl: d("1GrmMVs0XRA5nFMdKvBdBZjgmUUqpt7005"), duration: "৪৭ মিনিট", orderIndex: 5 },
      ],
      bonus: [
        { title: "বোনাস: গ্রামার রিভিশন ম্যারাথন", videoUrl: d("1GrmMVs0XRA5nFMdKvBdBZjgmUUqpt7201"), duration: "৫০ মিনিট", orderIndex: 1, isFree: true },
      ],
      materials: [
        { title: "গ্রামার রুলস হ্যান্ডবুক", driveUrl: d("1GrmMVs0XRA5nFMdKvBdBZjgmUUqpt7101"), type: "pdf" },
        { title: "১০০০+ MCQ প্রশ্নব্যাংক", driveUrl: d("1GrmMVs0XRA5nFMdKvBdBZjgmUUqpt7102"), type: "pdf" },
        { title: "রিভিশন শিট", driveUrl: d("1GrmMVs0XRA5nFMdKvBdBZjgmUUqpt7103"), type: "pdf" },
      ],
    },
  ];

  const createdCourseIds: string[] = [];
  const freeCourseClassIds: string[] = [];
  let spokenCourseId = "";
  let freeCourseIndex = 3; // SSC গণিত (ফ্রি)
  let spokenIndex = 0;

  let i = 0;
  for (const seed of seedCourses) {
    const [created] = await db
      .insert(courses)
      .values(seed.course)
      .returning({ id: courses.id });

    createdCourseIds.push(created.id);
    if (i === spokenIndex) spokenCourseId = created.id;

    if (seed.classes.length) {
      const inserted = await db
        .insert(classes)
        .values(seed.classes.map((c) => ({ ...c, courseId: created.id })))
        .returning({ id: classes.id });
      if (i === freeCourseIndex) {
        freeCourseClassIds.push(...inserted.slice(0, 2).map((r) => r.id));
      }
    }
    if (seed.bonus.length) {
      await db
        .insert(bonusVideos)
        .values(seed.bonus.map((b) => ({ ...b, courseId: created.id })));
    }
    if (seed.materials.length) {
      await db
        .insert(materials)
        .values(seed.materials.map((m) => ({ ...m, courseId: created.id })));
    }
    i++;
  }

  // ডেমো শিক্ষার্থীকে ২টি কোর্সে এনরোল + কিছু প্রোগ্রেস
  const freeCourseId = createdCourseIds[freeCourseIndex];
  await db.insert(enrollments).values([
    { userId: studentUser.id, courseId: freeCourseId },
    { userId: studentUser.id, courseId: spokenCourseId },
  ]);

  if (freeCourseClassIds.length) {
    await db.insert(classProgress).values(
      freeCourseClassIds.map((classId) => ({
        userId: studentUser.id,
        classId,
        courseId: freeCourseId,
      }))
    );
  }

  return Response.json({
    seeded: true,
    admin: { email: "admin@10minuteschool.com", password: "admin123" },
    student: { email: "student@demo.com", password: "123456" },
    courses: seedCourses.length,
  });
}

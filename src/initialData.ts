import { ProfileData, ProjectData, SkillData, ContactMessage } from './types';

export const INITIAL_PROFILE: ProfileData = {
  name: {
    ar: "ندا حمد",
    en: "Nada Hamad"
  },
  title: {
    ar: "صحفية استقصائية ومعدة برامج إعلامية ورائدة محتوى",
    en: "Investigative Journalist, Media Producer & Content Creator"
  },
  bio: {
    ar: "أكثر من اثني عشر عاماً في تقديم البرامج الإخبارية والتغطية الميدانية في الشرق الأوسط. أسعى دائماً لتوثيق الحقيقة وتقديم محتوى إعلامي يتسم بالعمق والدقة والموضوعية.",
    en: "Over 12 years hosting news broadcasts, live talk shows, and field reporting. Dedicated to journalistic integrity, unearthing the human element in complex global issues, and crafting rigorous, fair, and engaging reports."
  },
  imageUrl: "", // Will be assigned our generated portrait url dynamically in the app
  cvUrl: "#",
  metrics: [
    {
      id: "instagram",
      label: { ar: "إنستغرام", en: "Instagram" },
      value: "الحساب الرسمي",
      link: "https://instagram.com"
    },
    {
      id: "gmail",
      label: { ar: "البريد الإلكتروني", en: "Gmail" },
      value: "israahamad124@gmail.com",
      link: "mailto:israahamad124@gmail.com"
    },
    {
      id: "whatsapp",
      label: { ar: "واتساب", en: "WhatsApp" },
      value: "تواصل مباشر",
      link: "https://wa.me/201000000000"
    },
    {
      id: "linkedin",
      label: { ar: "لينكد إن", en: "LinkedIn" },
      value: "الملف المهني",
      link: "https://linkedin.com"
    }
  ]
};

export const INITIAL_PROJECTS: ProjectData[] = [
  {
    id: "proj-1",
    category: "video",
    title: {
      ar: "تحقيق استقصائي: خلف كواليس موانئ الشحن المغلقة",
      en: "Investigative Report: Inside Sealed Logistics Hubs"
    },
    publisher: {
      ar: "تلفزيون الشرق العربي",
      en: "Orient Arab TV"
    },
    description: {
      ar: "تحقيق مصور مدته 30 دقيقة كشف عن ثغرات توريد غامضة في الموانئ التجارية وتأثيرها على الحركة الاقتصادية الإقليمية.",
      en: "A 30-minute documentary investigating global supply chains, maritime logistics gaps, and their socio-economic impacts."
    },
    link: "https://www.youtube.com",
    date: "2025-11-12",
    imageUrl: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=800&q=85&auto=compress"
  },
  {
    id: "proj-2",
    category: "video",
    title: {
      ar: "مقابلة حصرية مباشرة مع مدير صندوق التنمية الإقليمي",
      en: "Exclusive Live: Interview with Regional Development Chair"
    },
    publisher: {
      ar: "برنامج صدى القرار",
      en: "Decision Echo Show"
    },
    description: {
      ar: "حوار مواجهة ساخن تناول تحديات التضخم وخطط الدعم الاقتصادي الموجه لمواطني المنطقة الاستثمارية الخاصة.",
      en: "A prime-time live interview debating the future of fiscal stimulus, inflation counters, and regional economic reforms."
    },
    link: "https://www.youtube.com",
    date: "2026-02-18",
    imageUrl: "https://images.unsplash.com/photo-1460889687473-0b39e658925d?auto=format&fit=crop&w=800&q=85&auto=compress"
  },
  {
    id: "proj-3",
    category: "audio",
    title: {
      ar: "بودكاست أفق الإعلام - الحلقة 14: تزييف الحقيقة بالذكاء الاصطناعي",
      en: "Media Horizon Podcast - Episode 14: AI Deepfakes in the Newsroom"
    },
    publisher: {
      ar: "منصة صوت بودكاست",
      en: "Sout Podcast Platform"
    },
    description: {
      ar: "حلقة صوتية نوقش فيها كيف تواجه غرف الأخبار الفورية خطر التلاعب بالصوت والصورة، مع حلول تقنية للتحقق.",
      en: "An in-depth audio session breaking down how verify teams discover synthetic media and combat sophisticated disinformation."
    },
    link: "https://soundcloud.com",
    date: "2026-03-05"
  },
  {
    id: "proj-4",
    category: "audio",
    title: {
      ar: "تقرير إذاعي خاص: حكايات النزوح خلف خط الجفاف",
      en: "Special Radio Feature: Stories of Climate Migration"
    },
    publisher: {
      ar: "الإذاعة الإخبارية الدولية",
      en: "International News Radio"
    },
    description: {
      ar: "تغطية مسموعة من الميدان ترصد تجمعات صغار المزارعين بعد جفاف الأودية الموسمية وعلاقتها بالتغير المناخي.",
      en: "A rich narrative audio feature collecting testimonies of farmers displaced by climate challenges and dry seasonal rivers."
    },
    link: "https://soundcloud.com",
    date: "2026-04-20"
  },
  {
    id: "proj-5",
    category: "written",
    title: {
      ar: "مستقبل التقديم التلفزيوني في عصر البث المتعدد والمفتوح",
      en: "The Future of Television Presentation in the Multi-Streaming Era"
    },
    publisher: {
      ar: "سجل الصحافة العربية",
      en: "Arab Journalism Register"
    },
    description: {
      ar: "ورقة عمل تحليلية طويلة تبحث في تغير أنماط اهتمام المشاهدين وعزوفهم عن النشرات التقليدية نحو المنصات السريعة.",
      en: "A long-form analytical paper detailing how viewing habits have evolved and why static linear broadcasts are changing."
    },
    link: "https://medium.com",
    date: "2026-01-15",
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=85&auto=compress"
  }
];

export const INITIAL_SKILLS: SkillData[] = [
  {
    id: "skill-1",
    name: { ar: "التقديم التلفزيوني المباشر", en: "Live TV Broadcasting" },
    level: 95,
    iconName: "Tv",
    category: { ar: "الأداء والتقديم", en: "Presentation" }
  },
  {
    id: "skill-2",
    name: { ar: "إدارة الحوارات والمناظرات الساخنة", en: "Talk Show Moderation" },
    level: 92,
    iconName: "Mic",
    category: { ar: "الأداء والتقديم", en: "Presentation" }
  },
  {
    id: "skill-3",
    name: { ar: "الصحافة الاستقصائية وجمع المصادر", en: "Investigative Journalism" },
    level: 90,
    iconName: "Search",
    category: { ar: "التحرير والكتابة", en: "Writing & Research" }
  },
  {
    id: "skill-4",
    name: { ar: "كتابة السكريبت والسيناريو الوثائقي", en: "Documentary Scriptwriting" },
    level: 88,
    iconName: "FileText",
    category: { ar: "التحرير والكتابة", en: "Writing & Research" }
  },
  {
    id: "skill-5",
    name: { ar: "التحرير والتدقيق الإخباري السريع", en: "Fast News Editing" },
    level: 85,
    iconName: "Edit3",
    category: { ar: "التحرير والكتابة", en: "Writing & Research" }
  },
  {
    id: "skill-6",
    name: { ar: "التعليق الصوتي وسرد القصص المسموعة", en: "Voice-over & Audio Narration" },
    level: 90,
    iconName: "Volume2",
    category: { ar: "الأداء والتقديم", en: "Presentation" }
  }
];

export const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: "msg-1",
    name: "مروان الشهري",
    email: "m.shehri@example.com",
    handle: "@marwan_sh",
    purpose: { ar: "استضافة تلفزيونية", en: "TV Feature Guest" },
    message: "مرحباً أستاذ طارق، نود التنسيق معك لاستضافتك في برنامجنا الثقافي الأسبوع القادم لمناقشة دور الصحافة الاستقصائية في كشف التحديات البيئية.",
    timestamp: "2026-06-19 14:32",
    isRead: false
  },
  {
    id: "msg-2",
    name: "Sarah Jenkins",
    email: "sjenkins@globalmedia.net",
    handle: "@sarah_j_media",
    purpose: { ar: "استشارة إعلامية", en: "Media Consulting" },
    message: "Hello Nada, I represent an international media house. We are looking for customized consultation and guidance sessions for our foreign correspondents operating in local regions.",
    timestamp: "2026-06-20 09:15",
    isRead: true
  }
];

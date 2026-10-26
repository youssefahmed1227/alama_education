/**
 * «هل تعلم؟» (Did You Know?) Facts Database
 * Exactly 14 facts:
 * - 5 meme / humorous Easter egg facts celebrating Mr. Ahmed Samir, Youssef, and the chicks.
 * - 9 curriculum-aligned educational facts from Egyptian 3rd Prep Social Studies (Geography & History).
 */

export interface DidYouKnowFact {
  id: string;
  fact: string;
  isMeme: boolean;
  category: 'meme' | 'geography' | 'history';
  autoDismissMs?: number; // Duration in ms for bubble display (e.g. 2500ms for Youssef smart chick)
  emoji: string;
  badge: string;
}

export const DID_YOU_KNOW_FACTS: DidYouKnowFact[] = [
  // --- 5 Meme / Humorous Facts ---
  {
    id: 'meme-1',
    fact: 'هل تعلم ان مستر احمد سمير احسن مدرس',
    isMeme: true,
    category: 'meme',
    emoji: '👑',
    badge: 'حقيقة مؤكدة 100%',
    autoDismissMs: 3500,
  },
  {
    id: 'meme-2',
    fact: 'هل تعلم ان يوسف يعد اذكي كتكوت',
    isMeme: true,
    category: 'meme',
    emoji: '🐣',
    badge: 'ذكاء خارق',
    // Special requirement: this bubble appears for like two or three seconds (2500ms)
    autoDismissMs: 2600,
  },
  {
    id: 'meme-3',
    fact: 'هل تعلم ان يوسف من ابكتكر هذه اللعبة',
    isMeme: true,
    category: 'meme',
    emoji: '💡',
    badge: 'المبتكر الأسطوري',
    autoDismissMs: 3500,
  },
  {
    id: 'meme-4',
    fact: 'هل تعلم ان الكتكيت الذين هم هنا سرقوا من مزرعة يوسف كتكوتي',
    isMeme: true,
    category: 'meme',
    emoji: '🐥',
    badge: 'تحقيق عاجل 🚨',
    autoDismissMs: 3500,
  },
  {
    id: 'meme-5',
    fact: 'هل تعلم ان كتاكيت مستر احمد سمير تجيب 100% في الدراسات وهي مغمضة!',
    isMeme: true,
    category: 'meme',
    emoji: '⭐',
    badge: 'تفوق العلامة',
    autoDismissMs: 3500,
  },

  // --- 9 Educational Curriculum Facts (Geography & History - 3rd Prep) ---
  {
    id: 'edu-1',
    fact: 'هل تعلم أن قارة آسيا هي أكبر قارات العالم مساحة، بينما قارة أستراليا (الأوقيانوسية) هي أصغرها؟',
    isMeme: false,
    category: 'geography',
    emoji: '🌏',
    badge: 'جغرافيا العالم',
  },
  {
    id: 'edu-2',
    fact: 'هل تعلم أن هضبة التبت في قارة آسيا تُلقب بـ "سقف العالم" لارتفاعها الشديد عن قمم الجبال المجاورة؟',
    isMeme: false,
    category: 'geography',
    emoji: '🏔️',
    badge: 'تضاريس العالم',
  },
  {
    id: 'edu-3',
    fact: 'هل تعلم أن نهر الفولجا في روسيا هو أطول أنهار قارة أوروبا ويصب في بحر قزوين؟',
    isMeme: false,
    category: 'geography',
    emoji: '🌊',
    badge: 'أنهار العالم',
  },
  {
    id: 'edu-4',
    fact: 'هل تعلم أن حوض نهر الأمازون في أمريكا الجنوبية هو أوسع حوض نهري في العالم؟',
    isMeme: false,
    category: 'geography',
    emoji: '🌴',
    badge: 'الأقاليم المناخية',
  },
  {
    id: 'edu-5',
    fact: 'هل تعلم أن معركة ديو البحرية عام 1509م أدت إلى تدمير الأسطول المملوكي وتدهور اقتصادهم؟',
    isMeme: false,
    category: 'history',
    emoji: '⛵',
    badge: 'مصر بين المماليك والعثمانيين',
  },
  {
    id: 'edu-6',
    fact: 'هل تعلم أن ثورة القاهرة الأولى في أكتوبر 1798م كان مركز قيادتها الجامع الأزهر الشريف ضد الحملة الفرنسية؟',
    isMeme: false,
    category: 'history',
    emoji: '🕌',
    badge: 'الحملة الفرنسية',
  },
  {
    id: 'edu-7',
    fact: 'هل تعلم أن محمد علي باشا أنشأ القناطر الخيرية لتنظيم الري وتحويل أراضي الوجه البحري إلى الري الدائم؟',
    isMeme: false,
    category: 'history',
    emoji: '🏛️',
    badge: 'بناء مصر الحديثة',
  },
  {
    id: 'edu-8',
    fact: 'هل تعلم أن الزعيم مصطفى كامل أسس جريدة اللواء عام 1900م وأسس الحزب الوطني عام 1907م لمقاومة الاحتلال؟',
    isMeme: false,
    category: 'history',
    emoji: '📰',
    badge: 'الكفاح الوطني',
  },
  {
    id: 'edu-9',
    fact: 'هل تعلم أن قارة أنتاركتيكا متجمدة بالكامل طوال العام وغير مأهولة بالسكان باستثناء مراكز بحوث علمية دولية؟',
    isMeme: false,
    category: 'geography',
    emoji: '❄️',
    badge: 'الموقع الفلكي والجغرافي',
  },
];

/**
 * Returns a random fact from the 14 facts
 */
export function getRandomFact(): DidYouKnowFact {
  const idx = Math.floor(Math.random() * DID_YOU_KNOW_FACTS.length);
  return DID_YOU_KNOW_FACTS[idx];
}

/**
 * Returns a deterministic fact for a given round index or count
 */
export function getFactForRound(roundNumber: number): DidYouKnowFact {
  const idx = Math.abs(roundNumber) % DID_YOU_KNOW_FACTS.length;
  return DID_YOU_KNOW_FACTS[idx];
}

/**
 * Chicken Mascot Dialogue Collection («أحاديث وسوالف كتكوت علامة»)
 * Rich variety of Arabic talks: Memes (Mr. Ahmed Samir, Youssef), curriculum geography/history facts,
 * 20-second urgent warnings, encouragement, classroom humor, and streak cheer.
 */

export interface ChickDialogue {
  id: string;
  category: 'meme' | 'urgent' | 'curriculum' | 'humor' | 'cheer';
  text: string;
  soundType?: 'chirp' | 'boing' | 'cluck' | 'squawk';
}

export const CHICK_DIALOGUES: ChickDialogue[] = [
  // 1. Memes & Creator banter (Requirement from user)
  {
    id: 'meme-ahmed-samir-1',
    category: 'meme',
    text: 'هل تعلم ان مستر احمد سمير احسن مدرس 👑 وأشطر معلم دراسات في جمهورية مصر كلها!',
    soundType: 'chirp',
  },
  {
    id: 'meme-ahmed-samir-2',
    category: 'meme',
    text: 'مستر أحمد سمير لو شاف إجاباتكم هيوزع درجات نهائية على الفصل كله بالحب! 🌟',
    soundType: 'chirp',
  },
  {
    id: 'meme-youssef-smart-1',
    category: 'meme',
    text: 'هل تعلم ان يوسف يعد اذكي كتكوت 🐣 وعنده دايماً خطة عبقرية لحل أي لغز!',
    soundType: 'chirp',
  },
  {
    id: 'meme-youssef-invented-1',
    category: 'meme',
    text: 'هل تعلم ان يوسف من ابكتكر هذه اللعبة 💡 وسجل براءة اختراع كتاكيت المعرفة!',
    soundType: 'chirp',
  },
  {
    id: 'meme-chicks-stolen-1',
    category: 'meme',
    text: 'هل تعلم ان الكتكيت الذين هم هنا سرقوا من مزرعة يوسف كتكوتي 🐥 ومطلوبين للعدالة!',
    soundType: 'squawk',
  },
  {
    id: 'meme-chick-secret-1',
    category: 'meme',
    text: 'سري للغاية: كتكوت يوسف هو قائد فرقة الكتاكيت ومهندس الإجابات الصحيحة! 🤫',
    soundType: 'chirp',
  },

  // 2. 20-Second Urgency Warnings
  {
    id: 'urgent-1',
    category: 'urgent',
    text: 'انتبه! بدأ العد التنازلي الحاسم (20 ثانية)! اختار الإجابة الصح فوراً! ⏰',
    soundType: 'squawk',
  },
  {
    id: 'urgent-2',
    category: 'urgent',
    text: 'باقي 20 ثانية بس! لو وصل المؤشر للصفر خسارة فورية وشاشة هزيمة! 🚨',
    soundType: 'squawk',
  },
  {
    id: 'urgent-3',
    category: 'urgent',
    text: 'عقارب الساعة بتجري وريشي بينتفض من التوتر! أسرعوا يا أبطال! 😱',
    soundType: 'squawk',
  },
  {
    id: 'urgent-4',
    category: 'urgent',
    text: 'تكتكة الثواني بتعلى! 20 ثانية وتضيع النقطة! ثق بنفسك وجاوب! 💥',
    soundType: 'squawk',
  },

  // 3. Curriculum Geography & History Tips (Egyptian Prep 3)
  {
    id: 'curr-1',
    category: 'curriculum',
    text: 'نصيحة جغرافية: هضبة التبت أعلى هضاب العالم وتعرف بسقف العالم لارتفاعها عن قمم الجبال! 🏔️',
    soundType: 'chirp',
  },
  {
    id: 'curr-2',
    category: 'curriculum',
    text: 'معلومة تاريخية: محمد علي أنشأ القناطر الخيرية على رأس الدلتا لتحويل أراضي الوجه البحري للري الدائم! 🌊',
    soundType: 'chirp',
  },
  {
    id: 'curr-3',
    category: 'curriculum',
    text: 'سر الخريطة: مضيق جبل طارق يصل البحر المتوسط بالمحيط الأطلنطي ويفصل أوروبا عن إفريقيا! 🗺️',
    soundType: 'chirp',
  },
  {
    id: 'curr-4',
    category: 'curriculum',
    text: 'تذكر دائماً: ثورة 1919 شارك فيها كل طوائف الشعب المصري مسلمين ومسيحيين ونساء ورجال! 🇪🇬',
    soundType: 'chirp',
  },
  {
    id: 'curr-5',
    category: 'curriculum',
    text: 'إقليم البحر المتوسط: مناخه حار جاف صيفاً، دافئ ممطر شتاءً، وأشجاره الزيتون دائم الخضرة! 🌿',
    soundType: 'chirp',
  },
  {
    id: 'curr-6',
    category: 'curriculum',
    text: 'تاريخنا فخر: معركة الريدانية 1517 انتهت بضم مصر للدولة العثمانية وإعدام طومان باي! ⚔️',
    soundType: 'chirp',
  },
  {
    id: 'curr-7',
    category: 'curriculum',
    text: 'نصيحة الامتحان: بحيرة فيكتوريا الاستوائية هي المنبع الدائم لمياه نهر النيل! 🚣‍♂️',
    soundType: 'chirp',
  },

  // 4. Classroom Humor & Playful Banter
  {
    id: 'humor-1',
    category: 'humor',
    text: 'صوص صوص! أنت مركز في السؤال ولا بتفكر في ساندوتش الكبدة والفسحة؟! 😂🥪',
    soundType: 'boing',
  },
  {
    id: 'humor-2',
    category: 'humor',
    text: 'أنا كتكوت متخرج بامتياز مع مرتبة الشرف في منهج الصف الثالث الإعدادي! 🎓🐥',
    soundType: 'cluck',
  },
  {
    id: 'humor-3',
    category: 'humor',
    text: 'مين قال الكتاكيت ما تفهمش في تضاريس أمريكا الشمالية وهضبة لبرادور؟! 🌍',
    soundType: 'chirp',
  },
  {
    id: 'humor-4',
    category: 'humor',
    text: 'لو كسبتوا التحدي ده، هوزع عليكم حبوب قمح ذهبية معتمدة من الكتكوت الملكي! 🌽👑',
    soundType: 'chirp',
  },
  {
    id: 'humor-5',
    category: 'humor',
    text: 'ريشي بيلمع من الطاقة الإيجابية! يلا اضرب الخيار الصح من غير تردد! ⚡',
    soundType: 'boing',
  },
  {
    id: 'humor-6',
    category: 'humor',
    text: 'كتكوت واحد في يدك خير من عشرة أسئلة في الهواء! فكر كويس قبل ما تضغط! 🐥',
    soundType: 'cluck',
  },
  {
    id: 'humor-7',
    category: 'humor',
    text: 'أنا وصاحبي يوسف بنراقب مستواكم من وراء الكواليس ومبسوطين جداً! 🕶️',
    soundType: 'chirp',
  },

  // 5. Cheer & Motivation
  {
    id: 'cheer-1',
    category: 'cheer',
    text: 'عاش يا وحوش! إجاباتكم ترفع الرأس والكتكوت فخور بيكم جداً! 🏆',
    soundType: 'chirp',
  },
  {
    id: 'cheer-2',
    category: 'cheer',
    text: 'بطل الجمهورية القادم في الدراسات الاجتماعية جالس قدامي الآن! 🌟',
    soundType: 'chirp',
  },
  {
    id: 'cheer-3',
    category: 'cheer',
    text: 'علامة كاملة في جيبك! استمر بنفس الحماس والتركيز! ✨',
    soundType: 'chirp',
  },
  {
    id: 'cheer-4',
    category: 'cheer',
    text: 'ما شاء الله تبارك الله! الذكاء بيشع من عيونكم زي بريق التاج الملكي! 👑',
    soundType: 'chirp',
  },
  {
    id: 'cheer-5',
    category: 'cheer',
    text: 'خطوة بخطوة للدرجة النهائية! الكتكوت ضامن لك التفوق بجدارة! 🎯',
    soundType: 'chirp',
  },
];

/**
 * Gets a random dialogue, optionally filtered by category
 */
export function getRandomChickDialogue(category?: ChickDialogue['category']): ChickDialogue {
  const pool = category ? CHICK_DIALOGUES.filter((d) => d.category === category) : CHICK_DIALOGUES;
  return pool[Math.floor(Math.random() * pool.length)] || CHICK_DIALOGUES[0];
}

/**
 * Get urgency dialogue specifically for the 20-second countdown threshold
 */
export function getUrgentDialogue(): string {
  const urgentPool = CHICK_DIALOGUES.filter((d) => d.category === 'urgent');
  return urgentPool[Math.floor(Math.random() * urgentPool.length)].text;
}

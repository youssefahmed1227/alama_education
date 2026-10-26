/**
 * Chicken Skins Catalog for «علامة | تحدي المعرفة»
 * High-definition customizable skins for the chick mascot chosen during team setup.
 */

import { ChickenSkinId } from '../types';

export interface ChickenSkin {
  id: ChickenSkinId;
  name: string;
  title: string;
  description: string;
  emoji: string;
  badge: string;
  themeColor: string;
}

export const CHICKEN_SKINS: ChickenSkin[] = [
  {
    id: 'classic',
    name: 'الكتكوت الأصلي',
    title: 'الكتكوت الكلاسيكي الذهبي',
    description: 'الكتكوت الذكي بريش ذهبي وعيون براقة',
    emoji: '🐣',
    badge: 'كلاسيكي أصيل',
    themeColor: '#F59E0B',
  },
  {
    id: 'king',
    name: 'الكتكوت الملكي',
    title: 'الملك المتوج بالذهب والياقوت',
    description: 'يرتدي تاج البطولة المرصع بالياقوت والصولجان الإمبراطوري وعباءة الملوك',
    emoji: '👑',
    badge: 'ملكي أسطوري',
    themeColor: '#EAB308',
  },
  {
    id: 'scholar',
    name: 'كتكوت مستر أحمد سمير',
    title: 'مستر أحمد سمير (ستايل الصورة الحقيقي)',
    description: 'الإطلالة الحقيقية لمستر أحمد سمير: جاكيت أسود شتوي ببطانة صوفية رمادية، بنطال كارجو أسود، حذاء بيج، قصة شعر فيد كول، وموبايل سيلفي ذهبي!',
    emoji: '🧔🏻‍♂️',
    badge: 'ستايل الصورة الحقيقي 📸',
    themeColor: '#1E293B',
  },
  {
    id: 'astronaut',
    name: 'كتكوت الفضاء',
    title: 'رائد فضاء المستقبل ومستكشف الكواكب',
    description: 'يرتدي خوذة الفضاء الكونية مع عاكس أزرق وهوائي اتصال فضائي',
    emoji: '🚀',
    badge: 'مستكشف كوني',
    themeColor: '#06B6D4',
  },
  {
    id: 'detective',
    name: 'الكتكوت المحقق',
    title: 'المحقق الذكي صائد الإجابات',
    description: 'يرتدي قبعة التحري الكلاسيكية ويحمل عدسة مكبرة تكشف أصعب الألغاز',
    emoji: '🕵️',
    badge: 'محقق ذكي',
    themeColor: '#8B5CF6',
  },
  {
    id: 'captain',
    name: 'كابتن الأبطال',
    title: 'قائد الفريق والهداف الرياضي',
    description: 'يرتدي عصابة الرأس الرياضية وشارة الكابتن الذهبية وقميص النصر',
    emoji: '⚽',
    badge: 'رياضي بطولي',
    themeColor: '#EF4444',
  },
  {
    id: 'ninja',
    name: 'النينجا الذهبي',
    title: 'نينجا السرعة والإجابات الخاطفة',
    description: 'يرتدي قناع النينجا وعصابة التحدي مع شارات الشوريكين الذهبية',
    emoji: '🥷',
    badge: 'سريع وخاطف',
    themeColor: '#10B981',
  },
  {
    id: 'superhero',
    name: 'الكتكوت الخارق',
    title: 'البطل الخارق منقذ النقاط',
    description: 'يرتدي وشاح البطل الخارق الأحمر الطائر وقناع النصر الذهبي',
    emoji: '🦸',
    badge: 'خارق للطبيعة',
    themeColor: '#F43F5E',
  },
  {
    id: 'pharaoh',
    name: 'الكتكوت الفرعوني',
    title: 'حفيد الفراعنة وباني الأهرامات',
    description: 'يرتدي غطاء الرأس النمس الفرعوني الملكي المطعم بالذهب واللازورد',
    emoji: '🏺',
    badge: 'تاريخ وحضارة',
    themeColor: '#D97706',
  },
  {
    id: 'cool',
    name: 'الكتكوت الكول',
    title: 'نجم الحفلات الواثق من نفسه',
    description: 'يرتدي نظارات شمسية عاكسة وأناقة شبابية لا مثيل لها',
    emoji: '😎',
    badge: 'ستايل عصري',
    themeColor: '#6366F1',
  },
  {
    id: 'explorer',
    name: 'الكتكوت المستكشف',
    title: 'مستكشف الأدغال والخرائط',
    description: 'يرتدي قبعة السفاري الاستكشافية المزودة بالبوصلة ومنديل الكشافة الأحمر الجسور',
    emoji: '🧭',
    badge: 'مغامر شجاع',
    themeColor: '#F59E0B',
  },
  {
    id: 'baby',
    name: 'الكتكوت الصغير',
    title: 'كتكوت البيضة الكيوت',
    description: 'صغير ولطيف جداً يرتدي قبعة البيضة المكسورة مع عيون مرحة بريئة',
    emoji: '🐣',
    badge: 'كيوت ومحبوب',
    themeColor: '#EC4899',
  },
];

export function getSkinById(id?: ChickenSkinId): ChickenSkin {
  if (id === 'ahmed_samir') {
    return CHICKEN_SKINS.find((s) => s.id === 'scholar') || CHICKEN_SKINS[0];
  }
  return CHICKEN_SKINS.find((s) => s.id === id) || CHICKEN_SKINS[0];
}

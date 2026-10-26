/**
 * Home Screen Component («الرئيسية»)
 * High-impact classroom welcome screen with mascot and mode selection
 */

import React, { useState } from 'react';
import { User, Users, ShieldAlert, Award, Play, BookOpen, HardDrive, History, HelpCircle, Sparkles } from 'lucide-react';
import { GameMode, ActiveScreen } from '../types';
import { ChickMascot, ChickModel } from './ChickMascot';
import { CHICKEN_SKINS } from '../data/chickenSkins';
import { soundEngine } from '../services/audio';
import { ChickenRunwayModal } from './ChickenRunwayModal';

interface HomeScreenProps {
  onSelectMode: (mode: GameMode) => void;
  onNavigate: (screen: ActiveScreen) => void;
  totalQuestions: number;
  completedRoundsCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectMode,
  onNavigate,
  totalQuestions,
  completedRoundsCount,
}) => {
  const [homeChickModel, setHomeChickModel] = useState<ChickModel>('scholar');
  const [runwayModalOpen, setRunwayModalOpen] = useState<boolean>(false);

  const modelOptions: Array<{ id: ChickModel; label: string }> = [
    { id: 'scholar', label: 'مستر أحمد سمير 📸' },
    { id: 'king', label: 'الملك 👑' },
    { id: 'classic', label: 'كلاسيكي 🐥' },
    { id: 'pharaoh', label: 'الفرعوني 🏺' },
    { id: 'astronaut', label: 'الفضاء 🚀' },
    { id: 'detective', label: 'المحقق 🕵️' },
    { id: 'ninja', label: 'النينجا 🥷' },
    { id: 'superhero', label: 'الخارق 🦸' },
    { id: 'captain', label: 'الكابتن ⚽' },
    { id: 'cool', label: 'الكول 😎' },
    { id: 'explorer', label: 'المستكشف 🧭' },
    { id: 'baby', label: 'البيضة 🐣' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
      {/* Hero Welcome with Chick Mascot */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/70 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative background lights */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex-1 text-center md:text-right space-y-4 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 rounded-full text-xs font-semibold">
            <span>✨</span>
            <span>المنهج المصري المعتمد 2026–2027</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            علامة <span className="text-amber-400">|</span> تحدي المعرفة
          </h1>

          <p className="text-slate-300 text-base md:text-lg max-w-xl leading-relaxed">
            المنصة التفاعلية لمسابقات الصف الثالث الإعدادي في الدراسات الاجتماعية. تنافس شيّق، تعزيز للفهم، ومؤثرات كرتونية مبهجة جاهزة للتشغيل دون إنترنت!
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs md:text-sm text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{totalQuestions} سؤال معتمد ومراجع</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{completedRoundsCount} جولة مكتملة</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <HardDrive className="w-4 h-4 text-sky-400" />
              <span>يعمل 100% دون إنترنت من الفلاشة</span>
            </span>
          </div>
        </div>

        {/* Mascot Centerpiece with Costume Picker & Runway Button */}
        <div className="shrink-0 flex flex-col items-center z-10 gap-3">
          <ChickMascot
            state="idle"
            model={homeChickModel}
            hasCrown={homeChickModel === 'king'}
            size="lg"
            message="اضغط عليّ لسماع صوتي يا بطل! 🐥"
            interactive={true}
          />

          {/* Primary Action Button: See Every Chicken Modeling */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setRunwayModalOpen(true);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 border border-amber-300 transform hover:scale-102 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>عرض جميع موديلات الكتاكيت 🌟</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black">
              {CHICKEN_SKINS.length} موديل 🐥
            </span>
          </button>

          {/* Quick Model Selector Pills */}
          <div className="flex items-center justify-center gap-1 flex-wrap max-w-xs bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shadow-inner">
            {modelOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setHomeChickModel(opt.id);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  homeChickModel === opt.id
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Chicken Modeling Runway Strip on Main Page */}
      <div className="w-full mt-6 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base">🌟</span>
            <h3 className="text-sm font-bold text-white">
              منصة استعراض الكتاكيت المباشرة على الرئيسية (Live Models Runway)
            </h3>
            <span className="text-[11px] bg-amber-400/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 font-semibold">
              انقر على أي موديل ليعرض نفسه كبطل على الصفحة الرئيسية فوراً!
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setRunwayModalOpen(true);
            }}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline cursor-pointer self-end sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>مسرح العرض التفاعلي الكامل</span>
            <span className="transform -scale-x-100">←</span>
          </button>
        </div>

        {/* Scrollable Modeling Ribbon showing each chicken */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {CHICKEN_SKINS.map((skin) => {
            const isSelected =
              homeChickModel === skin.id ||
              (skin.id === 'scholar' && homeChickModel === 'ahmed_samir');

            return (
              <button
                key={skin.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setHomeChickModel(skin.id as ChickModel);
                }}
                className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all text-right cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black scale-102 ring-1 ring-amber-300'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                  <ChickMascot
                    state="idle"
                    model={skin.id as ChickModel}
                    hasCrown={skin.id === 'king'}
                    size="sm"
                    animate={false}
                    interactive={false}
                  />
                </div>
                <div>
                  <div className="text-xs font-black flex items-center gap-1 leading-tight">
                    <span>{skin.emoji}</span>
                    <span>{skin.name}</span>
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 leading-tight ${
                      isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {skin.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Game Mode Selection Grid */}
      <div className="w-full mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">اختر نمط المسابقة</h2>
            <p className="text-sm text-slate-400">حدد طريقة التنافس داخل الفصل أو المنزل</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mode 1: Single Player */}
          <button
            onClick={() => onSelectMode('single')}
            className="group relative flex flex-col items-start p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/60 hover:bg-slate-850 transition-all text-right shadow-lg hover:shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
              لاعب واحد (تحدٍّ فردي)
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-6">
              اختبر معلوماتك بدقة، راجع شرح الإجابات فوراً، واجمع أكبر قدر من النقاط للتفوق الدراسي.
            </p>
            <div className="mt-auto flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span>بدء التحدي الفردي</span>
              <span className="transform -scale-x-100 group-hover:translate-x-1 transition-transform">←</span>
            </div>
          </button>

          {/* Mode 2: Two Teams (Recommended Classroom Mode) */}
          <button
            onClick={() => onSelectMode('two_teams')}
            className="group relative flex flex-col items-start p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950/60 border-2 border-amber-400/80 hover:border-amber-400 hover:bg-slate-850 transition-all text-right shadow-xl hover:shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <div className="absolute -top-3 left-6 px-3 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black rounded-full shadow">
              الوضع الأساسي للفصل
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
              فريقان متنافسان (تناوب الأدوار)
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-6">
              تنافس حماسي بين فريقين على شاشة واحدة. الإجابة الصحيحة تمنح النقاط وتُبقي الدور، والخطأ ينقل الدور للخصم!
            </p>
            <div className="mt-auto flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span>تجهيز الفريقين وبدء الجولة</span>
              <span className="transform -scale-x-100 group-hover:translate-x-1 transition-transform">←</span>
            </div>
          </button>

          {/* Mode 3: Multi Teams (Expandable) */}
          <button
            onClick={() => onSelectMode('multi_teams')}
            className="group relative flex flex-col items-start p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/60 hover:bg-slate-850 transition-all text-right shadow-lg hover:shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
              مجموعات متعددة (3 أو 4 فرق)
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-6">
              قسّم طلاب الفصل إلى 3 أو 4 مجموعات متنافسة في جولة واحدة مع دوران سلس ومنصف للأدوار.
            </p>
            <div className="mt-auto flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span>تخصيص المجموعات</span>
              <span className="transform -scale-x-100 group-hover:translate-x-1 transition-transform">←</span>
            </div>
          </button>
        </div>
      </div>

      {/* Curriculum Spotlight Banner */}
      <div className="w-full mt-10 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-right">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">موضوع البداية المعتمد:</h4>
            <p className="text-xs text-slate-400">
              الوحدة الثانية (جغرافيا سكان العالم) - الدرس الأول: «السلالات البشرية في العالم» + وحدات التاريخ والجغرافيا
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('question_bank')}
          className="px-4 py-2 text-xs font-medium text-amber-300 hover:text-amber-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
        >
          استعراض وإدارة بنك الأسئلة
        </button>
      </div>

      {/* Quick Access Footer Tiles */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-8">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setRunwayModalOpen(true);
          }}
          className="p-4 bg-gradient-to-b from-slate-900/90 to-amber-950/20 hover:bg-slate-900 border border-amber-500/40 hover:border-amber-400 rounded-xl text-center flex flex-col items-center gap-2 transition-all cursor-pointer group shadow-lg shadow-amber-500/5 col-span-2 sm:col-span-1"
        >
          <Sparkles className="w-5 h-5 text-amber-400 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold text-amber-300">مسرح عارضات الكتاكيت</span>
          <span className="text-[10px] text-slate-400">جميع الموديلات والأزياء</span>
        </button>
        <button
          onClick={() => onNavigate('teacher_guide')}
          className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-xl text-center flex flex-col items-center gap-2 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-medium text-slate-300">دليل المعلم والمسابقات</span>
          <span className="text-[10px] text-slate-500">نصائح إدارة الفصل</span>
        </button>
        <button
          onClick={() => onNavigate('history')}
          className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-xl text-center flex flex-col items-center gap-2 transition-colors cursor-pointer"
        >
          <History className="w-5 h-5 text-sky-400" />
          <span className="text-xs font-medium text-slate-300">سجل الجولات السابقة</span>
          <span className="text-[10px] text-slate-500">مراجعة النتائج والدرجات</span>
        </button>
        <button
          onClick={() => onNavigate('usb_export')}
          className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-xl text-center flex flex-col items-center gap-2 transition-colors cursor-pointer"
        >
          <HardDrive className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-medium text-slate-300">نسخة فلاشة USB</span>
          <span className="text-[10px] text-slate-500">تشغيل دون إنترنت</span>
        </button>
        <button
          onClick={() => onNavigate('rules_settings')}
          className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-xl text-center flex flex-col items-center gap-2 transition-colors cursor-pointer"
        >
          <Award className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-medium text-slate-300">قواعد النقاط والأدوار</span>
          <span className="text-[10px] text-slate-500">تخصيص عداد الثواني</span>
        </button>
      </div>

      {/* Chicken Runway & Modeling Showcase Modal */}
      <ChickenRunwayModal
        isOpen={runwayModalOpen}
        onClose={() => setRunwayModalOpen(false)}
        activeHomeModel={homeChickModel}
        onSelectForMainPage={(model) => setHomeChickModel(model)}
      />
    </div>
  );
};

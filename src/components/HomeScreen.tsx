/**
 * Home Screen Component («الرئيسية»)
 * High-impact classroom welcome screen with mascot and mode selection
 */

import React from 'react';
import { User, Users, ShieldAlert, Award, Play, BookOpen, HardDrive, History, HelpCircle } from 'lucide-react';
import { GameMode, ActiveScreen } from '../types';
import { ChickMascot } from './ChickMascot';

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

        {/* Mascot Centerpiece */}
        <div className="shrink-0 flex flex-col items-center z-10">
          <ChickMascot mood="idle" size="lg" message="مرحباً بكم يا أبطال الشهادة الإعدادية! 🐥" />
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
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        <button
          onClick={() => onNavigate('teacher_guide')}
          className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-xl text-center flex flex-col items-center gap-2 transition-colors"
        >
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-medium text-slate-300">دليل المعلم والمسابقات</span>
        </button>
        <button
          onClick={() => onNavigate('history')}
          className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-xl text-center flex flex-col items-center gap-2 transition-colors"
        >
          <History className="w-5 h-5 text-sky-400" />
          <span className="text-xs font-medium text-slate-300">سجل الجولات السابقة</span>
        </button>
        <button
          onClick={() => onNavigate('usb_export')}
          className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-xl text-center flex flex-col items-center gap-2 transition-colors"
        >
          <HardDrive className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-medium text-slate-300">تحميل نسخة فلاشة USB</span>
        </button>
        <button
          onClick={() => onNavigate('rules_settings')}
          className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-xl text-center flex flex-col items-center gap-2 transition-colors"
        >
          <Award className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-medium text-slate-300">قواعد النقاط والأدوار</span>
        </button>
      </div>
    </div>
  );
};

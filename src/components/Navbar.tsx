/**
 * Top Bar Navigation adhering to 3-zone contract & Arabic RTL
 */

import React from 'react';
import { Volume2, VolumeX, Sparkles, BookOpen, History, Settings, HelpCircle, HardDrive } from 'lucide-react';
import { ActiveScreen } from '../types';

interface NavbarProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  inGame?: boolean;
  onConfirmQuitGame?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  onNavigate,
  soundEnabled,
  onToggleSound,
  inGame = false,
  onConfirmQuitGame,
}) => {
  const handleNavClick = (screen: ActiveScreen) => {
    if (inGame) {
      if (onConfirmQuitGame) {
        onConfirmQuitGame();
      }
      return;
    }
    onNavigate(screen);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand title wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-right whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <span className="text-2xl transform group-hover:scale-110 transition-transform">🐥</span>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
            علامة <span className="text-amber-400 text-sm font-normal">| تحدي المعرفة</span>
          </span>
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleNavClick('home')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-400 ${
              activeScreen === 'home' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => handleNavClick('question_bank')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-400 ${
              activeScreen === 'question_bank' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            بنك الأسئلة
          </button>
          <button
            onClick={() => handleNavClick('history')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-400 ${
              activeScreen === 'history' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            سجل الجولات
          </button>
          <button
            onClick={() => handleNavClick('teacher_guide')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-400 ${
              activeScreen === 'teacher_guide' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            دليل المعلم
          </button>
          <button
            onClick={() => handleNavClick('usb_export')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-400 ${
              activeScreen === 'usb_export' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            نسخة USB
          </button>
        </nav>

        {/* Zone 3: Primary action + sound control */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            title={soundEnabled ? 'الصوت مفعّل' : 'الصوت مكتوم'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          {/* Settings button */}
          <button
            type="button"
            onClick={() => handleNavClick('rules_settings')}
            aria-label="إعدادات القواعد"
            className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
            title="إعدادات القواعد والوقت"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Primary Action Button */}
          {inGame ? (
            <button
              onClick={onConfirmQuitGame}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-rose-200 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              إنهاء المسابقة
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('setup')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>بدء مسابقة</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

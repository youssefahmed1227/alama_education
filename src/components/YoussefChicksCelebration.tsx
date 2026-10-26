/**
 * Special Youssef Victory & Chicks Celebration Component
 * «مؤثر فوز يوسف ومارش كتاكيت علامة الملكي»
 * Features distinct chicken models (King, Scholar, Explorer, Cool, Baby),
 * synthesized royal brass fanfare, confetti pops, sparkling crowns, and interactive controls.
 * Light, non-intrusive, performant, mobile-friendly, and respects reduced motion.
 */

import React, { useEffect, useState, useRef } from 'react';
import { X, Sparkles, Volume2 } from 'lucide-react';
import { ChickMascot, mapGameEventToAnimationState, ChickModel } from './ChickMascot';
import { soundEngine } from '../services/audio';

interface YoussefChicksCelebrationProps {
  winnerName: string;
  isTie: boolean;
  reducedMotion?: boolean;
  onDismiss?: () => void;
}

export const YoussefChicksCelebration: React.FC<YoussefChicksCelebrationProps> = ({
  winnerName,
  isTie,
  reducedMotion = false,
  onDismiss,
}) => {
  const [visible, setVisible] = useState<boolean>(true);
  const hasTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    // Only trigger once per winner instantiation
    if (hasTriggeredRef.current || isTie) return;
    hasTriggeredRef.current = true;

    // Trigger royal brass fanfare and celebratory confetti pop
    soundEngine.playYoussefFanfare();
    const confettiTimer = setTimeout(() => {
      soundEngine.playConfettiPop();
    }, 450);

    const crownTimer = setTimeout(() => {
      soundEngine.playCrownSparkle();
    }, 1800);

    // Auto-dismiss after 10 seconds (gives plenty of time to enjoy the models and music)
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 10000);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(crownTimer);
      clearTimeout(timer);
    };
  }, [isTie, onDismiss]);

  const handleReplayFanfare = () => {
    soundEngine.playYoussefFanfare();
    soundEngine.playConfettiPop();
  };

  if (!visible || isTie) return null;

  const celebrationTroop: Array<{
    model: ChickModel;
    label: string;
    delay: string;
    size: 'sm' | 'md' | 'lg';
    hasCrown: boolean;
  }> = [
    { model: 'scholar', label: 'العالِم يوسف! 📜', delay: '0s', size: 'sm', hasCrown: false },
    { model: 'cool', label: 'نجم المسابقة! ⭐', delay: '0.15s', size: 'md', hasCrown: false },
    { model: 'king', label: 'عاش يوسف الملك! 👑🏆', delay: '0.3s', size: 'lg', hasCrown: true },
    { model: 'explorer', label: 'مستكشف الجغرافيا! 🧭', delay: '0.45s', size: 'md', hasCrown: false },
    { model: 'baby', label: 'مبروك يا بطل! 🐥', delay: '0.6s', size: 'sm', hasCrown: false },
  ];

  return (
    <div
      role="region"
      aria-label="مؤثر فوز يوسف الاحتفالي"
      className="w-full my-4 p-4 md:p-6 bg-gradient-to-r from-amber-500/25 via-yellow-500/35 to-amber-500/25 border-2 border-amber-400 rounded-3xl shadow-2xl relative overflow-hidden transition-all text-center select-none"
    >
      {/* Decorative Floating Confetti Dots */}
      <div className="absolute top-2 left-6 text-xl animate-bounce pointer-events-none">🎉</div>
      <div className="absolute top-4 right-10 text-xl animate-bounce pointer-events-none" style={{ animationDelay: '0.3s' }}>✨</div>
      <div className="absolute bottom-2 left-12 text-lg animate-pulse pointer-events-none">⭐</div>
      <div className="absolute bottom-3 right-16 text-lg animate-pulse pointer-events-none" style={{ animationDelay: '0.5s' }}>🎊</div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
        aria-label="إغلاق المؤثر"
        className="absolute top-3 left-3 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors z-20"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Special Youssef Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 font-black rounded-full shadow-lg text-sm md:text-base mb-2 animate-bounce">
        <Sparkles className="w-4 h-4 fill-current" />
        <span>مارش النصر الملكي ليوسف وكتاكيت علامة 🐥👑🎺</span>
        <Sparkles className="w-4 h-4 fill-current" />
      </div>

      <p className="text-xs md:text-sm text-amber-200 font-bold mb-3 max-w-xl mx-auto">
        تحية فخر ملكية خاصة من فرقة كتاكيت علامة بمختلف أزيائها للمتسابق البطل ({winnerName}) لتفوقه واكتساحه الجولة!
      </p>

      {/* Replay Fanfare Button */}
      <button
        type="button"
        onClick={handleReplayFanfare}
        className="mb-3 px-3 py-1 bg-amber-400/20 hover:bg-amber-400/40 text-amber-300 border border-amber-400/50 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1.5"
      >
        <Volume2 className="w-3.5 h-3.5" />
        <span>إعادة عزف المارش الملكي 🎺</span>
      </button>

      {/* Diverse Flock of 5 Chicks (King, Scholar, Cool, Explorer, Baby) */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 flex-wrap py-2">
        {celebrationTroop.map((chick, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center transition-transform hover:scale-110 ${
              reducedMotion ? '' : 'animate-chick-bounce'
            }`}
            style={{
              animationDelay: chick.delay,
              animationDuration: '0.85s',
            }}
          >
            <ChickMascot
              state={mapGameEventToAnimationState('victory')}
              model={chick.model}
              hasCrown={chick.hasCrown}
              size={chick.size}
              message={chick.label}
              animate={!reducedMotion}
              interactive={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

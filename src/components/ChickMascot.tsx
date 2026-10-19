/**
 * Chick Mascot Component («كتكوت علامة»)
 * Scalable SVG cartoon mascot with expressive animations for classroom entertainment
 */

import React from 'react';

export type MascotMood = 'idle' | 'thinking' | 'correct' | 'wrong' | 'timeout' | 'celebration';

interface ChickMascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  animate?: boolean;
  className?: string;
}

export const ChickMascot: React.FC<ChickMascotProps> = ({
  mood = 'idle',
  size = 'md',
  message,
  animate = true,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-44',
    xl: 'w-60 h-60',
  };

  const getMoodAnimation = () => {
    if (!animate) return '';
    switch (mood) {
      case 'correct':
      case 'celebration':
        return 'animate-chick-bounce';
      case 'wrong':
        return 'animate-chick-wobble';
      case 'idle':
        return 'animate-chick-idle';
      case 'thinking':
        return 'animate-pulse';
      case 'timeout':
        return 'animate-chick-wobble';
      default:
        return '';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Speech bubble if message provided */}
      {message && (
        <div className="mb-2 px-4 py-2 bg-amber-400 text-slate-950 rounded-2xl font-bold text-sm md:text-base shadow-lg relative text-center border-2 border-amber-300 transform -translate-y-1">
          {message}
          <div className="absolute -bottom-2 right-1/2 translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-amber-400" />
        </div>
      )}

      {/* Mascot SVG Vector Graphic */}
      <div className={`relative ${sizeMap[size]} ${getMoodAnimation()} transition-transform`}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle Ambient Glow */}
          <circle cx="100" cy="115" r="70" fill="url(#chickGlow)" opacity="0.3" />

          {/* Feet */}
          <path d="M75 165 C75 180, 60 185, 55 185 M75 165 C75 180, 75 188, 73 188 M75 165 C75 180, 90 185, 93 185" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" />
          <path d="M125 165 C125 180, 110 185, 107 185 M125 165 C125 180, 125 188, 127 188 M125 165 C125 180, 140 185, 145 185" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" />

          {/* Body */}
          <ellipse cx="100" cy="115" rx="68" ry="62" fill="url(#bodyGradient)" stroke="#D97706" strokeWidth="4" />

          {/* Belly Highlight */}
          <ellipse cx="100" cy="125" rx="44" ry="40" fill="#FEF3C7" opacity="0.75" />

          {/* Wings */}
          {mood === 'correct' || mood === 'celebration' ? (
            <>
              {/* Joyfully raised wings */}
              <path d="M40 110 C20 70, 10 90, 32 118" fill="#F59E0B" stroke="#D97706" strokeWidth="3" />
              <path d="M160 110 C180 70, 190 90, 168 118" fill="#F59E0B" stroke="#D97706" strokeWidth="3" />
            </>
          ) : (
            <>
              {/* Normal resting wings */}
              <ellipse cx="42" cy="120" rx="14" ry="24" transform="rotate(15 42 120)" fill="#F59E0B" stroke="#D97706" strokeWidth="3" />
              <ellipse cx="158" cy="120" rx="14" ry="24" transform="rotate(-15 158 120)" fill="#F59E0B" stroke="#D97706" strokeWidth="3" />
            </>
          )}

          {/* Head Tuft Feathers */}
          <path d="M96 54 C94 36, 85 30, 80 32 C92 40, 94 48, 97 54 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
          <path d="M100 52 C104 28, 112 25, 118 28 C108 38, 105 46, 102 52 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />

          {/* Rosy Cheeks */}
          <ellipse cx="65" cy="118" rx="9" ry="6" fill="#FCA5A5" opacity="0.8" />
          <ellipse cx="135" cy="118" rx="9" ry="6" fill="#FCA5A5" opacity="0.8" />

          {/* Eyes depending on mood */}
          {mood === 'wrong' ? (
            <>
              {/* Comic cartoon dizzy swirl eyes */}
              <g transform="translate(62, 85)">
                <circle cx="12" cy="12" r="14" fill="white" stroke="#D97706" strokeWidth="2" />
                <path d="M6 12 Q12 6 18 12 Q12 18 8 13" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
              </g>
              <g transform="translate(114, 85)">
                <circle cx="12" cy="12" r="14" fill="white" stroke="#D97706" strokeWidth="2" />
                <path d="M6 12 Q12 6 18 12 Q12 18 8 13" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
              </g>
            </>
          ) : mood === 'timeout' ? (
            <>
              {/* Startled eyes */}
              <circle cx="74" cy="98" r="14" fill="white" stroke="#D97706" strokeWidth="2" />
              <circle cx="74" cy="98" r="6" fill="#0F172A" />
              <circle cx="126" cy="98" r="14" fill="white" stroke="#D97706" strokeWidth="2" />
              <circle cx="126" cy="98" r="6" fill="#0F172A" />
            </>
          ) : mood === 'thinking' ? (
            <>
              {/* Looking up / thoughtful eyes */}
              <circle cx="74" cy="98" r="12" fill="white" stroke="#D97706" strokeWidth="2" />
              <circle cx="77" cy="93" r="7" fill="#0F172A" />
              <circle cx="79" cy="91" r="2.5" fill="white" />
              <circle cx="126" cy="98" r="12" fill="white" stroke="#D97706" strokeWidth="2" />
              <circle cx="129" cy="93" r="7" fill="#0F172A" />
              <circle cx="131" cy="91" r="2.5" fill="white" />
            </>
          ) : (
            <>
              {/* Happy sparkling big cartoon eyes */}
              <ellipse cx="74" cy="98" rx="12" ry="14" fill="#0F172A" />
              <ellipse cx="126" cy="98" rx="12" ry="14" fill="#0F172A" />
              {/* Light glints */}
              <circle cx="71" cy="93" r="4.5" fill="white" />
              <circle cx="76" cy="103" r="2" fill="white" />
              <circle cx="123" cy="93" r="4.5" fill="white" />
              <circle cx="128" cy="103" r="2" fill="white" />
            </>
          )}

          {/* Cute Orange Beak */}
          {mood === 'correct' || mood === 'celebration' ? (
            // Wide open cheerful beak
            <path d="M85 106 Q100 128 115 106 Q100 98 85 106 Z" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
          ) : mood === 'wrong' ? (
            // Cute wavy mouth
            <path d="M88 114 Q95 108 100 114 Q105 120 112 114" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" fill="none" />
          ) : (
            // Cheerful closed beak
            <path d="M88 106 Q100 122 112 106 Q100 98 88 106 Z" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
          )}

          {/* Celebration Graduation Cap or Winner Crown */}
          {mood === 'celebration' && (
            <g transform="translate(68, 14)">
              <polygon points="32,0 64,12 32,24 0,12" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
              <polygon points="12,16 52,16 46,26 18,26" fill="#0F172A" />
              <circle cx="32" cy="12" r="3" fill="#FBBF24" />
              <path d="M32 12 Q48 18 46 32" stroke="#F59E0B" strokeWidth="2" fill="none" />
              <circle cx="46" cy="33" r="2.5" fill="#EF4444" />
            </g>
          )}

          {/* Gradients */}
          <defs>
            <radialGradient id="bodyGradient" cx="40%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="60%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
            <radialGradient id="chickGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Orbiting cartoon stars for correct / victory */}
        {(mood === 'correct' || mood === 'celebration') && (
          <div className="absolute -top-3 -right-2 text-2xl animate-star-pop select-none pointer-events-none">
            ⭐
          </div>
        )}
        {(mood === 'correct' || mood === 'celebration') && (
          <div className="absolute top-2 -left-3 text-xl animate-star-pop select-none pointer-events-none" style={{ animationDelay: '0.2s' }}>
            ✨
          </div>
        )}

        {/* Comic question marks or stars for wrong / timeout */}
        {mood === 'wrong' && (
          <>
            <span className="absolute -top-3 right-0 text-xl font-bold text-amber-400 animate-bounce">؟</span>
            <span className="absolute -top-2 left-2 text-lg font-bold text-amber-500 animate-pulse">💫</span>
          </>
        )}
        {mood === 'timeout' && (
          <span className="absolute -top-4 right-1/2 translate-x-1/2 text-2xl animate-pulse">⏰</span>
        )}
      </div>
    </div>
  );
};

/**
 * Flock of Chicks dancing across screen for big achievements & round victory
 */
export const ChickFlock: React.FC<{ count?: number; message?: string }> = ({ count = 5, message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 my-4">
      {message && (
        <div className="px-6 py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-slate-950 font-black rounded-full shadow-lg text-lg animate-bounce">
          {message}
        </div>
      )}
      <div className="flex items-end justify-center gap-2 md:gap-4 flex-wrap">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="transform transition-transform"
            style={{
              animationDelay: `${i * 0.12}s`,
              transform: `scale(${0.75 + (i % 2) * 0.25}) translateY(${i % 2 === 0 ? '-6px' : '0'})`,
            }}
          >
            <ChickMascot
              mood="correct"
              size={i === Math.floor(count / 2) ? 'lg' : 'md'}
              animate={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

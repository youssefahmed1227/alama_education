/**
 * Chick Mascot Component («كتكوت علامة»)
 * Scalable ultra-cute SVG cartoon mascot with rich animations, distinct character models,
 * dynamic facial expressions, interactive click-to-chirp sounds, and celebratory royal crown.
 */

import React, { useState } from 'react';
import { soundEngine } from '../services/audio';
import { getRandomChickDialogue } from '../data/chickDialogues';

export type ChickAnimationState = 'idle' | 'jumping' | 'cheering' | 'thinking' | 'wobbling';

export type ChickModel =
  | 'classic'
  | 'king'
  | 'scholar'
  | 'ahmed_samir'
  | 'explorer'
  | 'cool'
  | 'baby'
  | 'astronaut'
  | 'detective'
  | 'captain'
  | 'ninja'
  | 'superhero'
  | 'pharaoh';

export type MascotMood = ChickAnimationState | 'correct' | 'wrong' | 'timeout' | 'celebration' | 'victory' | 'streak';

export type GameAnimationEvent =
  | 'correct_answer'
  | 'wrong_answer'
  | 'timeout'
  | 'victory'
  | 'correct'
  | 'wrong'
  | 'idle'
  | 'thinking'
  | 'wobbling'
  | 'celebration'
  | 'streak';

/**
 * Helper function that maps specific game events to the chicken animation states:
 * - 'correct_answer' / 'correct' -> 'jumping'
 * - 'victory' / 'celebration' / 'streak' -> 'cheering'
 * - 'wrong_answer' / 'wrong' / 'timeout' -> 'thinking'
 * - 'wobbling' / 'wobble' / 'incorrect'  -> 'wobbling'
 * - 'idle' / default                     -> 'idle'
 */
export function mapGameEventToAnimationState(event: GameAnimationEvent | string): ChickAnimationState {
  switch (event) {
    case 'correct_answer':
    case 'correct':
      return 'jumping';
    case 'victory':
    case 'celebration':
    case 'cheering':
    case 'streak':
      return 'cheering';
    case 'wobbling':
    case 'wobble':
    case 'incorrect':
      return 'wobbling';
    case 'wrong_answer':
    case 'wrong':
    case 'timeout':
    case 'thinking':
      return 'thinking';
    case 'idle':
    default:
      return 'idle';
  }
}

// Alias for convenience
export const getChickAnimationStateForEvent = mapGameEventToAnimationState;

export interface ChickMascotProps {
  state?: ChickAnimationState;
  mood?: MascotMood;
  model?: ChickModel;
  hasCrown?: boolean;
  isVictory?: boolean;
  isUrgent?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  message?: string;
  messageDurationMs?: number;
  animate?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ChickMascot: React.FC<ChickMascotProps> = ({
  state,
  mood,
  model = 'classic',
  hasCrown = false,
  isVictory = false,
  isUrgent = false,
  size = 'md',
  message,
  messageDurationMs,
  animate = true,
  interactive = true,
  onClick,
  className = '',
}) => {
  const [isPoked, setIsPoked] = useState<boolean>(false);
  const [pokeBubble, setPokeBubble] = useState<string | null>(null);
  const [internalMessage, setInternalMessage] = useState<string | undefined>(message);

  // Sync internal message with external message prop and apply auto-dismiss timer if requested
  React.useEffect(() => {
    setInternalMessage(message);
    if (message && messageDurationMs && messageDurationMs > 0) {
      const timer = setTimeout(() => {
        setInternalMessage(undefined);
      }, messageDurationMs);
      return () => clearTimeout(timer);
    }
  }, [message, messageDurationMs]);

  // Determine effective state from either `state` prop or mapped `mood`
  const effectiveState: ChickAnimationState = state
    ? state
    : mood
    ? mapGameEventToAnimationState(mood)
    : 'idle';

  // Check if mascot is in a victory state: automatically adds the royal crown & champion appearance!
  const isVictoryState = Boolean(
    isVictory ||
    effectiveState === 'cheering' ||
    mood === 'victory' ||
    mood === 'celebration'
  );

  // Display crown if explicitly requested, model is 'king', or during victory states!
  const showCrown = hasCrown || model === 'king' || isVictoryState;

  // Real-life Mr. Ahmed Samir model based on photo (Black puffer jacket with sherpa fleece lining, fade haircut, beard, cream sneakers & gold selfie phone!)
  const isAhmedSamir = model === 'scholar' || model === 'ahmed_samir';

  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-44',
    xl: 'w-60 h-60',
    '2xl': 'w-72 h-72',
  };

  const getAnimationClass = () => {
    if (isPoked) return 'animate-chick-poke';
    if (!animate) return '';
    if (isUrgent) return 'animate-chick-urgent';
    switch (effectiveState) {
      case 'jumping':
        return 'animate-chick-jumping';
      case 'cheering':
        return 'animate-chick-cheering';
      case 'thinking':
        return 'animate-chick-thinking';
      case 'wobbling':
        return 'animate-chick-wobble';
      case 'idle':
      default:
        return 'animate-chick-idle';
    }
  };

  // Handle click on chick for cute interactive reaction
  const handleChickClick = () => {
    if (!interactive) return;

    setIsPoked(true);
    const dialogue = getRandomChickDialogue();

    // Trigger corresponding sound or random alternate
    if (dialogue.soundType === 'boing') {
      soundEngine.playFunnyBoing();
    } else if (dialogue.soundType === 'cluck') {
      soundEngine.playCluck();
    } else if (dialogue.soundType === 'squawk') {
      soundEngine.playSurpriseSquawk();
    } else {
      soundEngine.playChirp();
    }

    setPokeBubble(dialogue.text);

    setTimeout(() => {
      setIsPoked(false);
    }, 500);

    setTimeout(() => {
      setPokeBubble(null);
    }, 3200);

    onClick?.();
  };

  const displayedMessage = pokeBubble || internalMessage;

  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={handleChickClick}
      title={interactive ? 'اضغط على كتكوت علامة للتفاعل وسماع صوته!' : undefined}
    >
      {/* Speech bubble if message provided */}
      {displayedMessage && (
        <div className="mb-2 px-4 py-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 rounded-2xl font-black text-xs md:text-sm shadow-xl relative text-center border-2 border-amber-300/80 transform -translate-y-1 transition-all animate-bounce max-w-[240px] leading-tight">
          {displayedMessage}
          <div className="absolute -bottom-2 right-1/2 translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-amber-400" />
        </div>
      )}

      {/* Mascot SVG Vector Graphic */}
      <div className={`relative ${sizeMap[size]} ${getAnimationClass()} transition-transform`}>
        <svg
          viewBox="0 0 220 220"
          className="w-full h-full drop-shadow-2xl overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Body Feather Gradient */}
            <radialGradient id="bodyGradient" cx="38%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="45%" stopColor="#FDE047" />
              <stop offset="85%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>

            {/* Belly Fluff Gradient */}
            <radialGradient id="bellyGradient" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FDE68A" />
            </radialGradient>

            {/* Rosy Blush Glow */}
            <radialGradient id="blushGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FB7185" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
            </radialGradient>

            {/* Beak Gradient */}
            <linearGradient id="beakGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="60%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            {/* Royal Gold Crown Gradient */}
            <linearGradient id="royalGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="30%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Ruby Gem Gradient */}
            <radialGradient id="rubyGem" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FCA5A5" />
              <stop offset="40%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#991B1B" />
            </radialGradient>

            {/* Emerald Gem Gradient */}
            <radialGradient id="emeraldGem" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="40%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#065F46" />
            </radialGradient>

            {/* Soft Ambient Mascot Glow */}
            <radialGradient id="chickGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
            </radialGradient>

            {/* Royal Velvet Cape */}
            <linearGradient id="royalCape" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7E22CE" />
              <stop offset="70%" stopColor="#581C87" />
              <stop offset="100%" stopColor="#3B0764" />
            </linearGradient>

            {/* Glasses Gloss */}
            <linearGradient id="glassesGloss" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#38BDF8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.4" />
            </linearGradient>

            {/* Mr. Ahmed Samir Gradients (Photo Accurate) */}
            {/* Black Winter Puffer Jacket */}
            <linearGradient id="ahmedJacket" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Heather Grey Sherpa Fleece Lining */}
            <linearGradient id="sherpaFleece" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="40%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>

            {/* Mirror Selfie Champagne Gold Smartphone */}
            <linearGradient id="goldPhone" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="25%" stopColor="#FDE047" />
              <stop offset="65%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Jet-Black Fade Haircut */}
            <linearGradient id="ahmedHair" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="35%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Camera Module Glass */}
            <linearGradient id="phoneCameraGlass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          {/* Background Ambient Glow */}
          <circle cx="110" cy="125" r="85" fill="url(#chickGlow)" />

          {/* Model: Mr. Ahmed Samir - Studio Lounge Circular Loop Neon Wall Light (Photo Accurate) */}
          {isAhmedSamir && (
            <g className="opacity-45" style={{ transformOrigin: '162px 64px' }}>
              <ellipse cx="162" cy="64" rx="24" ry="22" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.7" />
              <ellipse cx="162" cy="64" rx="28" ry="26" stroke="#86EFAC" strokeWidth="1.2" fill="none" opacity="0.4" />
            </g>
          )}

          {/* Model: King's Royal Velvet Cape (Behind Body - Exclusive to King model) */}
          {model === 'king' && (
            <g className="animate-pulse" style={{ animationDuration: '3.5s' }}>
              {/* Outer Velvet Mantle */}
              <path
                d="M44 116 C22 142, 18 184, 40 196 C62 202, 158 202, 180 196 C202 184, 198 142, 176 116 Z"
                fill="url(#royalCape)"
                stroke="#F59E0B"
                strokeWidth="3.5"
              />
              {/* Inner Crimson Lining Folds */}
              <path
                d="M52 130 C38 152, 34 180, 52 192 C72 196, 148 196, 168 192 C186 180, 182 152, 168 130 Z"
                fill="#4C0519"
                opacity="0.35"
              />
              {/* White Ermine Fur Trim at Bottom */}
              <path
                d="M40 190 Q65 199 88 190 Q110 200 132 190 Q155 199 180 190 Q164 202 110 202 Q56 202 40 190 Z"
                fill="#F8FAFC"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              {/* Ermine spots */}
              <circle cx="68" cy="195" r="1.8" fill="#0F172A" />
              <circle cx="90" cy="196" r="1.5" fill="#0F172A" />
              <circle cx="110" cy="197" r="1.8" fill="#0F172A" />
              <circle cx="130" cy="196" r="1.5" fill="#0F172A" />
              <circle cx="152" cy="195" r="1.8" fill="#0F172A" />
            </g>
          )}

          {/* Model: Superhero Flying Crimson Cape (Behind Body) */}
          {model === 'superhero' && (
            <g className="animate-pulse" style={{ animationDuration: '2.5s' }}>
              <path
                d="M46 118 C20 152, 12 196, 42 208 C70 216, 150 216, 178 208 C208 196, 200 152, 174 118 Z"
                fill="#DC2626"
                stroke="#991B1B"
                strokeWidth="3.5"
              />
              <path
                d="M56 130 C38 160, 32 188, 56 198 C80 204, 140 204, 164 198 C188 188, 182 160, 164 130 Z"
                fill="#B91C1C"
                opacity="0.4"
              />
              {/* Golden Cape Clasp */}
              <circle cx="60" cy="122" r="5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="160" cy="122" r="5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            </g>
          )}

          {/* Wiggling Little Tail Feathers (Left Side) */}
          <g transform="translate(32, 130)">
            <path
              d="M15 10 C0 8, -6 0, -8 -8 C-2 -4, 8 2, 14 6"
              fill="#F59E0B"
              stroke="#D97706"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M16 16 C3 16, -4 10, -7 4 C-1 6, 8 10, 15 13"
              fill="#FBBF24"
              stroke="#D97706"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Feet: Stylish Cream/Beige Sneakers for Mr. Ahmed Samir (Photo Accurate) or Classic Orange Feet */}
          {isAhmedSamir ? (
            <g>
              {/* Black Jogger Pant Cuffs above shoes */}
              <rect x="74" y="174" width="18" height="8" rx="3" fill="#0F172A" stroke="#1E293B" strokeWidth="1.2" />
              <rect x="128" y="174" width="18" height="8" rx="3" fill="#0F172A" stroke="#1E293B" strokeWidth="1.2" />

              {/* Left Cream Sneaker (As in photo) */}
              <g transform="translate(62, 178)">
                {/* Sneaker Upper */}
                <path
                  d="M6 10 C6 2, 28 2, 32 10 L36 17 C36 21, 2 21, 2 17 Z"
                  fill="#EDE4D3"
                  stroke="#A8A29E"
                  strokeWidth="1.5"
                />
                {/* Thick White Rubber Sole */}
                <rect x="0" y="16" width="38" height="6.5" rx="3" fill="#FFFFFF" stroke="#D6D3D1" strokeWidth="1" />
                {/* Laces */}
                <line x1="12" y1="8" x2="24" y2="8" stroke="#57534E" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="14" y1="12" x2="22" y2="12" stroke="#57534E" strokeWidth="1.8" strokeLinecap="round" />
                {/* Sneaker Side Curve */}
                <path d="M8 14 Q16 11 26 14" stroke="#D6D3D1" strokeWidth="1" fill="none" />
              </g>

              {/* Right Cream Sneaker (As in photo) */}
              <g transform="translate(120, 178)">
                <path
                  d="M6 10 C6 2, 28 2, 32 10 L36 17 C36 21, 2 21, 2 17 Z"
                  fill="#EDE4D3"
                  stroke="#A8A29E"
                  strokeWidth="1.5"
                />
                <rect x="0" y="16" width="38" height="6.5" rx="3" fill="#FFFFFF" stroke="#D6D3D1" strokeWidth="1" />
                <line x1="12" y1="8" x2="24" y2="8" stroke="#57534E" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="14" y1="12" x2="22" y2="12" stroke="#57534E" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M8 14 Q16 11 26 14" stroke="#D6D3D1" strokeWidth="1" fill="none" />
              </g>
            </g>
          ) : (
            <g>
              {/* Left Foot */}
              <path
                d="M82 178 C82 195, 68 200, 62 200 M82 178 C82 196, 82 203, 80 203 M82 178 C82 196, 98 201, 102 200"
                stroke="#EA580C"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Right Foot */}
              <path
                d="M138 178 C138 195, 122 201, 118 200 M138 178 C138 196, 138 203, 140 203 M138 178 C138 196, 154 200, 160 200"
                stroke="#EA580C"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Plump Round Body */}
          <ellipse
            cx="110"
            cy="126"
            rx="74"
            ry="68"
            fill="url(#bodyGradient)"
            stroke="#D97706"
            strokeWidth="4"
          />

          {/* Chubby Light Belly */}
          <ellipse
            cx="110"
            cy="138"
            rx="50"
            ry="45"
            fill="url(#bellyGradient)"
            opacity="0.88"
          />

          {/* Model: Baby Eggshell Pants */}
          {model === 'baby' && (
            <path
              d="M48 140 Q110 196 172 140 L160 152 L145 138 L130 152 L110 136 L90 152 L75 138 L60 152 Z"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="3"
            />
          )}

          {/* Mr. Ahmed Samir Signature Outfit: Black Quilted Puffer Jacket, Sherpa Fleece Lapels & Mirror Selfie Smartphone */}
          {isAhmedSamir ? (
            <g>
              {/* Solid Black Cargo Joggers Lower Body */}
              <path
                d="M66 160 C66 182, 154 182, 154 160 C154 172, 66 172, 66 160 Z"
                fill="#0F172A"
                stroke="#1E293B"
                strokeWidth="1.5"
              />

              {/* Solid Black Crewneck Inner T-Shirt */}
              <path
                d="M84 116 Q110 126 136 116 L138 175 Q110 180 82 175 Z"
                fill="#0B0F19"
              />
              <path
                d="M92 118 Q110 125 128 118"
                stroke="#1E293B"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />

              {/* Black Quilted Winter Puffer Jacket - Left & Right Panels */}
              <path
                d="M40 118 C36 142, 48 174, 84 174 L86 120 C70 118, 52 116, 40 118 Z"
                fill="url(#ahmedJacket)"
                stroke="#020617"
                strokeWidth="2"
              />
              <path
                d="M180 118 C184 142, 172 174, 136 174 L134 120 C150 118, 168 116, 180 118 Z"
                fill="url(#ahmedJacket)"
                stroke="#020617"
                strokeWidth="2"
              />

              {/* Horizontal Puffer Quilting Seams & Volume Ridges */}
              <path d="M44 132 Q65 137 85 133" stroke="#334155" strokeWidth="2.2" fill="none" />
              <path d="M46 146 Q66 151 85 147" stroke="#334155" strokeWidth="2.2" fill="none" />
              <path d="M52 160 Q69 164 84 161" stroke="#334155" strokeWidth="2.2" fill="none" />

              <path d="M176 132 Q155 137 135 133" stroke="#334155" strokeWidth="2.2" fill="none" />
              <path d="M174 146 Q154 151 135 147" stroke="#334155" strokeWidth="2.2" fill="none" />
              <path d="M168 160 Q151 164 136 161" stroke="#334155" strokeWidth="2.2" fill="none" />

              {/* Heather Grey Sherpa Fleece Lining (Turned Outward on Lapels, Exact to Photo) */}
              <path
                d="M84 120 C88 134, 87 156, 84 174 C79 174, 75 168, 76 154 C77 140, 80 126, 84 120 Z"
                fill="url(#sherpaFleece)"
                stroke="#94A3B8"
                strokeWidth="1.2"
                strokeDasharray="2 1.5"
              />
              <path
                d="M136 120 C132 134, 133 156, 136 174 C141 174, 145 168, 144 154 C143 140, 140 126, 136 120 Z"
                fill="url(#sherpaFleece)"
                stroke="#94A3B8"
                strokeWidth="1.2"
                strokeDasharray="2 1.5"
              />

              {/* Silver Metallic Zipper Track */}
              <line x1="85" y1="120" x2="85" y2="174" stroke="#64748B" strokeWidth="1.6" strokeDasharray="2 2" />
              <line x1="135" y1="120" x2="135" y2="174" stroke="#64748B" strokeWidth="1.6" strokeDasharray="2 2" />

              {/* Left Puffer Sleeve & Hand in Pocket (Mirror Selfie Stance) */}
              <g>
                <path
                  d="M44 124 C34 138, 42 164, 60 167 C66 168, 72 164, 68 152 C64 140, 56 130, 44 124 Z"
                  fill="url(#ahmedJacket)"
                  stroke="#020617"
                  strokeWidth="2.5"
                />
                <line x1="58" y1="150" x2="72" y2="162" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
              </g>

              {/* Right Arm & Metallic Gold Smartphone Selfie Prop */}
              <g>
                <path
                  d="M174 126 C164 122, 146 132, 136 142 C130 148, 138 156, 148 152 C162 148, 172 138, 174 126 Z"
                  fill="url(#ahmedJacket)"
                  stroke="#020617"
                  strokeWidth="2.5"
                />

                {/* Metallic Gold Mirror Selfie Smartphone */}
                <g
                  transform={
                    effectiveState === 'jumping' || effectiveState === 'cheering'
                      ? 'translate(132, 94) rotate(10)'
                      : effectiveState === 'thinking'
                      ? 'translate(120, 118) rotate(-4)'
                      : effectiveState === 'wobbling'
                      ? 'translate(126, 128) rotate(-16)'
                      : 'translate(124, 122) rotate(-8)'
                  }
                  className="transition-transform duration-300"
                >
                  {/* Smartphone Body */}
                  <rect
                    x="0"
                    y="0"
                    width="36"
                    height="56"
                    rx="8"
                    fill="url(#goldPhone)"
                    stroke="#B45309"
                    strokeWidth="1.8"
                    filter="drop-shadow(0 6px 10px rgba(0,0,0,0.4))"
                  />
                  {/* Outer Bezel Rim */}
                  <rect
                    x="1.5"
                    y="1.5"
                    width="33"
                    height="53"
                    rx="6.5"
                    fill="none"
                    stroke="#FEF08A"
                    strokeWidth="0.8"
                    opacity="0.65"
                  />

                  {/* Triple Camera Island */}
                  <rect x="3" y="4" width="17" height="23" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1" />
                  <circle cx="11.5" cy="9.5" r="3.5" fill="url(#phoneCameraGlass)" stroke="#64748B" strokeWidth="0.8" />
                  <circle cx="10.5" cy="8.5" r="1.1" fill="#FFFFFF" opacity="0.85" />
                  <circle cx="11.5" cy="18.5" r="3.5" fill="url(#phoneCameraGlass)" stroke="#64748B" strokeWidth="0.8" />
                  <circle cx="10.5" cy="17.5" r="1.1" fill="#FFFFFF" opacity="0.85" />
                  <circle cx="18.5" cy="14" r="3" fill="url(#phoneCameraGlass)" stroke="#64748B" strokeWidth="0.8" />
                  <circle cx="17.7" cy="13.2" r="0.9" fill="#FFFFFF" opacity="0.85" />
                  <circle cx="6" cy="14" r="1.8" fill="#FEF08A" />

                  {/* Metallic Glare diagonal stripe */}
                  <line x1="5" y1="3" x2="31" y2="52" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.38" />

                  {/* Cute Chick Wing Fingers Clasping Phone Edge */}
                  <circle cx="2" cy="30" r="3.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" />
                  <circle cx="3" cy="37" r="3.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" />
                  <circle cx="5" cy="44" r="3.2" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" />

                  {/* Camera Sparkle Glint */}
                  <g transform="translate(8, 2)">
                    <polygon
                      points="4,0 5.2,2.8 8,4 5.2,5.2 4,8 2.8,5.2 0,4 2.8,2.8"
                      fill="#FFFFFF"
                      opacity="0.95"
                    />
                  </g>
                </g>
              </g>
            </g>
          ) : (
            /* Wings - Dynamic Posing based on State for Other Models */
            effectiveState === 'jumping' || effectiveState === 'cheering' ? (
              <g>
                {/* Left Wing - Raised High in Cheerful Flap */}
                <path
                  d="M46 120 C18 78, 6 100, 34 130 C40 136, 48 132, 46 120 Z"
                  fill="#F59E0B"
                  stroke="#D97706"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                {/* Right Wing - Raised High */}
                <path
                  d="M174 120 C202 78, 214 100, 186 130 C180 136, 172 132, 174 120 Z"
                  fill="#F59E0B"
                  stroke="#D97706"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
              </g>
            ) : effectiveState === 'thinking' ? (
              <g>
                {/* Left Wing resting on hip */}
                <path
                  d="M48 130 C30 120, 24 140, 44 152 C48 154, 52 142, 48 130 Z"
                  fill="#F59E0B"
                  stroke="#D97706"
                  strokeWidth="3.5"
                />
                {/* Right Wing scratching cheek / chin thoughtfully */}
                <path
                  d="M172 135 C185 110, 150 95, 128 118 C124 124, 132 132, 138 126 C150 114, 165 120, 168 138 Z"
                  fill="#F59E0B"
                  stroke="#D97706"
                  strokeWidth="3.5"
                />
              </g>
            ) : effectiveState === 'wobbling' ? (
              <g>
                {/* Drooping flustered trembling wings */}
                <path
                  d="M48 134 C26 138, 22 165, 42 168 C48 168, 52 152, 48 134 Z"
                  fill="#F59E0B"
                  stroke="#D97706"
                  strokeWidth="3.5"
                />
                <path
                  d="M172 134 C194 138, 198 165, 178 168 C172 168, 168 152, 172 134 Z"
                  fill="#F59E0B"
                  stroke="#D97706"
                  strokeWidth="3.5"
                />
              </g>
            ) : (
              <g>
                {/* Cute Resting Wings */}
                <path
                  d="M48 128 C28 118, 30 148, 48 156 C54 158, 56 142, 48 128 Z"
                  fill="#F59E0B"
                  stroke="#D97706"
                  strokeWidth="3.5"
                />
                <path
                  d="M172 128 C192 118, 190 148, 172 156 C166 158, 164 142, 172 128 Z"
                  fill="#F59E0B"
                  stroke="#D97706"
                  strokeWidth="3.5"
                />
              </g>
            )
          )}

          {/* Model Accessory: Explorer Neckerchief / Bandana */}
          {model === 'explorer' && (
            <g>
              <path
                d="M80 145 Q110 162 140 145 Q110 152 80 145 Z"
                fill="#DC2626"
                stroke="#991B1B"
                strokeWidth="2"
              />
              <polygon points="106,152 114,152 110,166" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
            </g>
          )}

          {/* Model: King's Royal Regalia (Brooches, Golden Collar, Medallion & Adaptive Scepter) */}
          {model === 'king' && (
            <g>
              {/* Golden Shoulder Brooches fastening the Royal Cape */}
              <g>
                <circle cx="56" cy="120" r="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                <circle cx="56" cy="120" r="3.5" fill="url(#rubyGem)" />
                <circle cx="164" cy="120" r="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                <circle cx="164" cy="120" r="3.5" fill="url(#rubyGem)" />
              </g>

              {/* Golden Royal Collar Chain */}
              <path
                d="M62 122 Q110 152 158 122"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                fill="none"
              />

              {/* Golden Grand Royal Medallion */}
              <circle cx="110" cy="154" r="10" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
              <circle cx="110" cy="154" r="7.5" fill="url(#rubyGem)" />
              <polygon points="110,147 112,152 117,152 113,155 115,160 110,157 105,160 107,155 103,152 108,152" fill="#FEF08A" />
              <circle cx="108" cy="151" r="1.8" fill="#FFFFFF" opacity="0.9" />

              {/* Royal Scepter held in right wing - adapts dynamically to animation state */}
              <g
                transform={
                  effectiveState === 'jumping' || effectiveState === 'cheering'
                    ? 'translate(182, 82) rotate(-18)'
                    : effectiveState === 'thinking'
                    ? 'translate(170, 116) rotate(22)'
                    : 'translate(174, 108) rotate(14)'
                }
                className="transition-transform duration-300"
              >
                {/* Scepter Shaft */}
                <line x1="0" y1="0" x2="0" y2="46" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" />
                <line x1="0" y1="8" x2="0" y2="38" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
                {/* Grip Rings */}
                <circle cx="0" cy="16" r="3" fill="#B45309" />
                <circle cx="0" cy="28" r="3" fill="#B45309" />
                {/* Imperial Ruby Orb Top */}
                <circle cx="0" cy="-2" r="8" fill="url(#rubyGem)" stroke="#B45309" strokeWidth="2" />
                <circle cx="-2.5" cy="-4.5" r="2.5" fill="#FFFFFF" opacity="0.9" />
                {/* Imperial Cross Crest on top of Scepter */}
                <path d="M0 -14 L0 -7 M-3.5 -10.5 L3.5 -10.5" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
                {/* Golden Base Finial */}
                <circle cx="0" cy="46" r="3.5" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
              </g>
            </g>
          )}

          {/* Model Accessory: Detective Magnifying Glass held in hand */}
          {model === 'detective' && (
            <g transform="translate(42, 115) rotate(-20)">
              <circle cx="16" cy="16" r="14" fill="#38BDF8" fillOpacity="0.25" stroke="#94A3B8" strokeWidth="3" />
              <line x1="26" y1="26" x2="42" y2="42" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3" fill="#FFFFFF" opacity="0.7" />
            </g>
          )}

          {/* Model Accessory: Captain Championship Medal */}
          {model === 'captain' && (
            <g transform="translate(110, 150)">
              {/* Ribbon */}
              <path d="M-12 -18 L0 0 L12 -18" stroke="#EF4444" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M-6 -18 L0 0 L6 -18" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Gold Medal */}
              <circle cx="0" cy="4" r="9" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
              <circle cx="0" cy="4" r="6.5" fill="#F59E0B" />
              <polygon points="0,0 2,3 5,3 3,5 4,8 0,6 -4,8 -3,5 -5,3 -2,3" fill="#FEF08A" />
            </g>
          )}

          {/* Model Accessory: Ninja Shuriken Chest Emblem */}
          {model === 'ninja' && (
            <g transform="translate(110, 146)">
              <circle cx="0" cy="0" r="8" fill="#1E293B" stroke="#10B981" strokeWidth="1.5" />
              <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill="#34D399" />
              <circle cx="0" cy="0" r="2" fill="#0F172A" />
            </g>
          )}

          {/* Model Accessory: Superhero Shield Emblem */}
          {model === 'superhero' && (
            <g transform="translate(110, 145)">
              <polygon points="0,-9 9,-4 7,8 0,12 -7,8 -9,-4" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
              <polygon points="0,-6 6,-3 5,5 0,8 -5,5 -6,-3" fill="#EF4444" />
              <path d="M-2 -3 L2 -3 L-1 1 L3 1 L-2 6 L0 2 L-3 2 Z" fill="#FEF08A" />
            </g>
          )}

          {/* Model Accessory: Pharaoh Egyptian Wesekh Broad Collar */}
          {model === 'pharaoh' && (
            <g transform="translate(110, 136)">
              <path d="M-36 0 Q0 30 36 0" stroke="#F59E0B" strokeWidth="6" fill="none" />
              <path d="M-34 0 Q0 26 34 0" stroke="#1E3A8A" strokeWidth="3" fill="none" />
              <path d="M-32 0 Q0 22 32 0" stroke="#0D9488" strokeWidth="2" fill="none" />
              <circle cx="0" cy="18" r="4.5" fill="#EF4444" stroke="#B45309" strokeWidth="1" />
            </g>
          )}

          {/* Model Accessory: Astronaut Space Suit Console */}
          {model === 'astronaut' && (
            <g transform="translate(110, 148)">
              <rect x="-14" y="-8" width="28" height="16" rx="4" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
              <circle cx="-6" cy="0" r="3" fill="#10B981" className="animate-pulse" />
              <circle cx="6" cy="0" r="3" fill="#38BDF8" />
              <rect x="-1" y="-5" width="2" height="10" fill="#64748B" />
            </g>
          )}

          {/* Urgent Low-Time Sweat Drops (Active when time is finishing) */}
          {isUrgent && (
            <g>
              {/* Right temple sweat droplet running down */}
              <g className="animate-bounce" style={{ animationDuration: '0.8s' }}>
                <path
                  d="M164 80 C164 80, 172 90, 172 96 A5 5 0 0 1 162 96 C162 90, 164 80, 164 80 Z"
                  fill="#38BDF8"
                  stroke="#0284C7"
                  strokeWidth="1.5"
                />
                <circle cx="165" cy="94" r="1.5" fill="#FFFFFF" />
              </g>
              {/* Left temple smaller sweat droplet */}
              <g className="animate-bounce" style={{ animationDuration: '1.1s' }}>
                <path
                  d="M58 84 C58 84, 64 92, 64 97 A4 4 0 0 1 56 97 C56 92, 58 84, 58 84 Z"
                  fill="#38BDF8"
                  stroke="#0284C7"
                  strokeWidth="1.2"
                />
                <circle cx="59" cy="95" r="1.2" fill="#FFFFFF" />
              </g>
            </g>
          )}

          {/* Rosy Fluffy Cheeks */}
          <ellipse cx="68" cy="128" rx="13" ry="8" fill="url(#blushGlow)" />
          <ellipse cx="152" cy="128" rx="13" ry="8" fill="url(#blushGlow)" />

          {/* Cute Anime spec-sparkle cheeks */}
          <circle cx="65" cy="126" r="2.5" fill="#FFFFFF" opacity="0.6" />
          <circle cx="155" cy="126" r="2.5" fill="#FFFFFF" opacity="0.6" />

          {/* Mr. Ahmed Samir Signature Groomed 5 O'Clock Stubble Beard (Photo Accurate) */}
          {isAhmedSamir && (
            <g>
              {/* Subtle dark stubble shadow contour along lower cheeks and jawline */}
              <path
                d="M58 120 C58 140, 76 156, 110 156 C144 156, 162 140, 162 120 C156 128, 146 138, 134 142 C124 145, 96 145, 86 142 C74 138, 64 128, 58 120 Z"
                fill="#0F172A"
                opacity="0.35"
              />
              <path
                d="M84 140 C92 148, 100 152, 110 152 C120 152, 128 148, 136 140 C126 145, 118 146, 110 146 C102 146, 94 145, 84 140 Z"
                fill="#020617"
                opacity="0.5"
              />
              {/* Micro stubble dots for crisp barbershop taper finish */}
              <circle cx="82" cy="132" r="0.9" fill="#0F172A" opacity="0.45" />
              <circle cx="88" cy="138" r="0.9" fill="#0F172A" opacity="0.45" />
              <circle cx="96" cy="144" r="0.9" fill="#0F172A" opacity="0.45" />
              <circle cx="104" cy="148" r="0.9" fill="#0F172A" opacity="0.5" />
              <circle cx="110" cy="149" r="0.9" fill="#0F172A" opacity="0.5" />
              <circle cx="116" cy="148" r="0.9" fill="#0F172A" opacity="0.5" />
              <circle cx="124" cy="144" r="0.9" fill="#0F172A" opacity="0.45" />
              <circle cx="132" cy="138" r="0.9" fill="#0F172A" opacity="0.45" />
              <circle cx="138" cy="132" r="0.9" fill="#0F172A" opacity="0.45" />
            </g>
          )}

          {/* Cartoon Eyes - Highly Expressive & Cutesy */}
          {isUrgent ? (
            <g>
              {/* Wide worried anxious anime eyes when time is expiring */}
              <ellipse cx="80" cy="106" rx="15" ry="17" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
              <ellipse cx="140" cy="106" rx="15" ry="17" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
              <circle cx="82" cy="106" r="7.5" fill="#0F172A" />
              <circle cx="138" cy="106" r="7.5" fill="#0F172A" />
              <circle cx="80" cy="103" r="3.5" fill="#FFFFFF" />
              <circle cx="136" cy="103" r="3.5" fill="#FFFFFF" />
              {/* Anxious Trembling Eyebrows */}
              <path d="M68 84 Q78 91 90 85" stroke="#B45309" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M130 85 Q142 91 152 84" stroke="#B45309" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ) : effectiveState === 'thinking' ? (
            <g>
              {/* Thoughtful Eyes looking up-right */}
              <ellipse cx="80" cy="106" rx="14" ry="16" fill="#FFFFFF" stroke="#D97706" strokeWidth="2.5" />
              <ellipse cx="140" cy="106" rx="14" ry="16" fill="#FFFFFF" stroke="#D97706" strokeWidth="2.5" />
              {/* Iris looking up */}
              <circle cx="84" cy="100" r="8.5" fill="#1E293B" />
              <circle cx="144" cy="100" r="8.5" fill="#1E293B" />
              {/* Double Specular Light Glints */}
              <circle cx="86" cy="97" r="3.5" fill="#FFFFFF" />
              <circle cx="82" cy="104" r="1.8" fill="#FFFFFF" />
              <circle cx="146" cy="97" r="3.5" fill="#FFFFFF" />
              <circle cx="142" cy="104" r="1.8" fill="#FFFFFF" />
              {/* Curious Eyebrows */}
              <path d="M70 88 Q80 82 92 89" stroke="#B45309" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M128 89 Q140 82 150 88" stroke="#B45309" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ) : effectiveState === 'jumping' || effectiveState === 'cheering' ? (
            <g>
              {/* Joyous Crescent Smiling Anime Eyes */}
              <path
                d="M66 108 C68 94, 88 94, 94 108"
                stroke="#1E293B"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M126 108 C128 94, 148 94, 154 108"
                stroke="#1E293B"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Cheerful Eyebrows */}
              <path d="M68 88 Q80 80 92 86" stroke="#B45309" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M128 86 Q140 80 152 88" stroke="#B45309" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ) : effectiveState === 'wobbling' ? (
            <g>
              {/* Comical dizzy spiral / swirling stunned eyes */}
              <g transform="translate(80, 106)">
                <ellipse cx="0" cy="0" rx="14" ry="16" fill="#FFFFFF" stroke="#D97706" strokeWidth="2.5" />
                <path
                  d="M0 0 A2 2 0 0 1 2 2 A4 4 0 0 1 -2 4 A6 6 0 0 1 -6 -2 A8 8 0 0 1 2 -8 A10 10 0 0 1 10 2"
                  stroke="#1E293B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
              <g transform="translate(140, 106)">
                <ellipse cx="0" cy="0" rx="14" ry="16" fill="#FFFFFF" stroke="#D97706" strokeWidth="2.5" />
                <path
                  d="M0 0 A2 2 0 0 1 -2 -2 A4 4 0 0 1 2 -4 A6 6 0 0 1 6 2 A8 8 0 0 1 -2 8 A10 10 0 0 1 -10 -2"
                  stroke="#1E293B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
              {/* Wobbly confused eyebrows */}
              <path d="M68 85 Q78 92 90 85" stroke="#B45309" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M130 85 Q142 92 152 85" stroke="#B45309" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            <g>
              {/* Big Adorable Pixar/Chibi Eyes with Double Specular Highlights */}
              <ellipse cx="80" cy="106" rx="14" ry="17" fill="#1E293B" />
              <ellipse cx="140" cy="106" rx="14" ry="17" fill="#1E293B" />
              {/* Iris Tone Glow */}
              <circle cx="80" cy="112" r="7" fill="#475569" opacity="0.6" />
              <circle cx="140" cy="112" r="7" fill="#475569" opacity="0.6" />
              {/* Main Specular Star Glint */}
              <circle cx="76" cy="100" r="5" fill="#FFFFFF" />
              <circle cx="136" cy="100" r="5" fill="#FFFFFF" />
              {/* Secondary Bottom Glint */}
              <circle cx="84" cy="113" r="2.8" fill="#FFFFFF" />
              <circle cx="144" cy="113" r="2.8" fill="#FFFFFF" />
              {/* Styled Eyebrows (Deeper for Mr. Ahmed Samir) */}
              <path
                d="M72 88 Q80 84 90 88"
                stroke={isAhmedSamir ? '#0F172A' : '#B45309'}
                strokeWidth={isAhmedSamir ? 3.2 : 2.5}
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M130 88 Q140 84 148 88"
                stroke={isAhmedSamir ? '#0F172A' : '#B45309'}
                strokeWidth={isAhmedSamir ? 3.2 : 2.5}
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Model Accessory: Cool Sunglasses */}
          {model === 'cool' && (
            <g transform="translate(0, 2)">
              {/* Dark lenses */}
              <path
                d="M62 96 C62 94, 98 94, 98 102 C98 116, 78 122, 64 116 C62 112, 62 98, 62 96 Z"
                fill="#0F172A"
                stroke="#F59E0B"
                strokeWidth="2.5"
              />
              <path
                d="M122 102 C122 94, 158 94, 158 96 C158 98, 158 112, 156 116 C142 122, 122 116, 122 102 Z"
                fill="#0F172A"
                stroke="#F59E0B"
                strokeWidth="2.5"
              />
              {/* Bridge */}
              <path d="M98 100 Q110 97 122 100" stroke="#F59E0B" strokeWidth="3" fill="none" />
              {/* Gloss glare diagonal lines */}
              <line x1="70" y1="97" x2="84" y2="115" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
              <line x1="130" y1="97" x2="144" y2="115" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
            </g>
          )}

          {/* Model Accessory: Scholar Spectacles / Glasses (Classic Scholar only, omitted for Mr. Ahmed Samir to match photo) */}
          {model === 'scholar' && !isAhmedSamir && (
            <g transform="translate(0, 2)">
              {/* Round Wireframe Rims */}
              <circle cx="80" cy="106" r="17" fill="url(#glassesGloss)" stroke="#0284C7" strokeWidth="3" />
              <circle cx="140" cy="106" r="17" fill="url(#glassesGloss)" stroke="#0284C7" strokeWidth="3" />
              {/* Glasses Bridge */}
              <path d="M97 106 Q110 101 123 106" stroke="#0284C7" strokeWidth="3" fill="none" />
              {/* Lens Glint */}
              <path d="M72 96 Q80 92 86 94" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
              <path d="M132 96 Q140 92 146 94" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
            </g>
          )}

          {/* Cute Orange Beak */}
          {isUrgent ? (
            <g>
              {/* Wavy anxious nervous mouth when time is almost up */}
              <path
                d="M96 122 Q103 116 110 122 Q117 127 124 121"
                stroke="#C2410C"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ) : effectiveState === 'jumping' || effectiveState === 'cheering' ? (
            <g>
              {/* Open Joyful Chirping Beak with cute pink tongue */}
              <path
                d="M92 114 Q110 102 128 114 Q110 142 92 114 Z"
                fill="url(#beakGradient)"
                stroke="#C2410C"
                strokeWidth="2.5"
              />
              <path d="M102 122 Q110 134 118 122 Q110 118 102 122 Z" fill="#F43F5E" />
              {/* Beak Highlight */}
              <path d="M98 112 Q110 106 122 112" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          ) : effectiveState === 'thinking' ? (
            <g>
              {/* Pensive cute pursed beak */}
              <path
                d="M96 116 Q110 112 122 118 Q110 128 96 116 Z"
                fill="url(#beakGradient)"
                stroke="#C2410C"
                strokeWidth="2.5"
              />
              <path d="M100 115 Q110 113 118 116" stroke="#FEF08A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          ) : effectiveState === 'wobbling' ? (
            <g>
              {/* Comical wavy wobbly disappointed beak */}
              <path
                d="M95 120 Q102 114 110 120 Q118 126 125 120"
                stroke="#C2410C"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ) : (
            <g>
              {/* Cute smiling beak */}
              <path
                d="M94 114 Q110 104 126 114 Q110 132 94 114 Z"
                fill="url(#beakGradient)"
                stroke="#C2410C"
                strokeWidth="2.5"
              />
              <path d="M98 112 Q110 106 120 112" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* HEADGEAR / MODEL ACCESSORIES & CROWN */}

          {/* Model: Classic Comb & Fluffy Feather Tuft */}
          {model === 'classic' && !showCrown && (
            <g>
              <path
                d="M104 60 C100 38, 90 32, 84 34 C98 44, 102 52, 105 60 Z"
                fill="#F59E0B"
                stroke="#D97706"
                strokeWidth="2.5"
              />
              <path
                d="M110 58 C114 30, 126 26, 132 30 C120 42, 116 50, 112 58 Z"
                fill="#FBBF24"
                stroke="#D97706"
                strokeWidth="2.5"
              />
              {/* Little Red Comb */}
              <path
                d="M106 58 C104 46, 116 44, 118 52 C124 44, 132 48, 128 58 Z"
                fill="#EF4444"
                stroke="#B91C1C"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Mr. Ahmed Samir: Modern Barber Fade Haircut (Photo-Accurate Textured Pompadour & Tapered Sides) */}
          {isAhmedSamir && !showCrown && (
            <g transform="translate(64, 38)">
              {/* Dark Hair Base / Tapered Fade on Sides */}
              <path
                d="M10 34 C10 16, 26 6, 46 6 C66 6, 82 16, 82 34 C78 30, 68 26, 46 26 C24 26, 14 30, 10 34 Z"
                fill="#0F172A"
                opacity="0.85"
              />
              {/* Volume Pompadour / Textured Top Haircut */}
              <path
                d="M12 28 C8 16, 20 2, 34 0 C44 -4, 58 -4, 68 1 C80 7, 84 18, 80 28 C74 20, 62 16, 46 16 C30 16, 18 20, 12 28 Z"
                fill="url(#ahmedHair)"
                stroke="#020617"
                strokeWidth="2"
              />
              {/* Texture Strands & Layering */}
              <path d="M26 12 Q38 4 52 6" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M34 16 Q46 8 62 10" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M42 20 Q54 13 70 16" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <path d="M22 22 Q32 14 44 16" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              {/* Clean Sideburn Taper */}
              <path d="M8 30 L11 42 L16 40 L14 28 Z" fill="#0F172A" />
              <path d="M84 30 L81 42 L76 40 L78 28 Z" fill="#0F172A" />
            </g>
          )}

          {/* Model: Scholar Mortarboard Cap (for classic scholar fallback) */}
          {model === 'scholar' && !isAhmedSamir && !showCrown && (
            <g transform="translate(62, 12)">
              {/* Cap Diamond */}
              <polygon
                points="48,0 96,18 48,36 0,18"
                fill="#1E293B"
                stroke="#FBBF24"
                strokeWidth="3"
              />
              {/* Cap Skull Base */}
              <polygon points="18,24 78,24 70,40 26,40" fill="#0F172A" />
              {/* Button & Golden Tassel */}
              <circle cx="48" cy="18" r="4.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
              <path d="M48 18 Q74 24 70 48" stroke="#FBBF24" strokeWidth="3" fill="none" />
              <circle cx="70" cy="50" r="3.5" fill="#F59E0B" />
            </g>
          )}

          {/* Model: Explorer Safari Hat */}
          {model === 'explorer' && !showCrown && (
            <g transform="translate(55, 20)">
              {/* Brim */}
              <ellipse cx="55" cy="46" rx="58" ry="12" fill="#D97706" stroke="#92400E" strokeWidth="2.5" />
              <ellipse cx="55" cy="44" rx="55" ry="10" fill="#FDE68A" />
              {/* Crown of Hat */}
              <path
                d="M20 42 C20 18, 90 18, 90 42 Z"
                fill="#F59E0B"
                stroke="#B45309"
                strokeWidth="3"
              />
              {/* Green Forest Band */}
              <path d="M21 38 Q55 42 89 38 L90 42 Q55 46 20 42 Z" fill="#15803D" />
              {/* Explorer Compass Badge */}
              <circle cx="55" cy="30" r="5" fill="#FEF08A" stroke="#B45309" strokeWidth="1.5" />
              <polygon points="55,26 57,30 55,34 53,30" fill="#DC2626" />
            </g>
          )}

          {/* Model: Baby Cracked Eggshell Hat */}
          {model === 'baby' && !showCrown && (
            <g transform="translate(68, 16)">
              <path
                d="M0 48 Q42 0 84 48 L70 38 L58 48 L42 34 L28 48 L14 38 Z"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <circle cx="34" cy="22" r="3" fill="#FBCFE8" />
              <circle cx="56" cy="26" r="2.5" fill="#BAE6FD" />
            </g>
          )}

          {/* Model: Astronaut Cosmic Helmet & Antenna */}
          {model === 'astronaut' && !showCrown && (
            <g>
              {/* Glass Visor Bubble Dome */}
              <circle cx="110" cy="110" r="70" stroke="#94A3B8" strokeWidth="4.5" fill="#38BDF8" fillOpacity="0.18" />
              <ellipse cx="90" cy="80" rx="36" ry="14" fill="#FFFFFF" opacity="0.35" transform="rotate(-20 90 80)" />
              {/* Top Communication Antenna */}
              <line x1="110" y1="40" x2="110" y2="15" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
              <circle cx="110" cy="12" r="5" fill="#EF4444" className="animate-pulse" />
              <circle cx="110" cy="12" r="2" fill="#FFFFFF" />
            </g>
          )}

          {/* Model: Detective Deerstalker Cap */}
          {model === 'detective' && !showCrown && (
            <g transform="translate(60, 22)">
              <ellipse cx="50" cy="48" rx="55" ry="12" fill="#78350F" stroke="#451A03" strokeWidth="2" />
              <path d="M12 46 C12 18, 88 18, 88 46 Z" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
              <path d="M50 18 L50 48" stroke="#B45309" strokeWidth="2" />
              <path d="M30 24 L30 48" stroke="#B45309" strokeWidth="1.5" />
              <path d="M70 24 L70 48" stroke="#B45309" strokeWidth="1.5" />
              {/* Ear flaps tied at top with bow */}
              <path d="M44 14 Q50 8 56 14 Q50 18 44 14 Z" fill="#D97706" />
            </g>
          )}

          {/* Model: Sports Champion Captain Headband */}
          {model === 'captain' && !showCrown && (
            <g transform="translate(48, 68)">
              {/* Elastic athletic headband */}
              <rect x="0" y="0" width="124" height="18" rx="7" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
              <line x1="0" y1="9" x2="124" y2="9" stroke="#FFFFFF" strokeWidth="3.5" />
              {/* Center golden star */}
              <polygon points="62,2 64,7 69,7 65,10 67,15 62,12 57,15 59,10 55,7 60,7" fill="#FBBF24" />
            </g>
          )}

          {/* Model: Golden Ninja Forehead Protector & Mask */}
          {model === 'ninja' && !showCrown && (
            <g>
              {/* Headband wrapping */}
              <g transform="translate(48, 66)">
                <rect x="0" y="0" width="124" height="20" rx="6" fill="#0F172A" stroke="#1E293B" strokeWidth="2" />
                {/* Silver Metal Plate */}
                <rect x="36" y="2" width="52" height="16" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
                {/* Ninja Insignia */}
                <circle cx="62" cy="10" r="4" fill="#10B981" />
                <circle cx="40" cy="10" r="1.5" fill="#475569" />
                <circle cx="84" cy="10" r="1.5" fill="#475569" />
              </g>
              {/* Lower face cloth mask covering bottom of beak */}
              <path
                d="M80 126 Q110 148 140 126 Q110 160 80 126 Z"
                fill="#0F172A"
                stroke="#1E293B"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Model: Superhero Domino Eye Mask */}
          {model === 'superhero' && !showCrown && (
            <g transform="translate(56, 92)">
              {/* Sleek heroic eye mask */}
              <path
                d="M6 14 C12 0, 44 0, 48 14 C50 18, 58 18, 60 14 C64 0, 96 0, 102 14 C106 26, 80 34, 54 22 C28 34, 2 26, 6 14 Z"
                fill="#0F172A"
                stroke="#EF4444"
                strokeWidth="2"
              />
              <circle cx="26" cy="14" r="7" fill="none" stroke="#FBBF24" strokeWidth="1" />
              <circle cx="82" cy="14" r="7" fill="none" stroke="#FBBF24" strokeWidth="1" />
            </g>
          )}

          {/* Model: Pharaoh Egyptian Royal Nemes Headdress */}
          {model === 'pharaoh' && !showCrown && (
            <g transform="translate(46, 20)">
              {/* Nemes Dome & Draping Sides */}
              <path
                d="M24 60 C12 28, 48 10, 64 10 C80 10, 116 28, 104 60 L118 100 L96 92 L98 56 C90 32, 38 32, 30 56 L32 92 L10 100 Z"
                fill="#1E3A8A"
                stroke="#F59E0B"
                strokeWidth="2.5"
              />
              {/* Nemes Golden Stripes */}
              <path d="M38 32 Q64 24 90 32" stroke="#F59E0B" strokeWidth="3" fill="none" />
              <path d="M32 44 Q64 36 96 44" stroke="#F59E0B" strokeWidth="3" fill="none" />
              <path d="M28 56 Q64 48 100 56" stroke="#F59E0B" strokeWidth="3" fill="none" />
              <path d="M14 84 L28 80" stroke="#F59E0B" strokeWidth="3" />
              <path d="M100 80 L114 84" stroke="#F59E0B" strokeWidth="3" />
              {/* Golden Uraeus Serpent Head at Forehead */}
              <circle cx="64" cy="22" r="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
              <circle cx="64" cy="22" r="2" fill="#EF4444" />
            </g>
          )}

          {/* Victory Appearance: Golden Champion Halo Ring */}
          {isVictoryState && (
            <g className="animate-pulse" style={{ animationDuration: '2.4s' }}>
              <circle
                cx="110"
                cy="105"
                r="88"
                stroke="#FBBF24"
                strokeWidth="3"
                strokeDasharray="6 4"
                fill="none"
                opacity="0.85"
              />
              {/* Laurel Star Accent at Top */}
              <polygon points="110,6 113,14 121,14 115,19 117,27 110,22 103,27 105,19 99,14 107,14" fill="#FBBF24" />
            </g>
          )}

          {/* Victory Appearance: Golden Champion Medallion on Chest */}
          {isVictoryState && model !== 'king' && model !== 'captain' && (
            <g transform="translate(110, 152)" className="animate-bounce" style={{ animationDuration: '1.4s' }}>
              <circle cx="0" cy="0" r="10" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
              <circle cx="0" cy="0" r="7.5" fill="#FEF08A" />
              <polygon points="0,-6 2,-1 7,0 3,3 4,8 0,5 -4,8 -3,3 -7,0 -2,-1" fill="#D97706" />
            </g>
          )}

          {/* ROYAL CHAMPION CROWN («تاج البطولة الملكي»)
              Rendered proudly on 'king' model, when hasCrown=true, or during victory celebration!
              Positioned precisely on the head apex at y=58 */}
          {showCrown && (
            <g
              transform="translate(56, 4)"
              className="animate-crown-glint"
              filter="drop-shadow(0 4px 12px rgba(245, 158, 11, 0.7))"
            >
              {/* Royal Velvet Interior Dome */}
              <path
                d="M12 55 Q54 28 96 55 Z"
                fill="#7E22CE"
                opacity="0.6"
              />
              <path
                d="M54 30 L54 55"
                stroke="#F59E0B"
                strokeWidth="2"
                opacity="0.8"
              />

              {/* Golden Crown Base & Peaks */}
              <path
                d="M6 56 Q54 62 102 56 L108 26 L84 40 L54 8 L24 40 L0 26 Z"
                fill="url(#royalGold)"
                stroke="#B45309"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />

              {/* Luminous Pearl Tips on All Peaks */}
              <circle cx="0" cy="25" r="5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.5" />
              <circle cx="24" cy="39" r="4.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.5" />
              <circle cx="54" cy="8" r="6.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
              <circle cx="84" cy="39" r="4.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.5" />
              <circle cx="108" cy="25" r="5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.5" />

              {/* Pearl Sheen Highlights */}
              <circle cx="-1" cy="23" r="1.5" fill="#FFFFFF" />
              <circle cx="52" cy="6" r="2" fill="#FFFFFF" />
              <circle cx="107" cy="23" r="1.5" fill="#FFFFFF" />

              {/* Inlaid Precious Jewels on Crown Rim Band */}
              <rect x="8" y="49" width="92" height="8" rx="4" fill="#B45309" opacity="0.4" />
              <circle cx="18" cy="53" r="4" fill="url(#rubyGem)" stroke="#7F1D1D" strokeWidth="1" />
              <circle cx="36" cy="54" r="4" fill="#38BDF8" stroke="#0369A1" strokeWidth="1" />
              <circle cx="54" cy="55" r="5.5" fill="url(#emeraldGem)" stroke="#064E3B" strokeWidth="1.5" />
              <circle cx="72" cy="54" r="4" fill="#38BDF8" stroke="#0369A1" strokeWidth="1" />
              <circle cx="90" cy="53" r="4" fill="url(#rubyGem)" stroke="#7F1D1D" strokeWidth="1" />

              {/* Center Imperial Diamond / Ruby on Peak */}
              <polygon
                points="54,18 61,26 54,34 47,26"
                fill="url(#rubyGem)"
                stroke="#991B1B"
                strokeWidth="1.5"
              />
              <circle cx="52" cy="24" r="1.8" fill="#FFFFFF" opacity="0.85" />

              {/* Golden Cross Crest on top of Crown */}
              <path d="M54 2 L54 10 M50 6 L58 6" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}
        </svg>

        {/* Orbiting stars & sparkles for jumping & cheering */}
        {(effectiveState === 'jumping' || effectiveState === 'cheering') && (
          <>
            <div className="absolute -top-3 -right-2 text-2xl animate-star-pop select-none pointer-events-none">
              ⭐
            </div>
            <div
              className="absolute top-2 -left-3 text-xl animate-star-pop select-none pointer-events-none"
              style={{ animationDelay: '0.2s' }}
            >
              ✨
            </div>
            {/* Royal sparkle glint over SVG crown */}
            {showCrown && (
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl select-none pointer-events-none animate-pulse text-amber-300"
                style={{ animationDuration: '1.2s' }}
              >
                ✨
              </div>
            )}
          </>
        )}

        {/* Urgent indicator for time running out */}
        {isUrgent && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl animate-bounce select-none pointer-events-none">
            ⏳
          </div>
        )}

        {/* Thoughtful indicators for thinking state */}
        {effectiveState === 'thinking' && !isUrgent && (
          <>
            <span className="absolute -top-3 right-1 text-2xl font-bold text-amber-400 animate-bounce">
              💡
            </span>
            <span className="absolute -top-1 left-2 text-lg text-amber-300 animate-pulse">
              ❓
            </span>
          </>
        )}

        {/* Dizzy indicators for wobbling state on incorrect answers */}
        {effectiveState === 'wobbling' && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-lg select-none pointer-events-none animate-bounce">
            <span>💫</span>
            <span>😵</span>
            <span>💫</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Multi-Model Flock of Chicks dancing across screen for big achievements & round victory.
 * Shows distinct chicken models (King, Scholar, Explorer, Cool, Baby) celebrating together!
 */
export const ChickFlock: React.FC<{
  count?: number;
  message?: string;
  state?: ChickAnimationState;
  hasCrown?: boolean;
  isVictory?: boolean;
}> = ({ count = 5, message, state = 'cheering', hasCrown = true, isVictory = true }) => {
  const models: ChickModel[] = ['king', 'scholar', 'explorer', 'cool', 'baby'];

  return (
    <div className="flex flex-col items-center justify-center gap-3 my-4">
      {message && (
        <div className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 font-black rounded-full shadow-2xl text-base md:text-lg animate-bounce border-2 border-amber-300">
          {message}
        </div>
      )}
      <div className="flex items-end justify-center gap-2 md:gap-4 flex-wrap">
        {Array.from({ length: count }).map((_, i) => {
          const isCenter = i === Math.floor(count / 2);
          const assignedModel: ChickModel = isCenter
            ? 'king'
            : models[i % models.length];

          return (
            <div
              key={i}
              className="transform transition-transform hover:scale-110"
              style={{
                animationDelay: `${i * 0.12}s`,
                transform: `scale(${isCenter ? 1.15 : 0.85 + (i % 2) * 0.15}) translateY(${
                  i % 2 === 0 ? '-6px' : '0'
                })`,
              }}
            >
              <ChickMascot
                state={state}
                model={assignedModel}
                hasCrown={hasCrown && (isCenter || assignedModel === 'king')}
                isVictory={isVictory}
                size={isCenter ? 'lg' : 'md'}
                animate={true}
                interactive={true}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

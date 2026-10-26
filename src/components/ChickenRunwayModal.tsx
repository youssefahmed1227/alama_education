/**
 * Chicken Runway & Modeling Showcase Modal («معرض ومسرح عارضات الكتاكيت»)
 * Interactive fashion runway displaying every chicken model in high-definition SVG,
 * with live pose controls, synchronized group dancing, crown styling, and one-click
 * selection to model directly on the main page.
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Crown, Music, Check, Eye, Play, Radio, Users, Star } from 'lucide-react';
import { ChickMascot, ChickModel, ChickAnimationState } from './ChickMascot';
import { CHICKEN_SKINS, ChickenSkin, getSkinById } from '../data/chickenSkins';
import { soundEngine } from '../services/audio';

interface ChickenRunwayModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeHomeModel: ChickModel;
  onSelectForMainPage: (model: ChickModel) => void;
}

export const ChickenRunwayModal: React.FC<ChickenRunwayModalProps> = ({
  isOpen,
  onClose,
  activeHomeModel,
  onSelectForMainPage,
}) => {
  const [selectedModel, setSelectedModel] = useState<ChickModel>(activeHomeModel);
  const [activeState, setActiveState] = useState<ChickAnimationState>('idle');
  const [hasCrown, setHasCrown] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'spotlight' | 'grid'>('spotlight');
  const [isPartyDancing, setIsPartyDancing] = useState<boolean>(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Sync selected model when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedModel(activeHomeModel);
    }
  }, [isOpen, activeHomeModel]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Toggle party dance mode
  const handleToggleParty = () => {
    soundEngine.playVictory();
    if (isPartyDancing) {
      setIsPartyDancing(false);
      setActiveState('idle');
    } else {
      setIsPartyDancing(true);
      setActiveState('cheering');
      setTimeout(() => {
        setActiveState('jumping');
      }, 1800);
    }
  };

  const handleApplyToMainPage = (model: ChickModel) => {
    soundEngine.playClick();
    onSelectForMainPage(model);
    const skin = getSkinById(model);
    setAppliedNotification(`تم اعتماد «${skin.name}» كعارض بطل على الصفحة الرئيسية بنجاح! ✨`);
    setTimeout(() => {
      setAppliedNotification(null);
    }, 2800);
  };

  const currentSkin: ChickenSkin = getSkinById(selectedModel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950/90 border border-slate-700/80 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
              🐥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  مسرح عارضات وموديلات الكتاكيت
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  {CHICKEN_SKINS.length} موديل كرتوني
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                استعرض تفاصيل وأزياء جميع الكتاكيت، واختبر حركاتهم وتاج البطولة واعتمد موديلك المفضل على الصفحة الرئيسية!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors focus:outline-none"
            title="إغلاق المعرض"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Navigation Toolbar */}
        <div className="px-6 py-3 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                soundEngine.playClick();
                setViewMode('spotlight');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'spotlight'
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>المسرح الفردي (Spotlight)</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setViewMode('grid');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>عرض الكل معاً ({CHICKEN_SKINS.length})</span>
            </button>
          </div>

          {/* Pose Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 px-2 font-semibold hidden sm:inline">الحركة:</span>
            {(
              [
                { id: 'idle', label: 'وقفة هادئة 🐥' },
                { id: 'jumping', label: 'قفز بهجة ⬆️' },
                { id: 'cheering', label: 'نصر واحتفال 🎉' },
                { id: 'thinking', label: 'تفكير ذكي 💡' },
              ] as const
            ).map((state) => (
              <button
                key={state.id}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveState(state.id);
                  setIsPartyDancing(false);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeState === state.id && !isPartyDancing
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {state.label}
              </button>
            ))}
          </div>

          {/* Special Actions: Crown & Party Dance */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                setHasCrown((prev) => !prev);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                hasCrown
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/60'
              }`}
              title="إلباس التاج الملكي للكتكوت"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>{hasCrown ? 'التاج الملكي مفعل 👑' : 'إلباس التاج 👑'}</span>
            </button>

            <button
              onClick={handleToggleParty}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isPartyDancing
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 animate-pulse font-black'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-pink-400/60'
              }`}
              title="تشغيل استعراض الرقص الجماعي"
            >
              <Music className="w-4 h-4 text-pink-400" />
              <span>{isPartyDancing ? 'إيقاف الحفلة ⏸️' : 'حفلة رقص جماعية 💃'}</span>
            </button>
          </div>
        </div>

        {/* Applied Notification Banner */}
        {appliedNotification && (
          <div className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm text-center flex items-center justify-center gap-2 animate-bounce shadow-lg shrink-0">
            <Check className="w-4 h-4" />
            <span>{appliedNotification}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {viewMode === 'spotlight' ? (
            /* SPOTLIGHT RUNWAY STAGE */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Mascot Runway Centerpiece */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center p-8 bg-slate-950/70 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl">
                {/* Stage Ambient Glow & Light Ring */}
                <div
                  className="absolute w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
                  style={{ backgroundColor: currentSkin.themeColor }}
                />
                <div className="absolute inset-x-0 bottom-8 h-20 bg-gradient-to-t from-slate-950/90 to-transparent pointer-events-none" />

                {/* Runway Pedestal Base */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <ChickMascot
                      state={activeState}
                      model={selectedModel}
                      hasCrown={hasCrown || selectedModel === 'king'}
                      isVictory={activeState === 'cheering'}
                      size="xl"
                      interactive={true}
                    />
                  </div>

                  {/* Stage Circular Platform */}
                  <div className="w-48 h-5 rounded-full bg-slate-800/90 border border-slate-700 shadow-2xl -mt-3 flex items-center justify-center">
                    <div className="w-32 h-1.5 rounded-full bg-amber-400/40 blur-xs" />
                  </div>
                </div>

                {/* Model Badge */}
                <div className="mt-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-md">
                    {currentSkin.badge}
                  </span>
                  {selectedModel === activeHomeModel && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-emerald-300" />
                      <span>الموديل الحالي على الرئيسية</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Character Information & Quick Model Selector */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                {/* Character Details Card */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-3xl font-black text-white flex items-center gap-3">
                        <span>{currentSkin.emoji}</span>
                        <span>{currentSkin.name}</span>
                      </div>
                      <p className="text-sm font-semibold text-amber-400 mt-1">
                        {currentSkin.title}
                      </p>
                    </div>

                    <button
                      onClick={() => handleApplyToMainPage(selectedModel)}
                      className={`px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg transition-all ${
                        selectedModel === activeHomeModel
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50 cursor-default'
                          : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-500/20'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {selectedModel === activeHomeModel
                          ? 'معتمد على الرئيسية ✓'
                          : 'اعتماده على الصفحة الرئيسية'}
                      </span>
                    </button>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800/80">
                    {currentSkin.description}
                  </p>

                  {/* Special Features Breakdown for Photo-Accurate Ahmed Samir */}
                  {(selectedModel === 'scholar' || selectedModel === 'ahmed_samir') && (
                    <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 p-3.5 rounded-xl border border-blue-900/40 text-xs space-y-2">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <span>📸</span>
                        <span>مواصفات ستايل الصورة وسيلفي المرآة:</span>
                      </div>
                      <ul className="text-slate-300 space-y-1 list-disc list-inside">
                        <li>جاكيت أسود شتوي منفوخ (Puffer Jacket) مع تضليع مبطن.</li>
                        <li>بطانة صوفية فرو ناعمة (Heather Grey Sherpa) مقلوبة للأمام على الياقتين.</li>
                        <li>تيشرت أسود كرو نك وبنطال كارجو أسود وكوتشي بيج بنعل مطاطي أبيض.</li>
                        <li>تسريحة بومبادور سوداء مدرجة الجوانب (Barber Fade) ولحية خفيفة مهذبة.</li>
                        <li>موبايل سيلفي ذهبي ميتاليك بثلاث كاميرات وفلاش مع لمعة تصوير ديناميكية!</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip to Pick Any Model */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                    <span>اختر موديلاً لعرضه على المسرح ({CHICKEN_SKINS.length} خيار):</span>
                    <span className="text-amber-400 text-[11px]">اضغط على أي كتكوت للمعاينة</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                    {CHICKEN_SKINS.map((skin) => {
                      const isSelected = selectedModel === skin.id;
                      const isMainHero = activeHomeModel === skin.id;

                      return (
                        <button
                          key={skin.id}
                          onClick={() => {
                            soundEngine.playClick();
                            setSelectedModel(skin.id as ChickModel);
                          }}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all text-center relative ${
                            isSelected
                              ? 'bg-amber-400/15 border-amber-400 shadow-md shadow-amber-500/10 scale-102 ring-1 ring-amber-400'
                              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                          }`}
                        >
                          {isMainHero && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow" title="الموديل الحالي على الرئيسية">
                              ✓
                            </span>
                          )}
                          <span className="text-2xl">{skin.emoji}</span>
                          <span className="text-xs font-bold text-white line-clamp-1">
                            {skin.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ALL MODELS RUNWAY GRID VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>استعراض جميع عارضات الكتاكيت ({CHICKEN_SKINS.length} موديلات متزامنة):</span>
                <span className="text-amber-400">اضغط على أي كتكوت لتفعيله كبطل على الرئيسية!</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {CHICKEN_SKINS.map((skin) => {
                  const isMainHero = activeHomeModel === skin.id;
                  const isCurSelected = selectedModel === skin.id;

                  return (
                    <div
                      key={skin.id}
                      className={`flex flex-col items-center justify-between p-5 rounded-2xl border transition-all relative overflow-hidden bg-slate-950/70 ${
                        isMainHero
                          ? 'border-emerald-500/70 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                          : isCurSelected
                          ? 'border-amber-400/70 shadow-lg shadow-amber-500/10'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="w-full flex items-center justify-between gap-1 text-[11px] mb-2">
                        <span className="px-2 py-0.5 rounded-full font-black bg-slate-900 border border-slate-700 text-amber-300">
                          {skin.badge}
                        </span>
                        {isMainHero && (
                          <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            على الرئيسية 🌟
                          </span>
                        )}
                      </div>

                      {/* Chick Mascot Display */}
                      <div className="my-2 transform hover:scale-110 transition-transform cursor-pointer" onClick={() => setSelectedModel(skin.id as ChickModel)}>
                        <ChickMascot
                          state={activeState}
                          model={skin.id as ChickModel}
                          hasCrown={hasCrown || skin.id === 'king'}
                          isVictory={activeState === 'cheering'}
                          size="md"
                          interactive={true}
                        />
                      </div>

                      {/* Title & Description */}
                      <div className="w-full text-center mt-2 space-y-1">
                        <h4 className="text-base font-black text-white flex items-center justify-center gap-1.5">
                          <span>{skin.emoji}</span>
                          <span>{skin.name}</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 px-1">
                          {skin.description}
                        </p>
                      </div>

                      {/* Select Button */}
                      <div className="w-full mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            setSelectedModel(skin.id as ChickModel);
                            setViewMode('spotlight');
                          }}
                          className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700/60"
                        >
                          المسرح الفردي 🔍
                        </button>
                        <button
                          onClick={() => handleApplyToMainPage(skin.id as ChickModel)}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                            isMainHero
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold'
                          }`}
                        >
                          {isMainHero ? 'معتمد ✓' : 'عرض على الرئيسية'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>جميع الموديلات مرسومة بتقنية الفيكتور الذاتية (Zero CDN) وتعمل كلياً دون إنترنت</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold transition-colors"
            >
              إغلاق ومتابعة المسابقة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

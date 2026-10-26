/**
 * Interactive Classroom Game Screen Component
 * High-contrast projector-ready quiz arena with cartoon mascot reactions & audio
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Award,
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Sparkles,
  HelpCircle,
  Volume2,
  VolumeX,
  MapPin,
  Compass,
  Target,
  FileEdit,
  Lightbulb,
  MessageCircle,
  RotateCcw,
} from 'lucide-react';
import { Question, Team, GameSettings, RoundAnswerRecord } from '../types';
import { ChickMascot, ChickAnimationState, ChickModel, mapGameEventToAnimationState } from './ChickMascot';
import { soundEngine } from '../services/audio';
import { DID_YOU_KNOW_FACTS, getRandomFact, DidYouKnowFact } from '../data/didYouKnowData';
import { getRandomChickDialogue } from '../data/chickDialogues';
import { getSkinById } from '../data/chickenSkins';

interface GameScreenProps {
  questions: Question[];
  teams: Team[];
  settings: GameSettings;
  onFinishRound: (answers: RoundAnswerRecord[], finalTeams: Team[]) => void;
  onQuitRound: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  questions,
  teams,
  settings,
  onFinishRound,
  onQuitRound,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [currentTeams, setCurrentTeams] = useState<Team[]>(teams);
  const [activeTeamIdx, setActiveTeamIdx] = useState<number>(0);

  // Question state
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isTimeout, setIsTimeout] = useState<boolean>(false);
  const [answersLog, setAnswersLog] = useState<RoundAnswerRecord[]>([]);

  // Ordering question temporary sequence
  const [orderingItems, setOrderingItems] = useState<string[]>([]);

  // Mascot state
  const [mascotState, setMascotState] = useState<ChickAnimationState>('idle');
  const [mascotModel, setMascotModel] = useState<ChickModel>('classic');
  const [mascotMessage, setMascotMessage] = useState<string | undefined>(undefined);
  const [streak, setStreak] = useState<number>(0);

  // Text-to-Speech Accessibility state
  const [isReading, setIsReading] = useState<boolean>(false);

  // 1 vs 1 Steal turn & Animations state
  const [isStealTurn, setIsStealTurn] = useState<boolean>(false);
  const [stolenFromTeamName, setStolenFromTeamName] = useState<string | null>(null);
  const [floatingScore, setFloatingScore] = useState<{ points: number; text: string } | null>(null);
  const [showSuccessSparkles, setShowSuccessSparkles] = useState<boolean>(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(settings.timePerQuestion);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Did You Know? («هل تعلم؟») State for every round
  const [roundFact, setRoundFact] = useState<DidYouKnowFact>(() => getRandomFact());
  const [showDidYouKnowModal, setShowDidYouKnowModal] = useState<boolean>(false);
  const [showDidYouKnowBanner, setShowDidYouKnowBanner] = useState<boolean>(true);
  const [mascotMessageDuration, setMascotMessageDuration] = useState<number | undefined>(undefined);

  // Confirm quit dialog
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);

  // Lose Screen Modal on Timeout reaching zero
  const [showLoseScreen, setShowLoseScreen] = useState<boolean>(false);
  const [defeatedTeam, setDefeatedTeam] = useState<Team | null>(null);
  const [loseReason, setLoseReason] = useState<string>('');

  const currentQ = questions[currentIdx];
  const activeTeam = currentTeams[activeTeamIdx] || currentTeams[0];

  // Initialize question
  useEffect(() => {
    if (!currentQ) return;

    soundEngine.stopSpeech();
    setIsReading(false);

    setIsAnswered(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsTimeout(false);
    setIsStealTurn(false);
    setStolenFromTeamName(null);
    setFloatingScore(null);
    setShowSuccessSparkles(false);
    setShowLoseScreen(false);
    setDefeatedTeam(null);
    setLoseReason('');
    setMascotState(mapGameEventToAnimationState('idle'));

    // Did You Know fact is strictly displayed in the dedicated box on screen, NOT in the chicken bubble!
    setMascotMessage(undefined);
    setMascotMessageDuration(undefined);

    setTimeLeft(settings.timePerQuestion);
    startTimeRef.current = Date.now();

    // Select suitable chicken model based on streak and topic context
    if (streak >= 3) {
      setMascotModel('king');
    } else if (streak === 2) {
      setMascotModel('cool');
    } else if (
      currentQ.type === 'map_identification' ||
      currentQ.unit.includes('جغرافيا') ||
      currentQ.topic.includes('قارات') ||
      currentQ.topic.includes('تضاريس') ||
      currentQ.topic.includes('مناخ')
    ) {
      setMascotModel('explorer');
    } else if (
      currentQ.unit.includes('تاريخ') ||
      currentQ.topic.includes('ثورة') ||
      currentQ.topic.includes('مصر') ||
      currentQ.topic.includes('محمد علي')
    ) {
      setMascotModel('scholar');
    } else {
      setMascotModel('classic');
    }

    // If ordering question, shuffle or set options
    if (currentQ.type === 'ordering' && currentQ.options) {
      // Shuffle slightly for ordering challenge
      const shuffled = [...currentQ.options].sort(() => Math.random() - 0.5);
      setOrderingItems(shuffled);
    }

    // Setup timer if timePerQuestion > 0
    if (settings.timePerQuestion > 0) {
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          // Escalating tense ticking & warning audio when time hits 20s or below
          if (prev <= 20) {
            soundEngine.playUrgentCountdown(prev);
            setMascotState('thinking');
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      soundEngine.stopSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, currentQ]);

  // Handle Text-to-Speech Read Aloud toggle
  const handleToggleTTS = () => {
    if (soundEngine.isSpeaking()) {
      soundEngine.stopSpeech();
      setIsReading(false);
      return;
    }

    if (!currentQ) return;
    setIsReading(true);

    let fullSpeech = currentQ.text;
    if (currentQ.type === 'odd_one_out') {
      fullSpeech = `استبعد الكلمة غير المناسبة: ${currentQ.text}`;
    } else if (currentQ.type === 'fill_blank') {
      fullSpeech = `أكمل العبارة: ${currentQ.text}`;
    } else if (currentQ.type === 'map_identification') {
      fullSpeech = `سؤال الخريطة: ${currentQ.text}`;
    } else if (currentQ.type === 'who_did_this') {
      fullSpeech = `من صاحب هذا العمل: ${currentQ.text}`;
    } else if (currentQ.type === 'what_is_the_event') {
      fullSpeech = `ما هو الحدث التاريخي: ${currentQ.text}`;
    } else if (currentQ.type === 'explanation_prompt') {
      fullSpeech = `ما التفسير الجغرافي أو التاريخي: ${currentQ.text}`;
    }

    // If choices are present, read them in order
    if (currentQ.type !== 'ordering' && currentQ.options && currentQ.options.length > 0) {
      const letters = ['أ', 'ب', 'ج', 'د'];
      const choicesSpeech = currentQ.options
        .map((opt, i) => `${letters[i]}، ${opt}`)
        .join(' . ');
      fullSpeech += ` . الخيارات المتاحة: ${choicesSpeech}`;
    }

    soundEngine.speakText(
      fullSpeech,
      () => setIsReading(false),
      () => setIsReading(false)
    );
  };

  // Helper to restart countdown timer (e.g. for steal turn)
  const restartTimer = () => {
    if (settings.timePerQuestion <= 0) return;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        if (prev <= 20) {
          soundEngine.playUrgentCountdown(prev);
          setMascotState('thinking');
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Proceed to steal turn from the Lose Screen modal in 1 vs 1 match
  const handleProceedToStealFromLoseScreen = () => {
    setShowLoseScreen(false);
    const timedOutTeam = currentTeams[activeTeamIdx];
    const otherTeamIdx = activeTeamIdx === 0 ? 1 : 0;
    const otherTeam = currentTeams[otherTeamIdx];

    setCurrentTeams((prev) =>
      prev.map((t, idx) =>
        idx === activeTeamIdx ? { ...t, timeoutCount: t.timeoutCount + 1 } : t
      )
    );

    setIsStealTurn(true);
    setStolenFromTeamName(timedOutTeam.name);
    setActiveTeamIdx(otherTeamIdx);
    setTimeLeft(settings.timePerQuestion);
    startTimeRef.current = Date.now();

    soundEngine.playStealChime();
    setMascotState('jumping');
    setMascotMessage(
      `⚡ خطف السؤال! انتهى وقت (${timedOutTeam.name})، والفرصة الآن مع (${otherTeam.name}) لخطف النقاط!`
    );

    restartTimer();
  };

  // Handle timeout
  // Rule: When time reaches zero, the team/player instantly loses and gets a dedicated Lose Screen!
  // In 1 vs 1 mode, after showing the loser screen, the question can also transfer to opponent to steal.
  const handleTimeout = () => {
    if (isAnswered) return;

    const timedOutTeam = currentTeams[activeTeamIdx];
    setDefeatedTeam(timedOutTeam);

    // Case 1: 1 vs 1 match (2 teams) and this is the FIRST timeout on this question:
    if (currentTeams.length === 2 && !isStealTurn) {
      const otherTeamIdx = activeTeamIdx === 0 ? 1 : 0;
      const otherTeam = currentTeams[otherTeamIdx];

      setLoseReason(
        `انتهى الوقت ووصل العداد إلى الصفر! خسر فريق (${timedOutTeam.name}) فرصة هذا السؤال، والفرصة جاهزة للخطف من قِبل (${otherTeam.name})!`
      );
      setMascotState(mapGameEventToAnimationState('timeout'));
      setShowLoseScreen(true);
      soundEngine.playTimeout();
      soundEngine.playWrong();
      return;
    }

    // Case 2: Solo player (1 team) -> Instant loss with lose screen!
    // Case 3: 1 vs 1 steal attempt timed out as well -> both fail!
    setIsAnswered(true);
    setIsTimeout(true);
    setIsCorrect(false);
    setStreak(0);
    setShowSuccessSparkles(false);
    setFloatingScore(null);
    setMascotState(mapGameEventToAnimationState('timeout'));

    const reason =
      currentTeams.length === 1
        ? `انتهى الوقت ووصل العداد للصفر! خسارة فورية للمتسابق (${timedOutTeam.name}) ⏰`
        : isStealTurn
        ? `انتهى وقت فرصة الخطف أيضاً! خسارة فورية وضاعت نقطة السؤال على الفريقين ⏰`
        : `انتهى الوقت المحدد للسؤال! خسارة فورية ⏰`;

    setLoseReason(reason);
    setMascotMessage(reason);
    setShowLoseScreen(true);
    soundEngine.playTimeout();
    soundEngine.playWrong();

    const timeSpent = settings.timePerQuestion;
    recordAnswer(null, false, true, 0, timeSpent);
  };

  // Reordering controls for ordering question type
  const moveOrderItem = (index: number, direction: 'up' | 'down') => {
    if (isAnswered) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderingItems.length) return;

    const next = [...orderingItems];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setOrderingItems(next);
  };

  // Submit Answer
  const handleSubmitAnswer = (ans: string | string[]) => {
    if (isAnswered) return;
    soundEngine.stopSpeech();
    setIsReading(false);
    if (timerRef.current) clearInterval(timerRef.current);

    setIsAnswered(true);
    setSelectedAnswer(ans);

    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    // Check correctness
    let correct = false;
    if (currentQ.type === 'ordering') {
      const correctArr = Array.isArray(currentQ.correctAnswer)
        ? currentQ.correctAnswer
        : [currentQ.correctAnswer];
      const userArr = Array.isArray(ans) ? ans : [ans];
      correct =
        userArr.length === correctArr.length &&
        userArr.every((val, i) => val.trim() === correctArr[i].trim());
    } else {
      correct =
        String(ans).trim().toLowerCase() ===
        String(currentQ.correctAnswer).trim().toLowerCase();
    }

    setIsCorrect(correct);

    let points = 0;
    if (correct) {
      points = settings.correctPoints;
      const nextStreak = streak + 1;
      setStreak(nextStreak);

      // Trigger celebratory animations
      setShowSuccessSparkles(true);
      setFloatingScore({
        points,
        text: isStealTurn ? `+${points} خطف ناجح! ⚡` : `+${points} نقطة مستحقة! 🌟`,
      });

      if (isStealTurn) {
        soundEngine.playCorrect();
        soundEngine.playStreakSound();
        setMascotState('cheering');
        setMascotMessage(`خطف رائع للسؤال! 🎯 فريق (${activeTeam.name}) يقتنص النقاط ببراعة! 🐥👑`);
      } else if (nextStreak >= 3) {
        soundEngine.playStreakSound();
        setMascotState('cheering');
        setMascotModel('king');
        setMascotMessage(`سلسلة نارية أسطورية! 🔥 ${nextStreak} إجابات متتالية صحيحة! 👑`);
      } else if (nextStreak === 2) {
        soundEngine.playCorrect();
        setMascotState('jumping');
        setMascotModel('cool');
        setMascotMessage('ثنائية رائعة! الكتكوت يرتدي نظارة الأبطال 😎✨');
      } else {
        soundEngine.playCorrect();
        setMascotState(mapGameEventToAnimationState('correct_answer'));
        const cheers = [
          'إجابة صحيحة! أحسنت يا بطل! 🐥⭐',
          'ممتاز! نقطة مستحقة لفريقك 🌟',
          'رائع جداً! استمر هكذا 🎯',
        ];
        setMascotMessage(cheers[Math.floor(Math.random() * cheers.length)]);
      }
    } else {
      setStreak(0);
      points = settings.wrongPenalty; // usually 0 or negative if penalty enabled
      setShowSuccessSparkles(false);
      setFloatingScore(null);
      setMascotState(mapGameEventToAnimationState('wrong_answer'));

      // Return to subject model
      if (currentQ.type === 'map_identification' || currentQ.unit.includes('جغرافيا')) {
        setMascotModel('explorer');
      } else if (currentQ.unit.includes('تاريخ')) {
        setMascotModel('scholar');
      } else {
        setMascotModel('classic');
      }

      if (isStealTurn) {
        setMascotMessage(`محاولة خطف غير موفقة! تعوضونها في السؤال القادم 🐥`);
      } else {
        const sighs = [
          'إجابة غير صحيحة! تعوضونها في السؤال القادم 🐥',
          'حاول مرة أخرى! راجع الشرح بالأسفل 💫',
        ];
        setMascotMessage(sighs[Math.floor(Math.random() * sighs.length)]);
      }
      soundEngine.playWrong();
    }

    recordAnswer(ans, correct, false, points, timeSpent);
  };

  // Record Answer & update team stats and turn rules
  const recordAnswer = (
    userAns: string | string[] | null,
    correct: boolean,
    timeout: boolean,
    points: number,
    timeSpent: number
  ) => {
    const record: RoundAnswerRecord = {
      questionId: currentQ.id,
      questionText: currentQ.text,
      questionType: currentQ.type,
      teamId: activeTeam.id,
      teamName: activeTeam.name,
      userAnswer: userAns || (timeout ? 'انتهى الوقت دون إجابة' : 'لا إجابة'),
      correctAnswer: currentQ.correctAnswer,
      isCorrect: correct,
      timeSpent,
      isTimeout: timeout,
      pointsAwarded: points,
      explanation: currentQ.explanation,
      topic: currentQ.topic,
    };

    const nextLog = [...answersLog, record];
    setAnswersLog(nextLog);

    // Update Team Points and counts
    const updatedTeams = currentTeams.map((t, idx) => {
      if (idx !== activeTeamIdx) return t;
      return {
        ...t,
        score: Math.max(0, t.score + points),
        correctCount: t.correctCount + (correct ? 1 : 0),
        wrongCount: t.wrongCount + (!correct && !timeout ? 1 : 0),
        timeoutCount: t.timeoutCount + (timeout ? 1 : 0),
      };
    });
    setCurrentTeams(updatedTeams);
  };

  // Move to next question or complete round
  const handleNextQuestion = () => {
    soundEngine.playClick();
    setIsStealTurn(false);
    setStolenFromTeamName(null);
    setFloatingScore(null);
    setShowSuccessSparkles(false);

    // Determine whose turn is next in 2-team or multi-team mode:
    // If correct and settings.keepTurnOnCorrect: keep turn!
    // If wrong or timeout and settings.passTurnOnWrong: advance turn to next team!
    let nextTeamIdx = activeTeamIdx;
    if (currentTeams.length > 1) {
      if (isCorrect && settings.keepTurnOnCorrect) {
        // Keep turn
        nextTeamIdx = activeTeamIdx;
      } else {
        // Pass to next team in circle
        nextTeamIdx = (activeTeamIdx + 1) % currentTeams.length;
      }
    }
    setActiveTeamIdx(nextTeamIdx);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Round Complete!
      onFinishRound(answersLog, currentTeams);
    }
  };

  if (!currentQ) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <p className="text-white text-lg">لا توجد أسئلة متوفرة لهذه الجولة.</p>
        <button
          onClick={onQuitRound}
          className="mt-4 px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-lg"
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  // Timer percentage
  const timerPct =
    settings.timePerQuestion > 0
      ? (timeLeft / settings.timePerQuestion) * 100
      : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col min-h-[calc(100vh-5rem)] justify-between select-none">
      {/* Top Bar: Progress, Active Team, Scores */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          {/* Question Index */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              السؤال {currentIdx + 1} من {questions.length}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 truncate max-w-[200px]">
              {currentQ.topic}
            </span>
          </div>

          {/* Active Turn Indicator */}
          {currentTeams.length > 1 && (
            <div
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 font-black text-sm shadow-md animate-pulse"
              style={{
                borderColor: activeTeam.color,
                backgroundColor: `${activeTeam.color}20`,
                color: '#FFFFFF',
              }}
            >
              <span>{activeTeam.avatar}</span>
              <span>الدور الحالي: {activeTeam.name}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* "Did You Know?" Round Fact Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playChirp();
                setShowDidYouKnowModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 font-bold text-xs transition-all hover:scale-105 shadow-sm"
              title="معلومة الجولة: هل تعلم؟"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>هل تعلم؟ 💡</span>
            </button>

            {/* Quit button */}
            <button
              onClick={() => setShowQuitConfirm(true)}
              className="text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors"
            >
              إنهاء الجولة
            </button>
          </div>
        </div>

        {/* Live Teams Scoreboard Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {currentTeams.map((t, idx) => {
            const isTurn = idx === activeTeamIdx;
            return (
              <div
                key={t.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                  isTurn
                    ? 'bg-slate-900 border-2 shadow-lg ring-1'
                    : 'bg-slate-950/60 border-slate-800 opacity-80'
                }`}
                style={{
                  borderColor: isTurn ? t.color : undefined,
                  boxShadow: isTurn ? `0 0 15px ${t.color}30` : undefined,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{t.avatar}</span>
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-[100px]">
                      {t.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      صح: {t.correctCount} | خطأ: {t.wrongCount}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-amber-400 font-mono tabular-nums">
                    {t.score}
                  </div>
                  <div className="text-[10px] text-slate-500">نقطة</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Progress Bar: Percentage of Questions Completed during current round */}
        {(() => {
          const completedQuestions = currentIdx + (isAnswered ? 1 : 0);
          const roundProgressPct = Math.round((completedQuestions / questions.length) * 100);
          return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2 text-amber-300">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>نسبة إنجاز أسئلة الجولة:</span>
                  <span className="text-white font-mono font-black text-sm">{roundProgressPct}%</span>
                </div>
                <div className="text-slate-400 flex items-center gap-2 text-xs">
                  <span>السؤال {currentIdx + 1} من {questions.length} ({completedQuestions} مكتمل)</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono text-[11px]">
                    باقي {questions.length - completedQuestions}
                  </span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5 relative">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 shadow-sm shadow-amber-400/30"
                  style={{ width: `${roundProgressPct}%` }}
                />
              </div>

              {/* Milestones Indicator */}
              <div className="flex justify-between items-center px-1 text-[10px] text-slate-500 font-mono">
                <span>0% البداية</span>
                <span>50% منتصف التحدي</span>
                <span>100% الختام</span>
              </div>
            </div>
          );
        })()}


        {/* "Did You Know?" Dedicated Fact Box («صندوق معلومة هل تعلم؟») */}
        {showDidYouKnowBanner && (
          <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/15 border-2 border-amber-400/50 rounded-2xl p-3.5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl shrink-0 p-2 bg-amber-400/20 rounded-2xl border border-amber-400/30">
                {roundFact.emoji}
              </span>
              <div className="text-xs md:text-sm font-bold leading-relaxed">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-amber-400 font-black text-xs uppercase tracking-wide">
                    💡 صندوق معلومة هل تعلم؟
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                    {roundFact.badge}
                  </span>
                </div>
                <p className="text-white text-sm md:text-base font-semibold leading-snug">
                  {roundFact.fact}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => soundEngine.speakText(roundFact.fact)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition-colors text-xs font-bold"
                title="استمع للمعلومة صوتياً"
              >
                <Volume2 className="w-4 h-4" />
                <span>استماع 🔊</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextFact = getRandomFact();
                  setRoundFact(nextFact);
                  // Did You Know fact is kept strictly in this box, NOT in the chicken bubble!
                  soundEngine.playChirp();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition-colors text-xs font-bold"
                title="معلومة أخرى 🎲"
              >
                <Sparkles className="w-4 h-4" />
                <span>معلومة أخرى 🎲</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDidYouKnowBanner(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="إخفاء الصندوق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Question Card with Chick Mascot */}
      <div className="my-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
        {/* Floating Celebratory Score Popup on Correct Answer */}
        {floatingScore && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none animate-float-score">
            <div className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 text-slate-950 font-black rounded-2xl shadow-2xl text-base md:text-lg border-2 border-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-900 animate-spin" />
              <span>{floatingScore.text}</span>
            </div>
          </div>
        )}

        {/* Success Confetti & Sparkles */}
        {showSuccessSparkles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-20">
            <div className="absolute top-4 left-8 text-2xl animate-sparkle-burst">✨</div>
            <div className="absolute top-10 right-12 text-3xl animate-sparkle-burst" style={{ animationDelay: '0.15s' }}>⭐</div>
            <div className="absolute bottom-12 left-16 text-2xl animate-sparkle-burst" style={{ animationDelay: '0.3s' }}>🎉</div>
            <div className="absolute bottom-8 right-20 text-3xl animate-sparkle-burst" style={{ animationDelay: '0.2s' }}>🌟</div>
          </div>
        )}

        {/* 1 vs 1 Question Steal Alert Banner */}
        {isStealTurn && !isAnswered && (
          <div className="mb-5 p-3.5 bg-gradient-to-r from-amber-500/20 via-rose-500/25 to-amber-500/20 border-2 border-amber-400/90 rounded-2xl flex items-center justify-between gap-3 text-amber-200 text-xs md:text-sm font-black shadow-lg shadow-amber-500/20 animate-steal-alert">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-bounce">⚡</span>
              <span>
                فرصة خطف السؤال! انتهى وقت {stolenFromTeamName ? `(${stolenFromTeamName})` : 'الفريق السابق'} — الفرصة الآن مع فريق ({activeTeam.name}) لخطف النقاط!
              </span>
            </div>
            <span className="shrink-0 px-3 py-1 bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow">
              فرصة خطف ⚡
            </span>
          </div>
        )}

        {/* New Question Theme Layout: Question Above -> Circular Timer & Mascot in Middle -> Answers Around Him */}
        
        {/* TOP: Question Header & Centered Question Text (Above the Central Mascot) */}
        <div className="mb-6 pb-4 border-b border-slate-800/80">
          {/* Metadata Toolbar Bar Above Question */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {currentQ.type === 'mcq'
                    ? 'اختيار من متعدد'
                    : currentQ.type === 'true_false'
                    ? 'صح أو خطأ'
                    : currentQ.type === 'ordering'
                    ? 'ترتيب الأحداث التاريخية'
                    : currentQ.type === 'cause_effect'
                    ? 'تحديد السبب والنتيجة'
                    : currentQ.type === 'historical_figure'
                    ? 'شخصيات وتواريخ وأحداث'
                    : currentQ.type === 'comparison'
                    ? 'مقارنة بين السلالات'
                    : currentQ.type === 'deduction'
                    ? 'استنتاج تاريخي وجغرافي'
                    : currentQ.type === 'odd_one_out'
                    ? 'استبعاد الكلمة غير المناسبة'
                    : currentQ.type === 'fill_blank'
                    ? 'أكمل العبارة'
                    : currentQ.type === 'map_identification'
                    ? 'سؤال الخريطة والجغرافيا'
                    : currentQ.type === 'who_did_this'
                    ? 'من صاحب هذا العمل؟ 👤'
                    : currentQ.type === 'what_is_the_event'
                    ? 'ما هو الحدث التاريخي؟ 📜'
                    : currentQ.type === 'explanation_prompt'
                    ? 'ما التفسير؟ 💡'
                    : 'مراجعة شاملة'}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">{currentQ.unit}</span>
              </div>

              {/* Distinct Chicken Mascot State Indicator Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800/90 border border-slate-700/80">
                <span className="text-slate-400">حالة الكتكوت:</span>
                <span
                  className={
                    mascotState === 'cheering'
                      ? 'text-amber-400 font-black'
                      : mascotState === 'jumping'
                      ? 'text-emerald-400 font-black'
                      : mascotState === 'thinking'
                      ? 'text-sky-300 font-black'
                      : 'text-amber-300 font-bold'
                  }
                >
                  {mascotState === 'cheering'
                    ? 'يحتفل بالبطولة! 👑🎉'
                    : mascotState === 'jumping'
                    ? 'يقفز فرحاً! 🦘⭐'
                    : mascotState === 'thinking'
                    ? 'يفكر بتركيز... 💡'
                    : 'مستقر ومتحمس 🐥'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Talk with the Chicken Button («تحدث مع الكتكوت») */}
              <button
                type="button"
                onClick={() => {
                  const dialogue = getRandomChickDialogue();
                  setMascotMessage(dialogue.text);
                  setMascotMessageDuration(4000);
                  if (dialogue.category === 'urgent') {
                    setMascotState('thinking');
                  } else if (dialogue.category === 'meme') {
                    setMascotState('jumping');
                  }
                  if (dialogue.soundType === 'boing') {
                    soundEngine.playFunnyBoing();
                  } else if (dialogue.soundType === 'cluck') {
                    soundEngine.playCluck();
                  } else if (dialogue.soundType === 'squawk') {
                    soundEngine.playSurpriseSquawk();
                  } else {
                    soundEngine.playChirp();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400/20 to-yellow-400/20 hover:from-amber-400/30 hover:to-yellow-400/30 text-amber-300 border border-amber-400/40 hover:scale-105 transition-all shadow-sm"
                title="تحدث مع الكتكوت لسماع آرائه الكوميدية ونوادره وميمز مستر أحمد سمير ويوسف!"
              >
                <MessageCircle className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>تحدث مع الكتكوت 💬</span>
              </button>

              {/* Accessible Text-to-Speech (TTS) Narration Button */}
              <button
                type="button"
                onClick={handleToggleTTS}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all shadow-sm ${
                  isReading
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500 animate-pulse'
                    : 'bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/40 hover:scale-105'
                }`}
                title={
                  isReading
                    ? 'إيقاف القراءة الصوتية'
                    : 'استمع لقراءة السؤال صوتياً (ميزة مساعدة للرؤية عن بعد في الفصل)'
                }
              >
                {isReading ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-400" />
                    <span>إيقاف القراءة</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>استمع للسؤال 🔊</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Question Text Centered Above Central Mascot & Arena */}
          <div className="py-2 text-center">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-relaxed max-w-4xl mx-auto drop-shadow-sm">
              {currentQ.text}
            </h3>
          </div>

          {/* Special Guidance Banners if applicable */}
          {currentQ.type === 'odd_one_out' && (
            <div className="mt-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center gap-2 text-rose-300 text-xs md:text-sm font-bold text-center">
              <Target className="w-4 h-4 shrink-0 text-rose-400" />
              <span>تحدي استبعاد الكلمة الشاذة: اختر الكلمة أو العبارة غير المنسجمة مع باقي المجموعة:</span>
            </div>
          )}

          {currentQ.type === 'fill_blank' && (
            <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2 text-amber-300 text-xs md:text-sm font-bold text-center">
              <FileEdit className="w-4 h-4 shrink-0 text-amber-400" />
              <span>إكمال العبارة: اختر الكلمة أو المصطلح الصحيح لملء الفراغ المحدد:</span>
            </div>
          )}

          {currentQ.type === 'map_identification' && (
            <div className="mt-2 p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center justify-center gap-2 text-sky-300 text-xs md:text-sm font-bold text-center">
              <Compass className="w-4 h-4 shrink-0 text-sky-400" />
              <span>سؤال الخريطة والجغرافيا الطبيعية: حدد الموقع أو الظاهرة الجغرافية الصحيحة:</span>
            </div>
          )}
        </div>

        {/* MIDDLE & AROUND: Circular Countdown Timer + Mascot in Center, Answers surrounding him */}
        {(() => {
          // Circular Timer Gauge Calculations
          const isUrgent20 = settings.timePerQuestion > 0 && timeLeft <= 20 && timeLeft > 0;
          const radius = 62;
          const circumference = 2 * Math.PI * radius; // ~389.56
          const clampedPct =
            settings.timePerQuestion > 0
              ? Math.max(0, Math.min(100, (timeLeft / settings.timePerQuestion) * 100))
              : 100;
          const strokeOffset = circumference * (1 - clampedPct / 100);

          // Central Circular Countdown Timer with Chicken Mascot inside
          const renderCentralCircularTimer = () => (
            <div className="flex flex-col items-center justify-center relative my-2 shrink-0 select-none">
              {/* Circular SVG Timer Ring */}
              <div className="relative w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 flex items-center justify-center">
                <svg
                  className="w-full h-full -rotate-90 transform overflow-visible"
                  viewBox="0 0 160 160"
                >
                  {/* Background Track Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-800/80"
                    fill="transparent"
                  />
                  {/* Animated Countdown Progress Ring */}
                  {settings.timePerQuestion > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="9"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ${
                        isUrgent20
                          ? 'text-rose-500 animate-pulse drop-shadow-[0_0_14px_rgba(244,63,94,0.9)]'
                          : 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.65)]'
                      }`}
                      fill="transparent"
                    />
                  )}
                </svg>

                {/* The Chicken Mascot in the exact center of the circular timer! */}
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <ChickMascot
                    state={mascotState}
                    model={(activeTeam.chickenSkin || mascotModel) as ChickModel}
                    hasCrown={streak >= 3 || activeTeam.chickenSkin === 'king' || mascotState === 'cheering'}
                    isVictory={mascotState === 'cheering'}
                    isUrgent={!isAnswered && timeLeft <= 20 && settings.timePerQuestion > 0}
                    size="md"
                    message={
                      !isAnswered && timeLeft <= 20 && settings.timePerQuestion > 0 && !mascotMessage
                        ? 'الوقت يداهمنا! بدأ العد التنازلي (20 ثانية)! ⏰'
                        : mascotMessage
                    }
                    messageDurationMs={mascotMessageDuration}
                    animate={!settings.reducedMotion}
                    interactive={true}
                  />
                </div>
              </div>

              {/* High-Contrast Countdown Seconds Badge & Team Skin Label */}
              <div className="mt-1 flex flex-col items-center gap-1">
                {settings.timePerQuestion > 0 ? (
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-black text-xs md:text-sm shadow-md transition-all ${
                      isUrgent20
                        ? 'bg-rose-500/25 border border-rose-500 text-rose-300 animate-pulse scale-105'
                        : 'bg-slate-950/80 border border-slate-800 text-amber-300'
                    }`}
                  >
                    <Clock
                      className={`w-3.5 h-3.5 ${
                        isUrgent20 ? 'text-rose-400 animate-bounce' : 'text-amber-400'
                      }`}
                    />
                    <span>{timeLeft} ثانية</span>
                    {isUrgent20 && <span className="text-[10px] text-rose-400">حاسم! ⚠️</span>}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">دون توقيت</span>
                )}

                {activeTeam.chickenSkin && (
                  <span className="text-[10px] font-bold text-amber-400/90 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-800 shadow">
                    مظهر: {getSkinById(activeTeam.chickenSkin).name}
                  </span>
                )}
              </div>
            </div>
          );

          // Render Option Button Helper
          const renderOptionButton = (opt: string, i: number) => {
            const letters = ['أ', 'ب', 'ج', 'د'];
            const isSelected = selectedAnswer === opt;
            const isCorrectAnswer = currentQ.correctAnswer === opt;

            let btnStyle =
              'border-slate-800 bg-slate-950/70 hover:border-amber-400 hover:bg-slate-850 hover:scale-[1.015] active:scale-[0.985] text-white cursor-pointer';

            if (isAnswered) {
              if (isCorrectAnswer) {
                btnStyle =
                  'border-emerald-500 bg-emerald-500/25 text-white font-black ring-2 ring-emerald-500 shadow-emerald-500/20 shadow-xl animate-answer-correct';
              } else if (isSelected && !isCorrect) {
                btnStyle =
                  'border-rose-500 bg-rose-500/25 text-rose-200 ring-2 ring-rose-500 line-through animate-answer-shake shadow-rose-500/20 shadow-xl';
              } else {
                btnStyle = 'border-slate-800/80 bg-slate-950/40 text-slate-500 opacity-40 scale-[0.99]';
              }
            }

            return (
              <button
                key={i}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSubmitAnswer(opt)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`p-4 md:p-5 rounded-2xl border-2 text-right flex items-center gap-3 md:gap-4 transition-all shadow-md ${btnStyle} group`}
              >
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 font-mono transition-colors ${
                    isAnswered && isCorrectAnswer
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : isAnswered && isSelected
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-800 text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950'
                  }`}
                >
                  {currentQ.type === 'odd_one_out' ? (
                    <Target className="w-4 h-4" />
                  ) : currentQ.type === 'map_identification' ? (
                    <MapPin className="w-4 h-4" />
                  ) : (
                    letters[i] || i + 1
                  )}
                </span>
                <span className="text-base md:text-lg font-bold flex-1 leading-snug">
                  {opt}
                </span>
                {isAnswered && isCorrectAnswer && (
                  <Check className="w-6 h-6 text-emerald-400 shrink-0 animate-bounce" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <X className="w-6 h-6 text-rose-400 shrink-0" />
                )}
              </button>
            );
          };

          // Render True/False Button Helper
          const renderTrueFalseButton = (choice: string, i: number) => {
            const isSelected = selectedAnswer === choice;
            const isCorrectAnswer = currentQ.correctAnswer === choice;

            let btnStyle =
              'border-slate-700 bg-slate-950 hover:border-amber-400/70 hover:bg-slate-850 hover:scale-[1.02] text-white active:scale-[0.98]';

            if (isAnswered) {
              if (isCorrectAnswer) {
                btnStyle =
                  'border-emerald-500 bg-emerald-500/25 text-emerald-200 ring-2 ring-emerald-500 font-black animate-answer-correct shadow-xl shadow-emerald-500/20';
              } else if (isSelected && !isCorrect) {
                btnStyle =
                  'border-rose-500 bg-rose-500/25 text-rose-200 line-through ring-2 ring-rose-500 animate-answer-shake shadow-xl shadow-rose-500/20';
              } else {
                btnStyle = 'border-slate-800 bg-slate-950/40 text-slate-500 opacity-40 scale-[0.98]';
              }
            }

            return (
              <button
                key={choice}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSubmitAnswer(choice)}
                style={{ animationDelay: `${i * 100}ms` }}
                className={`py-5 px-6 rounded-2xl border-2 text-xl font-bold flex items-center justify-center gap-3 transition-all ${btnStyle}`}
              >
                {choice === 'صواب' ? (
                  <Check className="w-6 h-6 text-emerald-400" />
                ) : (
                  <X className="w-6 h-6 text-rose-400" />
                )}
                <span>{choice}</span>
              </button>
            );
          };

          // 1. QUESTION TYPE: TRUE / FALSE (Centered Circular Timer between صواب and خطأ)
          if (currentQ.type === 'true_false') {
            return (
              <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center my-4">
                {/* Right: صواب */}
                <div className="w-full order-2 md:order-1 md:col-span-4 flex flex-col justify-center">
                  {renderTrueFalseButton('صواب', 0)}
                </div>

                {/* Center: Circular Timer + Chicken Mascot */}
                <div className="order-1 md:order-2 md:col-span-4 flex flex-col items-center justify-center">
                  {renderCentralCircularTimer()}
                </div>

                {/* Left: خطأ */}
                <div className="w-full order-3 md:order-3 md:col-span-4 flex flex-col justify-center">
                  {renderTrueFalseButton('خطأ', 1)}
                </div>
              </div>
            );
          }

          // 2. QUESTION TYPE: ORDERING (Central Circular Timer + Timeline list)
          if (currentQ.type === 'ordering') {
            return (
              <div className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center my-4">
                {/* Center: Circular Timer + Chicken Mascot */}
                <div className="order-1 md:order-1 md:col-span-5 flex flex-col items-center justify-center">
                  {renderCentralCircularTimer()}
                </div>

                {/* Ordering Items List */}
                <div className="w-full order-2 md:order-2 md:col-span-7 space-y-3">
                  <p className="text-xs text-amber-300 font-semibold mb-2">
                    استخدم الأسهم لإعادة ترتيب الأحداث من الأقدم (أعلى) إلى الأحدث (أسفل)، ثم اضغط «تثبيت الترتيب»:
                  </p>
                  <div className="space-y-2">
                    {orderingItems.map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                          isAnswered
                            ? isCorrect
                              ? 'border-emerald-500 bg-emerald-500/15 text-white animate-answer-correct'
                              : 'border-slate-700 bg-slate-950/60 text-slate-300'
                            : 'border-slate-700 bg-slate-950 text-white hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-xs font-bold font-mono">
                            {index + 1}
                          </span>
                          <span className="text-sm md:text-base font-bold">{item}</span>
                        </div>

                        {!isAnswered && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveOrderItem(index, 'up')}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="تحريك لأعلى"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={index === orderingItems.length - 1}
                              onClick={() => moveOrderItem(index, 'down')}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="تحريك لأسفل"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!isAnswered && (
                    <button
                      type="button"
                      onClick={() => handleSubmitAnswer(orderingItems)}
                      className="w-full mt-4 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-base shadow-lg transition-transform hover:scale-[1.01]"
                    >
                      تثبيت الترتيب واعتماد الإجابة
                    </button>
                  )}
                </div>
              </div>
            );
          }

          // 3. QUESTION TYPE: MULTIPLE CHOICE (MCQ, Who Did This, What Event, Explanation Prompt, Map, etc.)
          // Arena: Options 0 & 1 on Right, Circular Timer + Chicken in Middle, Options 2 & 3 on Left!
          const allOptions = currentQ.options || [];
          const firstHalf = allOptions.slice(0, 2);
          const secondHalf = allOptions.slice(2);

          return (
            <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center my-4">
              {/* Right Wing (Col 1-4 on md): Options أ و ب */}
              <div className="w-full order-2 md:order-1 md:col-span-4 flex flex-col gap-3 justify-center">
                {firstHalf.map((opt, idx) => renderOptionButton(opt, idx))}
              </div>

              {/* Center Arena (Col 5-8 on md): Circular Timer + Chicken Mascot in Middle */}
              <div className="order-1 md:order-2 md:col-span-4 flex flex-col items-center justify-center">
                {renderCentralCircularTimer()}
              </div>

              {/* Left Wing (Col 9-12 on md): Options ج و د */}
              <div className="w-full order-3 md:order-3 md:col-span-4 flex flex-col gap-3 justify-center">
                {secondHalf.map((opt, idx) => renderOptionButton(opt, idx + 2))}
              </div>
            </div>
          );
        })()}

        {/* Explanation & Educational Reference Box (Revealed only after answering) */}
        {isAnswered && (
          <div className="mt-6 pt-6 border-t border-slate-800 animate-fadeIn">
            <div
              className={`p-4 rounded-2xl border ${
                isCorrect
                  ? 'bg-emerald-950/30 border-emerald-800 text-emerald-100'
                  : 'bg-amber-950/30 border-amber-800 text-amber-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-black text-sm">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>شرح وتوضيح الإجابة الصحيحة:</span>
                {currentQ.reference && (
                  <span className="text-xs text-slate-400 font-normal mr-auto">
                    ({currentQ.reference})
                  </span>
                )}
              </div>
              <p className="text-sm md:text-base leading-relaxed font-medium">
                {currentQ.explanation}
              </p>
            </div>

            {/* Next Team Alert for 2-team mode */}
            {currentTeams.length > 1 && (
              <div className="mt-3 text-xs text-slate-400 text-center">
                {isCorrect && settings.keepTurnOnCorrect ? (
                  <span className="text-emerald-400 font-bold">
                    ✓ إجابة صحيحة: يستمر الدور مع فريق ({activeTeam.name}) للسؤال القادم!
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold">
                    ↻ ينتقل الدور إلى: (
                    {currentTeams[(activeTeamIdx + 1) % currentTeams.length].name}
                    ) في السؤال القادم.
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer: Next Question Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-400">
          المجموع الكلي: {activeTeam.name} لديه {activeTeam.score} نقطة
        </div>

        {isAnswered && (
          <button
            type="button"
            onClick={handleNextQuestion}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-base shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <span>
              {currentIdx + 1 < questions.length ? 'السؤال التالي' : 'عرض النتيجة النهائية'}
            </span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Confirmation Modal to Quit Game */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">هل تريد إنهاء المسابقة الحالية؟</h4>
            <p className="text-xs text-slate-300">
              سيتم إلغاء الجولة والعودة إلى الإعدادات. يمكنك متابعة الجولة حتى النهاية لحفظ نتيجتها في السجل.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-700"
              >
                متابعة المسابقة
              </button>
              <button
                onClick={() => {
                  setShowQuitConfirm(false);
                  onQuitRound();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg"
              >
                تأكيد الإنهاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive "Did You Know?" Modal Dialog */}
      {showDidYouKnowModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400/90 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setShowDidYouKnowModal(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-tr from-amber-500/30 to-yellow-400/20 border-2 border-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              {roundFact.emoji}
            </div>

            <div className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 mb-3">
              {roundFact.badge}
            </div>

            <h3 className="text-xl md:text-2xl font-black text-amber-300 mb-4 flex items-center justify-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-400 animate-pulse" />
              <span>هل تعلم؟</span>
            </h3>

            <div className="text-base md:text-lg font-bold text-white leading-relaxed mb-6 bg-slate-950/80 p-5 rounded-2xl border border-amber-400/30 shadow-inner">
              {roundFact.fact}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => soundEngine.speakText(roundFact.fact)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
                <span>استمع للمعلومة 🔊</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextFact = getRandomFact();
                  setRoundFact(nextFact);
                  soundEngine.playChirp();
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-sm flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>معلومة أخرى 🎲</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDidYouKnowModal(false)}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl text-sm transition-colors"
              >
                متابعة الجولة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Defeat / Lose Screen Modal when Timer hits 0 */}
      {showLoseScreen && defeatedTeam && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-rose-500/90 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative text-center space-y-5">
            {/* Header Icon */}
            <div className="w-16 h-16 mx-auto bg-rose-500/20 border-2 border-rose-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-rose-500/30 animate-bounce">
              🚨
            </div>

            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
              شاشة الخسارة الفورية ⏱️
            </div>

            <h3 className="text-2xl font-black text-rose-400">
              انتهى الوقت ووصل العداد إلى الصفر!
            </h3>

            {/* Loser Team Card */}
            <div
              className="p-4 rounded-2xl border-2 bg-slate-950/80 shadow-inner flex items-center justify-between"
              style={{ borderColor: defeatedTeam.color }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{defeatedTeam.avatar}</span>
                <div className="text-right">
                  <div className="text-xs text-rose-400 font-bold">الخاسر في هذا السؤال:</div>
                  <div className="text-lg font-black text-white">{defeatedTeam.name}</div>
                </div>
              </div>
              <div className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-black">
                خسارة فورية ❌
              </div>
            </div>

            {/* Chick Mascot reaction */}
            <div className="flex items-center justify-center gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <ChickMascot
                state="thinking"
                model={(defeatedTeam.chickenSkin || mascotModel) as ChickModel}
                size="sm"
                animate={true}
                interactive={false}
              />
              <div className="text-xs md:text-sm text-slate-300 font-medium text-right leading-relaxed flex-1">
                {loseReason || '«للأسف عقارب الساعة كانت أسرع منا والعداد لمس الصفر! خسارة فورية ومباشرة 😢🐥»'}
              </div>
            </div>

            {/* Question and Answer summary */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-right text-xs space-y-1">
              <div className="text-slate-400 font-bold">السؤال المفقود:</div>
              <div className="text-white font-medium">{currentQ.text}</div>
              <div className="text-emerald-400 font-bold pt-1">
                ✓ الإجابة الصحيحة كانت:{' '}
                {Array.isArray(currentQ.correctAnswer)
                  ? currentQ.correctAnswer.join(' ثم ')
                  : currentQ.correctAnswer}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {currentTeams.length === 2 && !isStealTurn ? (
                <button
                  type="button"
                  onClick={handleProceedToStealFromLoseScreen}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-sm shadow-xl flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-transform"
                >
                  <span>⚡ تحويل السؤال الآن لخطف النقاط (الفريق الآخر)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowLoseScreen(false);
                    handleNextQuestion();
                  }}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm shadow-lg transition-transform hover:scale-105"
                >
                  <span>السؤال التالي ⏩</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowLoseScreen(false);
                  onFinishRound(answersLog, currentTeams);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-sm border border-slate-700 transition-colors"
              >
                <span>عرض النتيجة النهائية 📊</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLoseScreen(false);
                  onQuitRound();
                }}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 font-bold rounded-xl text-sm transition-colors"
              >
                <span>الخروج للقائمة 🏠</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

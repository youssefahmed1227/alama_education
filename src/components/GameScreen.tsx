/**
 * Interactive Classroom Game Screen Component
 * High-contrast projector-ready quiz arena with cartoon mascot reactions & audio
 */

import React, { useState, useEffect, useRef } from 'react';
import { Clock, Award, AlertCircle, ArrowLeft, ArrowUp, ArrowDown, Check, X, Sparkles, HelpCircle } from 'lucide-react';
import { Question, Team, GameSettings, RoundAnswerRecord } from '../types';
import { ChickMascot, MascotMood } from './ChickMascot';
import { soundEngine } from '../services/audio';

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
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [mascotMessage, setMascotMessage] = useState<string | undefined>(undefined);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(settings.timePerQuestion);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Confirm quit dialog
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);

  const currentQ = questions[currentIdx];
  const activeTeam = currentTeams[activeTeamIdx] || currentTeams[0];

  // Initialize question
  useEffect(() => {
    if (!currentQ) return;

    setIsAnswered(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsTimeout(false);
    setMascotMood('idle');
    setMascotMessage(undefined);
    setTimeLeft(settings.timePerQuestion);
    startTimeRef.current = Date.now();

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
          if (prev <= 4) {
            soundEngine.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, currentQ]);

  // Handle timeout
  const handleTimeout = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsTimeout(true);
    setIsCorrect(false);
    setMascotMood('timeout');
    setMascotMessage('انتهى الوقت المحدد للسؤال! ⏰');
    soundEngine.playTimeout();

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
      setMascotMood('correct');
      const cheers = ['إجابة صحيحة! أحسنت يا بطل! 🐥⭐', 'ممتاز! نقطة مستحقة لفريقك 🌟', 'رائع جداً! استمر هكذا 🎯'];
      setMascotMessage(cheers[Math.floor(Math.random() * cheers.length)]);
      soundEngine.playCorrect();
    } else {
      points = settings.wrongPenalty; // usually 0 or negative if penalty enabled
      setMascotMood('wrong');
      const sighs = ['إجابة غير صحيحة! تعوضونها في السؤال القادم 🐥', 'حاول مرة أخرى! راجع الشرح بالأسفل 💫'];
      setMascotMessage(sighs[Math.floor(Math.random() * sighs.length)]);
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

          {/* Quit button */}
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors"
          >
            إنهاء الجولة
          </button>
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

        {/* Countdown Timer Bar */}
        {settings.timePerQuestion > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center gap-3">
            <Clock
              className={`w-5 h-5 shrink-0 ${
                timeLeft <= 5 ? 'text-rose-400 animate-bounce' : 'text-sky-400'
              }`}
            />
            <div className="flex-1 bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-1000 rounded-full ${
                  timeLeft <= 5
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                    : 'bg-gradient-to-r from-sky-500 to-amber-400'
                }`}
                style={{ width: `${timerPct}%` }}
              />
            </div>
            <span
              className={`text-sm font-black font-mono tabular-nums min-w-[36px] text-left ${
                timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-300'
              }`}
            >
              {timeLeft} ث
            </span>
          </div>
        )}
      </div>

      {/* Main Question Card with Chick Mascot */}
      <div className="my-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
        {/* Mascot Reaction Avatar Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
          <div className="flex-1 text-center sm:text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-amber-300 mb-2">
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
                  : 'مراجعة شاملة'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{currentQ.unit}</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white leading-relaxed">
              {currentQ.text}
            </h3>
          </div>

          <div className="shrink-0">
            <ChickMascot
              mood={mascotMood}
              size="md"
              message={mascotMessage}
              animate={!settings.reducedMotion}
            />
          </div>
        </div>

        {/* Interactive Options Area based on Question Type */}
        <div className="space-y-4">
          {/* Question Type: Ordering (Timeline / Chronological events) */}
          {currentQ.type === 'ordering' && (
            <div className="space-y-3">
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
                          ? 'border-emerald-500 bg-emerald-500/10 text-white'
                          : 'border-slate-700 bg-slate-950/60 text-slate-300'
                        : 'border-slate-700 bg-slate-950 text-white'
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
          )}

          {/* Question Type: True/False */}
          {currentQ.type === 'true_false' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['صواب', 'خطأ'].map((choice) => {
                const isSelected = selectedAnswer === choice;
                const isCorrectAnswer = currentQ.correctAnswer === choice;

                let btnStyle =
                  'border-slate-700 bg-slate-950 hover:border-amber-400/70 hover:bg-slate-850 text-white';

                if (isAnswered) {
                  if (isCorrectAnswer) {
                    btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 ring-2 ring-emerald-500 font-black';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'border-rose-500 bg-rose-500/20 text-rose-200 line-through';
                  } else {
                    btnStyle = 'border-slate-800 bg-slate-950/40 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSubmitAnswer(choice)}
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
              })}
            </div>
          )}

          {/* Question Type: Standard Multiple Choice (MCQ, Cause/Effect, Figure, Comparison, Deduction, Review) */}
          {currentQ.type !== 'ordering' && currentQ.type !== 'true_false' && (
            <div className="grid grid-cols-1 gap-3">
              {(currentQ.options || []).map((opt, i) => {
                const letters = ['أ', 'ب', 'ج', 'د'];
                const isSelected = selectedAnswer === opt;
                const isCorrectAnswer = currentQ.correctAnswer === opt;

                let btnStyle =
                  'border-slate-800 bg-slate-950/70 hover:border-amber-400 hover:bg-slate-850 text-white';

                if (isAnswered) {
                  if (isCorrectAnswer) {
                    btnStyle =
                      'border-emerald-500 bg-emerald-500/20 text-white font-bold ring-2 ring-emerald-500 shadow-emerald-500/10 shadow-lg';
                  } else if (isSelected && !isCorrect) {
                    btnStyle =
                      'border-rose-500 bg-rose-500/20 text-rose-200 ring-1 ring-rose-500 line-through';
                  } else {
                    btnStyle = 'border-slate-800/80 bg-slate-950/40 text-slate-500 opacity-50';
                  }
                }

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSubmitAnswer(opt)}
                    className={`p-4 rounded-2xl border-2 text-right flex items-center gap-4 transition-all ${btnStyle} group`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 font-mono transition-colors ${
                        isAnswered && isCorrectAnswer
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : isAnswered && isSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950'
                      }`}
                    >
                      {letters[i] || i + 1}
                    </span>
                    <span className="text-base md:text-lg font-bold flex-1 leading-snug">
                      {opt}
                    </span>
                    {isAnswered && isCorrectAnswer && (
                      <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <X className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

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
    </div>
  );
};

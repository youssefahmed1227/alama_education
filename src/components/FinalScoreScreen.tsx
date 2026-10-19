/**
 * Final Score & Winner Podium Screen Component
 * Celebratory classroom screen with mascot flock, confetti, stats, and review options
 */

import React, { useEffect } from 'react';
import { Trophy, Award, RotateCcw, Eye, Printer, Download, Sparkles, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Team, RoundAnswerRecord, GameMode } from '../types';
import { ChickFlock } from './ChickMascot';
import { soundEngine } from '../services/audio';

interface FinalScoreScreenProps {
  mode: GameMode;
  teams: Team[];
  answers: RoundAnswerRecord[];
  onPlayAgain: () => void;
  onReviewAnswers: () => void;
  onGoHome: () => void;
}

export const FinalScoreScreen: React.FC<FinalScoreScreenProps> = ({
  mode,
  teams,
  answers,
  onPlayAgain,
  onReviewAnswers,
  onGoHome,
}) => {
  // Sort teams by score descending
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const isTie = sorted.length > 1 && sorted[0].score === sorted[1].score && sorted[0].score > 0;
  const winner = sorted[0];

  useEffect(() => {
    soundEngine.playVictory();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['السؤال', 'نوع السؤال', 'الفريق', 'إجابة المتسابق', 'الإجابة الصحيحة', 'النتيجة', 'النقاط', 'الوقت المستغرق (ث)'];
    const rows = answers.map((a) => [
      `"${a.questionText.replace(/"/g, '""')}"`,
      `"${a.questionType}"`,
      `"${a.teamName}"`,
      `"${Array.isArray(a.userAnswer) ? a.userAnswer.join(' -> ') : a.userAnswer}"`,
      `"${Array.isArray(a.correctAnswer) ? a.correctAnswer.join(' -> ') : a.correctAnswer}"`,
      `"${a.isCorrect ? 'صحيحة' : a.isTimeout ? 'انتهى الوقت' : 'خاطئة'}"`,
      `"${a.pointsAwarded}"`,
      `"${a.timeSpent}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نتيجة_مسابقة_علامة_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center select-none">
      {/* Victory Celebration Flock of Chicks */}
      <ChickFlock
        count={5}
        message={
          isTie
            ? 'تعادل بطولي بين الفريقين! أداء أسطوري 🐥🎉'
            : mode === 'single'
            ? `مبروك يا بطل! ${winner.name} 🐥🏆`
            : `الفائز بالبطولة: ${winner.name} 🐥🏆`
        }
      />

      {/* Main Winner / Tie Banner */}
      <div className="my-6 bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-amber-400 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center border-2 border-amber-400 shadow-lg">
          <Trophy className="w-10 h-10 md:w-12 md:h-12 fill-amber-400" />
        </div>

        <h2 className="text-2xl md:text-4xl font-black text-white mb-2">
          {isTie ? 'النتيجة النهائية: تعادل رائع!' : `كأس الجولة لـ: ${winner.name}`}
        </h2>

        <p className="text-sm md:text-base text-slate-300 max-w-lg mx-auto">
          {isTie
            ? 'أظهر الفريقان تفوقاً باهراً في مادة الدراسات الاجتماعية للصف الثالث الإعدادي!'
            : `تهانينا لـ ${winner.name} على إحراز المركز الأول بمجموع ${winner.score} نقطة!`}
        </p>

        {/* Podium for Multiple Teams */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-right">
          {sorted.map((team, rank) => {
            const totalAnswered = team.correctCount + team.wrongCount + team.timeoutCount;
            const accuracy = totalAnswered > 0 ? Math.round((team.correctCount / totalAnswered) * 100) : 0;

            return (
              <div
                key={team.id}
                className={`p-5 rounded-2xl border-2 transition-all relative ${
                  rank === 0 && !isTie
                    ? 'bg-amber-400/10 border-amber-400 shadow-xl'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                {rank === 0 && (
                  <span className="absolute -top-3 left-4 px-2.5 py-0.5 bg-amber-400 text-slate-950 text-xs font-black rounded-full">
                    {isTie ? 'تعادل' : 'المركز الأول 🥇'}
                  </span>
                )}
                {rank === 1 && sorted.length > 1 && !isTie && (
                  <span className="absolute -top-3 left-4 px-2.5 py-0.5 bg-slate-400 text-slate-950 text-xs font-black rounded-full">
                    المركز الثاني 🥈
                  </span>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{team.avatar}</span>
                  <div>
                    <h3 className="font-bold text-base text-white truncate max-w-[150px]">
                      {team.name}
                    </h3>
                    <div className="text-xs text-amber-400 font-bold">
                      {team.score} نقطة
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      إجابات صحيحة:
                    </span>
                    <span className="font-bold text-white font-mono">{team.correctCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1 text-rose-400">
                      <XCircle className="w-3.5 h-3.5" />
                      إجابات خاطئة:
                    </span>
                    <span className="font-bold text-white font-mono">{team.wrongCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      نفاد الوقت:
                    </span>
                    <span className="font-bold text-white font-mono">{team.timeoutCount}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-1.5 font-bold">
                    <span className="text-sky-300">نسبة الدقة:</span>
                    <span className="text-sky-400 font-mono">{accuracy}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6 no-print">
        <button
          onClick={onPlayAgain}
          className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-sm shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>جولة جديدة بنفس الفرق</span>
        </button>

        <button
          onClick={onReviewAnswers}
          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 border border-slate-700"
        >
          <Eye className="w-4 h-4 text-amber-400" />
          <span>مراجعة جميع الإجابات والدروس ({answers.length})</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-2 border border-slate-800"
          title="طباعة لوحة النتائج"
        >
          <Printer className="w-4 h-4 text-sky-400" />
          <span>طباعة اللوحة</span>
        </button>

        <button
          onClick={handleExportCSV}
          className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-2 border border-slate-800"
          title="تصدير تفاصيل الأسئلة إلى Excel/CSV"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>تصدير CSV</span>
        </button>

        <button
          onClick={onGoHome}
          className="px-4 py-3 text-slate-400 hover:text-white text-sm font-semibold transition-colors"
        >
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
};

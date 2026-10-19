/**
 * Round Review Screen Component («شاشة مراجعة الإجابات»)
 * Step-by-step breakdown of every question answered in the round with explanations and references
 */

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle, Clock, BookOpen, Filter } from 'lucide-react';
import { RoundAnswerRecord } from '../types';

interface RoundReviewScreenProps {
  answers: RoundAnswerRecord[];
  onBackToFinalScores: () => void;
}

export const RoundReviewScreen: React.FC<RoundReviewScreenProps> = ({
  answers,
  onBackToFinalScores,
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'timeout'>('all');

  const filtered = answers.filter((a) => {
    if (filter === 'correct') return a.isCorrect;
    if (filter === 'wrong') return !a.isCorrect && !a.isTimeout;
    if (filter === 'timeout') return a.isTimeout;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white">مراجعة أسئلة الجولة</h2>
          <p className="text-sm text-slate-400">
            راجع إجابات كل فريق والشرح العلمي الدقيق لكل سؤال وفق الكتاب المدرسي
          </p>
        </div>

        <button
          onClick={onBackToFinalScores}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs transition-colors shrink-0"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لنتائج المسابقة</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'all' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          الكل ({answers.length})
        </button>
        <button
          onClick={() => setFilter('correct')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'correct' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-emerald-400'
          }`}
        >
          صحيحة ({answers.filter((a) => a.isCorrect).length})
        </button>
        <button
          onClick={() => setFilter('wrong')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'wrong' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-rose-400'
          }`}
        >
          خاطئة ({answers.filter((a) => !a.isCorrect && !a.isTimeout).length})
        </button>
        <button
          onClick={() => setFilter('timeout')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'timeout' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-amber-400'
          }`}
        >
          نفاد الوقت ({answers.filter((a) => a.isTimeout).length})
        </button>
      </div>

      {/* Questions Review List */}
      <div className="space-y-4">
        {filtered.map((item, index) => {
          return (
            <div
              key={index}
              className={`p-5 rounded-2xl border-2 transition-all bg-slate-900 text-right ${
                item.isCorrect
                  ? 'border-emerald-500/50'
                  : item.isTimeout
                  ? 'border-amber-500/50'
                  : 'border-rose-500/50'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-xs font-bold font-mono">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    الفريق المجيب: <span className="text-white">{item.teamName}</span>
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400">{item.topic}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.isCorrect ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      إجابة صحيحة (+{item.pointsAwarded})
                    </span>
                  ) : item.isTimeout ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                      <Clock className="w-3.5 h-3.5" />
                      انتهى الوقت (0)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30">
                      <XCircle className="w-3.5 h-3.5" />
                      إجابة خاطئة (0)
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500 font-mono">
                    ({item.timeSpent} ث)
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <h4 className="text-base md:text-lg font-bold text-white mb-3">
                {item.questionText}
              </h4>

              {/* User Answer vs Correct Answer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs font-medium">
                <div
                  className={`p-3 rounded-xl border ${
                    item.isCorrect
                      ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-800/60 text-rose-200'
                  }`}
                >
                  <span className="block font-bold text-slate-400 mb-1">الإجابة التي اختارها الفريق:</span>
                  <span className="font-bold">
                    {Array.isArray(item.userAnswer)
                      ? item.userAnswer.join(' ➔ ')
                      : item.userAnswer}
                  </span>
                </div>

                <div className="p-3 rounded-xl border bg-slate-950 border-slate-800 text-slate-200">
                  <span className="block font-bold text-emerald-400 mb-1">الإجابة الصحيحة النموذجية:</span>
                  <span className="font-bold text-emerald-300">
                    {Array.isArray(item.correctAnswer)
                      ? item.correctAnswer.join(' ➔ ')
                      : item.correctAnswer}
                  </span>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-amber-400 ml-1">توضيح المعلم:</span>
                {item.explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

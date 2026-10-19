/**
 * Round Setup Screen Component («إعدادات الجولة»)
 * Configures question count (10, 20, 30), question timer, difficulty, and curriculum topics
 */

import React from 'react';
import { ArrowRight, Play, Clock, Sparkles, Filter, Sliders, CheckCircle2 } from 'lucide-react';
import { GameSettings, Team, Difficulty } from '../types';
import { CURRICULUM_TOPICS } from '../data/curriculumQuestions';

interface SetupScreenProps {
  settings: GameSettings;
  teams: Team[];
  totalAvailableQuestions: number;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onStartGame: () => void;
  onBack: () => void;
}

const QUESTION_COUNT_OPTIONS = [10, 20, 30];
const TIMER_OPTIONS = [
  { label: '10 ثوانٍ', value: 10 },
  { label: '15 ثانية', value: 15 },
  { label: '20 ثانية (موصى به)', value: 20 },
  { label: '30 ثانية', value: 30 },
  { label: '45 ثانية', value: 45 },
  { label: '60 ثانية', value: 60 },
  { label: 'دون مؤقت', value: 0 },
];
const DIFFICULTY_OPTIONS: { label: string; value: 'all' | Difficulty }[] = [
  { label: 'مختلط (جميع المستويات)', value: 'all' },
  { label: 'سهل (أساسي وتأسيسي)', value: 'easy' },
  { label: 'متوسط (تطبيقي)', value: 'medium' },
  { label: 'صعب (متميزين وتفكير عليا)', value: 'hard' },
];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  settings,
  teams,
  totalAvailableQuestions,
  onUpdateSettings,
  onStartGame,
  onBack,
}) => {
  const handleCountChange = (count: number) => {
    onUpdateSettings({ ...settings, questionCount: count });
  };

  const handleTimerChange = (time: number) => {
    onUpdateSettings({ ...settings, timePerQuestion: time });
  };

  const handleDifficultyChange = (diff: 'all' | Difficulty) => {
    onUpdateSettings({ ...settings, difficulty: diff });
  };

  const handleToggleTopic = (topic: string) => {
    const current = settings.selectedTopics;
    if (current.includes(topic)) {
      onUpdateSettings({ ...settings, selectedTopics: current.filter((t) => t !== topic) });
    } else {
      onUpdateSettings({ ...settings, selectedTopics: [...current, topic] });
    }
  };

  const handleSelectAllTopics = () => {
    onUpdateSettings({ ...settings, selectedTopics: [] }); // empty means all topics
  };

  const isAllTopicsSelected = settings.selectedTopics.length === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white">إعدادات الجولة والمسابقة</h2>
          <p className="text-sm text-slate-400">
            خصّص عدد الأسئلة والوقت وموضوعات المنهج قبل بدء التحدي
          </p>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>تعديل الفرق</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Teams Summary Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>المشاركون في هذه الجولة:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {teams.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-bold"
                style={{ borderColor: t.color, backgroundColor: `${t.color}15`, color: '#FFFFFF' }}
              >
                <span>{t.avatar}</span>
                <span>{t.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 1. Question Count Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">عدد أسئلة الجولة</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            تُختار الأسئلة عشوائياً دون تكرار في الجولة الواحدة (بنك الأسئلة المتاح: {totalAvailableQuestions} سؤال)
          </p>

          <div className="grid grid-cols-3 gap-4">
            {QUESTION_COUNT_OPTIONS.map((count) => {
              const isSelected = settings.questionCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleCountChange(count)}
                  className={`py-4 px-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/10 text-white shadow-lg'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-2xl md:text-3xl font-black text-amber-400">{count}</span>
                  <span className="text-xs font-semibold mt-1">سؤالاً</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Timer Duration Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">وقت إجابة كل سؤال</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            المؤقت التنازلي ينتهي تلقائياً عند تثبيت الإجابة، أو ينقل الدور عند انتهائه
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {TIMER_OPTIONS.map((opt) => {
              const isSelected = settings.timePerQuestion === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleTimerChange(opt.value)}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                    isSelected
                      ? 'border-sky-400 bg-sky-400/15 text-white ring-1 ring-sky-400'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Difficulty Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">مستوى الصعوبة</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            حدد مستوى الأسئلة المطلوب أو اختر الخليط المتوازن
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DIFFICULTY_OPTIONS.map((diff) => {
              const isSelected = settings.difficulty === diff.value;
              return (
                <button
                  key={diff.value}
                  type="button"
                  onClick={() => handleDifficultyChange(diff.value)}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    isSelected
                      ? 'border-purple-400 bg-purple-400/15 text-white ring-1 ring-purple-400'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{diff.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Curriculum Topic Filter */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">موضوعات الأسئلة في الجولة</h3>
            </div>
            <button
              type="button"
              onClick={handleSelectAllTopics}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors ${
                isAllTopicsSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              شامل جميع الموضوعات
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            يمكنك حصر الجولة في درس محدد (مثل الدرس الأول: السلالات البشرية) أو دمج موضوعات التاريخ والجغرافيا
          </p>

          <div className="flex flex-wrap gap-2">
            {CURRICULUM_TOPICS.map((topic) => {
              const isSelected = isAllTopicsSelected || settings.selectedTopics.includes(topic);
              const isSpecificallyPicked = settings.selectedTopics.includes(topic);

              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleToggleTopic(topic)}
                  className={`text-xs px-3 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                    isSpecificallyPicked
                      ? 'border-emerald-400 bg-emerald-500/20 text-white font-bold'
                      : isAllTopicsSelected
                      ? 'border-slate-700 bg-slate-950 text-slate-200'
                      : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  <span>{topic}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Start Button Footer */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors"
        >
          رجوع
        </button>

        <button
          onClick={onStartGame}
          className="px-10 py-3.5 text-base font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-xl hover:shadow-amber-500/20 transition-all hover:scale-[1.02] flex items-center gap-2.5"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>بدء الجولة الآن!</span>
        </button>
      </div>
    </div>
  );
};

/**
 * Team Setup Screen Component
 * Custom player / team name inputs with avatars and colors
 */

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Users, User, Shield, Sparkles } from 'lucide-react';
import { GameMode, Team } from '../types';

interface TeamSetupScreenProps {
  mode: GameMode;
  teams: Team[];
  onUpdateTeams: (teams: Team[]) => void;
  onProceedToRoundSetup: () => void;
  onBack: () => void;
}

const AVATAR_OPTIONS = ['🐥', '🦅', '🦁', '⚡', '🌟', '🚀', '🦉', '🎯', '🏆', '🔥'];
const COLOR_OPTIONS = [
  { name: 'أزرق ملكي', value: '#3B82F6', border: 'border-blue-500', bg: 'bg-blue-500/10' },
  { name: 'كهرماني ذهبي', value: '#F59E0B', border: 'border-amber-500', bg: 'bg-amber-500/10' },
  { name: 'زمردي أخضر', value: '#10B981', border: 'border-emerald-500', bg: 'bg-emerald-500/10' },
  { name: 'أرجواني', value: '#8B5CF6', border: 'border-purple-500', bg: 'bg-purple-500/10' },
  { name: 'ياقوتي أحمر', value: '#EF4444', border: 'border-rose-500', bg: 'bg-rose-500/10' },
];

export const TeamSetupScreen: React.FC<TeamSetupScreenProps> = ({
  mode,
  teams,
  onUpdateTeams,
  onProceedToRoundSetup,
  onBack,
}) => {
  const [localTeams, setLocalTeams] = useState<Team[]>(teams);

  const handleNameChange = (id: string, newName: string) => {
    const updated = localTeams.map((t) => (t.id === id ? { ...t, name: newName } : t));
    setLocalTeams(updated);
    onUpdateTeams(updated);
  };

  const handleAvatarChange = (id: string, avatar: string) => {
    const updated = localTeams.map((t) => (t.id === id ? { ...t, avatar } : t));
    setLocalTeams(updated);
    onUpdateTeams(updated);
  };

  const handleColorChange = (id: string, color: string) => {
    const updated = localTeams.map((t) => (t.id === id ? { ...t, color } : t));
    setLocalTeams(updated);
    onUpdateTeams(updated);
  };

  const handleAddTeam = () => {
    if (localTeams.length >= 4) return;
    const newId = `team-${localTeams.length + 1}`;
    const newTeam: Team = {
      id: newId,
      name: `الفريق ${localTeams.length + 1}`,
      color: COLOR_OPTIONS[localTeams.length % COLOR_OPTIONS.length].value,
      avatar: AVATAR_OPTIONS[localTeams.length % AVATAR_OPTIONS.length],
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      timeoutCount: 0,
    };
    const updated = [...localTeams, newTeam];
    setLocalTeams(updated);
    onUpdateTeams(updated);
  };

  const handleRemoveTeam = (id: string) => {
    if (localTeams.length <= 2) return;
    const updated = localTeams.filter((t) => t.id !== id);
    setLocalTeams(updated);
    onUpdateTeams(updated);
  };

  const handleContinue = () => {
    // Ensure all teams have non-empty names
    const validated = localTeams.map((t, idx) => ({
      ...t,
      name: t.name.trim() || (mode === 'single' ? 'المتسابق يوسف' : `الفريق ${idx + 1}`),
    }));
    setLocalTeams(validated);
    onUpdateTeams(validated);
    onProceedToRoundSetup();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white">
            {mode === 'single' ? 'بيانات المتسابق' : 'أسماء الفرق المشاركة'}
          </h2>
          <p className="text-sm text-slate-400">
            {mode === 'single'
              ? 'اكتب اسمك ليظهر على الشاشة ولوحة الشرف'
              : 'أدخل أسماء الفرق والشعارات قبل بدء المسابقة'}
          </p>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>تغيير النمط</span>
        </button>
      </div>

      {/* Team Cards Grid */}
      <div className={`grid gap-6 ${mode === 'single' ? 'grid-cols-1 max-w-xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
        {localTeams.map((team, idx) => {
          return (
            <div
              key={team.id}
              className="bg-slate-900 border-2 rounded-2xl p-6 shadow-xl relative transition-all"
              style={{ borderColor: team.color }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {mode === 'single' ? 'اللاعب' : `الفريق (${idx + 1})`}
                </span>

                {mode === 'multi_teams' && localTeams.length > 2 && (
                  <button
                    onClick={() => handleRemoveTeam(team.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
                  >
                    حذف الفريق
                  </button>
                )}
              </div>

              {/* Name Input */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {mode === 'single' ? 'اسم المتسابق:' : 'اسم الفريق أو المتسابقين:'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => handleNameChange(team.id, e.target.value)}
                    placeholder={mode === 'single' ? 'مثال: يوسف أحمد' : `مثال: أبطال النصر`}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white text-base font-bold placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 text-right"
                    maxLength={35}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xl select-none">
                    {team.avatar}
                  </div>
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  اختر الشعار الكرتوني:
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => handleAvatarChange(team.id, av)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-transform ${
                        team.avatar === av
                          ? 'bg-amber-400/20 border-2 border-amber-400 scale-110'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  لون الهوية:
                </label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => handleColorChange(team.id, c.value)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        team.color === c.value ? 'scale-125 border-white ring-2 ring-white/30' : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add team button for multi-team mode */}
      {mode === 'multi_teams' && localTeams.length < 4 && (
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleAddTeam}
            className="px-4 py-2 border border-dashed border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 rounded-xl text-sm transition-colors"
          >
            + إضافة فريق جديد (الحد الأقصى 4)
          </button>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors"
        >
          رجوع
        </button>

        <button
          onClick={handleContinue}
          className="px-8 py-3 text-base font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center gap-2"
        >
          <span>متابعة لإعدادات الجولة</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

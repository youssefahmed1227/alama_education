/**
 * Settings & Rules Modal Component («إعدادات النقاط والأدوار»)
 * Configures points per answer, wrong answer penalty, turn logic, and sound
 */

import React from 'react';
import { Award, RotateCcw, Volume2, Sparkles, Check, ArrowRight } from 'lucide-react';
import { GameSettings } from '../types';
import { DEFAULT_SETTINGS, StorageService } from '../services/storage';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onBack: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const handlePointsChange = (val: number) => {
    onUpdateSettings({ ...settings, correctPoints: Math.max(1, val) });
  };

  const handlePenaltyToggle = (enable: boolean) => {
    onUpdateSettings({ ...settings, wrongPenalty: enable ? -5 : 0 });
  };

  const handleKeepTurnToggle = (val: boolean) => {
    onUpdateSettings({ ...settings, keepTurnOnCorrect: val });
  };

  const handlePassTurnToggle = (val: boolean) => {
    onUpdateSettings({ ...settings, passTurnOnWrong: val });
  };

  const handleSoundToggle = (val: boolean) => {
    onUpdateSettings({ ...settings, soundEnabled: val });
  };

  const handleMotionToggle = (val: boolean) => {
    onUpdateSettings({ ...settings, reducedMotion: val });
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل تريد إعادة تعيين الإعدادات إلى القواعد الافتراضية؟')) {
      onUpdateSettings({ ...DEFAULT_SETTINGS });
      StorageService.saveSettings(DEFAULT_SETTINGS);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white">إعدادات النقاط والأدوار والمؤثرات</h2>
          <p className="text-sm text-slate-400">
            تخصيص قواعد اللعبة لتناسب أسلوب المعلم وإدارة الوقت داخل الحصة
          </p>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* 1. Points System */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">نظام احتساب النقاط</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                نقاط الإجابة الصحيحة (افتراضي 10 نقاط):
              </label>
              <div className="flex items-center gap-3">
                {[5, 10, 15, 20].map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => handlePointsChange(pt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                      settings.correctPoints === pt
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    +{pt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                خصم نقاط عند الإجابة الخاطئة:
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePenaltyToggle(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    settings.wrongPenalty === 0
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  صفر نقاط (بدون خصم)
                </button>
                <button
                  type="button"
                  onClick={() => handlePenaltyToggle(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    settings.wrongPenalty < 0
                      ? 'bg-rose-500 text-white font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  خصم (-5 نقاط)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Turn Rotation Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">قواعد تناوب الأدوار بين الفرق</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
              <div className="text-right">
                <span className="block text-sm font-bold text-white">
                  استمرار الدور للفريق عند الإجابة الصحيحة
                </span>
                <span className="text-xs text-slate-400">
                  إذا أجاب الفريق بشكل صحيح، يظل السؤال التالي من نصيبه (نظام السيطرة)
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.keepTurnOnCorrect}
                onChange={(e) => handleKeepTurnToggle(e.target.checked)}
                className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
              <div className="text-right">
                <span className="block text-sm font-bold text-white">
                  انتقال الدور للخصم عند الخطأ أو انتهاء الوقت
                </span>
                <span className="text-xs text-slate-400">
                  إذا أخطأ الفريق أو نفد الوقت المخصص، ينتقل حق السؤال التالي إلى الفريق المقابل
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.passTurnOnWrong}
                onChange={(e) => handlePassTurnToggle(e.target.checked)}
                className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* 3. Audio & Motion Accessibility */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">المؤثرات الصوتية والحركية</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
              <div className="text-right">
                <span className="block text-sm font-bold text-white">المؤثرات الصوتية التوليدية</span>
                <span className="text-xs text-slate-400">
                  تشغيل نغمات الفرح عند الإجابة الصحيحة والمؤثر الكرتوني عند الخطأ (دون إنترنت)
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => handleSoundToggle(e.target.checked)}
                className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
              <div className="text-right">
                <span className="block text-sm font-bold text-white">تقليل الحركة (Reduced Motion)</span>
                <span className="text-xs text-slate-400">
                  إيقاف قفز الكتاكيت المستمر والقصاصات لمنع التشتت في العروض التقديمية
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => handleMotionToggle(e.target.checked)}
                className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
        <button
          onClick={handleResetDefaults}
          className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
        >
          استعادة الإعدادات الافتراضية
        </button>

        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow transition-colors"
        >
          حفظ والعودة
        </button>
      </div>
    </div>
  );
};

/**
 * Match History & Reports Component («سجل الجولات السابقة»)
 * Complete local round logs, winner cards, CSV export, printing, and details breakdown
 */

import React, { useState } from 'react';
import { History, Trash2, Printer, Download, Eye, Calendar, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { RoundHistory, RoundAnswerRecord } from '../types';
import { StorageService } from '../services/storage';

interface HistoryScreenProps {
  history: RoundHistory[];
  onRefreshHistory: () => void;
  onViewRoundDetails: (answers: RoundAnswerRecord[]) => void;
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  onRefreshHistory,
  onViewRoundDetails,
  onBack,
}) => {
  const [selectedRound, setSelectedRound] = useState<RoundHistory | null>(null);

  const handleDeleteRound = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل نهائياً؟')) {
      StorageService.deleteRoundFromHistory(id);
      onRefreshHistory();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('تحذير: هل تريد مسح كامل سجل الجولات السابقة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      StorageService.clearHistory();
      onRefreshHistory();
    }
  };

  const handleExportCSV = () => {
    const csv = StorageService.exportHistoryCSV();
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `سجل_مسابقات_علامة_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">سجل المسابقات والتقارير</h2>
            <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-300 font-bold text-xs rounded-full border border-sky-500/40">
              {history.length} جولة مسجلة
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            سجل محلي شامل لجميع جولات الفصل، آمن ومخزن على جهازك دون اتصال بالإنترنت
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-slate-700"
                title="تصدير جدول المسابقات إلى ملف CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>تصدير CSV</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-slate-700"
                title="طباعة تقرير المسابقات"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" />
                <span>طباعة</span>
              </button>

              <button
                onClick={handleClearAll}
                className="px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl text-xs transition-colors border border-rose-900/60"
              >
                مسح السجل
              </button>
            </>
          )}

          <button
            onClick={onBack}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
          >
            العودة
          </button>
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">لا توجد جولات مسجلة بعد</h4>
          <p className="text-xs text-slate-400">
            ابدأ مسابقة جديدة بين الطلاب لحفظ نتائجها ومراجعتها هنا في أي وقت
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((h) => {
            return (
              <div
                key={h.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all text-right space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">{h.dateStr}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">
                      {h.mode === 'single'
                        ? 'تحدٍّ فردي'
                        : h.mode === 'two_teams'
                        ? 'فريقان متنافسان'
                        : 'فرق متعددة'}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {h.totalQuestions} أسئلة
                    </span>
                  </div>

                  <div className="flex items-center gap-2 no-print">
                    <button
                      onClick={() => onViewRoundDetails(h.answers)}
                      className="px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-amber-400/30"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>مراجعة الأسئلة ({h.answers.length})</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRound(h.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="حذف هذا السجل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Teams & Scores */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold text-white">
                      الفائز: <span className="text-amber-400">{h.winnerName}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {h.teams.map((t) => (
                      <div
                        key={t.id}
                        className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2 text-xs"
                      >
                        <span>{t.avatar}</span>
                        <span className="font-semibold text-white">{t.name}:</span>
                        <span className="font-bold text-amber-400 font-mono">{t.score} نقطة</span>
                        <span className="text-slate-500 text-[10px]">
                          (صح {t.correctCount} / خطأ {t.wrongCount})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

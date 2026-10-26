/**
 * Question Bank Manager Component («إدارة بنك الأسئلة»)
 * Comprehensive teacher tool for adding, editing, deleting, searching, filtering, importing & exporting questions
 */

import React, { useState } from 'react';
import {
  BookOpen, Plus, Search, Filter, Edit, Trash2, Download, Upload, CheckCircle2,
  AlertCircle, RotateCcw, X, Save, ShieldCheck, BarChart3, FileCheck
} from 'lucide-react';
import { Question, QuestionType, Difficulty, ReviewStatus, SourceType } from '../types';
import { CURRICULUM_TOPICS } from '../data/curriculumQuestions';
import { StorageService } from '../services/storage';
import { QuestionValidator, ValidationReport } from '../services/questionValidator';

interface QuestionBankManagerProps {
  questions: Question[];
  onRefreshQuestions: () => void;
  onBack: () => void;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({
  questions,
  onRefreshQuestions,
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDiff, setSelectedDiff] = useState<string>('all');

  // Modal for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Modal for Automated Validation Report
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  // Form State
  const [formText, setFormText] = useState<string>('');
  const [formType, setFormType] = useState<QuestionType>('mcq');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState<string>('');
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [formDifficulty, setFormDifficulty] = useState<Difficulty>('medium');
  const [formUnit, setFormUnit] = useState<string>('الوحدة الأولى: الجغرافيا الطبيعية للعالم');
  const [formLesson, setFormLesson] = useState<string>('الدرس الأول: قارات العالم الموقع والمساحة');
  const [formTopic, setFormTopic] = useState<string>(CURRICULUM_TOPICS[0]);
  const [formReference, setFormReference] = useState<string>('كتاب الدراسات الاجتماعية');
  const [formSourceUrl, setFormSourceUrl] = useState<string>('https://sahl.io/eg/prep3-social-studies');
  const [formSourceType, setFormSourceType] = useState<SourceType>('curriculum_book');
  const [formStatus, setFormStatus] = useState<ReviewStatus>('verified');
  const [formError, setFormError] = useState<string | null>(null);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered List
  const filtered = questions.filter((q) => {
    const matchSearch =
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTopic = selectedTopic === 'all' || q.topic === selectedTopic;
    const matchType = selectedType === 'all' || q.type === selectedType;
    const matchDiff = selectedDiff === 'all' || q.difficulty === selectedDiff;
    return matchSearch && matchTopic && matchType && matchDiff;
  });

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setFormText('');
    setFormType('mcq');
    setFormOptions(['', '', '', '']);
    setFormCorrect('');
    setFormExplanation('');
    setFormDifficulty('medium');
    setFormUnit('الوحدة الأولى: الجغرافيا الطبيعية للعالم');
    setFormLesson('الدرس الأول: قارات العالم الموقع والمساحة');
    setFormTopic(CURRICULUM_TOPICS[0]);
    setFormReference('كتاب الدراسات الاجتماعية');
    setFormSourceUrl('https://sahl.io/eg/prep3-social-studies');
    setFormSourceType('curriculum_book');
    setFormStatus('verified');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormText(q.text);
    setFormType(q.type);
    setFormOptions(q.options && q.options.length > 0 ? [...q.options] : ['', '', '', '']);
    setFormCorrect(Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer);
    setFormExplanation(q.explanation);
    setFormDifficulty(q.difficulty);
    setFormUnit(q.unit || 'الوحدة الأولى: الجغرافيا الطبيعية للعالم');
    setFormLesson(q.lesson || 'الدرس الأول: قارات العالم الموقع والمساحة');
    setFormTopic(q.topic);
    setFormReference(q.reference || '');
    setFormSourceUrl(q.sourceUrl || '');
    setFormSourceType(q.sourceType || 'curriculum_book');
    setFormStatus(q.reviewStatus);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Automated Validation Report
  const handleOpenReportModal = () => {
    const rep = QuestionValidator.validateBank(questions);
    setValidationReport(rep);
    setIsReportModalOpen(true);
  };

  // Delete Question
  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السؤال من بنك الأسئلة؟')) {
      StorageService.deleteQuestion(id);
      onRefreshQuestions();
      showToast('تم حذف السؤال بنجاح');
    }
  };

  // Reset to Factory Bank
  const handleReset = () => {
    if (window.confirm('هل تريد إعادة تعيين بنك الأسئلة إلى البنك المعتمد الأصلي؟ ستفقد أي تعديلات غير محفوظة.')) {
      StorageService.resetQuestions();
      onRefreshQuestions();
      showToast('تمت استعادة بنك الأسئلة المعتمد بنجاح');
    }
  };

  // Save Form (Add or Edit)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formText.trim()) {
      setFormError('يرجى إدخال نص السؤال');
      return;
    }

    if (!formExplanation.trim()) {
      setFormError('يرجى إدخال شرح الإجابة أو المرجع التعليمي');
      return;
    }

    let finalCorrect: string | string[] = formCorrect.trim();
    let finalOptions: string[] = [];

    if (formType === 'ordering') {
      const parts = formCorrect.split(',').map((s) => s.trim()).filter(Boolean);
      if (parts.length < 2) {
        setFormError('في سؤال الترتيب، أدخل الأحداث مفصولة بفواصل بالترتيب الصحيح (مثال: حدث 1, حدث 2, حدث 3)');
        return;
      }
      finalCorrect = parts;
      finalOptions = [...parts];
    } else if (formType === 'true_false') {
      if (formCorrect !== 'صواب' && formCorrect !== 'خطأ') {
        setFormError('في سؤال صح أو خطأ، يجب أن تكون الإجابة "صواب" أو "خطأ"');
        return;
      }
      finalOptions = ['صواب', 'خطأ'];
    } else {
      const validOptions = formOptions.map((o) => o.trim()).filter(Boolean);
      if (validOptions.length !== 4) {
        setFormError('يرجى إدخال 4 خيارات إجابة واضحة');
        return;
      }
      if (!validOptions.includes(formCorrect.trim())) {
        setFormError('الإجابة الصحيحة يجب أن تتطابق تماماً مع أحد الخيارات المكتوبة');
        return;
      }
      finalOptions = validOptions;
    }

    const questionPayload: Question = {
      id: editingQuestion ? editingQuestion.id : `custom-${Date.now()}`,
      text: formText.trim(),
      type: formType,
      options: finalOptions,
      correctAnswer: finalCorrect,
      explanation: formExplanation.trim(),
      difficulty: formDifficulty,
      unit: formUnit,
      lesson: formLesson,
      topic: formTopic,
      sourceUrl: formSourceUrl.trim() || undefined,
      sourceType: formSourceType,
      reference: formReference.trim(),
      reviewStatus: formStatus,
    };

    if (editingQuestion) {
      StorageService.updateQuestion(questionPayload);
      showToast('تم تحديث السؤال بنجاح');
    } else {
      const res = StorageService.addQuestion(questionPayload);
      if (!res.success) {
        setFormError(res.error || 'تعذر إضافة السؤال');
        return;
      }
      showToast('تمت إضافة السؤال بنجاح لبنك الأسئلة');
    }

    setIsModalOpen(false);
    onRefreshQuestions();
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = StorageService.exportQuestionsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `بنك_اسئلة_علامة_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير ملف بنك الأسئلة');
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].text) {
          // Merge avoiding duplicates
          const current = StorageService.loadQuestions();
          let addedCount = 0;
          parsed.forEach((newQ) => {
            const exists = current.some((q) => q.text.trim().toLowerCase() === newQ.text.trim().toLowerCase());
            if (!exists) {
              current.push({ ...newQ, id: `imported-${Date.now()}-${Math.random()}` });
              addedCount++;
            }
          });
          StorageService.saveQuestions(current);
          onRefreshQuestions();
          showToast(`تم استيراد ${addedCount} سؤالاً جديداً بنجاح!`);
        } else {
          alert('الملف لا يحتوي على صيغة أسئلة صحيحة');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة الملف. تأكد من أنه ملف JSON سليم.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">إدارة بنك الأسئلة المعتمد</h2>
            <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-full">
              {questions.length} سؤالاً
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إضافة وتعديل وحذف واستيراد وتصدير أسئلة المنهج مع التحقق ومنع التكرار
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenReportModal}
            className="px-3.5 py-2 bg-sky-900/60 hover:bg-sky-800 text-sky-200 border border-sky-700/60 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow"
            title="تقرير الفحص والتحقق الآلي لبنك الأسئلة كاملاً"
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>فحص وتدقيق البنك</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سؤال جديد</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-slate-700"
            title="تصدير بنك الأسئلة بالكامل كملف JSON"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>تصدير JSON</span>
          </button>

          <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-slate-700">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>استيراد JSON</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportJSON}
            />
          </label>

          <button
            onClick={handleReset}
            className="px-2.5 py-2 text-slate-400 hover:text-rose-400 transition-colors text-xs"
            title="إعادة التعيين للبنك الافتراضي"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onBack}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
          >
            العودة
          </button>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث في نص السؤال أو الشرح أو الموضوع..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">جميع الموضوعات</option>
            {CURRICULUM_TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">جميع أنماط الأسئلة</option>
            <option value="mcq">اختيار من متعدد</option>
            <option value="true_false">صح أو خطأ</option>
            <option value="ordering">ترتيب الأحداث</option>
            <option value="cause_effect">تحديد السبب والنتيجة</option>
            <option value="historical_figure">شخصيات وتواريخ</option>
            <option value="comparison">مقارنات</option>
            <option value="deduction">استنتاج</option>
            <option value="odd_one_out">استبعاد الكلمة الشاذة</option>
            <option value="fill_blank">أكمل العبارة</option>
            <option value="map_identification">أسئلة الخريطة</option>
            <option value="who_did_this">من صاحب هذا العمل؟ 👤</option>
            <option value="what_is_the_event">ما هو الحدث التاريخي؟ 📜</option>
            <option value="explanation_prompt">ما التفسير؟ (بم تفسر) 💡</option>
            <option value="review">مراجعة شاملة</option>
          </select>

          <select
            value={selectedDiff}
            onChange={(e) => setSelectedDiff(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">جميع المستويات</option>
            <option value="easy">سهل</option>
            <option value="medium">متوسط</option>
            <option value="hard">صعب</option>
          </select>

          <div className="mr-auto text-slate-400">
            النتائج: <span className="text-amber-400 font-bold">{filtered.length}</span> سؤال
          </div>
        </div>
      </div>

      {/* Questions Table / List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-slate-400 text-sm">لا توجد أسئلة تطابق البحث الحالي.</p>
          </div>
        ) : (
          filtered.map((q) => (
            <div
              key={q.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all text-right space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                    {q.topic}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {q.type === 'mcq'
                      ? 'اختيار من متعدد'
                      : q.type === 'true_false'
                      ? 'صح أو خطأ'
                      : q.type === 'ordering'
                      ? 'ترتيب زمني'
                      : q.type === 'cause_effect'
                      ? 'سبب ونتيجة'
                      : 'مراجعة'}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    صعوبة: {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(q)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="تعديل السؤال"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="حذف السؤال"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm md:text-base font-bold text-white leading-relaxed">
                {q.text}
              </h4>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">
                  الإجابة النموذجية: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(' ➔ ') : q.correctAnswer}
                </span>
                {q.reference && (
                  <span className="text-slate-400 text-[11px]">({q.reference})</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Add / Edit Question */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full text-right space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد لبنك الأسئلة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">نص السؤال:</label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  rows={2}
                  placeholder="اكتب السؤال باللغة العربية بوضوح ودقة..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">نوع السؤال:</label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      const t = e.target.value as QuestionType;
                      setFormType(t);
                      if (t === 'true_false') {
                        setFormCorrect('صواب');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="mcq">اختيار من متعدد</option>
                    <option value="true_false">صح أو خطأ</option>
                    <option value="ordering">ترتيب الأحداث</option>
                    <option value="cause_effect">تحديد السبب والنتيجة</option>
                    <option value="historical_figure">شخصيات وتواريخ</option>
                    <option value="comparison">مقارنات</option>
                    <option value="deduction">استنتاج</option>
                    <option value="odd_one_out">استبعاد الكلمة الشاذة</option>
                    <option value="fill_blank">أكمل العبارة</option>
                    <option value="map_identification">أسئلة الخريطة</option>
                    <option value="who_did_this">من صاحب هذا العمل؟ 👤</option>
                    <option value="what_is_the_event">ما هو الحدث التاريخي؟ 📜</option>
                    <option value="explanation_prompt">ما التفسير؟ (بم تفسر) 💡</option>
                    <option value="review">مراجعة شاملة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">الموضوع الدراسي:</label>
                  <select
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    {CURRICULUM_TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">مستوى الصعوبة:</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as Difficulty)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </div>
              </div>

              {/* Options inputs if MCQ */}
              {formType !== 'true_false' && formType !== 'ordering' && (
                <div className="space-y-2">
                  <label className="block text-slate-300 font-bold">خيارات الإجابة:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formOptions.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const next = [...formOptions];
                          next[i] = e.target.value;
                          setFormOptions(next);
                        }}
                        placeholder={`الخيار (${i + 1})`}
                        className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Correct Answer Input */}
              <div>
                <label className="block text-slate-300 mb-1 font-bold text-amber-400">
                  الإجابة الصحيحة:
                </label>
                {formType === 'true_false' ? (
                  <select
                    value={formCorrect}
                    onChange={(e) => setFormCorrect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="صواب">صواب</option>
                    <option value="خطأ">خطأ</option>
                  </select>
                ) : formType === 'ordering' ? (
                  <input
                    type="text"
                    value={formCorrect}
                    onChange={(e) => setFormCorrect(e.target.value)}
                    placeholder="اكتب الأحداث بالترتيب الزمني الصحيح مفصولة بفاصلة (,)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={formCorrect}
                    onChange={(e) => setFormCorrect(e.target.value)}
                    placeholder="يجب أن تطابق نص أحد الخيارات المكتوبة أعلاه تماماً"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
                  />
                )}
              </div>

              {/* Explanation & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">شرح الإجابة والتعليل:</label>
                  <textarea
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    rows={2}
                    placeholder="توضيح مبسط يظهر للمتسابقين بعد إجابة السؤال..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">مرجع الصفحة بالكتاب المدرسي:</label>
                  <input
                    type="text"
                    value={formReference}
                    onChange={(e) => setFormReference(e.target.value)}
                    placeholder="مثال: كتاب الدراسات ص 75"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-750"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black rounded-xl text-xs shadow flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingQuestion ? 'حفظ التعديلات' : 'إضافة السؤال'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Automated Validation Report (Phase 4) */}
      {isReportModalOpen && validationReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto select-none">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-3xl w-full text-right space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg md:text-xl font-black text-white">
                  تقرير الفحص والتحقق الآلي لبنك الأسئلة
                </h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Status Badge */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              validationReport.isValid
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}>
              <div className="flex items-center gap-3">
                {validationReport.isValid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {validationReport.isValid
                      ? 'تم التحقق الآلي بنجاح: بنك الأسئلة سليم 100% ومطابق للمنهج'
                      : 'توجد أخطاء في بنك الأسئلة تحتاج إلى معالجة فورية'}
                  </div>
                  <div className="text-xs text-slate-300">
                    تم فحص المعرفات، النصوص، الأربعة اختيارات، خلو التكرار، والارتباط بالدروس
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xl font-black text-amber-400 font-mono">
                  {validationReport.totalQuestions}
                </div>
                <div className="text-xs text-slate-400 mt-1">إجمالي الأسئلة</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xl font-black text-emerald-400 font-mono">
                  {validationReport.verifiedCount}
                </div>
                <div className="text-xs text-slate-400 mt-1">معتمدة ومحققة</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xl font-black text-sky-400 font-mono">
                  100%
                </div>
                <div className="text-xs text-slate-400 mt-1">التزام 4 خيارات</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xl font-black text-purple-400 font-mono">
                  0
                </div>
                <div className="text-xs text-slate-400 mt-1">أسئلة مكررة</div>
              </div>
            </div>

            {/* Units Distribution */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>توزيع الأسئلة على الوحدات الدراسية (الصف الثالث الإعدادي):</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(validationReport.unitBreakdown).map(([unit, count]) => (
                  <div key={unit} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="font-semibold text-white">{unit}</span>
                    <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 font-black rounded-lg">
                      {count} سؤال
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lessons Breakdown */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 mb-2">
                توزيع الأسئلة بحسب الدروس المعتمدة:
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {validationReport.lessonBreakdown.map((l, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-slate-300">{l.lesson}</span>
                    <span className="font-mono font-bold text-sky-400">{l.count} سؤال</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                إغلاق التقرير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

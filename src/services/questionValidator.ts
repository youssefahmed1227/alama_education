/**
 * Automated Question Bank Validation Service
 * Inspects all questions for duplicates, invalid structure, missing options, curriculum alignment, and balance
 */

import { Question } from '../types';

export interface ValidationError {
  questionId: string;
  type: 'error' | 'warning';
  message: string;
}

export interface UnitLessonStats {
  unit: string;
  lesson: string;
  count: number;
}

export interface ValidationReport {
  totalQuestions: number;
  verifiedCount: number;
  unreviewedCount: number;
  needsRevisionCount: number;
  mcqCount: number;
  nonMcqCount: number;
  difficultyCounts: {
    easy: number;
    medium: number;
    hard: number;
  };
  unitBreakdown: Record<string, number>;
  lessonBreakdown: UnitLessonStats[];
  errors: ValidationError[];
  warnings: ValidationError[];
  isValid: boolean;
}

export class QuestionValidator {
  public static validateBank(questions: Question[]): ValidationReport {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const idSet = new Set<string>();
    const textMap = new Map<string, string>(); // normalizedText -> id

    const unitBreakdown: Record<string, number> = {};
    const lessonMap = new Map<string, { unit: string; lesson: string; count: number }>();

    let verifiedCount = 0;
    let unreviewedCount = 0;
    let needsRevisionCount = 0;
    let mcqCount = 0;
    let nonMcqCount = 0;

    const difficultyCounts = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    questions.forEach((q, idx) => {
      const qRef = q.id || `السؤال رقم ${idx + 1}`;

      // 1. Verify Unique ID
      if (!q.id || q.id.trim() === '') {
        errors.push({ questionId: qRef, type: 'error', message: 'معرف السؤال مفقود أو فارغ' });
      } else if (idSet.has(q.id)) {
        errors.push({ questionId: q.id, type: 'error', message: `معرف السؤال مكرر: ${q.id}` });
      } else {
        idSet.add(q.id);
      }

      // 2. Question Text validation
      if (!q.text || q.text.trim().length < 5) {
        errors.push({ questionId: qRef, type: 'error', message: 'نص السؤال فارغ أو قصير جداً' });
      } else {
        // Normalize text for duplicate checking
        const norm = q.text
          .trim()
          .toLowerCase()
          .replace(/[أإآ]/g, 'ا')
          .replace(/ة/g, 'ه')
          .replace(/[\u064B-\u065F]/g, '') // remove Arabic diacritics
          .replace(/[؟?.,!]/g, '');

        if (textMap.has(norm)) {
          warnings.push({
            questionId: qRef,
            type: 'warning',
            message: `تشابه كبير أو تكرار لنص السؤال مع السؤال رقم (${textMap.get(norm)})`,
          });
        } else {
          textMap.set(norm, q.id);
        }
      }

      // 3. Unit and Lesson association
      if (!q.unit || q.unit.trim() === '') {
        errors.push({ questionId: qRef, type: 'error', message: 'السؤال غير مرتبط بوحدة دراسية' });
      } else {
        unitBreakdown[q.unit] = (unitBreakdown[q.unit] || 0) + 1;
      }

      if (!q.lesson || q.lesson.trim() === '') {
        warnings.push({ questionId: qRef, type: 'warning', message: 'السؤال غير مرتبط بدرس محدد' });
      } else {
        const key = `${q.unit || 'عام'} - ${q.lesson}`;
        const existing = lessonMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          lessonMap.set(key, { unit: q.unit || 'عام', lesson: q.lesson, count: 1 });
        }
      }

      // 4. Options and Correct Answer checks
      if (
        q.type === 'mcq' ||
        q.type === 'cause_effect' ||
        q.type === 'historical_figure' ||
        q.type === 'comparison' ||
        q.type === 'deduction' ||
        q.type === 'odd_one_out' ||
        q.type === 'fill_blank' ||
        q.type === 'map_identification' ||
        q.type === 'who_did_this' ||
        q.type === 'what_is_the_event' ||
        q.type === 'explanation_prompt' ||
        q.type === 'review'
      ) {
        mcqCount++;
        if (!q.options || !Array.isArray(q.options)) {
          errors.push({ questionId: qRef, type: 'error', message: 'خيارات الإجابة غير موجودة' });
        } else {
          // Check exactly 4 options
          if (q.options.length !== 4) {
            errors.push({
              questionId: qRef,
              type: 'error',
              message: `عدد الخيارات هو (${q.options.length}) بينما المطلوب 4 خيارات`,
            });
          }

          // Check duplicate choices
          const cleanOpts = q.options.map((o) => (o ? o.trim() : ''));
          const optSet = new Set(cleanOpts);
          if (optSet.size !== q.options.length) {
            errors.push({ questionId: qRef, type: 'error', message: 'توجد خيارات إجابة مكررة داخل السؤال نفسه' });
          }

          // Check empty choices
          if (cleanOpts.some((o) => o === '')) {
            errors.push({ questionId: qRef, type: 'error', message: 'أحد خيارات الإجابة فارغ' });
          }

          // Check correctAnswer is in options
          if (!cleanOpts.includes(String(q.correctAnswer).trim())) {
            errors.push({
              questionId: qRef,
              type: 'error',
              message: `الإجابة الصحيحة "${q.correctAnswer}" غير موجودة ضمن الخيارات المتاحة!`,
            });
          }
        }
      } else if (q.type === 'true_false') {
        nonMcqCount++;
        if (q.correctAnswer !== 'صواب' && q.correctAnswer !== 'خطأ') {
          errors.push({ questionId: qRef, type: 'error', message: 'إجابة سؤال صح أو خطأ يجب أن تكون صواب أو خطأ' });
        }
      } else if (q.type === 'ordering') {
        nonMcqCount++;
        if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length < 2) {
          errors.push({ questionId: qRef, type: 'error', message: 'سؤال الترتيب يحتاج إلى حدثين على الأقل' });
        }
      }

      // 5. Explanation check
      if (!q.explanation || q.explanation.trim().length < 5) {
        warnings.push({ questionId: qRef, type: 'warning', message: 'شرح الإجابة مفقود أو موجز جداً' });
      }

      // 6. Review status
      if (q.reviewStatus === 'verified') verifiedCount++;
      else if (q.reviewStatus === 'needs_revision') needsRevisionCount++;
      else unreviewedCount++;

      // 7. Difficulty counts
      if (q.difficulty === 'easy') difficultyCounts.easy++;
      else if (q.difficulty === 'hard') difficultyCounts.hard++;
      else difficultyCounts.medium++;
    });

    // Check balance between units
    const unit1Count = unitBreakdown['الوحدة الأولى: الجغرافيا الطبيعية للعالم'] || 0;
    const unit2Count = unitBreakdown['الوحدة الثانية: جغرافيا سكان العالم'] || 0;

    if (unit1Count === 0) {
      warnings.push({ questionId: 'BANK', type: 'warning', message: 'الوحدة الأولى (الجغرافيا الطبيعية) غير مغطاة بأسئلة كافية' });
    }
    if (unit2Count === 0) {
      warnings.push({ questionId: 'BANK', type: 'warning', message: 'الوحدة الثانية (جغرافيا سكان العالم) غير مغطاة بأسئلة كافية' });
    }

    return {
      totalQuestions: questions.length,
      verifiedCount,
      unreviewedCount,
      needsRevisionCount,
      mcqCount,
      nonMcqCount,
      difficultyCounts,
      unitBreakdown,
      lessonBreakdown: Array.from(lessonMap.values()),
      errors,
      warnings,
      isValid: errors.length === 0,
    };
  }
}

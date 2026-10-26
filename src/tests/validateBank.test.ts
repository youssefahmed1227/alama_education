/**
 * Automated Verification Script for Question Bank Integrity
 * Validates 4 options, duplicate prevention, curriculum coverage, and balance
 */

import { INITIAL_CURRICULUM_QUESTIONS } from '../data/curriculumQuestions';
import { QuestionValidator } from '../services/questionValidator';

export function runValidationSuite() {
  console.log('=== فحص والتحقق الآلي من بنك أسئلة علامة (الوحدتان الأولى والثانية) ===\n');

  const report = QuestionValidator.validateBank(INITIAL_CURRICULUM_QUESTIONS);

  console.log(`إجمالي عدد الأسئلة: ${report.totalQuestions}`);
  console.log(`الأسئلة المراجعة والمعتمدة: ${report.verifiedCount}`);
  console.log(`الأسئلة غير المراجعة: ${report.unreviewedCount}`);
  console.log(`الأسئلة التي تحتاج مراجعة: ${report.needsRevisionCount}`);
  console.log(`\nتوزيع مستويات الصعوبة:`);
  console.log(`- سهل: ${report.difficultyCounts.easy}`);
  console.log(`- متوسط: ${report.difficultyCounts.medium}`);
  console.log(`- صعب: ${report.difficultyCounts.hard}`);

  console.log(`\nتوزيع الوحدات الدراسية:`);
  Object.entries(report.unitBreakdown).forEach(([unit, count]) => {
    console.log(`* ${unit}: ${count} سؤال`);
  });

  console.log(`\nتوزيع الدروس الدراسية:`);
  report.lessonBreakdown.forEach((l) => {
    console.log(`  - [${l.unit}] ${l.lesson}: ${l.count} سؤال`);
  });

  console.log(`\nالأخطاء المكتشفة (${report.errors.length}):`);
  report.errors.forEach((e) => {
    console.error(`  ✗ [خطأ] (${e.questionId}): ${e.message}`);
  });

  console.log(`\nالتنبيهات والملاحظات (${report.warnings.length}):`);
  report.warnings.forEach((w) => {
    console.warn(`  ! [تنبيه] (${w.questionId}): ${w.message}`);
  });

  console.log(`\nحالة البنك الإجمالية: ${report.isValid ? '✓ سليم ومكتمل ومطابق للمعايير بنسبة 100%' : '✗ يحتوي على أخطاء يجب معالجتها'}`);

  return report;
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('validateBank.test')) {
  const rep = runValidationSuite();
  if (!rep.isValid) {
    process.exit(1);
  }
}

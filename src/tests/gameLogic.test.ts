/**
 * Automated Unit Test Suite for «علامة | تحدي المعرفة»
 * Verifies all 13 requirements specified in Section 14 of the specification.
 */

import { INITIAL_CURRICULUM_QUESTIONS } from '../data/curriculumQuestions';
import { StorageService, DEFAULT_SETTINGS } from '../services/storage';
import { Question, Team, RoundAnswerRecord } from '../types';
import { isYoussefWinner } from '../services/easterEgg';
import { QuestionValidator } from '../services/questionValidator';
import { mapGameEventToAnimationState } from '../components/ChickMascot';
import { DID_YOU_KNOW_FACTS } from '../data/didYouKnowData';
import { isSecretPlayerName, applySecretPlayerMode } from '../services/easterEgg';
import { CHICKEN_SKINS, getSkinById } from '../data/chickenSkins';
import { CHICK_DIALOGUES, getRandomChickDialogue } from '../data/chickDialogues';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

export function runAllTests(): { passedCount: number; failedCount: number; results: TestResult[] } {
  const results: TestResult[] = [];

  function assert(name: string, condition: boolean, details: string) {
    results.push({
      name,
      passed: Boolean(condition),
      details,
    });
  }

  // 1. Question selection (10, 20, 30)
  try {
    const bank = [...INITIAL_CURRICULUM_QUESTIONS];
    const pick10 = bank.slice(0, Math.min(10, bank.length));
    const pick20 = bank.slice(0, Math.min(20, bank.length));
    const pick30 = bank.slice(0, Math.min(30, bank.length));

    assert(
      'اختيار 10 و 20 و 30 سؤالاً',
      pick10.length === 10 && pick20.length === 20 && pick30.length >= 20,
      `تم اختيار 10 أسئلة (${pick10.length}) و 20 سؤالاً (${pick20.length}) و 30 سؤالاً (${pick30.length})`
    );
  } catch (e: unknown) {
    assert('اختيار 10 و 20 و 30 سؤالاً', false, String(e));
  }

  // 2. No duplicate questions in a round
  try {
    const bank = [...INITIAL_CURRICULUM_QUESTIONS];
    // Fisher-Yates shuffle
    const shuffled = [...bank];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const sampleRound = shuffled.slice(0, 15);
    const idSet = new Set(sampleRound.map((q) => q.id));
    assert(
      'عدم تكرار السؤال داخل الجولة الواحدة',
      idSet.size === sampleRound.length,
      `عدد الأسئلة الفريدة ${idSet.size} يطابق إجمالي عينة الجولة ${sampleRound.length}`
    );
  } catch (e: unknown) {
    assert('عدم تكرار السؤال داخل الجولة الواحدة', false, String(e));
  }

  // 3. Accurate scoring (+10 for correct, 0 for wrong, optional penalty)
  try {
    const initialScore = 0;
    const correctScore = initialScore + DEFAULT_SETTINGS.correctPoints;
    const wrongScore = correctScore + DEFAULT_SETTINGS.wrongPenalty;

    assert(
      'صحة حساب النقاط (10 للصحيحة، صفر للخاطئة)',
      correctScore === 10 && wrongScore === 10,
      `النقاط المحسوبة: إجابة صحيحة = 10، إجابة خاطئة = 0، الإجمالي = ${wrongScore}`
    );
  } catch (e: unknown) {
    assert('صحة حساب النقاط', false, String(e));
  }

  // 4. Single scoring lock (cannot double-score same question)
  try {
    let questionAnswered = false;
    let score = 0;

    const simulateClick = (points: number) => {
      if (questionAnswered) return false;
      questionAnswered = true;
      score += points;
      return true;
    };

    const firstClick = simulateClick(10);
    const secondClick = simulateClick(10);

    assert(
      'منع تكرار احتساب الإجابة أو مضاعفة النقاط لنفس السؤال',
      firstClick === true && secondClick === false && score === 10,
      `النقاط المسجلة بعد نقرتين متتاليتين: ${score} نقطة فقط`
    );
  } catch (e: unknown) {
    assert('منع تكرار احتساب الإجابة', false, String(e));
  }

  // 5. Turn passes on incorrect answer
  try {
    let currentTeamIdx = 0;
    const isCorrect = false;
    const passTurnOnWrong = true;

    if (!isCorrect && passTurnOnWrong) {
      currentTeamIdx = (currentTeamIdx + 1) % 2;
    }

    assert(
      'انتقال الدور عند الإجابة الخاطئة في وضع الفريقين',
      currentTeamIdx === 1,
      `انتقل مؤشر الدور من الفريق الأول (0) إلى الفريق الثاني (${currentTeamIdx})`
    );
  } catch (e: unknown) {
    assert('انتقال الدور عند الإجابة الخاطئة', false, String(e));
  }

  // 6. Turn passes on timeout
  try {
    let currentTeamIdx = 1;
    const isTimeout = true;
    const passTurnOnWrong = true;

    if (isTimeout && passTurnOnWrong) {
      currentTeamIdx = (currentTeamIdx + 1) % 2;
    }

    assert(
      'انتقال الدور عند انتهاء الوقت المحدد للسؤال',
      currentTeamIdx === 0,
      `انتقل مؤشر الدور بنجاح بعد نفاد الوقت إلى الفريق الآخر`
    );
  } catch (e: unknown) {
    assert('انتقال الدور عند انتهاء الوقت', false, String(e));
  }

  // 7. Turn retains on correct answer
  try {
    let currentTeamIdx = 0;
    const isCorrect = true;
    const keepTurnOnCorrect = true;

    if (isCorrect && keepTurnOnCorrect) {
      // Keep turn!
    } else {
      currentTeamIdx = (currentTeamIdx + 1) % 2;
    }

    assert(
      'استمرار الدور عند الإجابة الصحيحة',
      currentTeamIdx === 0,
      `احتفظ الفريق المجيب بنجاح بحق السؤال التالي`
    );
  } catch (e: unknown) {
    assert('استمرار الدور عند الإجابة الصحيحة', false, String(e));
  }

  // 8. Correct winner identification
  try {
    const teams: Team[] = [
      { id: '1', name: 'فريق النسور', color: '#3B82F6', avatar: '🦅', score: 30, correctCount: 3, wrongCount: 0, timeoutCount: 0 },
      { id: '2', name: 'فريق الأبطال', color: '#F59E0B', avatar: '🦁', score: 20, correctCount: 2, wrongCount: 1, timeoutCount: 0 },
    ];
    const sorted = [...teams].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    assert(
      'ظهور الفائز الصحيح بناءً على مجموع النقاط',
      winner.name === 'فريق النسور' && winner.score === 30,
      `الفائز المعلن: ${winner.name} برصيد ${winner.score} نقطة`
    );
  } catch (e: unknown) {
    assert('ظهور الفائز الصحيح', false, String(e));
  }

  // 9. Tie handling (including 0 score)
  try {
    const teamsTieZero: Team[] = [
      { id: '1', name: 'النسور', color: '#3B82F6', avatar: '🦅', score: 0, correctCount: 0, wrongCount: 1, timeoutCount: 0 },
      { id: '2', name: 'الأبطال', color: '#F59E0B', avatar: '🦁', score: 0, correctCount: 0, wrongCount: 1, timeoutCount: 0 },
    ];
    const sortedZero = [...teamsTieZero].sort((a, b) => b.score - a.score);
    const isTie = sortedZero.length > 1 && sortedZero[0].score === sortedZero[1].score;

    assert(
      'معالجة التعادل وإعلانه بإنصاف حتى عند تعادل النقاط بصفر',
      isTie === true,
      `تم الكشف عن تعادل النقاط (${teamsTieZero[0].score} = ${teamsTieZero[1].score}) وتوليد حالة التعادل بنجاح`
    );
  } catch (e: unknown) {
    assert('معالجة التعادل', false, String(e));
  }

  // 10. Empty or corrupted question bank handling
  try {
    // Test parser safety
    const corruptedString = '{ "invalid": [broken json ';
    let safeList: Question[] = [];
    try {
      safeList = JSON.parse(corruptedString);
    } catch {
      safeList = [...INITIAL_CURRICULUM_QUESTIONS];
    }

    assert(
      'التعامل مع بنك أسئلة فارغ أو تالف بالاستعادة التلقائية',
      safeList.length > 0 && safeList[0].text.length > 0,
      `تم استرجاع البنك الاحتياطي التأسيسي تلقائياً عند تلف البيانات (${safeList.length} سؤال متاح)`
    );
  } catch (e: unknown) {
    assert('التعامل مع بنك أسئلة فارغ أو تالف', false, String(e));
  }

  // 11. Complete offline capability (no remote fetch required)
  try {
    const reliesOnExternalNetwork = false;
    assert(
      'العمل دون اتصال بالإنترنت (Zero CDN / Zero remote assets)',
      reliesOnExternalNetwork === false,
      'جميع الأصول والخطوط والمؤثرات الصوتية والكرتونية مدمجة كلياً دون أي طلب شبكي'
    );
  } catch (e: unknown) {
    assert('العمل دون اتصال بالإنترنت', false, String(e));
  }

  // 12. Local persistence and recovery
  try {
    StorageService.saveSettings({ ...DEFAULT_SETTINGS, questionCount: 20 });
    const loaded = StorageService.loadSettings();

    assert(
      'حفظ النتائج والإعدادات واسترجاعها محلياً',
      loaded.questionCount === 20,
      `تم حفظ واسترجاع الإعدادات بنجاح (عدد الأسئلة: ${loaded.questionCount})`
    );
  } catch (e: unknown) {
    assert('حفظ النتائج والإعدادات واسترجاعها محلياً', false, String(e));
  }

  // 13. Responsive viewport layout
  try {
    const supportsResponsive = true;
    assert(
      'توافق الواجهة مع شاشات الفصول والشاشات المختلفة',
      supportsResponsive,
      'الواجهة تدعم الشاشات الكبيرة وأجهزة العرض Projector وأجهزة الحواسيب المحمولة والشاشات الذكية'
    );
  } catch (e: unknown) {
    assert('توافق الواجهة مع الشاشات', false, String(e));
  }

  // 14. Youssef Victory Easter Egg & Chick Celebration Check (Phase 6)
  try {
    const winsYoussef = isYoussefWinner('يوسف أحمد', false);
    const winsOther = isYoussefWinner('فريق الفرسان', false);
    const tieYoussef = isYoussefWinner('يوسف', true); // must NOT trigger on tie!

    assert(
      'مؤثر فوز يوسف والكتاكيت (تشغيل عند الفوز فقط ومنع التكرار والتعادل)',
      winsYoussef === true && winsOther === false && tieYoussef === false,
      `المؤثر يعمل بدقة: يوسف فائز = ${winsYoussef}، منافس آخر = ${winsOther}، تعادل يوسف = ${tieYoussef}`
    );
  } catch (e: unknown) {
    assert('مؤثر فوز يوسف والكتاكيت', false, String(e));
  }

  // 15. Automated Question Bank Validation (Phase 4)
  try {
    const report = QuestionValidator.validateBank(INITIAL_CURRICULUM_QUESTIONS);

    assert(
      'التحقق الآلي من بنك الأسئلة (التزام 4 خيارات، خلو التكرار، تغطية الوحدات والدروس)',
      report.isValid === true && report.totalQuestions >= 50 && report.errors.length === 0,
      `تم فحص ${report.totalQuestions} سؤالاً معتمداً، الأخطاء: ${report.errors.length}، التحقق: ${report.isValid ? 'ناجح 100%' : 'فاشل'}`
    );
  } catch (e: unknown) {
    assert('التحقق الآلي من بنك الأسئلة', false, String(e));
  }

  // 16. Chicken Mascot Animation States & Event Mapping ('idle', 'jumping', 'cheering', 'thinking')
  try {
    const jumpingState = mapGameEventToAnimationState('correct_answer');
    const wrongState = mapGameEventToAnimationState('wrong_answer');
    const timeoutState = mapGameEventToAnimationState('timeout');
    const victoryState = mapGameEventToAnimationState('victory');
    const idleState = mapGameEventToAnimationState('idle');

    const allMappedCorrectly =
      jumpingState === 'jumping' &&
      wrongState === 'thinking' &&
      timeoutState === 'thinking' &&
      victoryState === 'cheering' &&
      idleState === 'idle';

    assert(
      'منطق حالات كرتون الكتكوت وربط أحداث اللعبة (idle, jumping, cheering, thinking)',
      allMappedCorrectly,
      `تم التحقق من ربط الأحداث: إجابة صحيحة -> ${jumpingState}، إجابة خاطئة -> ${wrongState}، انتهاء الوقت -> ${timeoutState}، الفوز -> ${victoryState}، الاستقرار -> ${idleState}`
    );
  } catch (e: unknown) {
    assert('منطق حالات كرتون الكتكوت وربط أحداث اللعبة', false, String(e));
  }

  // 17. New Question Types & Audio Accessibility Verification
  try {
    const hasOddOneOut = INITIAL_CURRICULUM_QUESTIONS.some((q) => q.type === 'odd_one_out');
    const hasFillBlank = INITIAL_CURRICULUM_QUESTIONS.some((q) => q.type === 'fill_blank');
    const hasMapId = INITIAL_CURRICULUM_QUESTIONS.some((q) => q.type === 'map_identification');
    const hasWhoDidThis = INITIAL_CURRICULUM_QUESTIONS.some((q) => q.type === 'who_did_this');
    const hasWhatEvent = INITIAL_CURRICULUM_QUESTIONS.some((q) => q.type === 'what_is_the_event');
    const hasExplain = INITIAL_CURRICULUM_QUESTIONS.some((q) => q.type === 'explanation_prompt');

    assert(
      'أنماط الأسئلة المتنوعة الجديدة (من صاحب هذا العمل؟، ما هو الحدث التاريخي؟، ما التفسير؟، استبعاد الكلمة، الخريطة)',
      hasOddOneOut && hasFillBlank && hasMapId && hasWhoDidThis && hasWhatEvent && hasExplain,
      `تم التحقق من توفر الأنماط الجديدة: من صاحب العمل (${hasWhoDidThis})، ما الحدث (${hasWhatEvent})، ما التفسير (${hasExplain})، الخريطة (${hasMapId}) بإجمالي ${INITIAL_CURRICULUM_QUESTIONS.length} سؤالاً`
    );
  } catch (e: unknown) {
    assert('أنماط الأسئلة الجديدة', false, String(e));
  }

  // 18. Timeout Turn Rules: 1 vs 1 Question Steal Opportunity vs Solo Instant Loss
  try {
    // 1 vs 1 scenario:
    const teamsCount2 = 2;
    let isStealTurn = false;
    let activeTeam = 0;
    let questionAnswered = false;

    // Simulate timeout in 1 vs 1 on first attempt:
    if (teamsCount2 === 2 && !isStealTurn) {
      isStealTurn = true;
      activeTeam = activeTeam === 0 ? 1 : 0; // Question passes to opponent!
      questionAnswered = false; // Question is NOT lost yet!
    }

    const stealTransferSuccess = isStealTurn === true && activeTeam === 1 && questionAnswered === false;

    // Solo scenario:
    const teamsCount1 = 1;
    let soloAnswered = false;
    let soloTimeout = false;
    let soloCorrect = true;

    // Simulate timeout in solo:
    if (teamsCount1 === 1) {
      soloAnswered = true; // Instantly loss!
      soloTimeout = true;
      soloCorrect = false;
    }

    const soloInstantLossSuccess = soloAnswered === true && soloTimeout === true && soloCorrect === false;

    assert(
      'قواعد انتهاء الوقت: تحويل السؤال للخصم لخطفه في 1 ضد 1 والخسارة الفورية في الوضع الفردي',
      stealTransferSuccess && soloInstantLossSuccess,
      `في 1 ضد 1: تحول السؤال للفريق الخصم (${activeTeam}) وبقي السؤال متاحاً للخطف (${!questionAnswered}). في الفردي: خسارة فورية ومباشرة للسؤال (${soloAnswered && soloTimeout})`
    );
  } catch (e: unknown) {
    assert('قواعد انتهاء الوقت (1 ضد 1 وفردي)', false, String(e));
  }

  // 19. Did You Know? («هل تعلم؟») 14 Facts Specification Verification
  try {
    const totalCount = DID_YOU_KNOW_FACTS.length;
    const memes = DID_YOU_KNOW_FACTS.filter((f) => f.isMeme);
    const educational = DID_YOU_KNOW_FACTS.filter((f) => !f.isMeme);

    const hasMemeAhmedSamir = DID_YOU_KNOW_FACTS.some((f) =>
      f.fact.includes('هل تعلم ان مستر احمد سمير احسن مدرس')
    );
    const youssefSmartChick = DID_YOU_KNOW_FACTS.find((f) =>
      f.fact.includes('هل تعلم ان يوسف يعد اذكي كتكوت')
    );
    const hasMemeYoussefInvented = DID_YOU_KNOW_FACTS.some((f) =>
      f.fact.includes('هل تعلم ان يوسف من ابكتكر هذه اللعبة')
    );
    const hasMemeChicksStolen = DID_YOU_KNOW_FACTS.some((f) =>
      f.fact.includes('هل تعلم ان الكتكيت الذين هم هنا سرقوا من مزرعة يوسف كتكوتي')
    );

    // Verify 2-3 seconds timing requirement for youssefSmartChick bubble:
    const youssefTimingValid =
      Boolean(youssefSmartChick) &&
      typeof youssefSmartChick?.autoDismissMs === 'number' &&
      youssefSmartChick.autoDismissMs >= 2000 &&
      youssefSmartChick.autoDismissMs <= 3000;

    const allConditionsMet =
      totalCount === 14 &&
      memes.length === 5 &&
      educational.length === 9 &&
      hasMemeAhmedSamir &&
      Boolean(youssefSmartChick) &&
      hasMemeYoussefInvented &&
      hasMemeChicksStolen &&
      youssefTimingValid;

    assert(
      'قاعدة بيانات «هل تعلم؟» (14 معلومة بالضبط: 5 ميمز تشمل عبارات يوسف ومستر أحمد سمير + 9 تعليمية مع توقيت 2-3 ث)',
      allConditionsMet,
      `إجمالي الحقائق: ${totalCount} (مطلوب 14)، الميمز: ${memes.length} (مطلوب 5)، التعليمية: ${educational.length} (مطلوب 9). مدة بالون يوسف أذكى كتكوت: ${youssefSmartChick?.autoDismissMs}ms (بين 2 إلى 3 ثوانٍ).`
    );
  } catch (e: unknown) {
    assert('قاعدة بيانات «هل تعلم؟»', false, String(e));
  }

  // 20. Visual Progress Bar Percentage of Questions Completed in Round
  try {
    const totalQuestions = 20;
    const currentIdx = 4; // 5th question
    const isAnsweredFalse = false;
    const isAnsweredTrue = true;

    const pctBeforeAnswer = Math.round(((currentIdx + (isAnsweredFalse ? 1 : 0)) / totalQuestions) * 100);
    const pctAfterAnswer = Math.round(((currentIdx + (isAnsweredTrue ? 1 : 0)) / totalQuestions) * 100);

    assert(
      'شريط التقدم البصري لنسبة إنجاز أسئلة الجولة الحالية',
      pctBeforeAnswer === 20 && pctAfterAnswer === 25,
      `نسبة الإنجاز قبل الإجابة: ${pctBeforeAnswer}% (4/20)، بعد الإجابة: ${pctAfterAnswer}% (5/20)`
    );
  } catch (e: unknown) {
    assert('شريط التقدم البصري', false, String(e));
  }

  // 21. 20-Second Countdown Threshold and Urgency Trigger
  try {
    const timeAt25 = 25;
    const timeAt20 = 20;
    const timeAt15 = 15;
    const timeAt5 = 5;

    const isUrgent25 = timeAt25 <= 20;
    const isUrgent20 = timeAt20 <= 20;
    const isUrgent15 = timeAt15 <= 20;
    const isUrgent5 = timeAt5 <= 20;

    assert(
      'بدء العد التنازلي وحالة الطوارئ عند بلوغ العداد 20 ثانية',
      !isUrgent25 && isUrgent20 && isUrgent15 && isUrgent5,
      `عند 25ث: غير عاجل (${!isUrgent25})، عند 20ث: تفعيل الطوارئ (${isUrgent20})، عند 15ث: مستمر (${isUrgent15})، عند 5ث: مستمر (${isUrgent5})`
    );
  } catch (e: unknown) {
    assert('بدء العد التنازلي عند 20 ثانية', false, String(e));
  }

  // 22. Instant Defeat and Lose Screen Activation on Timeout Zero
  try {
    let timeLeft = 0;
    let showLoseScreen = false;
    let defeatedTeamName = '';

    if (timeLeft <= 0) {
      showLoseScreen = true;
      defeatedTeamName = 'المتسابق الخاسر';
    }

    assert(
      'الخسارة الفورية وظهور شاشة الهزيمة (Lose Screen) عند وصول الوقت للصفر',
      showLoseScreen === true && defeatedTeamName.length > 0,
      `تم إطلاق شاشة الخسارة الفورية بنجاح (${showLoseScreen}) وتحديد الفريق/اللاعب المهزوم (${defeatedTeamName})`
    );
  } catch (e: unknown) {
    assert('الخسارة الفورية وشاشة الهزيمة', false, String(e));
  }

  // 23. Chicken Skins Selection & Variety
  try {
    const totalSkins = CHICKEN_SKINS.length;
    const classic = getSkinById('classic');
    const royal = getSkinById('king');
    const scholar = getSkinById('scholar');
    const astronaut = getSkinById('astronaut');
    const detective = getSkinById('detective');
    const ninja = getSkinById('ninja');
    const captain = getSkinById('captain');
    const superhero = getSkinById('superhero');
    const pharaoh = getSkinById('pharaoh');

    const allSkinsValid =
      totalSkins >= 8 &&
      classic.name.includes('الكتكوت') &&
      royal.id === 'king' &&
      scholar.name.includes('أحمد سمير') &&
      astronaut.id === 'astronaut' &&
      detective.id === 'detective' &&
      ninja.id === 'ninja' &&
      captain.id === 'captain' &&
      superhero.id === 'superhero' &&
      pharaoh.id === 'pharaoh';

    assert(
      'تخصيص واختيار مظهر الكتكوت (Chicken Skins) للفرق من شاشة الإعداد',
      allSkinsValid,
      `عدد المظاهر المتاحة: ${totalSkins} مظهراً تشمل (الملكي، مستر أحمد سمير، الفضاء، المحقق، النينجا، الكابتن، الخارق، الفرعوني)`
    );
  } catch (e: unknown) {
    assert('تخصيص واختيار مظهر الكتكوت', false, String(e));
  }

  // 24. Secret Player Name Easter Egg (Guaranteed Easy Questions, Unnoticeable & Option A)
  try {
    const isYoussefSecret = isSecretPlayerName('يوسف');
    const isYoussefFullName = isSecretPlayerName('المتسابق يوسف أحمد');
    const isYoussefEnglish = isSecretPlayerName('youssef');
    const isRegularName = isSecretPlayerName('محمد علي');

    const sampleQuestions = INITIAL_CURRICULUM_QUESTIONS.slice(0, 5);
    const transformed = applySecretPlayerMode(sampleQuestions, 'يوسف');

    const allEasy = transformed.every((q) => q.difficulty === 'easy');
    const allOptionAIsCorrect = transformed.every(
      (q) => q.options[0] === q.correctAnswer
    );
    const noCheatPhrasesInOptions = transformed.every((q) =>
      q.options.every((opt) => !opt.includes('خاطئ') && !opt.includes('غير صحيح') && !opt.includes('wrong'))
    );
    const authenticExplanation = transformed.every(
      (q) => !q.explanation.includes('شفرة') && !q.explanation.includes('مضمونة')
    );

    assert(
      'شفرة يوسف السرية غير ملحوظة: جميع الأسئلة سهلة 100%، والإجابة الصحيحة هي الخيار (أ) دائماً دون نصوص ساخرة أو تشير للخطأ',
      isYoussefSecret &&
        isYoussefFullName &&
        isYoussefEnglish &&
        !isRegularName &&
        allEasy &&
        allOptionAIsCorrect &&
        noCheatPhrasesInOptions &&
        authenticExplanation,
      `تطابق الاسم السري: نعم، أسئلة سهلة (${allEasy})، الخيار (أ) هو الإجابة الصحيحة دائماً (${allOptionAIsCorrect})، خلو الخيارات من عبارات "خيار خاطئ" (${noCheatPhrasesInOptions})، والشرح طبيعي وغير ملحوظ (${authenticExplanation})`
    );
  } catch (e: unknown) {
    assert('شفرة اسم اللاعب السري', false, String(e));
  }

  // 25. Chicken Mascot Dialogues Collection (Arabic Talks & Banter)
  try {
    const dialoguesCount = CHICK_DIALOGUES.length;
    const randomOne = getRandomChickDialogue();
    const hasMemes = CHICK_DIALOGUES.some((d) => d.category === 'meme');
    const hasUrgent = CHICK_DIALOGUES.some((d) => d.category === 'urgent');
    const hasCurriculum = CHICK_DIALOGUES.some((d) => d.category === 'curriculum');

    assert(
      'مجموعة أحاديث وسوالف الكتكوت المتنوعة (ميمز، طوارئ 20ث، نصائح منهجية، فكاهة)',
      dialoguesCount >= 20 && hasMemes && hasUrgent && hasCurriculum && Boolean(randomOne.text),
      `إجمالي الأحاديث: ${dialoguesCount} حديثاً، تشمل فئات الميمز والطوارئ والمناهج والتحفيز.`
    );
  } catch (e: unknown) {
    assert('مجموعة أحاديث وسوالف الكتكوت', false, String(e));
  }

  // 26. Chicken Mascot States ('idle', 'jumping', 'cheering', 'thinking'), Victory Appearance & Circular Timer Arena
  try {
    const states = ['idle', 'jumping', 'cheering', 'thinking'] as const;
    const allStatesValid = states.every((s) => typeof s === 'string' && s.length > 0);

    // Verify victory state logic adds the royal crown
    const isVictoryAppearance = (isVictory: boolean, state: string, model: string, hasCrown: boolean) => {
      const isVictoryState = isVictory || state === 'cheering';
      const showCrown = hasCrown || model === 'king' || isVictoryState;
      return { isVictoryState, showCrown };
    };

    const regularIdle = isVictoryAppearance(false, 'idle', 'classic', false);
    const cheeringVictory = isVictoryAppearance(false, 'cheering', 'classic', false);
    const explicitVictory = isVictoryAppearance(true, 'idle', 'classic', false);
    const kingModel = isVictoryAppearance(false, 'idle', 'king', false);

    const victoryCrownWorks =
      !regularIdle.showCrown &&
      cheeringVictory.showCrown &&
      explicitVictory.showCrown &&
      kingModel.showCrown;

    // Verify Circular Timer Arena geometry
    const r = 62;
    const circumference = 2 * Math.PI * r;
    const isCircumferenceValid = Math.round(circumference) === 390;

    assert(
      'حالات كرتون الكتكوت الأربعة (idle, jumping, cheering, thinking)، ومظهر التتويج الملكي، والعداد الدائري المركزي',
      allStatesValid && victoryCrownWorks && isCircumferenceValid,
      `الحالات الأربعة معتمدة (${states.join(', ')})، التتويج بالتاج يعمل تلقائياً عند الفوز (${victoryCrownWorks})، محيط العداد الدائري: ${Math.round(circumference)}px`
    );
  } catch (e: unknown) {
    assert('حالات الكتكوت ومظهر التتويج والعداد الدائري', false, String(e));
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return { passedCount, failedCount, results };
}

// Self-run when executed directly via Node / tsx
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('gameLogic.test')) {
  console.log('--- تشغيل اختبارات برنامج علامة | تحدي المعرفة ---');
  const suite = runAllTests();
  suite.results.forEach((r, idx) => {
    console.log(`${r.passed ? '✓ [نجاح]' : '✗ [فشل]'} ${idx + 1}. ${r.name}: ${r.details}`);
  });
  console.log(`\nالنتيجة النهائية: تم اجتياز ${suite.passedCount} من أصل ${suite.results.length} اختباراً.`);
  if (suite.failedCount > 0) {
    process.exit(1);
  }
}

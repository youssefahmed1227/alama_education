/**
 * Types for «علامة | تحدي المعرفة»
 * Educational Quiz Game for Egyptian Prep 3 Social Studies
 */

export type QuestionType =
  | 'mcq'               // اختيار من متعدد
  | 'true_false'         // صح أو خطأ
  | 'ordering'           // ترتيب الأحداث التاريخية
  | 'cause_effect'       // تحديد السبب والنتيجة (بم تفسر وما النتائج)
  | 'historical_figure'  // شخصيات وتواريخ وأحداث
  | 'comparison'         // مقارنة بين السلالات / الأقاليم / المعارك
  | 'deduction'          // استنتاج جغرافي أو تاريخي
  | 'odd_one_out'        // استبعاد الكلمة غير المناسبة / الكلمة الشاذة
  | 'fill_blank'          // أكمل العبارة / إكمال الفراغ
  | 'map_identification' // أسئلة الخريطة وتحديد الظواهر الجغرافية
  | 'who_did_this'       // من صاحب هذا العمل؟
  | 'what_is_the_event'  // ما هو الحدث التاريخي؟
  | 'explanation_prompt' // ما التفسير؟ (تفسير الحدث أو الظاهرة)
  | 'review';            // مراجعة شاملة

export type Difficulty = 'easy' | 'medium' | 'hard';

export type ReviewStatus = 'verified' | 'unreviewed' | 'needs_revision';

export type SourceType =
  | 'curriculum_book'
  | 'official_exam'
  | 'educational_platform'
  | 'original_curriculum_based';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[]; // exactly 4 choices for multiple choice
  correctAnswer: string | string[]; // Single string answer or array of strings for ordering
  explanation: string;
  difficulty: Difficulty;
  unit: string;
  lesson: string;
  topic: string;
  sourceUrl?: string; // Verified link or official reference
  sourceType: SourceType;
  reference?: string; // Book page or official syllabus reference
  reviewStatus: ReviewStatus;
}

export type GameMode = 'single' | 'two_teams' | 'multi_teams';

export type ChickenSkinId =
  | 'classic'
  | 'king'
  | 'scholar'
  | 'ahmed_samir'
  | 'astronaut'
  | 'detective'
  | 'captain'
  | 'ninja'
  | 'superhero'
  | 'pharaoh'
  | 'cool'
  | 'baby'
  | 'explorer';

export interface Team {
  id: string;
  name: string;
  color: string;
  avatar: string;
  chickenSkin?: ChickenSkinId;
  score: number;
  correctCount: number;
  wrongCount: number;
  timeoutCount: number;
}

export interface GameSettings {
  questionCount: number; // 10, 20, 30
  timePerQuestion: number; // 10, 15, 20, 30, 45, 60 (or 0 for no limit)
  difficulty: 'all' | Difficulty;
  selectedTopics: string[]; // filter topics or empty for all
  correctPoints: number; // default 10
  wrongPenalty: number; // default 0 (can be -5 if enabled)
  keepTurnOnCorrect: boolean; // default true
  passTurnOnWrong: boolean; // default true
  soundEnabled: boolean; // default true
  reducedMotion: boolean; // default false
}

export interface RoundAnswerRecord {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  teamId: string;
  teamName: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
  isTimeout: boolean;
  pointsAwarded: number;
  explanation: string;
  topic: string;
}

export interface RoundHistory {
  id: string;
  timestamp: number;
  dateStr: string;
  mode: GameMode;
  teams: Team[];
  winnerTeamId: string | 'tie' | null;
  winnerName: string;
  totalQuestions: number;
  answeredCount: number;
  answers: RoundAnswerRecord[];
}

export type ActiveScreen =
  | 'home'
  | 'setup'
  | 'team_setup'
  | 'game'
  | 'final_score'
  | 'round_review'
  | 'question_bank'
  | 'history'
  | 'rules_settings'
  | 'teacher_guide'
  | 'usb_export';

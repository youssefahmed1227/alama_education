/**
 * Centralized Easter Egg & Custom Celebration Rules
 * Configurable matching rule for «يوسف» and other custom celebration triggers,
 * plus the secret player name logic for guaranteed easy questions and secret name answers.
 */

import { Question } from '../types';

export interface EasterEggConfig {
  targetNames: string[];
  enabled: boolean;
  durationMs: number;
}

export const DEFAULT_EASTER_EGG_CONFIG: EasterEggConfig = {
  targetNames: ['يوسف', 'youssef', 'yousef'],
  enabled: true,
  durationMs: 5000,
};

/**
 * Checks if a winner name qualifies for the special Youssef celebration
 * Only returns true if the winner actually won (not tie, not empty)
 */
export function isYoussefWinner(
  winnerName: string | undefined | null,
  isTie: boolean,
  config: EasterEggConfig = DEFAULT_EASTER_EGG_CONFIG
): boolean {
  if (!config.enabled) return false;
  if (isTie) return false;
  if (!winnerName) return false;

  const normalized = winnerName.trim().toLowerCase();
  if (normalized.length === 0) return false;

  return config.targetNames.some((t) => normalized.includes(t.toLowerCase()));
}

/**
 * Checks if a player/team name matches the Secret Player Name Easter Egg.
 * When typed, player gets all easy questions and all answers are 'a' with the secret name!
 */
export function isSecretPlayerName(name: string | undefined | null): boolean {
  if (!name) return false;
  const clean = name.trim().toLowerCase();
  if (!clean) return false;

  // Matches "يوسف" or "youssef" or "كتكوت يوسف" or contains "يوسف"
  return (
    clean === 'يوسف' ||
    clean === 'youssef' ||
    clean === 'yousef' ||
    clean === 'كتكوت يوسف' ||
    clean.includes('يوسف') ||
    clean.includes('youssef')
  );
}

/**
 * Transforms questions for Secret Player Mode (completely unnoticeable in the classroom):
 * 1. Ensures difficulty is 'easy'
 * 2. Positions the genuine correct answer as Option 'A' (index 0) so the secret player effortlessly picks 'أ' every time
 * 3. Keeps authentic, natural curriculum options (does NOT say "خيار خاطئ" or "غير صحيح" or "this is wrong")
 * 4. Preserves genuine educational explanation so nobody in the room notices
 */
export function applySecretPlayerMode(
  questions: Question[],
  _secretPlayerName: string = 'يوسف'
): Question[] {
  return questions.map((q) => {
    // If ordering or non-4 options, return as easy
    if (q.type === 'ordering' || !q.options || q.options.length !== 4) {
      return { ...q, difficulty: 'easy' as const };
    }

    const correctStr = String(
      Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer
    ).trim();

    // Filter genuine curriculum distractors from the question itself
    const otherOptions = q.options.filter((opt) => opt.trim() !== correctStr);

    // Place true correct answer at index 0 (Option 'A' / الخيار أ) with genuine distractors
    const naturalOptions = [
      correctStr,
      otherOptions[0] || 'قارة إفريقيا',
      otherOptions[1] || 'محمد علي باشا',
      otherOptions[2] || 'جبال الألب',
    ];

    return {
      ...q,
      difficulty: 'easy' as const,
      options: naturalOptions,
      correctAnswer: correctStr,
      explanation: q.explanation,
    };
  });
}

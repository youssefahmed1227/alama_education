/**
 * Storage Service for «علامة | تحدي المعرفة»
 * Robust offline persistence with memory fallback for strict browser environments
 */

import { INITIAL_CURRICULUM_QUESTIONS } from '../data/curriculumQuestions';
import { GameSettings, Question, RoundHistory } from '../types';

const STORAGE_KEYS = {
  QUESTIONS: 'alamah_question_bank_v1',
  HISTORY: 'alamah_match_history_v1',
  SETTINGS: 'alamah_game_settings_v1',
  TEAMS: 'alamah_saved_teams_v1',
};

// In-memory fallback if localStorage is disabled or throws
const memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return memoryStore[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // fallback
  }
  memoryStore[key] = value;
}

export const DEFAULT_SETTINGS: GameSettings = {
  questionCount: 10,
  timePerQuestion: 20,
  difficulty: 'all',
  selectedTopics: [],
  correctPoints: 10,
  wrongPenalty: 0,
  keepTurnOnCorrect: true,
  passTurnOnWrong: true,
  soundEnabled: true,
  reducedMotion: false,
};

export class StorageService {
  /**
   * Load Questions from storage or fallback to verified bank
   */
  public static loadQuestions(): Question[] {
    const raw = safeGetItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      this.saveQuestions(INITIAL_CURRICULUM_QUESTIONS);
      return [...INITIAL_CURRICULUM_QUESTIONS];
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge updated verified bank with any teacher-added custom questions
        const verifiedIds = new Set(INITIAL_CURRICULUM_QUESTIONS.map((q) => q.id));
        const customQuestions = parsed.filter((q: Question) => !verifiedIds.has(q.id));
        const merged = [...INITIAL_CURRICULUM_QUESTIONS, ...customQuestions];
        return merged;
      }
    } catch {
      // corrupt data
    }
    return [...INITIAL_CURRICULUM_QUESTIONS];
  }

  /**
   * Save questions to storage
   */
  public static saveQuestions(questions: Question[]): void {
    safeSetItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }

  /**
   * Add a new question with validation
   */
  public static addQuestion(newQuestion: Question): { success: boolean; error?: string } {
    const list = this.loadQuestions();
    // Check duplicates by exact or near text
    const cleanText = newQuestion.text.trim().toLowerCase();
    const existing = list.find((q) => q.text.trim().toLowerCase() === cleanText);
    if (existing) {
      return { success: false, error: 'يوجد سؤال مطابق بالفعل في بنك الأسئلة!' };
    }
    list.unshift(newQuestion);
    this.saveQuestions(list);
    return { success: true };
  }

  /**
   * Update existing question
   */
  public static updateQuestion(updated: Question): boolean {
    const list = this.loadQuestions();
    const index = list.findIndex((q) => q.id === updated.id);
    if (index === -1) return false;
    list[index] = updated;
    this.saveQuestions(list);
    return true;
  }

  /**
   * Delete question
   */
  public static deleteQuestion(id: string): boolean {
    const list = this.loadQuestions();
    const filtered = list.filter((q) => q.id !== id);
    if (filtered.length === list.length) return false;
    this.saveQuestions(filtered);
    return true;
  }

  /**
   * Reset question bank to factory defaults
   */
  public static resetQuestions(): Question[] {
    this.saveQuestions(INITIAL_CURRICULUM_QUESTIONS);
    return [...INITIAL_CURRICULUM_QUESTIONS];
  }

  /**
   * Load Settings
   */
  public static loadSettings(): GameSettings {
    const raw = safeGetItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * Save Settings
   */
  public static saveSettings(settings: GameSettings): void {
    safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  /**
   * Load Match History
   */
  public static loadHistory(): RoundHistory[] {
    const raw = safeGetItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Save a completed round into History
   */
  public static saveRoundToHistory(round: RoundHistory): void {
    const history = this.loadHistory();
    history.unshift(round);
    // Keep last 100 rounds
    if (history.length > 100) history.pop();
    safeSetItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }

  /**
   * Delete a round from history
   */
  public static deleteRoundFromHistory(id: string): void {
    const history = this.loadHistory();
    const filtered = history.filter((h) => h.id !== id);
    safeSetItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
  }

  /**
   * Clear all history
   */
  public static clearHistory(): void {
    safeSetItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
  }

  /**
   * Export questions to JSON string
   */
  public static exportQuestionsJSON(): string {
    const questions = this.loadQuestions();
    return JSON.stringify(questions, null, 2);
  }

  /**
   * Export Match History to CSV for teachers
   */
  public static exportHistoryCSV(): string {
    const history = this.loadHistory();
    if (history.length === 0) return 'لا توجد بيانات مسابقات سابقة';

    const headers = ['التاريخ', 'الوضع', 'الفائز', 'النتيجة', 'عدد الأسئلة', 'الفرق'];
    const rows = history.map((h) => [
      `"${h.dateStr}"`,
      `"${h.mode === 'single' ? 'لاعب واحد' : h.mode === 'two_teams' ? 'فريقان' : 'متعدد الفرق'}"`,
      `"${h.winnerName}"`,
      `"${h.teams.map((t) => `${t.name}: ${t.score}`).join(' | ')}"`,
      `"${h.totalQuestions}"`,
      `"${h.teams.map((t) => t.name).join(' ضد ')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

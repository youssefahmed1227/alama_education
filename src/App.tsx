/**
 * «علامة | تحدي المعرفة»
 * Main Application Component for Egyptian Prep 3 Social Studies Quiz System
 */

import React, { useState, useEffect } from 'react';
import { ActiveScreen, GameMode, GameSettings, Question, RoundAnswerRecord, RoundHistory, Team } from './types';
import { DEFAULT_SETTINGS, StorageService } from './services/storage';
import { soundEngine } from './services/audio';
import { isSecretPlayerName, applySecretPlayerMode } from './services/easterEgg';

// Components
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { TeamSetupScreen } from './components/TeamSetupScreen';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { FinalScoreScreen } from './components/FinalScoreScreen';
import { RoundReviewScreen } from './components/RoundReviewScreen';
import { QuestionBankManager } from './components/QuestionBankManager';
import { HistoryScreen } from './components/HistoryScreen';
import { SettingsModal } from './components/SettingsModal';
import { TeacherGuideModal } from './components/TeacherGuideModal';
import { UsbExportModal } from './components/UsbExportModal';
import { ConfettiCanvas } from './components/ConfettiCanvas';

export default function App() {
  // Navigation & Screen State
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [gameMode, setGameMode] = useState<GameMode>('two_teams');

  // Persistence State
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [questionsBank, setQuestionsBank] = useState<Question[]>([]);
  const [historyList, setHistoryList] = useState<RoundHistory[]>([]);

  // Active Round State
  const [teams, setTeams] = useState<Team[]>([]);
  const [roundQuestions, setRoundQuestions] = useState<Question[]>([]);
  const [roundAnswers, setRoundAnswers] = useState<RoundAnswerRecord[]>([]);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  // Review specific answers
  const [reviewAnswersList, setReviewAnswersList] = useState<RoundAnswerRecord[]>([]);

  // Load initial data on mount
  useEffect(() => {
    const loadedSettings = StorageService.loadSettings();
    const loadedQuestions = StorageService.loadQuestions();
    const loadedHistory = StorageService.loadHistory();

    setSettings(loadedSettings);
    setQuestionsBank(loadedQuestions);
    setHistoryList(loadedHistory);
    soundEngine.setSoundEnabled(loadedSettings.soundEnabled);
  }, []);

  // Initialize Default Teams for a given mode
  const initTeamsForMode = (mode: GameMode): Team[] => {
    if (mode === 'single') {
      return [
        {
          id: 'player-1',
          name: 'المتسابق يوسف',
          color: '#3B82F6',
          avatar: '🐥',
          score: 0,
          correctCount: 0,
          wrongCount: 0,
          timeoutCount: 0,
        },
      ];
    } else if (mode === 'two_teams') {
      return [
        {
          id: 'team-1',
          name: 'فريق النسور',
          color: '#3B82F6',
          avatar: '🦅',
          score: 0,
          correctCount: 0,
          wrongCount: 0,
          timeoutCount: 0,
        },
        {
          id: 'team-2',
          name: 'فريق الأبطال',
          color: '#F59E0B',
          avatar: '🦁',
          score: 0,
          correctCount: 0,
          wrongCount: 0,
          timeoutCount: 0,
        },
      ];
    } else {
      // multi_teams (3 teams initial)
      return [
        {
          id: 'team-1',
          name: 'المجموعة الأولى',
          color: '#3B82F6',
          avatar: '⚡',
          score: 0,
          correctCount: 0,
          wrongCount: 0,
          timeoutCount: 0,
        },
        {
          id: 'team-2',
          name: 'المجموعة الثانية',
          color: '#F59E0B',
          avatar: '🌟',
          score: 0,
          correctCount: 0,
          wrongCount: 0,
          timeoutCount: 0,
        },
        {
          id: 'team-3',
          name: 'المجموعة الثالثة',
          color: '#10B981',
          avatar: '🚀',
          score: 0,
          correctCount: 0,
          wrongCount: 0,
          timeoutCount: 0,
        },
      ];
    }
  };

  // When user selects a game mode from Home
  const handleSelectMode = (mode: GameMode) => {
    soundEngine.playClick();
    setGameMode(mode);
    setTeams(initTeamsForMode(mode));
    setActiveScreen('team_setup');
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    soundEngine.setSoundEnabled(newSettings.soundEnabled);
  };

  // Toggle Sound from Navbar
  const handleToggleSound = () => {
    const nextState = !settings.soundEnabled;
    handleUpdateSettings({ ...settings, soundEnabled: nextState });
  };

  // Start Game: Select and shuffle non-repeating questions
  const handleStartGame = () => {
    soundEngine.playClick();

    // Check Secret Player Name Easter Egg:
    // If any team/player has typed the secret name (e.g. "يوسف"):
    // "they get all easy questions and all answers are a only the secret name"
    const secretTeam = teams.find((t) => isSecretPlayerName(t.name));

    if (secretTeam) {
      let easyPool = questionsBank.filter((q) => q.difficulty === 'easy');
      if (easyPool.length === 0) {
        easyPool = [...questionsBank];
      }
      const shuffled = [...easyPool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const selected = shuffled.slice(0, Math.min(settings.questionCount, shuffled.length));
      const secretName = secretTeam.name.trim() || 'يوسف';
      const secretQuestions = applySecretPlayerMode(selected, secretName);
      setRoundQuestions(secretQuestions);
    } else {
      // 1. Filter by topics if specified
      let pool = [...questionsBank];
      if (settings.selectedTopics.length > 0) {
        pool = pool.filter((q) => settings.selectedTopics.includes(q.topic));
      }

      // 2. Filter by difficulty if specified
      if (settings.difficulty !== 'all') {
        const diffPool = pool.filter((q) => q.difficulty === settings.difficulty);
        if (diffPool.length >= 5) {
          pool = diffPool;
        }
      }

      // Fallback if filter too restrictive
      if (pool.length === 0) {
        pool = [...questionsBank];
      }

      // 3. Shuffle thoroughly (Fisher-Yates) to ensure zero repetition in the round
      const shuffled = [...pool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // 4. Slice to requested questionCount (10, 20, 30)
      const selected = shuffled.slice(0, Math.min(settings.questionCount, shuffled.length));
      setRoundQuestions(selected);
    }

    // Reset team scores and stats for the new round
    const resetTeams = teams.map((t) => ({
      ...t,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      timeoutCount: 0,
    }));
    setTeams(resetTeams);
    setRoundAnswers([]);

    setActiveScreen('game');
  };

  // Finish Round: Save results and show final score screen
  const handleFinishRound = (answers: RoundAnswerRecord[], finalTeams: Team[]) => {
    setRoundAnswers(answers);
    setTeams(finalTeams);

    // Determine winner
    const sorted = [...finalTeams].sort((a, b) => b.score - a.score);
    const isTie = sorted.length > 1 && sorted[0].score === sorted[1].score && sorted[0].score > 0;
    const winner = sorted[0];

    const historyRecord: RoundHistory = {
      id: `round-${Date.now()}`,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      mode: gameMode,
      teams: finalTeams,
      winnerTeamId: isTie ? 'tie' : winner.id,
      winnerName: isTie ? 'تعادل الفريقين' : winner.name,
      totalQuestions: answers.length,
      answeredCount: answers.length,
      answers,
    };

    // Save to persistence
    StorageService.saveRoundToHistory(historyRecord);
    setHistoryList(StorageService.loadHistory());

    // Trigger celebration effects
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 5000);

    setActiveScreen('final_score');
  };

  // Replay with same teams
  const handlePlayAgain = () => {
    handleStartGame();
  };

  // Review answers of completed round
  const handleReviewCurrentRound = () => {
    setReviewAnswersList(roundAnswers);
    setActiveScreen('round_review');
  };

  // Review answers from history list
  const handleViewHistoricalAnswers = (answers: RoundAnswerRecord[]) => {
    setReviewAnswersList(answers);
    setActiveScreen('round_review');
  };

  // Refresh questions bank
  const handleRefreshQuestions = () => {
    const list = StorageService.loadQuestions();
    setQuestionsBank(list);
  };

  // Refresh history list
  const handleRefreshHistory = () => {
    const list = StorageService.loadHistory();
    setHistoryList(list);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Confetti Canvas for Victory Celebrations */}
      <ConfettiCanvas active={confettiActive} duration={4000} />

      {/* Top Bar Navigation */}
      <Navbar
        activeScreen={activeScreen}
        onNavigate={(screen) => setActiveScreen(screen)}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        inGame={activeScreen === 'game'}
        onConfirmQuitGame={() => setActiveScreen('home')}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full">
        {activeScreen === 'home' && (
          <HomeScreen
            onSelectMode={handleSelectMode}
            onNavigate={(screen) => setActiveScreen(screen)}
            totalQuestions={questionsBank.length}
            completedRoundsCount={historyList.length}
          />
        )}

        {activeScreen === 'team_setup' && (
          <TeamSetupScreen
            mode={gameMode}
            teams={teams}
            onUpdateTeams={(updated) => setTeams(updated)}
            onProceedToRoundSetup={() => setActiveScreen('setup')}
            onBack={() => setActiveScreen('home')}
          />
        )}

        {activeScreen === 'setup' && (
          <SetupScreen
            settings={settings}
            teams={teams}
            totalAvailableQuestions={questionsBank.length}
            onUpdateSettings={handleUpdateSettings}
            onStartGame={handleStartGame}
            onBack={() => setActiveScreen('team_setup')}
          />
        )}

        {activeScreen === 'game' && (
          <GameScreen
            questions={roundQuestions}
            teams={teams}
            settings={settings}
            onFinishRound={handleFinishRound}
            onQuitRound={() => setActiveScreen('home')}
          />
        )}

        {activeScreen === 'final_score' && (
          <FinalScoreScreen
            mode={gameMode}
            teams={teams}
            answers={roundAnswers}
            reducedMotion={settings.reducedMotion}
            onPlayAgain={handlePlayAgain}
            onReviewAnswers={handleReviewCurrentRound}
            onGoHome={() => setActiveScreen('home')}
          />
        )}

        {activeScreen === 'round_review' && (
          <RoundReviewScreen
            answers={reviewAnswersList}
            onBackToFinalScores={() => setActiveScreen('final_score')}
          />
        )}

        {activeScreen === 'question_bank' && (
          <QuestionBankManager
            questions={questionsBank}
            onRefreshQuestions={handleRefreshQuestions}
            onBack={() => setActiveScreen('home')}
          />
        )}

        {activeScreen === 'history' && (
          <HistoryScreen
            history={historyList}
            onRefreshHistory={handleRefreshHistory}
            onViewRoundDetails={handleViewHistoricalAnswers}
            onBack={() => setActiveScreen('home')}
          />
        )}

        {activeScreen === 'rules_settings' && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onBack={() => setActiveScreen('home')}
          />
        )}

        {activeScreen === 'teacher_guide' && (
          <TeacherGuideModal onBack={() => setActiveScreen('home')} />
        )}

        {activeScreen === 'usb_export' && (
          <UsbExportModal onBack={() => setActiveScreen('home')} />
        )}
      </main>

      {/* Quiet Classroom Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            برنامج «علامة | تحدي المعرفة» © 2026–2027 — مخصص للمدارس المصرية (الصف الثالث الإعدادي)
          </span>
          <span className="text-slate-600">
            يعمل 100% دون إنترنت · جاهز للفلاشة USB
          </span>
        </div>
      </footer>
    </div>
  );
}

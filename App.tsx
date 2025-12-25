import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { BadgesScreen } from './src/screens/BadgesScreen';

import { UserProgress, VerbGroup, Level, Badge, GameResults } from './src/types';
import {
  loadProgress,
  saveProgress,
  updateStreak,
  checkForNewBadges,
  calculateLevel,
  initialProgress,
  updateSRAfterAnswer,
} from './src/utils/storage';
import { colors } from './src/utils/theme';

// Screen types
type Screen = 'home' | 'game' | 'results' | 'progress' | 'badges';

interface GameConfig {
  group: VerbGroup;
  level: Level;
}


export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  // Load progress on app start
  useEffect(() => {
    const init = async () => {
      try {
        const savedProgress = await loadProgress();
        // Update streak
        const updatedProgress = updateStreak(savedProgress);
        setProgress(updatedProgress);
        await saveProgress(updatedProgress);
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Start game
  const handleStartGame = useCallback((group: VerbGroup, level: Level) => {
    setGameConfig({ group, level });
    setCurrentScreen('game');
  }, []);

  // Exit game
  const handleExitGame = useCallback(() => {
    setGameConfig(null);
    setCurrentScreen('home');
  }, []);

  // Game complete
  const handleGameComplete = useCallback(
    async (results: GameResults) => {
      setGameResults(results);

      // Calculate stars earned (1-3 based on accuracy)
      const accuracy = results.correctAnswers / results.totalQuestions;
      let starsEarned = 0;
      if (accuracy >= 0.9) starsEarned = 3;
      else if (accuracy >= 0.7) starsEarned = 2;
      else if (accuracy >= 0.5) starsEarned = 1;

      // Update progress
      let updatedProgress: UserProgress = {
        ...progress,
        totalPoints: progress.totalPoints + results.pointsEarned,
        stars: progress.stars + starsEarned,
        gamesPlayed: progress.gamesPlayed + 1,
        correctAnswers: progress.correctAnswers + results.correctAnswers,
        totalAnswers: progress.totalAnswers + results.totalQuestions,
      };

      // Update Spaced Repetition data for each exercise
      if (results.exerciseResults) {
        for (const result of results.exerciseResults) {
          updatedProgress = updateSRAfterAnswer(
            updatedProgress,
            result.verbId,
            result.tense,
            result.isCorrect
          );
        }
      }

      // Check for level up
      const oldLevel = progress.currentLevel;
      const calculatedLevel = calculateLevel(updatedProgress.totalPoints);
      updatedProgress.currentLevel = calculatedLevel;

      if (calculatedLevel > oldLevel) {
        setLeveledUp(true);
        setNewLevel(calculatedLevel);
      } else {
        setLeveledUp(false);
      }

      // Check for new badges
      const earnedBadges = checkForNewBadges(updatedProgress);
      if (earnedBadges.length > 0) {
        updatedProgress.badges = [...updatedProgress.badges, ...earnedBadges];
        setNewBadges(earnedBadges);
      } else {
        setNewBadges([]);
      }

      // Add perfect round badge if applicable
      if (results.perfectRound) {
        const hasPerfectBadge = updatedProgress.badges.some(
          (b) => b.id === 'first_perfect'
        );
        if (!hasPerfectBadge) {
          const perfectBadge: Badge = {
            id: 'first_perfect',
            name: 'Perfekt Runde',
            description: 'Fullført en runde uten feil',
            icon: '✨',
            earnedDate: new Date().toISOString(),
            category: 'special',
          };
          updatedProgress.badges.push(perfectBadge);
          setNewBadges((prev) => [...prev, perfectBadge]);
        }
      }

      setProgress(updatedProgress);
      await saveProgress(updatedProgress);

      setCurrentScreen('results');
    },
    [progress]
  );

  // Play again
  const handlePlayAgain = useCallback(() => {
    if (gameConfig) {
      setCurrentScreen('game');
    }
  }, [gameConfig]);

  // Go home
  const handleGoHome = useCallback(() => {
    setGameConfig(null);
    setGameResults(null);
    setNewBadges([]);
    setLeveledUp(false);
    setCurrentScreen('home');
  }, []);

  // Show progress
  const handleShowProgress = useCallback(() => {
    setCurrentScreen('progress');
  }, []);

  // Show badges
  const handleShowBadges = useCallback(() => {
    setCurrentScreen('badges');
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="dark" />
      </View>
    );
  }

  // Calculate stars earned for results screen
  const starsEarned = gameResults
    ? gameResults.correctAnswers / gameResults.totalQuestions >= 0.9
      ? 3
      : gameResults.correctAnswers / gameResults.totalQuestions >= 0.7
      ? 2
      : gameResults.correctAnswers / gameResults.totalQuestions >= 0.5
      ? 1
      : 0
    : 0;

  return (
    <>
      <StatusBar style="dark" />

      {currentScreen === 'home' && (
        <HomeScreen
          progress={progress}
          onStartGame={handleStartGame}
          onShowProgress={handleShowProgress}
          onShowBadges={handleShowBadges}
        />
      )}

      {currentScreen === 'game' && gameConfig && (
        <GameScreen
          group={gameConfig.group}
          level={gameConfig.level}
          progress={progress}
          onComplete={handleGameComplete}
          onExit={handleExitGame}
        />
      )}

      {currentScreen === 'results' && gameResults && (
        <ResultsScreen
          correctAnswers={gameResults.correctAnswers}
          totalQuestions={gameResults.totalQuestions}
          pointsEarned={gameResults.pointsEarned}
          starsEarned={starsEarned}
          newBadges={newBadges}
          leveledUp={leveledUp}
          newLevel={newLevel}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
        />
      )}

      {currentScreen === 'progress' && (
        <ProgressScreen progress={progress} onBack={handleGoHome} />
      )}

      {currentScreen === 'badges' && (
        <BadgesScreen progress={progress} onBack={handleGoHome} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

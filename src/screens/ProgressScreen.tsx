import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';
import { UserProgress, LEVEL_REQUIREMENTS } from '../types';

interface ProgressScreenProps {
  progress: UserProgress;
  onBack: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  progress,
  onBack,
}) => {
  const currentLevelReq = LEVEL_REQUIREMENTS[progress.currentLevel - 1] || LEVEL_REQUIREMENTS[0];
  const nextLevelReq = LEVEL_REQUIREMENTS[progress.currentLevel] || null;

  const pointsToNextLevel = nextLevelReq
    ? nextLevelReq.pointsRequired - progress.totalPoints
    : 0;

  const levelProgress = nextLevelReq
    ? ((progress.totalPoints - currentLevelReq.pointsRequired) /
        (nextLevelReq.pointsRequired - currentLevelReq.pointsRequired)) *
      100
    : 100;

  const accuracy = progress.totalAnswers > 0
    ? Math.round((progress.correctAnswers / progress.totalAnswers) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Tilbake</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Din Fremgang</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Level Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{progress.currentLevel}</Text>
          </View>
          <Text style={styles.levelTitle}>Nivå {progress.currentLevel}</Text>

          {nextLevelReq && (
            <>
              <View style={styles.levelProgressBar}>
                <View
                  style={[
                    styles.levelProgressFill,
                    { width: `${Math.min(100, Math.max(0, levelProgress))}%` },
                  ]}
                />
              </View>
              <Text style={styles.levelProgressText}>
                {pointsToNextLevel} poeng til neste nivå
              </Text>
            </>
          )}
          {!nextLevelReq && (
            <Text style={styles.maxLevelText}>Maks nivå nådd!</Text>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>{progress.totalPoints}</Text>
            <Text style={styles.statLabel}>Totale poeng</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{progress.stars}</Text>
            <Text style={styles.statLabel}>Stjerner</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{progress.streakDays}</Text>
            <Text style={styles.statLabel}>Dager streak</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎮</Text>
            <Text style={styles.statValue}>{progress.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Spill</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Nøyaktighet</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏅</Text>
            <Text style={styles.statValue}>{progress.badges.length}</Text>
            <Text style={styles.statLabel}>Medaljer</Text>
          </View>
        </View>

        {/* Answer Stats */}
        <View style={styles.answerStats}>
          <Text style={styles.sectionTitle}>Svarstatistikk</Text>
          <View style={styles.answerBars}>
            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>Riktige</Text>
              <View style={styles.answerBarContainer}>
                <View
                  style={[
                    styles.answerBar,
                    styles.answerBarCorrect,
                    {
                      width: `${
                        progress.totalAnswers > 0
                          ? (progress.correctAnswers / progress.totalAnswers) * 100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.answerValue}>{progress.correctAnswers}</Text>
            </View>

            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>Feil</Text>
              <View style={styles.answerBarContainer}>
                <View
                  style={[
                    styles.answerBar,
                    styles.answerBarWrong,
                    {
                      width: `${
                        progress.totalAnswers > 0
                          ? ((progress.totalAnswers - progress.correctAnswers) /
                              progress.totalAnswers) *
                            100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.answerValue}>
                {progress.totalAnswers - progress.correctAnswers}
              </Text>
            </View>
          </View>
        </View>

        {/* Motivation */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>
            {progress.streakDays >= 7
              ? '🚀'
              : progress.streakDays >= 3
              ? '💪'
              : '🌱'}
          </Text>
          <Text style={styles.motivationText}>
            {progress.streakDays >= 7
              ? 'Fantastisk streak! Du er ustoppelig!'
              : progress.streakDays >= 3
              ? 'Bra jobba! Fortsett slik!'
              : progress.streakDays >= 1
              ? 'God start! Kom tilbake i morgen!'
              : 'Start din streak i dag!'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  levelCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.textOnPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  levelNumber: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.extrabold,
    color: colors.primary,
  },
  levelTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.textOnPrimary,
    marginBottom: spacing.md,
  },
  levelProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: colors.textOnPrimary,
    borderRadius: borderRadius.full,
  },
  levelProgressText: {
    color: colors.textOnPrimary,
    opacity: 0.9,
    marginTop: spacing.sm,
    fontSize: typography.fontSizes.sm,
  },
  maxLevelText: {
    color: colors.gold,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  answerStats: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  answerBars: {
    gap: spacing.sm,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  answerLabel: {
    width: 60,
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  answerBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  answerBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  answerBarCorrect: {
    backgroundColor: colors.success,
  },
  answerBarWrong: {
    backgroundColor: colors.error,
  },
  answerValue: {
    width: 40,
    textAlign: 'right',
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textPrimary,
  },
  motivationCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  motivationEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  motivationText: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

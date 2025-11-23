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
import { Badge, BADGES, UserProgress } from '../types';

interface BadgesScreenProps {
  progress: UserProgress;
  onBack: () => void;
}

const BadgeCard: React.FC<{
  badge: Omit<Badge, 'earnedDate'>;
  earned: Badge | undefined;
}> = ({ badge, earned }) => {
  const isEarned = !!earned;

  return (
    <View
      style={[
        styles.badgeCard,
        !isEarned && styles.badgeCardLocked,
      ]}
    >
      <View
        style={[
          styles.badgeIcon,
          !isEarned && styles.badgeIconLocked,
        ]}
      >
        <Text style={[styles.badgeEmoji, !isEarned && styles.badgeEmojiLocked]}>
          {isEarned ? badge.icon : '🔒'}
        </Text>
      </View>
      <View style={styles.badgeInfo}>
        <Text style={[styles.badgeName, !isEarned && styles.badgeNameLocked]}>
          {badge.name}
        </Text>
        <Text style={styles.badgeDescription}>{badge.description}</Text>
        {earned && (
          <Text style={styles.badgeDate}>
            Opptjent: {new Date(earned.earnedDate).toLocaleDateString('nb-NO')}
          </Text>
        )}
      </View>
      {isEarned && <Text style={styles.checkmark}>✓</Text>}
    </View>
  );
};

export const BadgesScreen: React.FC<BadgesScreenProps> = ({ progress, onBack }) => {
  const earnedCount = progress.badges.length;
  const totalCount = BADGES.length;

  const groupedBadges = {
    verb_group: BADGES.filter((b) => b.category === 'verb_group'),
    streak: BADGES.filter((b) => b.category === 'streak'),
    accuracy: BADGES.filter((b) => b.category === 'accuracy'),
    level: BADGES.filter((b) => b.category === 'level'),
    special: BADGES.filter((b) => b.category === 'special'),
  };

  const categoryTitles = {
    verb_group: 'Verbgrupper',
    streak: 'Streaks',
    accuracy: 'Nøyaktighet',
    level: 'Nivåer',
    special: 'Spesielle',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Tilbake</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Medaljer</Text>
        <Text style={styles.subtitle}>
          {earnedCount} av {totalCount} opptjent
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(earnedCount / totalCount) * 100}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {Object.entries(groupedBadges).map(([category, badges]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {categoryTitles[category as keyof typeof categoryTitles]}
            </Text>
            {badges.map((badge) => {
              const earned = progress.badges.find((b) => b.id === badge.id);
              return <BadgeCard key={badge.id} badge={badge} earned={earned} />;
            })}
          </View>
        ))}

        {/* Motivation */}
        {earnedCount < totalCount && (
          <View style={styles.motivationCard}>
            <Text style={styles.motivationEmoji}>💪</Text>
            <Text style={styles.motivationText}>
              Fortsett å øve for å låse opp flere medaljer!
            </Text>
          </View>
        )}

        {earnedCount === totalCount && (
          <View style={styles.completedCard}>
            <Text style={styles.completedEmoji}>🏆</Text>
            <Text style={styles.completedText}>
              Gratulerer! Du har samlet alle medaljer!
            </Text>
          </View>
        )}
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
  subtitle: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  progressContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: borderRadius.full,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  badgeCardLocked: {
    backgroundColor: colors.surfaceAlt,
    opacity: 0.7,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  badgeIconLocked: {
    backgroundColor: colors.surfaceAlt,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeEmojiLocked: {
    opacity: 0.5,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  badgeNameLocked: {
    color: colors.textMuted,
  },
  badgeDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeDate: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  checkmark: {
    fontSize: typography.fontSizes.xl,
    color: colors.success,
    fontWeight: typography.fontWeights.bold,
  },
  motivationCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
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
  completedCard: {
    backgroundColor: colors.gold + '20',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  completedEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  completedText: {
    fontSize: typography.fontSizes.base,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: typography.fontWeights.medium,
  },
});

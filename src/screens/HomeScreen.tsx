import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';
import { VerbGroup, Level, UserProgress } from '../types';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  progress: UserProgress;
  onStartGame: (group: VerbGroup, level: Level) => void;
  onShowProgress: () => void;
  onShowBadges: () => void;
}

const VerbGroupCard: React.FC<{
  group: VerbGroup;
  title: string;
  description: string;
  color: string;
  emoji: string;
  onPress: () => void;
}> = ({ group, title, description, color, emoji, onPress }) => {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.groupCard, { borderLeftColor: color }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.groupEmoji, { backgroundColor: color + '20' }]}>
        <Text style={styles.emojiText}>{emoji}</Text>
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupTitle}>{title}</Text>
        <Text style={styles.groupDescription}>{description}</Text>
      </View>
      <Text style={[styles.groupArrow, { color }]}>→</Text>
    </TouchableOpacity>
  );
};

const LevelSelector: React.FC<{
  selectedLevel: Level | null;
  onSelectLevel: (level: Level) => void;
}> = ({ selectedLevel, onSelectLevel }) => {
  const levels: { level: Level; label: string; color: string; description: string }[] = [
    { level: 'lett', label: 'Lett', color: colors.levelEasy, description: 'Kun presens' },
    { level: 'middels', label: 'Middels', color: colors.levelMedium, description: '+ Passé Composé' },
    { level: 'vanskelig', label: 'Vanskelig', color: colors.levelHard, description: 'Alle tider' },
  ];

  return (
    <View style={styles.levelContainer}>
      <Text style={styles.levelTitle}>Velg nivå:</Text>
      <View style={styles.levelButtons}>
        {levels.map(({ level, label, color, description }) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.levelButton,
              selectedLevel === level && { backgroundColor: color, borderColor: color },
            ]}
            onPress={() => onSelectLevel(level)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.levelLabel,
                selectedLevel === level && styles.levelLabelSelected,
              ]}
            >
              {label}
            </Text>
            <Text
              style={[
                styles.levelDescription,
                selectedLevel === level && styles.levelDescriptionSelected,
              ]}
            >
              {description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const StatsBar: React.FC<{ progress: UserProgress }> = ({ progress }) => (
  <View style={styles.statsBar}>
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{progress.currentLevel}</Text>
      <Text style={styles.statLabel}>Nivå</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{progress.totalPoints}</Text>
      <Text style={styles.statLabel}>Poeng</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{progress.stars}</Text>
      <Text style={styles.statLabel}>Stjerner</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{progress.streakDays}</Text>
      <Text style={styles.statLabel}>Streak</Text>
    </View>
  </View>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  onStartGame,
  onShowProgress,
  onShowBadges,
}) => {
  const [selectedGroup, setSelectedGroup] = React.useState<VerbGroup | null>(null);
  const [selectedLevel, setSelectedLevel] = React.useState<Level | null>(null);

  const handleSelectGroup = (group: VerbGroup) => {
    setSelectedGroup(group);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStartGame = () => {
    if (selectedGroup && selectedLevel) {
      onStartGame(selectedGroup, selectedLevel);
    }
  };

  const verbGroups = [
    {
      group: 'ER' as VerbGroup,
      title: 'ER-verb',
      description: 'parler, manger, aimer...',
      color: colors.verbER,
      emoji: '🗣️',
    },
    {
      group: 'IR' as VerbGroup,
      title: 'IR-verb',
      description: 'finir, choisir, réussir...',
      color: colors.verbIR,
      emoji: '🎯',
    },
    {
      group: 'RE' as VerbGroup,
      title: 'RE-verb',
      description: 'vendre, attendre, répondre...',
      color: colors.verbRE,
      emoji: '📦',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>VerbVenture</Text>
          <Text style={styles.subtitle}>Mestre franske verb!</Text>
        </View>

        {/* Stats */}
        <StatsBar progress={progress} />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={onShowProgress}>
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionText}>Fremgang</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={onShowBadges}>
            <Text style={styles.quickActionIcon}>🏆</Text>
            <Text style={styles.quickActionText}>Medaljer</Text>
          </TouchableOpacity>
        </View>

        {/* Verb Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Velg verbgruppe</Text>
          {verbGroups.map((item) => (
            <VerbGroupCard
              key={item.group}
              {...item}
              onPress={() => handleSelectGroup(item.group)}
            />
          ))}
        </View>

        {/* Level Selector - shown when group is selected */}
        {selectedGroup && (
          <LevelSelector
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
          />
        )}

        {/* Start Button */}
        {selectedGroup && selectedLevel && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartGame}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start øvelse!</Text>
            <Text style={styles.startButtonSubtext}>
              {selectedGroup}-verb • {selectedLevel}
            </Text>
          </TouchableOpacity>
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
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  logo: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.extrabold,
    color: colors.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  quickActionText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  groupEmoji: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emojiText: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  groupDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  groupArrow: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
  },
  levelContainer: {
    marginBottom: spacing.lg,
  },
  levelTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  levelButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  levelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  levelLabel: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  levelLabelSelected: {
    color: colors.textOnPrimary,
  },
  levelDescription: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  levelDescriptionSelected: {
    color: colors.textOnPrimary,
    opacity: 0.9,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.lg,
  },
  startButtonText: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textOnPrimary,
  },
  startButtonSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.textOnPrimary,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
});

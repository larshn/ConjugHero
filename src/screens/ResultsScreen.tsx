import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';
import { Badge } from '../types';

const { width } = Dimensions.get('window');

interface ResultsScreenProps {
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
  starsEarned: number;
  newBadges: Badge[];
  leveledUp: boolean;
  newLevel: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  correctAnswers,
  totalQuestions,
  pointsEarned,
  starsEarned,
  newBadges,
  leveledUp,
  newLevel,
  onPlayAgain,
  onGoHome,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const starAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const isPerfect = correctAnswers === totalQuestions;

  useEffect(() => {
    // Trigger celebration haptic
    if (isPerfect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const useNative = Platform.OS !== 'web';

    // Animate entrance
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: useNative,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: useNative,
      }),
    ]).start();

    // Animate stars
    starAnims.forEach((anim, index) => {
      if (index < starsEarned) {
        Animated.sequence([
          Animated.delay(500 + index * 200),
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 5,
            useNativeDriver: useNative,
          }),
        ]).start();
      }
    });
  }, []);

  const getEmoji = () => {
    if (accuracy === 100) return '🏆';
    if (accuracy >= 80) return '🌟';
    if (accuracy >= 60) return '👍';
    return '💪';
  };

  const getMessage = () => {
    if (accuracy === 100) return 'Perfekt! Du er fantastisk!';
    if (accuracy >= 80) return 'Strålende jobba!';
    if (accuracy >= 60) return 'Bra innsats!';
    return 'Fortsett å øve!';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Main result */}
        <Animated.View
          style={[
            styles.resultCard,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>{getEmoji()}</Text>
          <Text style={styles.message}>{getMessage()}</Text>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Din score</Text>
            <Text style={styles.score}>
              {correctAnswers}/{totalQuestions}
            </Text>
            <Text style={styles.accuracy}>{accuracy}% riktig</Text>
          </View>

          {/* Stars */}
          <View style={styles.starsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.star,
                  {
                    transform: [{ scale: starAnims[index] }],
                    opacity: index < starsEarned ? 1 : 0.3,
                  },
                ]}
              >
                ⭐
              </Animated.Text>
            ))}
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>+{pointsEarned}</Text>
            <Text style={styles.statLabel}>Poeng</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>+{starsEarned}</Text>
            <Text style={styles.statLabel}>Stjerner</Text>
          </View>
        </Animated.View>

        {/* Level up notification */}
        {leveledUp && (
          <Animated.View style={[styles.levelUpContainer, { opacity: fadeAnim }]}>
            <Text style={styles.levelUpEmoji}>🎉</Text>
            <Text style={styles.levelUpText}>Nivå opp!</Text>
            <Text style={styles.levelUpLevel}>Du er nå nivå {newLevel}!</Text>
          </Animated.View>
        )}

        {/* New badges */}
        {newBadges.length > 0 && (
          <Animated.View style={[styles.badgesContainer, { opacity: fadeAnim }]}>
            <Text style={styles.badgesTitle}>Nye medaljer!</Text>
            <View style={styles.badgesList}>
              {newBadges.map((badge) => (
                <View key={badge.id} style={styles.badgeItem}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Buttons */}
        <Animated.View style={[styles.buttonsContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.playAgainButton}
            onPress={onPlayAgain}
            activeOpacity={0.8}
          >
            <Text style={styles.playAgainText}>Spill igjen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={onGoHome}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Til hovedmenyen</Text>
          </TouchableOpacity>
        </Animated.View>
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
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    width: width - spacing.md * 2,
    ...shadows.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  message: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreLabel: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  score: {
    fontSize: typography.fontSizes['5xl'],
    fontWeight: typography.fontWeights.extrabold,
    color: colors.primary,
  },
  accuracy: {
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  star: {
    fontSize: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    minWidth: 100,
    ...shadows.sm,
  },
  statValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  levelUpContainer: {
    backgroundColor: colors.gold + '20',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  levelUpEmoji: {
    fontSize: 32,
  },
  levelUpText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  levelUpLevel: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
  },
  badgesContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    width: '100%',
    ...shadows.sm,
  },
  badgesTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  badgeItem: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    minWidth: 80,
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeName: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  playAgainButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  playAgainText: {
    color: colors.textOnPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
  homeButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  homeButtonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
  },
});

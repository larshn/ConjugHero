import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';
import {
  Exercise,
  VerbGroup,
  Level,
  Pronoun,
  UserProgress,
} from '../types';
import {
  generateExerciseRound,
  calculatePoints,
  formatTenseNorwegian,
  shuffleArray,
} from '../utils/exercises';
import { TENSE_EXPLANATIONS, VERB_GROUP_EXPLANATIONS } from '../data/verbs';

const { width } = Dimensions.get('window');

interface GameScreenProps {
  group: VerbGroup;
  level: Level;
  progress: UserProgress;
  onComplete: (results: GameResults) => void;
  onExit: () => void;
}

interface GameResults {
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
  perfectRound: boolean;
}

// Fill-in exercise component
const FillInExercise: React.FC<{
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  feedback: 'correct' | 'wrong' | null;
}> = ({ exercise, onAnswer, feedback }) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim()) {
      onAnswer(input.trim().toLowerCase());
    }
  };

  useEffect(() => {
    setInput('');
  }, [exercise.id]);

  return (
    <View style={styles.exerciseContainer}>
      <View style={styles.verbInfo}>
        <Text style={styles.infinitive}>{exercise.verb.infinitive}</Text>
        <Text style={styles.meaning}>({exercise.verb.norwegianMeaning})</Text>
      </View>

      <View style={styles.tenseInfo}>
        <Text style={styles.tenseLabel}>{formatTenseNorwegian(exercise.tense)}</Text>
      </View>

      <View style={styles.promptContainer}>
        <Text style={styles.pronoun}>{exercise.pronoun}</Text>
        <TextInput
          style={[
            styles.input,
            feedback === 'correct' && styles.inputCorrect,
            feedback === 'wrong' && styles.inputWrong,
          ]}
          value={input}
          onChangeText={setInput}
          placeholder="Skriv bøyningen..."
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleSubmit}
          editable={!feedback}
        />
      </View>

      {!feedback && (
        <TouchableOpacity
          style={[styles.submitButton, !input.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!input.trim()}
        >
          <Text style={styles.submitButtonText}>Sjekk svar</Text>
        </TouchableOpacity>
      )}

      {feedback === 'wrong' && (
        <View style={styles.correctAnswerContainer}>
          <Text style={styles.correctAnswerLabel}>Riktig svar:</Text>
          <Text style={styles.correctAnswer}>{exercise.correctAnswer}</Text>
        </View>
      )}
    </View>
  );
};

// Multiple choice exercise component
const MultipleChoiceExercise: React.FC<{
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  feedback: 'correct' | 'wrong' | null;
  selectedAnswer: string | null;
}> = ({ exercise, onAnswer, feedback, selectedAnswer }) => {
  return (
    <View style={styles.exerciseContainer}>
      <View style={styles.verbInfo}>
        <Text style={styles.infinitive}>{exercise.verb.infinitive}</Text>
        <Text style={styles.meaning}>({exercise.verb.norwegianMeaning})</Text>
      </View>

      <View style={styles.tenseInfo}>
        <Text style={styles.tenseLabel}>{formatTenseNorwegian(exercise.tense)}</Text>
      </View>

      <View style={styles.promptContainer}>
        <Text style={styles.pronounLarge}>{exercise.pronoun} ___?</Text>
      </View>

      <View style={styles.optionsContainer}>
        {exercise.options?.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === exercise.correctAnswer;
          const showCorrect = feedback && isCorrect;
          const showWrong = feedback === 'wrong' && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && !feedback && styles.optionSelected,
                showCorrect && styles.optionCorrect,
                showWrong && styles.optionWrong,
              ]}
              onPress={() => !feedback && onAnswer(option)}
              disabled={!!feedback}
            >
              <Text
                style={[
                  styles.optionText,
                  (showCorrect || (isSelected && !feedback)) && styles.optionTextSelected,
                  showWrong && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Match exercise component
const MatchExercise: React.FC<{
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  feedback: 'correct' | 'wrong' | null;
}> = ({ exercise, onAnswer, feedback }) => {
  const [selectedPronoun, setSelectedPronoun] = useState<Pronoun | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [matchResults, setMatchResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (exercise.matchPairs) {
      setShuffledAnswers(shuffleArray(exercise.matchPairs.map((p) => p.answer)));
    }
    setMatches({});
    setSelectedPronoun(null);
    setMatchResults({});
  }, [exercise.id]);

  const handleSelectPronoun = (pronoun: Pronoun) => {
    setSelectedPronoun(pronoun);
  };

  const handleSelectAnswer = (answer: string) => {
    if (selectedPronoun) {
      const newMatches = { ...matches, [selectedPronoun]: answer };
      setMatches(newMatches);
      setSelectedPronoun(null);

      // Check if all matched
      if (Object.keys(newMatches).length === 6) {
        // Calculate which matches are correct
        const results: Record<string, boolean> = {};
        let allCorrect = true;

        exercise.matchPairs?.forEach((pair) => {
          const isCorrect = newMatches[pair.pronoun] === pair.answer;
          results[pair.pronoun] = isCorrect;
          if (!isCorrect) allCorrect = false;
        });

        setMatchResults(results);
        onAnswer(allCorrect);
      }
    }
  };

  const pronouns: Pronoun[] = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'];

  return (
    <View style={styles.exerciseContainer}>
      <View style={styles.verbInfo}>
        <Text style={styles.infinitive}>{exercise.verb.infinitive}</Text>
        <Text style={styles.meaning}>({exercise.verb.norwegianMeaning})</Text>
      </View>

      <Text style={styles.matchInstruction}>Koble pronomen med riktig bøyning:</Text>

      <View style={styles.matchContainer}>
        <View style={styles.matchColumn}>
          {pronouns.map((pronoun) => {
            const hasMatch = !!matches[pronoun];
            const showResult = Object.keys(matchResults).length > 0;
            const isCorrect = matchResults[pronoun];

            return (
              <TouchableOpacity
                key={pronoun}
                style={[
                  styles.matchItem,
                  selectedPronoun === pronoun && styles.matchItemSelected,
                  hasMatch && !showResult && styles.matchItemPending,
                  showResult && isCorrect && styles.matchItemCorrect,
                  showResult && !isCorrect && styles.matchItemWrong,
                ]}
                onPress={() => !hasMatch && handleSelectPronoun(pronoun)}
                disabled={hasMatch || !!feedback}
              >
                <Text style={styles.matchItemText}>{pronoun}</Text>
                {hasMatch && (
                  <Text style={[
                    styles.matchedAnswer,
                    showResult && isCorrect && styles.matchedAnswerCorrect,
                    showResult && !isCorrect && styles.matchedAnswerWrong,
                  ]}>
                    → {matches[pronoun]} {showResult && (isCorrect ? '✓' : '✗')}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.matchColumn}>
          {shuffledAnswers.map((answer, index) => {
            const isUsed = Object.values(matches).includes(answer);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.matchItem,
                  styles.matchItemAnswer,
                  isUsed && styles.matchItemUsed,
                ]}
                onPress={() => !isUsed && handleSelectAnswer(answer)}
                disabled={isUsed || !selectedPronoun || !!feedback}
              >
                <Text style={[styles.matchItemText, isUsed && styles.matchItemTextUsed]}>
                  {answer}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export const GameScreen: React.FC<GameScreenProps> = ({
  group,
  level,
  progress,
  onComplete,
  onExit,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  // Animation
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const generated = generateExerciseRound(group, level, 10);
    setExercises(generated);
  }, [group, level]);

  const currentExercise = exercises[currentIndex];

  const handleAnswer = useCallback(
    (answer: string | boolean) => {
      if (!currentExercise || feedback) return;

      let isCorrect: boolean;

      if (typeof answer === 'boolean') {
        isCorrect = answer;
      } else {
        isCorrect = answer.toLowerCase() === currentExercise.correctAnswer.toLowerCase();
        setSelectedAnswer(answer);
      }

      if (isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setFeedback('correct');
        setCorrectCount((c) => c + 1);
        const points = calculatePoints(true, level, currentExercise.type);
        setTotalPoints((p) => p + points);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setFeedback('wrong');
      }
    },
    [currentExercise, feedback, level]
  );

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      // Fade out and in
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setFeedback(null);
        setSelectedAnswer(null);
        setShowExplanation(false);
      }, 150);
    } else {
      // Game complete
      onComplete({
        correctAnswers: correctCount + (feedback === 'correct' ? 0 : 0),
        totalQuestions: exercises.length,
        pointsEarned: totalPoints,
        perfectRound: correctCount === exercises.length,
      });
    }
  };

  if (!currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Laster...</Text>
      </SafeAreaView>
    );
  }

  const progressPercent = ((currentIndex + 1) / exercises.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {exercises.length}
          </Text>
          <Text style={styles.pointsText}>{totalPoints} poeng</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Exercise */}
      <Animated.View style={[styles.exerciseWrapper, { opacity: fadeAnim }]}>
        {currentExercise.type === 'fill_in' && (
          <FillInExercise
            exercise={currentExercise}
            onAnswer={handleAnswer}
            feedback={feedback}
          />
        )}

        {currentExercise.type === 'multiple_choice' && (
          <MultipleChoiceExercise
            exercise={currentExercise}
            onAnswer={handleAnswer}
            feedback={feedback}
            selectedAnswer={selectedAnswer}
          />
        )}

        {currentExercise.type === 'match' && (
          <MatchExercise
            exercise={currentExercise}
            onAnswer={handleAnswer}
            feedback={feedback}
          />
        )}
      </Animated.View>

      {/* Feedback area */}
      {feedback && (
        <View style={styles.feedbackContainer}>
          <View
            style={[
              styles.feedbackBanner,
              feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong,
            ]}
          >
            <Text style={styles.feedbackEmoji}>
              {feedback === 'correct' ? '🎉' : '💪'}
            </Text>
            <Text style={styles.feedbackText}>
              {feedback === 'correct' ? 'Riktig!' : 'Ikke helt!'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.explanationToggle}
            onPress={() => setShowExplanation(!showExplanation)}
          >
            <Text style={styles.explanationToggleText}>
              {showExplanation ? 'Skjul forklaring' : 'Vis forklaring'}
            </Text>
          </TouchableOpacity>

          {showExplanation && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>
                {VERB_GROUP_EXPLANATIONS[currentExercise.verb.group].title}
              </Text>
              <Text style={styles.explanationText}>
                {VERB_GROUP_EXPLANATIONS[currentExercise.verb.group].pattern}
              </Text>
              <Text style={styles.explanationExample}>
                Eks: {VERB_GROUP_EXPLANATIONS[currentExercise.verb.group].example}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex < exercises.length - 1 ? 'Neste →' : 'Se resultater'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitButtonText: {
    fontSize: typography.fontSizes.xl,
    color: colors.textSecondary,
  },
  progressInfo: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  pointsText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  exerciseWrapper: {
    flex: 1,
    padding: spacing.md,
  },
  exerciseContainer: {
    flex: 1,
  },
  verbInfo: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infinitive: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  meaning: {
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  tenseInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tenseLabel: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  promptContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pronoun: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  pronounLarge: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  input: {
    width: '100%',
    maxWidth: 300,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSizes.xl,
    textAlign: 'center',
    backgroundColor: colors.surface,
  },
  inputCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successLight + '20',
  },
  inputWrong: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight + '20',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignSelf: 'center',
    ...shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.textOnPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
  correctAnswerContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  correctAnswerLabel: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
  },
  correctAnswer: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.success,
    marginTop: spacing.xs,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  optionWrong: {
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  optionText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: colors.textOnPrimary,
  },
  matchInstruction: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  matchContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  matchColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  matchItem: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  matchItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  matchItemPending: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '15',
  },
  matchItemCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successLight + '20',
  },
  matchItemWrong: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight + '20',
  },
  matchItemMatched: {
    borderColor: colors.success,
    backgroundColor: colors.successLight + '20',
  },
  matchItemAnswer: {
    backgroundColor: colors.surfaceAlt,
  },
  matchItemUsed: {
    opacity: 0.3,
  },
  matchItemText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textPrimary,
  },
  matchItemTextUsed: {
    color: colors.textMuted,
  },
  matchedAnswer: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  matchedAnswerCorrect: {
    color: colors.success,
  },
  matchedAnswerWrong: {
    color: colors.error,
  },
  feedbackContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  feedbackCorrect: {
    backgroundColor: colors.successLight + '30',
  },
  feedbackWrong: {
    backgroundColor: colors.errorLight + '30',
  },
  feedbackEmoji: {
    fontSize: 24,
  },
  feedbackText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  explanationToggle: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  explanationToggleText: {
    color: colors.primary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  explanationBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  explanationTitle: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  explanationText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  explanationExample: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.md,
  },
  nextButtonText: {
    color: colors.textOnPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
});

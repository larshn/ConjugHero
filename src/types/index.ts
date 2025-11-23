// Verbgrupper
export type VerbGroup = 'ER' | 'IR' | 'RE';

// Nivåer
export type Level = 'lett' | 'middels' | 'vanskelig';

// Verb-tider
export type Tense = 'présent' | 'passé_composé' | 'imparfait' | 'futur_simple';

// Personlige pronomen
export type Pronoun = 'je' | 'tu' | 'il/elle' | 'nous' | 'vous' | 'ils/elles';

// Bøyning for et verb i en tid
export interface Conjugation {
  je: string;
  tu: string;
  'il/elle': string;
  nous: string;
  vous: string;
  'ils/elles': string;
}

// Norske bøyningsformer for hver tid
export interface NorwegianForms {
  présent: string;        // "snakker"
  passé_composé: string;  // "har snakket"
  imparfait: string;      // "snakket"
  futur_simple: string;   // "skal snakke"
}

// Et fransk verb med alle bøyninger
export interface FrenchVerb {
  id: string;
  infinitive: string;
  norwegianMeaning: string;
  norwegianForms: NorwegianForms; // Korrekte norske bøyninger
  group: VerbGroup;
  conjugations: {
    présent: Conjugation;
    passé_composé: Conjugation;
    imparfait: Conjugation;
    futur_simple: Conjugation;
  };
  auxiliaryVerb?: 'avoir' | 'être'; // For passé composé
}

// Oppgavetyper
export type ExerciseType = 'fill_in' | 'multiple_choice' | 'match';

// En oppgave
export interface Exercise {
  id: string;
  type: ExerciseType;
  verb: FrenchVerb;
  tense: Tense;
  pronoun: Pronoun;
  correctAnswer: string;
  options?: string[]; // For multiple choice
  matchPairs?: { pronoun: Pronoun; answer: string }[]; // For matching
}

// Brukerens fremgang
export interface UserProgress {
  totalPoints: number;
  currentLevel: number;
  stars: number;
  badges: Badge[];
  verbProgress: VerbProgress[];
  streakDays: number;
  lastPlayedDate: string;
  gamesPlayed: number;
  correctAnswers: number;
  totalAnswers: number;
}

// Fremgang per verb
export interface VerbProgress {
  verbId: string;
  mastered: boolean;
  correctCount: number;
  incorrectCount: number;
  lastPracticed: string;
  tenseMastery: {
    présent: number;
    passé_composé: number;
    imparfait: number;
    futur_simple: number;
  };
}

// Medaljer/Badges
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: string;
  category: 'verb_group' | 'streak' | 'accuracy' | 'level' | 'special';
}

// Tilgjengelige badges
export const BADGES: Omit<Badge, 'earnedDate'>[] = [
  { id: 'er_beginner', name: 'ER-Nybegynner', description: 'Fullført første ER-verb', icon: '🌱', category: 'verb_group' },
  { id: 'er_master', name: 'ER-Mester', description: 'Mestret 10 ER-verb', icon: '🏆', category: 'verb_group' },
  { id: 'ir_beginner', name: 'IR-Nybegynner', description: 'Fullført første IR-verb', icon: '🌿', category: 'verb_group' },
  { id: 'ir_master', name: 'IR-Mester', description: 'Mestret 10 IR-verb', icon: '🥇', category: 'verb_group' },
  { id: 're_beginner', name: 'RE-Nybegynner', description: 'Fullført første RE-verb', icon: '🌲', category: 'verb_group' },
  { id: 're_master', name: 'RE-Mester', description: 'Mestret 10 RE-verb', icon: '🎖️', category: 'verb_group' },
  { id: 'streak_3', name: '3-dagers Streak', description: 'Øvd 3 dager på rad', icon: '🔥', category: 'streak' },
  { id: 'streak_7', name: 'Ukekriger', description: 'Øvd 7 dager på rad', icon: '⚡', category: 'streak' },
  { id: 'streak_30', name: 'Månedsmester', description: 'Øvd 30 dager på rad', icon: '💫', category: 'streak' },
  { id: 'accuracy_80', name: 'Presis', description: '80% nøyaktighet', icon: '🎯', category: 'accuracy' },
  { id: 'accuracy_95', name: 'Perfeksjonist', description: '95% nøyaktighet', icon: '💎', category: 'accuracy' },
  { id: 'level_5', name: 'Nivå 5', description: 'Nådd nivå 5', icon: '⭐', category: 'level' },
  { id: 'level_10', name: 'Nivå 10', description: 'Nådd nivå 10', icon: '🌟', category: 'level' },
  { id: 'first_perfect', name: 'Perfekt Runde', description: 'Fullført en runde uten feil', icon: '✨', category: 'special' },
  { id: 'all_tenses', name: 'Tidsreisende', description: 'Øvd på alle verbaltider', icon: '⏰', category: 'special' },
];

// Spilltilstand
export interface GameState {
  currentExerciseIndex: number;
  exercises: Exercise[];
  correctAnswers: number;
  wrongAnswers: number;
  pointsEarned: number;
  isComplete: boolean;
  selectedGroup: VerbGroup | null;
  selectedLevel: Level | null;
}

// Nivåkrav
export interface LevelRequirements {
  pointsRequired: number;
  starsRequired: number;
}

export const LEVEL_REQUIREMENTS: LevelRequirements[] = [
  { pointsRequired: 0, starsRequired: 0 },      // Level 1
  { pointsRequired: 100, starsRequired: 3 },    // Level 2
  { pointsRequired: 300, starsRequired: 8 },    // Level 3
  { pointsRequired: 600, starsRequired: 15 },   // Level 4
  { pointsRequired: 1000, starsRequired: 25 },  // Level 5
  { pointsRequired: 1500, starsRequired: 40 },  // Level 6
  { pointsRequired: 2200, starsRequired: 60 },  // Level 7
  { pointsRequired: 3000, starsRequired: 85 },  // Level 8
  { pointsRequired: 4000, starsRequired: 115 }, // Level 9
  { pointsRequired: 5500, starsRequired: 150 }, // Level 10
];

import { Exercise, ExerciseType, FrenchVerb, Level, Pronoun, Tense, VerbGroup, SpacedRepetitionItem } from '../types';
import { getVerbsByGroup, ALL_VERBS } from '../data/verbs';
import { generateSmartExerciseSelection } from './spacedRepetition';

// Pronomen i rekkefølge
const PRONOUNS: Pronoun[] = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'];

// Tider basert på nivå
const getTensesForLevel = (level: Level): Tense[] => {
  switch (level) {
    case 'lett':
      return ['présent'];
    case 'middels':
      return ['présent', 'passé_composé'];
    case 'vanskelig':
      return ['présent', 'passé_composé', 'imparfait', 'futur_simple'];
    default:
      return ['présent'];
  }
};

// Generer tilfeldige feil-svar for multiple choice
const generateWrongAnswers = (
  correctAnswer: string,
  verb: FrenchVerb,
  tense: Tense,
  count: number = 3
): string[] => {
  const wrongAnswers: string[] = [];
  const allConjugations = Object.values(verb.conjugations[tense]);

  // Først, legg til andre bøyninger fra samme verb (unngå duplikater!)
  for (const conj of allConjugations) {
    // Sjekk at det ikke er riktig svar OG ikke allerede lagt til
    if (conj !== correctAnswer && !wrongAnswers.includes(conj) && wrongAnswers.length < count) {
      wrongAnswers.push(conj);
    }
  }

  // Hvis vi trenger flere, generer varianter
  if (wrongAnswers.length < count) {
    // Lag noen typiske feil basert på verbgruppen
    const stem = verb.infinitive.slice(0, -2);
    const wrongEndings = ['e', 'es', 'ons', 'ez', 'ent', 'is', 'it', 'issons', 's', 'ds', 'dons'];

    for (const ending of wrongEndings) {
      const wrong = stem + ending;
      if (wrong !== correctAnswer && !wrongAnswers.includes(wrong) && wrongAnswers.length < count) {
        wrongAnswers.push(wrong);
      }
    }
  }

  return wrongAnswers.slice(0, count);
};

// Bland array (Fisher-Yates shuffle)
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generer én oppgave
export const generateExercise = (
  verb: FrenchVerb,
  tense: Tense,
  type: ExerciseType
): Exercise => {
  const pronoun = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
  const correctAnswer = verb.conjugations[tense][pronoun];

  const exercise: Exercise = {
    id: `${verb.id}-${tense}-${pronoun}-${Date.now()}`,
    type,
    verb,
    tense,
    pronoun,
    correctAnswer,
  };

  if (type === 'multiple_choice') {
    const wrongAnswers = generateWrongAnswers(correctAnswer, verb, tense);
    exercise.options = shuffleArray([correctAnswer, ...wrongAnswers]);
  }

  if (type === 'match') {
    // Generer match-par for alle pronomen
    exercise.matchPairs = PRONOUNS.map(p => ({
      pronoun: p,
      answer: verb.conjugations[tense][p],
    }));
  }

  return exercise;
};

// Generer en hel runde med oppgaver (med valgfri SR-støtte)
export const generateExerciseRound = (
  group: VerbGroup,
  level: Level,
  exerciseCount: number = 10,
  srItems?: SpacedRepetitionItem[]  // Valgfri: SR-data for smart utvalg
): Exercise[] => {
  const verbs = getVerbsByGroup(group);
  const tenses = getTensesForLevel(level);
  const exercises: Exercise[] = [];

  // Bestem oppgavetyper basert på nivå
  const types: ExerciseType[] = level === 'lett'
    ? ['fill_in', 'multiple_choice']
    : ['fill_in', 'multiple_choice', 'match'];

  // Bruk SR-basert utvalg hvis data er tilgjengelig
  let verbTenseSelection: { verb: FrenchVerb; tense: Tense }[];

  if (srItems && srItems.length > 0) {
    // Smart utvalg basert på spaced repetition
    verbTenseSelection = generateSmartExerciseSelection(
      verbs,
      srItems,
      tenses,
      exerciseCount
    );
  } else {
    // Tilfeldig utvalg (fallback)
    verbTenseSelection = [];
    for (let i = 0; i < exerciseCount; i++) {
      verbTenseSelection.push({
        verb: verbs[Math.floor(Math.random() * verbs.length)],
        tense: tenses[Math.floor(Math.random() * tenses.length)],
      });
    }
  }

  verbTenseSelection.forEach((selection, i) => {
    // Varier oppgavetypen
    let type: ExerciseType;
    if (i % 5 === 4 && types.includes('match')) {
      // Hver 5. oppgave er match (hvis tilgjengelig)
      type = 'match';
    } else {
      type = Math.random() > 0.5 ? 'fill_in' : 'multiple_choice';
    }

    exercises.push(generateExercise(selection.verb, selection.tense, type));
  });

  return exercises;
};

// Beregn poeng for et svar
export const calculatePoints = (
  isCorrect: boolean,
  level: Level,
  type: ExerciseType,
  timeBonus: number = 0
): number => {
  if (!isCorrect) return 0;

  let basePoints = 10;

  // Nivåbonus
  switch (level) {
    case 'middels':
      basePoints = 15;
      break;
    case 'vanskelig':
      basePoints = 25;
      break;
  }

  // Oppgavetypebonus
  switch (type) {
    case 'fill_in':
      basePoints += 5; // Vanskeligere enn multiple choice
      break;
    case 'match':
      basePoints += 10; // Må matche alle
      break;
  }

  // Tidsbonus (maks 10 ekstra poeng)
  return basePoints + Math.min(timeBonus, 10);
};

// Norsk formatering av tid
export const formatTenseNorwegian = (tense: Tense): string => {
  switch (tense) {
    case 'présent':
      return 'Presens';
    case 'passé_composé':
      return 'Passé Composé';
    case 'imparfait':
      return 'Imparfait';
    case 'futur_simple':
      return 'Futur';
    default:
      return tense;
  }
};

// Hent norsk bøyningsform for en tid (bruker lagrede former fra verbdata)
export const formatMeaningInTense = (verb: { norwegianForms?: { présent: string; passé_composé: string; imparfait: string; futur_simple: string } }, tense: Tense): string => {
  // Bruk de lagrede norske formene hvis de finnes
  if (verb.norwegianForms) {
    return verb.norwegianForms[tense];
  }
  // Fallback til tom streng hvis ingen former er definert
  return '';
};

// Norsk formatering av nivå
export const formatLevelNorwegian = (level: Level): string => {
  switch (level) {
    case 'lett':
      return 'Lett';
    case 'middels':
      return 'Middels';
    case 'vanskelig':
      return 'Vanskelig';
    default:
      return level;
  }
};

// Norsk formatering av pronomen
export const formatPronounNorwegian = (pronoun: Pronoun): string => {
  switch (pronoun) {
    case 'je':
      return 'Jeg';
    case 'tu':
      return 'Du';
    case 'il/elle':
      return 'Han/Hun';
    case 'nous':
      return 'Vi';
    case 'vous':
      return 'Dere';
    case 'ils/elles':
      return 'De';
    default:
      return pronoun;
  }
};

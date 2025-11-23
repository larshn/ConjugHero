import { Exercise, ExerciseType, FrenchVerb, Level, Pronoun, Tense, VerbGroup } from '../types';
import { getVerbsByGroup, ALL_VERBS } from '../data/verbs';

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

  // Først, legg til andre bøyninger fra samme verb
  for (const conj of allConjugations) {
    if (conj !== correctAnswer && wrongAnswers.length < count) {
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

// Generer en hel runde med oppgaver
export const generateExerciseRound = (
  group: VerbGroup,
  level: Level,
  exerciseCount: number = 10
): Exercise[] => {
  const verbs = getVerbsByGroup(group);
  const tenses = getTensesForLevel(level);
  const exercises: Exercise[] = [];

  // Bestem oppgavetyper basert på nivå
  const types: ExerciseType[] = level === 'lett'
    ? ['fill_in', 'multiple_choice']
    : ['fill_in', 'multiple_choice', 'match'];

  for (let i = 0; i < exerciseCount; i++) {
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const tense = tenses[Math.floor(Math.random() * tenses.length)];

    // Varier oppgavetypen
    let type: ExerciseType;
    if (i % 5 === 4 && types.includes('match')) {
      // Hver 5. oppgave er match (hvis tilgjengelig)
      type = 'match';
    } else {
      type = Math.random() > 0.5 ? 'fill_in' : 'multiple_choice';
    }

    exercises.push(generateExercise(verb, tense, type));
  }

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

// Konverter norsk infinitiv til riktig tid
export const formatMeaningInTense = (norwegianMeaning: string, tense: Tense): string => {
  // Fjern "å " fra begynnelsen hvis det finnes
  const baseVerb = norwegianMeaning.replace(/^å\s+/, '');

  // Håndter sammensatte betydninger (f.eks. "å like / å elske")
  const parts = baseVerb.split(/\s*\/\s*/);

  const conjugatePart = (verb: string): string => {
    // Fjern eventuelt "å " fra delene også
    const cleanVerb = verb.replace(/^å\s+/, '').trim();

    switch (tense) {
      case 'présent':
        // Legg til -r for presens (forenklet)
        if (cleanVerb.endsWith('e')) {
          return cleanVerb + 'r';
        }
        return cleanVerb + 'er';

      case 'passé_composé':
        // Perfektum: har + partisipp
        if (cleanVerb.endsWith('e')) {
          return 'har ' + cleanVerb + 't';
        }
        return 'har ' + cleanVerb + 'd';

      case 'imparfait':
        // Preteritum (pågående)
        if (cleanVerb.endsWith('e')) {
          return cleanVerb + 't';
        }
        return cleanVerb + 'de';

      case 'futur_simple':
        // Futurum: skal + infinitiv
        return 'skal ' + cleanVerb;

      default:
        return cleanVerb;
    }
  };

  return parts.map(conjugatePart).join(' / ');
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

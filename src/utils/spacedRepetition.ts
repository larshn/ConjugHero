/**
 * Spaced Repetition System basert på SM-2 algoritmen
 *
 * SM-2 bruker en "quality" score fra 0-5:
 * 0 - Totalt feil, husket ingenting
 * 1 - Feil, men gjenkjente svaret
 * 2 - Feil, men svaret var på tunga
 * 3 - Riktig, men med mye innsats
 * 4 - Riktig, med litt nøling
 * 5 - Perfekt, umiddelbart riktig
 *
 * For vår app forenkler vi til:
 * - Riktig svar: quality 4 (med nøling) eller 5 (rask)
 * - Feil svar: quality 1
 */

import { SpacedRepetitionItem, Tense, VerbStrength } from '../types';
import { FrenchVerb } from '../types';

// Standardverdier for nye elementer
const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

/**
 * Opprett et nytt SR-element for et verb+tid
 */
export const createSRItem = (verbId: string, tense: Tense): SpacedRepetitionItem => {
  const today = new Date().toISOString().split('T')[0];
  return {
    verbId,
    tense,
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    nextReviewDate: today, // Due umiddelbart
    repetitions: 0,
    lastQuality: 0,
  };
};

/**
 * SM-2 algoritme: Oppdater et element basert på kvalitetsscore
 */
export const updateSRItem = (
  item: SpacedRepetitionItem,
  quality: number // 0-5
): SpacedRepetitionItem => {
  // Begrens quality til 0-5
  const q = Math.max(0, Math.min(5, quality));

  let { easeFactor, interval, repetitions } = item;

  if (q >= 3) {
    // Riktig svar
    if (repetitions === 0) {
      interval = 1; // Første repetisjon: 1 dag
    } else if (repetitions === 1) {
      interval = 6; // Andre repetisjon: 6 dager
    } else {
      // Påfølgende: multipliser med ease factor
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Feil svar - start på nytt
    repetitions = 0;
    interval = 1;
  }

  // Oppdater ease factor (SM-2 formel)
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

  // Beregn neste review-dato
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    ...item,
    easeFactor,
    interval,
    nextReviewDate: nextDate.toISOString().split('T')[0],
    repetitions,
    lastQuality: q,
  };
};

/**
 * Konverter riktig/feil til quality score
 * timeSpentMs: tid brukt på å svare (for å vurdere nøling)
 */
export const getQualityFromAnswer = (
  isCorrect: boolean,
  timeSpentMs?: number
): number => {
  if (!isCorrect) {
    return 1; // Feil, men så svaret
  }

  // Rask = quality 5, treg = quality 3
  if (timeSpentMs !== undefined) {
    if (timeSpentMs < 3000) return 5;  // Under 3 sek = perfekt
    if (timeSpentMs < 8000) return 4;  // Under 8 sek = bra
    return 3; // Tregt, men riktig
  }

  return 4; // Default for riktig svar
};

/**
 * Sjekk om et element er "due" (forfalt til repetisjon)
 */
export const isDue = (item: SpacedRepetitionItem): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return item.nextReviewDate <= today;
};

/**
 * Beregn styrke (0-100) for et SR-element
 * Basert på interval og ease factor
 */
export const calculateStrength = (item: SpacedRepetitionItem): number => {
  // Ny/aldri øvd = 0
  if (item.repetitions === 0) return 0;

  // Basert på interval (opptil 30 dager = 100%)
  const intervalScore = Math.min(100, (item.interval / 30) * 100);

  // Justert for ease factor
  const easeMultiplier = (item.easeFactor - MIN_EASE_FACTOR) / (DEFAULT_EASE_FACTOR - MIN_EASE_FACTOR);

  // Kombiner: 70% interval, 30% ease
  const strength = intervalScore * 0.7 + (easeMultiplier * 100) * 0.3;

  // Reduser hvis forfalt
  if (isDue(item)) {
    const today = new Date();
    const dueDate = new Date(item.nextReviewDate);
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    // Reduser 5% per dag forfalt, minimum 10%
    const penalty = Math.min(0.9, daysOverdue * 0.05);
    return Math.max(10, strength * (1 - penalty));
  }

  return Math.round(strength);
};

/**
 * Beregn samlet verbstyrke fra SR-data
 */
export const calculateVerbStrength = (
  verbId: string,
  srItems: SpacedRepetitionItem[]
): VerbStrength => {
  const verbItems = srItems.filter(item => item.verbId === verbId);

  const tenses: Tense[] = ['présent', 'passé_composé', 'imparfait', 'futur_simple'];

  const tenseStrengths = {
    présent: 0,
    passé_composé: 0,
    imparfait: 0,
    futur_simple: 0,
  };

  let totalStrength = 0;
  let itemCount = 0;
  let anyDue = false;
  let earliestReview: string | null = null;

  tenses.forEach(tense => {
    const item = verbItems.find(i => i.tense === tense);
    if (item) {
      const strength = calculateStrength(item);
      tenseStrengths[tense] = strength;
      totalStrength += strength;
      itemCount++;

      if (isDue(item)) anyDue = true;

      if (!earliestReview || item.nextReviewDate < earliestReview) {
        earliestReview = item.nextReviewDate;
      }
    }
  });

  return {
    verbId,
    overallStrength: itemCount > 0 ? Math.round(totalStrength / itemCount) : 0,
    tenseStrengths,
    isDue: anyDue,
    nextReviewDate: earliestReview,
  };
};

/**
 * Hent verb som trenger øving, sortert etter prioritet
 */
export const getVerbsToReview = (
  allVerbs: FrenchVerb[],
  srItems: SpacedRepetitionItem[],
  tenses: Tense[],
  maxCount: number = 10
): { verb: FrenchVerb; tense: Tense; priority: number }[] => {
  const today = new Date().toISOString().split('T')[0];
  const candidates: { verb: FrenchVerb; tense: Tense; priority: number }[] = [];

  allVerbs.forEach(verb => {
    tenses.forEach(tense => {
      const srItem = srItems.find(
        item => item.verbId === verb.id && item.tense === tense
      );

      let priority: number;

      if (!srItem) {
        // Aldri øvd = høy prioritet for nye elementer
        priority = 50;
      } else if (isDue(srItem)) {
        // Forfalt = høyest prioritet, mer forfalt = høyere
        const dueDate = new Date(srItem.nextReviewDate);
        const todayDate = new Date(today);
        const daysOverdue = Math.floor(
          (todayDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        priority = 100 + daysOverdue * 10;
      } else {
        // Ikke forfalt = lav prioritet
        priority = 0;
      }

      if (priority > 0) {
        candidates.push({ verb, tense, priority });
      }
    });
  });

  // Sorter etter prioritet (høyest først) og ta maks antall
  return candidates
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxCount);
};

/**
 * Miks SR-prioriterte verb med tilfeldige for variasjon
 */
export const generateSmartExerciseSelection = (
  allVerbs: FrenchVerb[],
  srItems: SpacedRepetitionItem[],
  tenses: Tense[],
  count: number = 10
): { verb: FrenchVerb; tense: Tense }[] => {
  const dueItems = getVerbsToReview(allVerbs, srItems, tenses, count);

  // 70% fra SR-prioriterte, 30% tilfeldig
  const srCount = Math.ceil(count * 0.7);
  const randomCount = count - Math.min(dueItems.length, srCount);

  const selected: { verb: FrenchVerb; tense: Tense }[] = [];

  // Legg til SR-prioriterte
  dueItems.slice(0, srCount).forEach(item => {
    selected.push({ verb: item.verb, tense: item.tense });
  });

  // Fyll opp med tilfeldige
  for (let i = 0; i < randomCount; i++) {
    const randomVerb = allVerbs[Math.floor(Math.random() * allVerbs.length)];
    const randomTense = tenses[Math.floor(Math.random() * tenses.length)];
    selected.push({ verb: randomVerb, tense: randomTense });
  }

  // Bland rekkefølgen
  return selected.sort(() => Math.random() - 0.5);
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, Badge, BADGES, SpacedRepetitionItem, Tense } from '../types';
import { createSRItem, updateSRItem, getQualityFromAnswer } from './spacedRepetition';

const STORAGE_KEY = '@verbventure_progress';

// Initial brukerdata
export const initialProgress: UserProgress = {
  totalPoints: 0,
  currentLevel: 1,
  stars: 0,
  badges: [],
  verbProgress: [],
  spacedRepetition: [],
  streakDays: 0,
  lastPlayedDate: '',
  gamesPlayed: 0,
  correctAnswers: 0,
  totalAnswers: 0,
};

// Hent brukerens fremgang (med migrering for eldre data)
export const loadProgress = async (): Promise<UserProgress> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue !== null) {
      const parsed = JSON.parse(jsonValue);
      // Migrering: legg til spacedRepetition hvis det mangler
      if (!parsed.spacedRepetition) {
        parsed.spacedRepetition = [];
      }
      return parsed;
    }
    return initialProgress;
  } catch (e) {
    console.error('Feil ved lasting av fremgang:', e);
    return initialProgress;
  }
};

// Oppdater SR-data etter et svar
export const updateSRAfterAnswer = (
  progress: UserProgress,
  verbId: string,
  tense: Tense,
  isCorrect: boolean,
  timeSpentMs?: number
): UserProgress => {
  const quality = getQualityFromAnswer(isCorrect, timeSpentMs);

  // Finn eller opprett SR-element
  let srItem = progress.spacedRepetition.find(
    item => item.verbId === verbId && item.tense === tense
  );

  if (!srItem) {
    srItem = createSRItem(verbId, tense);
  }

  // Oppdater med SM-2
  const updatedItem = updateSRItem(srItem, quality);

  // Oppdater listen
  const newSRList = progress.spacedRepetition.filter(
    item => !(item.verbId === verbId && item.tense === tense)
  );
  newSRList.push(updatedItem);

  return {
    ...progress,
    spacedRepetition: newSRList,
  };
};

// Lagre brukerens fremgang
export const saveProgress = async (progress: UserProgress): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(progress);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Feil ved lagring av fremgang:', e);
  }
};

// Sjekk og oppdater streak
export const updateStreak = (progress: UserProgress): UserProgress => {
  const today = new Date().toISOString().split('T')[0];
  const lastPlayed = progress.lastPlayedDate;

  if (!lastPlayed) {
    // Første gang brukeren spiller
    return {
      ...progress,
      streakDays: 1,
      lastPlayedDate: today,
    };
  }

  const lastDate = new Date(lastPlayed);
  const todayDate = new Date(today);
  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Allerede spilt i dag
    return progress;
  } else if (diffDays === 1) {
    // Spilt i går, fortsett streak
    return {
      ...progress,
      streakDays: progress.streakDays + 1,
      lastPlayedDate: today,
    };
  } else {
    // Streak brutt
    return {
      ...progress,
      streakDays: 1,
      lastPlayedDate: today,
    };
  }
};

// Sjekk om brukeren har opptjent nye badges
export const checkForNewBadges = (progress: UserProgress): Badge[] => {
  const earnedBadgeIds = progress.badges.map(b => b.id);
  const newBadges: Badge[] = [];
  const today = new Date().toISOString();

  // Sjekk streak badges
  if (progress.streakDays >= 3 && !earnedBadgeIds.includes('streak_3')) {
    const badge = BADGES.find(b => b.id === 'streak_3')!;
    newBadges.push({ ...badge, earnedDate: today });
  }
  if (progress.streakDays >= 7 && !earnedBadgeIds.includes('streak_7')) {
    const badge = BADGES.find(b => b.id === 'streak_7')!;
    newBadges.push({ ...badge, earnedDate: today });
  }
  if (progress.streakDays >= 30 && !earnedBadgeIds.includes('streak_30')) {
    const badge = BADGES.find(b => b.id === 'streak_30')!;
    newBadges.push({ ...badge, earnedDate: today });
  }

  // Sjekk nøyaktighets-badges
  if (progress.totalAnswers >= 10) {
    const accuracy = (progress.correctAnswers / progress.totalAnswers) * 100;
    if (accuracy >= 80 && !earnedBadgeIds.includes('accuracy_80')) {
      const badge = BADGES.find(b => b.id === 'accuracy_80')!;
      newBadges.push({ ...badge, earnedDate: today });
    }
    if (accuracy >= 95 && !earnedBadgeIds.includes('accuracy_95')) {
      const badge = BADGES.find(b => b.id === 'accuracy_95')!;
      newBadges.push({ ...badge, earnedDate: today });
    }
  }

  // Sjekk nivå-badges
  if (progress.currentLevel >= 5 && !earnedBadgeIds.includes('level_5')) {
    const badge = BADGES.find(b => b.id === 'level_5')!;
    newBadges.push({ ...badge, earnedDate: today });
  }
  if (progress.currentLevel >= 10 && !earnedBadgeIds.includes('level_10')) {
    const badge = BADGES.find(b => b.id === 'level_10')!;
    newBadges.push({ ...badge, earnedDate: today });
  }

  // Sjekk verbgruppe-badges
  const erVerbs = progress.verbProgress.filter(v => v.verbId.match(/parler|manger|aimer|regarder|jouer|travailler|ecouter|danser/));
  const irVerbs = progress.verbProgress.filter(v => v.verbId.match(/finir|choisir|reussir|grandir|rougir|reflechir/));
  const reVerbs = progress.verbProgress.filter(v => v.verbId.match(/vendre|attendre|repondre|perdre|entendre|descendre/));

  if (erVerbs.length >= 1 && !earnedBadgeIds.includes('er_beginner')) {
    const badge = BADGES.find(b => b.id === 'er_beginner')!;
    newBadges.push({ ...badge, earnedDate: today });
  }
  if (irVerbs.length >= 1 && !earnedBadgeIds.includes('ir_beginner')) {
    const badge = BADGES.find(b => b.id === 'ir_beginner')!;
    newBadges.push({ ...badge, earnedDate: today });
  }
  if (reVerbs.length >= 1 && !earnedBadgeIds.includes('re_beginner')) {
    const badge = BADGES.find(b => b.id === 're_beginner')!;
    newBadges.push({ ...badge, earnedDate: today });
  }

  return newBadges;
};

// Beregn nytt nivå basert på poeng
export const calculateLevel = (points: number): number => {
  if (points >= 5500) return 10;
  if (points >= 4000) return 9;
  if (points >= 3000) return 8;
  if (points >= 2200) return 7;
  if (points >= 1500) return 6;
  if (points >= 1000) return 5;
  if (points >= 600) return 4;
  if (points >= 300) return 3;
  if (points >= 100) return 2;
  return 1;
};

// Nullstill fremgang
export const resetProgress = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Feil ved nullstilling av fremgang:', e);
  }
};

// Gamification Types
export interface GamificationData {
  userId: string;
  points: number;
  totalPoints: number;
  level: number;
  activitiesJoinedToday: number;
  lastLoginDate: string;
  streak?: number;
  streakDays: number;
  totalActivitiesJoined: number;
  achievements?: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  earnedAt: string;
  category: 'daily' | 'activity' | 'milestone' | 'special' | 'points' | 'level';
}

export interface GamificationConstants {
  POINTS_PER_ACTIVITY: number;
  DAILY_LOGIN_BONUS: number;
  THREE_ACTIVITIES_BONUS: number;
  LEVEL_THRESHOLDS: number[];
}

export interface GamificationSystem {
  awardPointsForActivity: () => void;
  claimDailyBonus: () => void;
  calculateLevel: (points: number) => number;
  getNextLevelThreshold: (currentLevel: number) => number;
}

// Level Benefits
export interface LevelBenefit {
  level: number;
  benefits: string[];
  description: string;
  color: string;
}

// Animation States
export interface AnimationState {
  showPointsAnimation: boolean;
  showLevelUpAnimation: boolean;
  earnedPoints: number;
  newLevel?: number;
}

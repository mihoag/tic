import { GamificationData, GamificationConstants, Achievement, LevelBenefit } from '../types/gamification';

export class GamificationService {
  private static instance: GamificationService;
  private constants: GamificationConstants = {
    POINTS_PER_ACTIVITY: 10,
    DAILY_LOGIN_BONUS: 5,
    THREE_ACTIVITIES_BONUS: 50,
    LEVEL_THRESHOLDS: [0, 100, 250, 500, 1000, 2000, 5000]
  };

  private levelBenefits: LevelBenefit[] = [
    {
      level: 1,
      benefits: ['Basic activity access', 'Profile customization'],
      description: 'Welcome to PingBadge!',
      color: 'blue'
    },
    {
      level: 2,
      benefits: ['Priority notifications', 'Enhanced leaderboard visibility'],
      description: 'You\'re getting the hang of it!',
      color: 'green'
    },
    {
      level: 3,
      benefits: ['Access to premium activities', 'Early activity registration'],
      description: 'Expert level unlocked!',
      color: 'purple'
    },
    {
      level: 4,
      benefits: ['VIP status', 'Exclusive badges', 'Activity creation priority'],
      description: 'Champion status achieved!',
      color: 'gold'
    }
  ];

  public static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // Save/Load user data
  public saveUserData(userId: string, data: GamificationData): void {
    localStorage.setItem(`gamification_${userId}`, JSON.stringify(data));
  }

  public loadUserData(userId: string): GamificationData | null {
    const saved = localStorage.getItem(`gamification_${userId}`);
    return saved ? JSON.parse(saved) : null;
  }

  // Level calculations
  public calculateLevel(points: number): number {
    for (let i = this.constants.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= this.constants.LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  public getNextLevelThreshold(currentLevel: number): number {
    return this.constants.LEVEL_THRESHOLDS[currentLevel] || this.constants.LEVEL_THRESHOLDS[this.constants.LEVEL_THRESHOLDS.length - 1];
  }

  public getProgressToNextLevel(points: number, currentLevel: number): number {
    const currentThreshold = this.constants.LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextThreshold = this.getNextLevelThreshold(currentLevel);
    
    if (nextThreshold === currentThreshold) return 100; // Max level
    
    return Math.min(((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100);
  }

  // Point calculations
  public calculateActivityPoints(activitiesJoinedToday: number): number {
    let points = this.constants.POINTS_PER_ACTIVITY;
    
    // Bonus for third activity
    if (activitiesJoinedToday === 3) {
      points += this.constants.THREE_ACTIVITIES_BONUS;
    }
    
    return points;
  }

  // Daily bonus logic
  public isDailyBonusAvailable(lastLoginDate: string): boolean {
    const today = new Date().toDateString();
    return lastLoginDate !== today;
  }

  public resetDailyProgress(): void {
    // This would be called at midnight or on first login of the day
    // Reset daily counters
  }

  // Achievement system
  public checkAchievements(data: GamificationData): Achievement[] {
    const newAchievements: Achievement[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Daily login achievement
    if (this.isDailyBonusAvailable(data.lastLoginDate)) {
      newAchievements.push({
        id: `daily_login_${today}`,
        name: 'Daily Visitor',
        description: 'Logged in today',
        icon: '🎯',
        points: this.constants.DAILY_LOGIN_BONUS,
        earnedAt: new Date().toISOString(),
        category: 'daily'
      });
    }

    // Activity milestones
    if (data.activitiesJoinedToday === 3) {
      newAchievements.push({
        id: `triple_activity_${today}`,
        name: 'Triple Threat',
        description: 'Joined 3 activities in one day',
        icon: '⚡',
        points: this.constants.THREE_ACTIVITIES_BONUS,
        earnedAt: new Date().toISOString(),
        category: 'milestone'
      });
    }

    return newAchievements;
  }

  // Level benefits
  public getLevelBenefits(level: number): LevelBenefit | undefined {
    return this.levelBenefits.find(benefit => benefit.level === level);
  }

  public getAllLevelBenefits(): LevelBenefit[] {
    return this.levelBenefits;
  }

  // Constants getter
  public getConstants(): GamificationConstants {
    return this.constants;
  }
}

export const gamificationService = GamificationService.getInstance();

import { useState, useEffect, useCallback, useRef } from 'react';
import { GamificationData, Achievement, LevelBenefit } from '../types/gamification';
import { gamificationService } from '../services/gamificationService';

interface UseGamificationReturn {
  data: GamificationData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addPoints: (points: number, reason: string) => Promise<void>;
  joinActivity: () => Promise<void>;
  checkDailyBonus: () => Promise<void>;
  resetDay: () => void;
  
  // Calculations
  currentLevel: number;
  nextLevelThreshold: number;
  progressToNextLevel: number;
  levelBenefits: LevelBenefit | undefined;
  
  // Achievements
  newAchievements: Achievement[];
  clearAchievements: () => void;
}

export function useGamification(userId: string): UseGamificationReturn {
  const [data, setData] = useState<GamificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  
  const dataRef = useRef<GamificationData | null>(null);
  dataRef.current = data;

  // Initialize data
  useEffect(() => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const savedData = gamificationService.loadUserData(userId);
      
      if (savedData) {
        setData(savedData);
      } else {
        // Initialize new user data
        const initialData: GamificationData = {
          userId,
          points: 0,
          totalPoints: 0,
          level: 1,
          activitiesJoinedToday: 0,
          lastLoginDate: '',
          achievements: [],
          streakDays: 0,
          totalActivitiesJoined: 0
        };
        setData(initialData);
        gamificationService.saveUserData(userId, initialData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gamification data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Save data whenever it changes
  useEffect(() => {
    if (data && userId) {
      gamificationService.saveUserData(userId, data);
    }
  }, [data, userId]);

  const addPoints = useCallback(async (points: number, reason: string) => {
    if (!dataRef.current) return;

    const currentData = dataRef.current;
    const newPoints = currentData.totalPoints + points;
    const newLevel = gamificationService.calculateLevel(newPoints);
    
    const achievement: Achievement = {
      id: `points_${Date.now()}`,
      name: 'Points Earned',
      description: reason,
      icon: '⭐',
      points,
      earnedAt: new Date().toISOString(),
      category: 'points'
    };

    const updatedData: GamificationData = {
      ...currentData,
      totalPoints: newPoints,
      level: newLevel,
      achievements: [...(currentData.achievements || []), achievement]
    };

    setData(updatedData);
    setNewAchievements(prev => [...prev, achievement]);

    // Level up notification
    if (newLevel > currentData.level) {
      const levelAchievement: Achievement = {
        id: `level_${newLevel}_${Date.now()}`,
        name: `Level ${newLevel} Unlocked!`,
        description: `You've reached level ${newLevel}`,
        icon: '🏆',
        points: 0,
        earnedAt: new Date().toISOString(),
        category: 'level'
      };
      
      setNewAchievements(prev => [...prev, levelAchievement]);
    }

    // Trigger global gamification update event
    window.dispatchEvent(new CustomEvent('gamificationUpdate', {
      detail: { data: updatedData, newAchievements: [achievement] }
    }));
  }, []);

  const joinActivity = useCallback(async () => {
    if (!dataRef.current) return;

    const currentData = dataRef.current;
    const today = new Date().toDateString();
    
    // Reset daily counter if it's a new day
    const activitiesJoinedToday = currentData.lastLoginDate === today 
      ? currentData.activitiesJoinedToday + 1 
      : 1;

    const activityPoints = gamificationService.calculateActivityPoints(activitiesJoinedToday);
    
    const updatedData: GamificationData = {
      ...currentData,
      activitiesJoinedToday,
      totalActivitiesJoined: currentData.totalActivitiesJoined + 1,
      totalPoints: currentData.totalPoints + activityPoints,
      level: gamificationService.calculateLevel(currentData.totalPoints + activityPoints),
      lastLoginDate: today
    };

    // Check for achievements
    const achievements = gamificationService.checkAchievements(updatedData);
    if (achievements.length > 0) {
      updatedData.achievements = [...(updatedData.achievements || []), ...achievements];
      setNewAchievements(prev => [...prev, ...achievements]);
    }

    setData(updatedData);

    // Add points with proper reason
    let reason = `Joined activity (+${gamificationService.getConstants().POINTS_PER_ACTIVITY} points)`;
    if (activitiesJoinedToday === 3) {
      reason += ` + Triple Activity Bonus (+${gamificationService.getConstants().THREE_ACTIVITIES_BONUS} points)`;
    }

    await addPoints(activityPoints, reason);
  }, [addPoints]);

  const checkDailyBonus = useCallback(async () => {
    if (!dataRef.current) return;

    const currentData = dataRef.current;
    const today = new Date().toDateString();
    
    if (gamificationService.isDailyBonusAvailable(currentData.lastLoginDate)) {
      const dailyBonus = gamificationService.getConstants().DAILY_LOGIN_BONUS;
      
      const updatedData: GamificationData = {
        ...currentData,
        lastLoginDate: today,
        streakDays: currentData.lastLoginDate === new Date(Date.now() - 86400000).toDateString()
          ? currentData.streakDays + 1
          : 1,
        activitiesJoinedToday: 0 // Reset daily activity counter
      };

      setData(updatedData);
      await addPoints(dailyBonus, `Daily login bonus (+${dailyBonus} points)`);
    }
  }, [addPoints]);

  const resetDay = useCallback(() => {
    if (!dataRef.current) return;

    const updatedData: GamificationData = {
      ...dataRef.current,
      activitiesJoinedToday: 0
    };

    setData(updatedData);
  }, []);

  const clearAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  // Calculated values
  const currentLevel = data?.level || 1;
  const nextLevelThreshold = gamificationService.getNextLevelThreshold(currentLevel);
  const progressToNextLevel = data 
    ? gamificationService.getProgressToNextLevel(data.totalPoints, currentLevel)
    : 0;
  const levelBenefits = gamificationService.getLevelBenefits(currentLevel);

  return {
    data,
    isLoading,
    error,
    
    // Actions
    addPoints,
    joinActivity,
    checkDailyBonus,
    resetDay,
    
    // Calculations
    currentLevel,
    nextLevelThreshold,
    progressToNextLevel,
    levelBenefits,
    
    // Achievements
    newAchievements,
    clearAchievements
  };
}

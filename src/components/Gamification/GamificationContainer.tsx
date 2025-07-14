import React from 'react';
import { useGamification } from '../../hooks/useGamification';
import GamificationStats from './GamificationStats';
import PointsAnimation from './PointsAnimation';
import LevelUpModal from './LevelUpModal';
import DailyBonusNotification from './DailyBonusNotification';

interface GamificationContainerProps {
  userId: string;
  isEnabled: boolean;
  isMobile?: boolean;
}

const GamificationContainer: React.FC<GamificationContainerProps> = ({
  userId,
  isEnabled,
  isMobile = false
}) => {
  const {
    data,
    currentLevel,
    newAchievements,
    clearAchievements
  } = useGamification(userId);

  if (!isEnabled || !data) {
    return null;
  }

  const hasPointsAnimation = newAchievements.some(achievement => 
    achievement.category === 'points' || achievement.category === 'activity'
  );
  const hasLevelUpAnimation = newAchievements.some(achievement => 
    achievement.category === 'level'
  );
  const hasDailyBonus = newAchievements.some(achievement => 
    achievement.category === 'daily'
  );

  const earnedPoints = newAchievements
    .filter(achievement => achievement.category === 'points' || achievement.category === 'activity')
    .reduce((total, achievement) => total + achievement.points, 0);

  return (
    <>
      <GamificationStats
        userLevel={currentLevel}
        userPoints={data.totalPoints}
        activitiesJoinedToday={data.activitiesJoinedToday}
        isMobile={isMobile}
      />
      
      <PointsAnimation
        earnedPoints={earnedPoints}
        isVisible={hasPointsAnimation}
      />
      
      <LevelUpModal
        userLevel={currentLevel}
        isVisible={hasLevelUpAnimation}
        onClose={clearAchievements}
      />
      
      <DailyBonusNotification
        isVisible={hasDailyBonus}
        bonusPoints={5} // DAILY_LOGIN_BONUS constant
      />
    </>
  );
};

export default GamificationContainer;

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useCallback } from "react";

// Navigation Components
import Logo from "../Navigation/Logo";
import DesktopNavigation from "../Navigation/DesktopNavigation";
import MobileNavigation from "../Navigation/MobileNavigation";
import UserMenu from "../Navigation/UserMenu";
import MobileMenuButton from "../Navigation/MobileMenuButton";

// Gamification Components
import GamificationStats from "../Gamification/GamificationStats";
import PointsAnimation from "../Gamification/PointsAnimation";
import LevelUpModal from "../Gamification/LevelUpModal";
import DailyBonusNotification from "../Gamification/DailyBonusNotification";

// Gamification Constants
const POINTS_PER_ACTIVITY = 10;
const DAILY_LOGIN_BONUS = 5;
const THREE_ACTIVITIES_BONUS = 50;
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 5000];

const Header: React.FC = () => {
  const { user, logout, isAuthenticated, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Gamification State (only for regular users)
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [dailyLoginBonus, setDailyLoginBonus] = useState(false);
  const [activitiesJoinedToday, setActivitiesJoinedToday] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);

  const saveGamificationData = (
    points: number,
    level: number,
    activitiesCount: number
  ) => {
    if (user) {
      const data = {
        points,
        level,
        activitiesJoinedToday: activitiesCount,
        lastLoginDate: new Date().toDateString(),
      };
      localStorage.setItem(
        `gamification_${user.user_id}`,
        JSON.stringify(data)
      );
    }
  };

  const awardPoints = useCallback((points: number) => {
    const newPoints = userPoints + points;
    setUserPoints(newPoints);
    setEarnedPoints(points);
    setShowPointsAnimation(true);

    // Check for level up
    const currentThreshold =
      LEVEL_THRESHOLDS[userLevel] ||
      LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    if (
      newPoints >= currentThreshold &&
      userLevel < LEVEL_THRESHOLDS.length - 1
    ) {
      const newLevel = userLevel + 1;
      setUserLevel(newLevel);
      setLevelUpAnimation(true);
      setTimeout(() => setLevelUpAnimation(false), 4000);
    }

    setTimeout(() => setShowPointsAnimation(false), 3000);
  }, [userPoints, userLevel]);

  // Initialize user gamification data (only for regular users, not organizers)
  useEffect(() => {
    if (isAuthenticated && user && !isOrganizer) {
      const savedData = localStorage.getItem(`gamification_${user.user_id}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setUserPoints(data.points || 0);
        setUserLevel(data.level || 1);
        setActivitiesJoinedToday(data.activitiesJoinedToday || 0);

        // Check if daily login bonus is available
        const lastLoginDate = data.lastLoginDate;
        const today = new Date().toDateString();
        if (lastLoginDate !== today) {
          setDailyLoginBonus(true);
        }
      } else {
        // First time user - show welcome bonus
        setDailyLoginBonus(true);
      }
    }
  }, [isAuthenticated, user, isOrganizer]);

  // Handle daily bonus auto-trigger
  useEffect(() => {
    if (dailyLoginBonus && isAuthenticated && user && !isOrganizer) {
      const savedData = localStorage.getItem(`gamification_${user.user_id}`);
      const hasExistingData = !!savedData;

      setTimeout(
        () => {
          if (hasExistingData) {
            awardPoints(DAILY_LOGIN_BONUS);
          } else {
            awardPoints(DAILY_LOGIN_BONUS);
          }
          setDailyLoginBonus(false);
        },
        hasExistingData ? 1000 : 1500
      );
    }
  }, [dailyLoginBonus, isAuthenticated, user, isOrganizer, awardPoints]);

  // Export functions for other components to use (only for regular users)
  (
    window as typeof window & {
      gamificationSystem?: { awardPointsForActivity: () => void };
    }
  ).gamificationSystem = !isOrganizer
    ? {
        awardPointsForActivity: () => {
          const newActivitiesCount = activitiesJoinedToday + 1;
          setActivitiesJoinedToday(newActivitiesCount);

          let pointsToAward = POINTS_PER_ACTIVITY;

          if (newActivitiesCount === 3) {
            pointsToAward += THREE_ACTIVITIES_BONUS;
          }

          awardPoints(pointsToAward);
          saveGamificationData(
            userPoints + pointsToAward,
            userLevel,
            newActivitiesCount
          );
        },
      }
    : undefined;

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          
          <DesktopNavigation 
            isAuthenticated={isAuthenticated}
            isOrganizer={isOrganizer}
          />

          <UserMenu
            user={user}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          >
            {/* Gamification Display - Only for regular users */}
            {!isOrganizer && isAuthenticated && (
              <GamificationStats
                userLevel={userLevel}
                userPoints={userPoints}
                activitiesJoinedToday={activitiesJoinedToday}
              />
            )}
          </UserMenu>

          <MobileMenuButton
            isOpen={isMobileMenuOpen}
            onToggle={toggleMobileMenu}
          />
        </div>

        <MobileNavigation
          isAuthenticated={isAuthenticated}
          isOrganizer={isOrganizer}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onLogout={handleLogout}
        >
          {/* Mobile Gamification Display - Only for regular users */}
          {!isOrganizer && isAuthenticated && (
            <GamificationStats
              userLevel={userLevel}
              userPoints={userPoints}
              activitiesJoinedToday={activitiesJoinedToday}
              isMobile={true}
            />
          )}
        </MobileNavigation>
      </div>

      {/* Gamification Animations - Only for regular users */}
      {!isOrganizer && (
        <>
          <PointsAnimation
            earnedPoints={earnedPoints}
            isVisible={showPointsAnimation}
          />
          
          <LevelUpModal
            userLevel={userLevel}
            isVisible={levelUpAnimation}
            onClose={() => setLevelUpAnimation(false)}
          />
          
          <DailyBonusNotification
            isVisible={dailyLoginBonus}
            bonusPoints={DAILY_LOGIN_BONUS}
          />
        </>
      )}
    </header>
  );
};

export default Header;

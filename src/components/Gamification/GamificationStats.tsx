import React from 'react';
import { Star, Trophy, Target, Zap } from 'lucide-react';

interface GamificationStatsProps {
  userLevel: number;
  userPoints: number;
  activitiesJoinedToday: number;
  isMobile?: boolean;
}

const GamificationStats: React.FC<GamificationStatsProps> = ({
  userLevel,
  userPoints,
  activitiesJoinedToday,
  isMobile = false
}) => {
  if (isMobile) {
    return (
      <div className="px-3 py-3 mb-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="font-bold text-gray-900">Level {userLevel}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-blue-700">{userPoints} pts</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-green-700">Today: {activitiesJoinedToday}/3</span>
          </div>
          {activitiesJoinedToday >= 3 && (
            <div className="flex items-center space-x-1 text-orange-600">
              <Zap className="h-4 w-4 animate-pulse" />
              <span className="text-xs font-medium">Bonus unlocked!</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg border border-blue-200">
      <div className="flex items-center space-x-1">
        <Trophy className="h-4 w-4 text-yellow-600" />
        <span className="text-sm font-bold text-gray-900">L{userLevel}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Star className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-bold text-blue-700">{userPoints}</span>
      </div>
      {activitiesJoinedToday > 0 && (
        <div className="flex items-center space-x-1">
          <Target className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-green-700">
            {activitiesJoinedToday}/3
          </span>
        </div>
      )}
      {activitiesJoinedToday >= 3 && (
        <Zap className="h-4 w-4 text-orange-500 animate-pulse" />
      )}
    </div>
  );
};

export default GamificationStats;

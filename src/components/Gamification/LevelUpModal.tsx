import React from 'react';
import { Trophy, Zap, Target, Gift } from 'lucide-react';

interface LevelUpModalProps {
  userLevel: number;
  isVisible: boolean;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  userLevel,
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-10 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="mb-6">
            <Trophy className="h-20 w-20 text-yellow-500 mx-auto animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 animate-pulse">
            Level Up!
          </h2>
          <p className="text-xl text-gray-700 mb-4">
            Welcome to Level {userLevel}! 🎊
          </p>
          <div className="text-sm text-gray-600 mb-6">
            You've unlocked new benefits and features!
          </div>
          
          {/* Level Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              New Level {userLevel} Benefits:
            </h3>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <Zap className="h-3 w-3 text-blue-500" />
                <span>Higher priority in activity notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-3 w-3 text-green-500" />
                <span>Enhanced leaderboard visibility</span>
              </div>
              {userLevel >= 3 && (
                <div className="flex items-center space-x-2">
                  <Gift className="h-3 w-3 text-purple-500" />
                  <span>Access to premium activities</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Awesome! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;

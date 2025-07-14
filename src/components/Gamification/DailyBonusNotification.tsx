import React from 'react';
import { Gift } from 'lucide-react';

interface DailyBonusNotificationProps {
  isVisible: boolean;
  bonusPoints: number;
}

const DailyBonusNotification: React.FC<DailyBonusNotificationProps> = ({
  isVisible,
  bonusPoints
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-4 rounded-lg shadow-xl animate-bounce">
        <div className="flex items-center space-x-3">
          <Gift className="h-6 w-6 animate-pulse" />
          <div>
            <div className="font-bold text-lg">Daily Bonus Available!</div>
            <div className="text-sm text-green-100">
              +{bonusPoints} points for logging in today
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyBonusNotification;

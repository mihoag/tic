import React from 'react';
import { Star } from 'lucide-react';

interface PointsAnimationProps {
  earnedPoints: number;
  isVisible: boolean;
}

const PointsAnimation: React.FC<PointsAnimationProps> = ({
  earnedPoints,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 pointer-events-none">
      <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-bounce">
        <div className="flex items-center space-x-2">
          <Star className="h-5 w-5 animate-spin" />
          <div>
            <div className="font-bold">+{earnedPoints} Points!</div>
            <div className="text-xs text-green-100">Great job! 🎉</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsAnimation;

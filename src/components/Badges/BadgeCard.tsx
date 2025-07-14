import React from 'react';
import { Share2, Eye, Award } from 'lucide-react';
import { Badge } from '../../types';

interface BadgeCardProps {
  issuedBadge: Badge;
  onViewDetails: () => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ issuedBadge, onViewDetails }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:scale-105">
      <div className="relative">
        <img
          src={issuedBadge.image_url}
          alt={issuedBadge.badge_name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <Award className="h-4 w-4" />
            <span>Verified</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{issuedBadge.badge_name}</h3>
          <p className="text-gray-700 text-sm line-clamp-2">{issuedBadge.description}</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onViewDetails}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
          >
            <Eye className="h-4 w-4" />
            <span>Details</span>
          </button>
          <button
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center space-x-1"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgeCard;
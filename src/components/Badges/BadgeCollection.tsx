import React, { useState, useEffect } from 'react';
import { Award, Share2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { badgeService } from '../../services/apiService';
import { Badge } from '../../types';
import BadgeCard from './BadgeCard';

const BadgeCollection: React.FC = () => {
  const { user } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserBadges = async () => {
      if (!user?.user_id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await badgeService.getBadges({ 
          user_id: user.user_id 
        });
        
        if (response.success) {
          setUserBadges(response.data || []);
        } else {
          setError('Failed to load badges');
        }
      } catch (error) {
        console.error('Error fetching user badges:', error);
        setError('Failed to load badges');
    
      } finally {
        setLoading(false);
      }
    };

    fetchUserBadges();
  }, [user?.user_id]);

  if (!user) return null;

  // const handleShareBadge = (badge: IssuedBadge, platform: string) => {
  //   const shareUrl = `${window.location.origin}/verify/${badge.verification_code}`;
  //   const shareText = `I earned the "${badge.badge?.badge_name || 'Badge'}" badge from ${badge.organization?.org_name || 'Organization'} for my ESG activities! 🌱 #PingBadge #ESGHeroes`;
    
  //   switch (platform) {
  //     case 'facebook':
  //       window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`);
  //       break;
  //     case 'linkedin':
  //       window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`);
  //       break;
  //     case 'copy':
  //       navigator.clipboard.writeText(shareText + ' ' + shareUrl);
  //       alert('Link copied to clipboard!');
  //       break;
  //   }
  // };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Badge Collection</h1>
        <p className="text-lg text-gray-600">
          Showcase your ESG achievements and share your impact with the world
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center">
          <div className="bg-green-500 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-green-700">{userBadges.length}</div>
          <div className="text-green-600 font-medium">Total Badges</div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 text-center">
          <div className="bg-blue-500 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Share2 className="h-6 w-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-blue-700">{userBadges.length * 3}</div>
          <div className="text-blue-600 font-medium">Times Shared</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 text-center">
          <div className="bg-purple-500 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <ExternalLink className="h-6 w-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-purple-700">{userBadges.length * 15}</div>
          <div className="text-purple-600 font-medium">Profile Views</div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your badges...</p>
        </div>
      )}

      {/* Badge Grid */}
      {!loading && !error && userBadges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userBadges.map((issuedBadge) => (
            <BadgeCard
              key={issuedBadge.badge_def_id}
              issuedBadge={issuedBadge}
              onViewDetails={() => setSelectedBadge(issuedBadge)}
            />
          ))}
        </div>
      ) : (
        !loading && !error && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Award className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No badges yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start participating in ESG activities to earn your first badge and build your impact portfolio.
            </p>
            <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all">
              Explore Activities
            </button>
          </div>
        )
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="text-center mb-6">
              <img
                src={selectedBadge.image_url || '/placeholder-badge.png'}
                alt={selectedBadge?.badge_name || 'Badge'}
                className="w-32 h-32 mx-auto rounded-2xl object-cover mb-4"
              />
              <h3 className="text-2xl font-bold text-gray-900">{selectedBadge?.badge_name || 'Badge'}</h3>
            
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedBadge?.description || 'No description available'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Earned Date</h4>
                <p className="text-gray-600">{new Date(selectedBadge.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Verification Code</h4>
              </div>
            </div>

            <div className="flex space-x-3 mb-4">
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeCollection;
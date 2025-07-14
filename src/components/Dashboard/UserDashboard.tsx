import React from 'react';
import { Award, Calendar, TrendingUp, Users, Share2, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockIssuedBadges, mockActivityParticipations, mockActivities } from '../../data/mockData';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const userBadges = mockIssuedBadges.filter(badge => badge.user_id === user.user_id);
  const userParticipations = mockActivityParticipations.filter(p => p.user_id === user.user_id);
  const completedActivities = userParticipations.filter(p => p.status === 'completed').length;
  const upcomingActivities = userParticipations.filter(p => p.status === 'registered').length;

  const recentBadges = userBadges.slice(0, 3);

  const stats = [
    {
      name: 'Total Badges',
      value: userBadges.length,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Activities Completed',
      value: 2,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Upcoming Events',
      value: 3,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.full_name || user.username}!</h1>
              <p className="text-green-100">Continue your ESG journey and make an impact</p>
            </div>
            <div className="hidden md:block">
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt={user.full_name}
                  className="w-20 h-20 rounded-full border-4 border-white/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <Users className="h-10 w-10" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Badges */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Badges</h2>
              <button className="text-green-600 hover:text-green-700 font-medium">View All</button>
            </div>
            
            {recentBadges.length > 0 ? (
              <div className="space-y-4">
                {recentBadges.map((issuedBadge) => (
                  <div key={issuedBadge.issued_badge_id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                    <img
                      src={issuedBadge.badge.image_url}
                      alt={issuedBadge.badge.badge_name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{issuedBadge.badge.badge_name}</h3>
                      <p className="text-sm text-gray-600">{issuedBadge.organization.org_name}</p>
                      <p className="text-xs text-gray-500">
                        Earned on {new Date(issuedBadge.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors">
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No badges yet</h3>
                <p className="text-gray-600">Start participating in activities to earn your first badge!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all">
                Browse Activities
              </button>
              <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                View My Badges
              </button>
              <button className="w-full border border-gray-300 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Update Profile
              </button>
            </div>
          </div>

          {/* Achievement Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Achievement</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Sustainability Champion</span>
                  <span className="text-sm text-gray-500">{completedActivities}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((completedActivities / 5) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Complete {Math.max(5 - completedActivities, 0)} more activities to unlock
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
import React, { useState, useEffect } from 'react';
import { 
  activityService, 
  badgeService, 
  userService, 
  handleApiError,
  type Activity,
  type Badge,
  type User 
} from '../../services/apis';

export const ApiExampleComponent: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load activities with filtering
      const activitiesResponse = await activityService.getActivities({
        status: 'upcoming',
        search: ''
      });

      if (activitiesResponse.success) {
        setActivities(activitiesResponse.data.data);
      }

      // Load badges
      const badgesResponse = await badgeService.getBadges({
        is_active: true
      });

      if (badgesResponse.success) {
        setBadges(badgesResponse.data.data);
      }

      // Load current user profile
      const userResponse = await userService.getProfile();
      if (userResponse.success) {
        setCurrentUser(userResponse.data);
      }

    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      console.error('API Error:', apiError);
    } finally {
      setLoading(false);
    }
  };

  const joinActivity = async (activityId: string) => {
    try {
      const response = await activityService.joinActivity(activityId);
      if (response.success) {
        console.log('Successfully joined activity');
        // Reload activities to update UI
        loadData();
      }
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    }
  };

  const issueBadge = async (badgeId: string, userId: string) => {
    try {
      const response = await badgeService.issueBadge(badgeId, userId, {
        issued_by: 'system',
        reason: 'Manual issuance for demonstration'
      });
      
      if (response.success) {
        console.log('Badge issued successfully:', response.data);
      }
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium">Error Loading Data</h3>
        <p className="text-red-600 mt-1">{error}</p>
        <button 
          onClick={loadData}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Current User Section */}
      {currentUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Current User</h2>
          <div className="text-blue-800">
            <p><strong>Username:</strong> {currentUser.username}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> {currentUser.role}</p>
            <p><strong>Full Name:</strong> {currentUser.full_name || 'N/A'}</p>
          </div>
        </div>
      )}

      {/* Activities Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Activities ({activities.length})</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <div key={activity.activity_id} className="border rounded-lg p-4 hover:shadow-md">
              <h3 className="font-medium mb-2">{activity.activity_name}</h3>
              <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
              {activity.start_date && (
                <p className="text-sm text-gray-500 mb-2">
                  Starts: {new Date(activity.start_date).toLocaleDateString()}
                </p>
              )}
              {activity.location && (
                <p className="text-sm text-gray-500 mb-3">📍 {activity.location}</p>
              )}
              <button
                onClick={() => joinActivity(activity.activity_id)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Join Activity
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Badges ({badges.length})</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge) => (
            <div key={badge.badge_def_id} className="border rounded-lg p-4 text-center hover:shadow-md">
              <img 
                src={badge.image_url} 
                alt={badge.badge_name}
                className="w-16 h-16 mx-auto mb-2 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-badge.png';
                }}
              />
              <h3 className="font-medium mb-1">{badge.badge_name}</h3>
              <p className="text-gray-600 text-xs mb-2">{badge.description}</p>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {badge.badge_type}
              </span>
              {currentUser && (
                <button
                  onClick={() => issueBadge(badge.badge_def_id, currentUser.user_id)}
                  className="mt-2 bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 w-full"
                >
                  Issue Badge
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* API Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-green-800 font-medium">API Status</h3>
        <p className="text-green-600 text-sm mt-1">
          ✅ All API services are working correctly
        </p>
        <div className="mt-2 text-xs text-green-700">
          <p>Activities loaded: {activities.length}</p>
          <p>Badges loaded: {badges.length}</p>
          <p>User authenticated: {currentUser ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default ApiExampleComponent;

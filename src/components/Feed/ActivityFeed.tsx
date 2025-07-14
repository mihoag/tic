import React, { useState, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { activityService } from '../../services/apiService';
import { Activity } from '../../types';
import ActivityCard from './ActivityCard';

const ActivityFeed: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userParticipations, setUserParticipations] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch activities and user participations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all activities
        const activitiesResponse = await activityService.getActivities({
          search: debouncedSearchTerm || undefined
        });

        console.log('Activities response:', activitiesResponse);

        if (activitiesResponse.success) {
          setActivities(activitiesResponse.data || []);
        }

        // Fetch user activities if authenticated
        if (isAuthenticated && user?.user_id) {
          const userActivitiesResponse = await activityService.getActivities({user_id: user.user_id});
          if (userActivitiesResponse.success) {
            setUserParticipations(userActivitiesResponse.data || []);
          }
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearchTerm, isAuthenticated, user?.user_id]);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    if (filterType === 'joined') {
      return matchesSearch && userParticipations.some(p => p.activity_id === activity.activity_id);
    }
    if (filterType === 'available') {
      return matchesSearch && !userParticipations.some(p => p.activity_id === activity.activity_id);
    }
    
    return matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">ESG Activities</h1>
        <p className="text-lg text-gray-600">
          Discover and participate in environmental, social, and governance initiatives
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        {isAuthenticated && (
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Activities</option>
              <option value="available">Available</option>
              <option value="joined">Joined</option>
            </select>
          </div>
        )}
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
          <p className="text-gray-600">Loading activities...</p>
        </div>
      )}

      {/* Activities Grid */}
      {!loading && !error && (
        <div className="space-y-6">
          {filteredActivities.map(activity => {
            const participation = userParticipations.find(p => p.activity_id === activity.activity_id);
            return (
              <ActivityCard
                key={activity.activity_id}
                activity={activity}
                participation={participation}
                isAuthenticated={isAuthenticated}
              />
            );
          })}
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
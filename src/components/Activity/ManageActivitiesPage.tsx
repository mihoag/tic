import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  Edit3, 
  Trash2, 
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Medal,
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockActivities, mockActivityParticipations, mockIssuedBadges } from '../../data/mockData';

const ManageActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { organization, isOrganizer } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  if (!isOrganizer || !organization) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be an organization admin to manage activities.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const orgActivities = mockActivities.filter(activity => activity.org_id === organization.org_id);

  const getActivityStatus = (activity: typeof mockActivities[0]) => {
    const now = new Date();
    const startDate = new Date(activity.start_date);
    const endDate = new Date(activity.end_date);

    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return 'completed';
  };

  const getParticipantCount = (activityId: string) => {
    return mockActivityParticipations.filter(p => p.activity_id === activityId).length;
  };

  const getBadgeCount = (activityId: string) => {
    const activity = orgActivities.find(a => a.activity_id === activityId);
    if (!activity?.badge_def_id) return 0;
    return mockIssuedBadges.filter(badge => 
      badge.badge_def_id === activity.badge_def_id
    ).length;
  };

  const getUpcomingActivitiesStats = () => {
    const upcomingActivities = orgActivities.filter(a => getActivityStatus(a) === 'upcoming');
    return upcomingActivities.map(activity => ({
      name: activity.activity_name.length > 20 ? 
            activity.activity_name.substring(0, 20) + '...' : 
            activity.activity_name,
      participants: getParticipantCount(activity.activity_id),
      maxParticipants: 50,
      activityId: activity.activity_id
    }));
  };

  const getCompletedActivitiesStats = () => {
    const completedActivities = orgActivities.filter(a => getActivityStatus(a) === 'completed');
    return completedActivities.map(activity => ({
      name: activity.activity_name.length > 20 ? 
            activity.activity_name.substring(0, 20) + '...' : 
            activity.activity_name,
      participants: getParticipantCount(activity.activity_id),
      badges: getBadgeCount(activity.activity_id),
      activityId: activity.activity_id
    }));
  };

  const filteredActivities = orgActivities.filter(activity => {
    const matchesSearch = activity.activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && getActivityStatus(activity) === filterStatus;
  });

  const handleDeleteActivity = (activityId: string) => {
    // In a real app, this would call an API to delete the activity
    console.log('Deleting activity:', activityId);
    setShowDeleteModal(null);
    // Show success message or update the list
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Upcoming' },
      ongoing: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Ongoing' },
      completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, text: 'Completed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4" />
        <span>{config.text}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Activities</h1>
          <p className="text-gray-600 mt-2">Create and manage your organization's ESG activities</p>
        </div>
        <Link
          to="/create-activity"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Activity</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-3xl font-bold text-gray-900">{orgActivities.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-3xl font-bold text-gray-900">
                {orgActivities.filter(a => getActivityStatus(a) === 'upcoming').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ongoing</p>
              <p className="text-3xl font-bold text-gray-900">
                {orgActivities.filter(a => getActivityStatus(a) === 'ongoing').length}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-3xl font-bold text-gray-900">
                {orgActivities.reduce((total, activity) => total + getParticipantCount(activity.activity_id), 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Upcoming Activities Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Activities</h3>
                <p className="text-sm text-gray-600">Participant registrations</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-blue-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Registration Trends</span>
            </div>
          </div>
          
          {getUpcomingActivitiesStats().length > 0 ? (
            <div className="space-y-4">
              {getUpcomingActivitiesStats().slice(0, 5).map((activity) => (
                <div key={activity.activityId} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-900">{activity.name}</span>
                    <span className="text-gray-600">
                      {activity.participants}/{activity.maxParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((activity.participants / activity.maxParticipants) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{((activity.participants / activity.maxParticipants) * 100).toFixed(1)}% filled</span>
                    <span>{activity.maxParticipants - activity.participants} spots left</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming activities</p>
            </div>
          )}
        </div>

        {/* Completed Activities Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Medal className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Completed Activities</h3>
                <p className="text-sm text-gray-600">Participants & badges awarded</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-green-600">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">Achievement Stats</span>
            </div>
          </div>
          
          {getCompletedActivitiesStats().length > 0 ? (
            <div className="space-y-4">
              {getCompletedActivitiesStats().slice(0, 5).map((activity) => (
                <div key={activity.activityId} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">{activity.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{activity.participants}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{activity.participants}</div>
                      <div className="text-xs text-gray-500">Participants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{activity.badges}</div>
                      <div className="text-xs text-gray-500">Badges Awarded</div>
                    </div>
                  </div>
                  
                  {activity.participants > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Badge Success Rate</span>
                        <span>{((activity.badges / activity.participants) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-1 rounded-full"
                          style={{ 
                            width: `${Math.min((activity.badges / activity.participants) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No completed activities yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredActivities.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredActivities.map((activity) => {
              const status = getActivityStatus(activity);
              const participantCount = getParticipantCount(activity.activity_id);
              
              return (
                <div key={activity.activity_id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{activity.activity_name}</h3>
                        {getStatusBadge(status)}
                        {activity.badge && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Award className="h-4 w-4" />
                            <span className="text-sm font-medium">Badge Available</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{activity.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(activity.start_date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{participantCount} participants</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        to={`/activity/${activity.activity_id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => navigate(`/edit-activity/${activity.activity_id}`)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit Activity"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(activity.activity_id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Activity"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Calendar className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No activities found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search terms or filters.'
                : 'Create your first activity to start engaging your community!'
              }
            </p>
            <Link
              to="/create-activity"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Create Your First Activity
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Activity</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this activity? This action cannot be undone and will affect all participants.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteActivity(showDeleteModal)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageActivitiesPage;
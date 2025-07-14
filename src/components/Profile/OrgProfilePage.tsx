import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  Globe, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera,
  CheckCircle,
  Award,
  Users,
  Activity,
  Search,
  Filter,
  MapPin,
  Clock,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Activity as ActivityType } from '../../types';
import { Link } from 'react-router-dom';
import { organizationService, activityService } from '../../services/apiService';

const OrgProfilePage: React.FC = () => {
  const { organization, isOrganizer, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgActivities, setOrgActivities] = useState<ActivityType[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    org_name: organization?.org_name || '',
    description: organization?.description || '',
    website_url: organization?.website_url || '',
    org_email: organization?.org_email || ''
  });

  // Fetch organization activities using real API
  useEffect(() => {
    const fetchOrgActivities = async () => {
      if (!organization?.org_id) return;
      
      try {
        setDataLoading(true);
        const response = await activityService.getActivities({
          org_id: organization.org_id
        });

        console.log('Fetched organization activities:', response);
        
        if (response.success) {
          setOrgActivities(response.data);
        } else {
          console.error('Failed to fetch organization activities');
        }
      } catch (error) {
        console.error('Error fetching organization activities:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchOrgActivities();
  }, []);

  if (!isOrganizer || !organization) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need to be an organization admin to view this page.</p>
        </div>
      </div>
    );
  }

  // Calculate statistics - keeping mock data for badges for now
  // TODO: Replace with real API calls when badge endpoints are ready
  const orgBadges: unknown[] = []; // Will be replaced with real badge data
  const orgIssuedBadges: unknown[] = []; // Will be replaced with real issued badge data
  const totalParticipants = 0; // TODO: Calculate from real participation data

  const getActivityStatus = (activity: { start_date?: string; end_date?: string }) => {
    if (!activity.start_date || !activity.end_date) return 'upcoming';
    
    const now = new Date();
    const startDate = new Date(activity.start_date);
    const endDate = new Date(activity.end_date);

    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return 'completed';
  };

  const getParticipantCount = (): number => {
    // TODO: Replace with real API call to get participant count
    // For now, return 0 until we implement the participant API
    return 0;
  };

  const filteredActivities = orgActivities.filter(activity => {
    const matchesSearch = activity.activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && getActivityStatus(activity) === filterStatus;
  });

  const handleSave = async () => {
    if (!organization) return;
    
    // Validate required fields
    if (!editForm.org_name.trim()) {
      setError('Organization name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await organizationService.updateOrganization(
        organization.org_id,
        user?.user_id || '',
        {
          org_name: editForm.org_name.trim(),
          description: editForm.description.trim() || undefined,
          website_url: editForm.website_url.trim() || undefined,
          org_email: editForm.org_email.trim() || undefined
        }
      );

      if (response.success) {
        // Update local organization data in AuthContext would be ideal
        // For now, we'll just update the form to reflect the saved data
      
        setIsEditing(false);
        // Optionally reload the page or update context
        window.location.reload();
      } else {
        setError('Failed to update organization');
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      setError('Failed to update organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      org_name: organization?.org_name || '',
      description: organization?.description || '',
      website_url: organization?.website_url || '',
      org_email: organization?.org_email || ''
    });
    setIsEditing(false);
    setError(null);
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
      day: 'numeric'
    });
  };

  const stats = [
    {
      name: 'Total Activities',
      value: orgActivities.length,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%'
    },
    {
      name: 'Badges Created',
      value: orgBadges.length,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%'
    },
    {
      name: 'Badges Issued',
      value: orgIssuedBadges.length,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15%'
    },
    {
      name: 'Total Participants',
      value: totalParticipants,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+10%'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Organization Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
        <div className="relative px-8 pb-8">
          <div className="flex items-end space-x-6 -mt-16">
            <div className="relative">
              {organization.org_logo_url ? (
                <img
                  src={organization.org_logo_url}
                  alt={organization.org_name}
                  className="w-32 h-32 rounded-2xl border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl border-4 border-white bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-white" />
                </div>
              )}
              <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1 mt-4">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.org_name}
                    onChange={(e) => setEditForm({...editForm, org_name: e.target.value})}
                    className="text-3xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 w-full"
                    placeholder="Organization name"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="text-gray-600 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 w-full resize-none"
                    placeholder="Organization description..."
                    rows={3}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="email"
                      value={editForm.org_email}
                      onChange={(e) => setEditForm({...editForm, org_email: e.target.value})}
                      className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Contact email"
                    />
                    <input
                      type="url"
                      value={editForm.website_url}
                      onChange={(e) => setEditForm({...editForm, website_url: e.target.value})}
                      className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Website URL"
                    />
                  </div>
                  {error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{organization.org_name}</h1>
                    {organization.is_verified && (
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2 mb-4">{organization.description || 'No description provided'}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{organization.org_email}</span>
                    </div>
                    {organization.website_url && (
                      <div className="flex items-center space-x-1">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={organization.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(organization.created_at)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-4">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setError(null);
                  }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activities Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Activities Management</h2>
          <Link
            to="/create-activity"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create New Activity
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

        {/* Activities List */}
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Loading activities...</span>
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const status = getActivityStatus(activity);
              const participantCount = getParticipantCount();
              
              return (
                <div key={activity.activity_id} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{activity.activity_name}</h3>
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
                          <span>{activity.start_date ? formatDate(activity.start_date) : 'TBD'}</span>
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
                        onClick={() => console.log('Edit activity:', activity.activity_id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit Activity"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => console.log('Delete activity:', activity.activity_id)}
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
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-8 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Activity className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search terms or filters.'
                : 'Create your first activity to start engaging your community!'
              }
            </p>
            <Link
              to="/create-activity"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Activity
            </Link>
          </div>
        )}
      </div>

      {/* Badge Performance Section */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Badge Performance</h2>
        
        {/* TODO: Replace with real badge data when badge API is implemented */}
        <div className="text-center py-8">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Badge Management Coming Soon</h3>
          <p className="text-gray-600">Badge creation and management features will be available soon!</p>
        </div>
      </div>
    </div>
  );
};

export default OrgProfilePage;
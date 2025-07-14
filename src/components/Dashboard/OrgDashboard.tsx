import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, Activity, TrendingUp, Calendar, MapPin, BarChart3, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Activity as ActivityType } from '../../types';
import { activityService } from '../../services/apiService';

const OrgDashboard: React.FC = () => {
  const { organization } = useAuth();
  const [orgActivities, setOrgActivities] = useState<ActivityType[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  console.log('Organization in OrgDashboard:', organization);

  // Fetch organization activities using real API
  useEffect(() => {
    const fetchOrgActivities = async () => {
      if (!organization?.org_id) return;
      
      try {
        setDataLoading(true);
        const response = await activityService.getActivities({
          org_id: organization.org_id
        });
        
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
  }, [organization?.org_id]);

  if (!organization) return null;

  // Calculate statistics - keeping mock data for badges for now
  // TODO: Replace with real API calls when badge endpoints are ready
  const orgIssuedBadges: unknown[] = []; // Will be replaced with real issued badge data
  const totalParticipants = 0; // TODO: Calculate from real participation data

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
      name: 'Badges Issued',
      value: orgIssuedBadges.length,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%'
    },
    {
      name: 'Total Participants',
      value: totalParticipants,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15%'
    },
    {
      name: 'Impact Score',
      value: orgIssuedBadges.length * 10 + totalParticipants * 2,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+10%'
    }
  ];

  const recentActivities = orgActivities.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{organization.org_name} Dashboard</h1>
              <p className="text-blue-100">Manage your ESG activities and track community impact</p>
            </div>
            <div className="hidden md:block">
              {organization.org_logo_url ? (
                <img
                  src={organization.org_logo_url}
                  alt={organization.org_name}
                  className="w-20 h-20 rounded-full border-4 border-white/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <BarChart3 className="h-10 w-10" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
              <Link 
                to="/create-activity"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create New
              </Link>
            </div>
            
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                <span className="text-gray-600">Loading activities...</span>
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.activity_id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{activity.activity_name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Edit
                      </button>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{activity.start_date ? new Date(activity.start_date).toLocaleDateString() : 'TBD'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{activity.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>
                          0 participants
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
                <p className="text-gray-600">Create your first activity to start engaging your community!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                to="/create-activity"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all block text-center"
              >
                Create Activity
              </Link>
              <Link 
                to="/manage-badges"
                className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition-colors block text-center"
              >
                Badges
              </Link>
              <Link 
                to="/manage-activities"
                className="w-full border border-gray-300 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-50 transition-colors block text-center"
              >
                Manage Activities
              </Link>
            </div>
          </div>

          {/* Badge Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Badge Performance</h3>
            {/* TODO: Replace with real badge data when badge API is implemented */}
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-sm">Badge data coming soon</p>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-semibold text-gray-900">{orgIssuedBadges.length} badges issued</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Activities</span>
                <span className="font-semibold text-gray-900">{orgActivities.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-semibold text-green-600">87%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgDashboard;
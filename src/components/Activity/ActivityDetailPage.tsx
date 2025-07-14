import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft, 
  CheckCircle, 
  UserPlus,
  Globe,
  Mail,
  X,
  UserX,
  AlertTriangle,
  Eye,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { activityService, userService, ActivityDetailResponse } from '../../services/apiService';
import { User, ActivityParticipation } from '../../types';

const ActivityDetailPage: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isOrganizer, organization } = useAuth();
  
  // State for data
  const [activityData, setActivityData] = useState<ActivityDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantUsers, setParticipantUsers] = useState<User[]>([]);
  
  // State for actions
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<{user: User, participation: ActivityParticipation} | null>(null);
  const [isKickingOut, setIsKickingOut] = useState(false);

  // Fetch activity data
  useEffect(() => {
    const fetchActivity = async () => {
      if (!activityId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await activityService.getActivity(activityId);
        setActivityData(response.data);
      } catch (err) {
        setError('Failed to load activity details');
        console.error('Error fetching activity:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [activityId]);

  // Fetch participant user data
  useEffect(() => {
    const fetchParticipantUsers = async () => {
      if (!activityData?.participations) return;
      
      try {
        const userPromises = activityData.participations.map(async (participation) => {
          try {
            const response = await userService.getUserById(participation.user_id);
            return response.data;
          } catch (err) {
            console.error(`Error fetching user ${participation.user_id}:`, err);
            return null;
          }
        });
        
        const users = await Promise.all(userPromises);
        const validUsers = users.filter((user): user is User => user !== null);
        setParticipantUsers(validUsers);
      } catch (err) {
        console.error('Error fetching participant users:', err);
      }
    };

    fetchParticipantUsers();
  }, [activityData?.participations]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Loading activity details...</h2>
        </div>
      </div>
    );
  }

  if (error || !activityData) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Activity not found'}
          </h2>
          <button
            onClick={() => navigate('/feed')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Back to Activities
          </button>
        </div>
      </div>
    );
  }

  // Extract data from nested response
  const activity = activityData.activity;
  const activityParticipants = activityData.participations || [];


 
  // Extract participant users from participations (assuming user data is populated)
  
  // Find current user's participation
  const participation = activityParticipants.find(p => p.user_id === user?.user_id);
  
  // Check if current user is the organizer of this activity
  const isActivityOrganizer = isOrganizer && organization?.org_id === activity?.org_id;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = () => {
    const start = new Date(activity.start_date ?? '');
    const end = new Date(activity.end_date ?? '');
    const diffHours = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${diffHours} hours`;
  };

  const handleJoinActivity = async () => {
    if (!isAuthenticated || !activityId) {
      navigate('/login');
      return;
    }
    
    setIsJoining(true);
    try {
      // Call real API to join activity
      if (!user?.user_id) {
        throw new Error('User ID is missing');
      }
      await activityService.joinActivity(activityId, user.user_id);
      
      // Trigger gamification points
      const gamificationSystem = (window as unknown as { gamificationSystem?: { awardPointsForActivity: () => void } })?.gamificationSystem;
      if (gamificationSystem) {
        gamificationSystem.awardPointsForActivity();
      }
      
      // Refresh activity data to show updated participation
      const response = await activityService.getActivity(activityId);
      setActivityData(response.data);
    } catch (error) {
      alert('Failed to join activity. Please try again.');
      console.error('Error joining activity:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveActivity = async () => {
    if (!activityId) return;
    
    setIsLeaving(true);
    try {
      // Call real API to leave activity
      await activityService.leaveActivity(activityId);
      
      // Refresh activity data to show updated participation
      const response = await activityService.getActivity(activityId);
      setActivityData(response.data);
      
      // Show success message
      alert('Successfully left the activity!');
    } catch (error) {
      alert('Failed to leave activity. Please try again.');
      console.error('Error leaving activity:', error);
    } finally {
      setIsLeaving(false);
    }
  };

  const isActivityPast = new Date(activity.end_date ?? '') < new Date();
  const isActivityFull = activityParticipants.length >= 100; // Assume max 100 participants

  const handleParticipantClick = (participant: User) => {
    const participantData = activityParticipants.find(p => p.user_id === participant.user_id);
    if (participantData) {
      setSelectedParticipant({ user: participant, participation: participantData });
    }
  };

  const handleKickParticipant = async () => {
    if (!selectedParticipant) return;
    
    setIsKickingOut(true);
    try {
      // Simulate API call to kick participant
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call
      alert(`${selectedParticipant.user.full_name || selectedParticipant.user.username} has been removed from the activity.`);
      
      // Close modal
      setSelectedParticipant(null);
      
      // In a real app, you would refresh the participant data here
    } catch {
      alert('Error removing participant. Please try again.');
    } finally {
      setIsKickingOut(false);
    }
  };

  const closeParticipantModal = () => {
    setSelectedParticipant(null);
    setIsKickingOut(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/feed')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Activities</span>
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-8 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={activity.Organization?.org_logo_url || 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?w=80'}
                    alt={activity.Organization?.org_name || 'Organization'}
                    className="w-16 h-16 rounded-xl border-2 border-white/20"
                  />
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{activity.activity_name}</h1>
                    <p className="text-green-100">{activity.Organization?.org_name}</p>
                  </div>
                </div>
                
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Activity</h2>
              <p className="text-gray-700 leading-relaxed">{activity.description}</p>
            </div>
          </div>

          {/* Activity Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Activity Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Start Date & Time</h4>
                    <p className="text-gray-600">{formatDate(activity.start_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">End Date & Time</h4>
                    <p className="text-gray-600">{formatDate(activity.end_date)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-6 w-6 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Location</h4>
                    <p className="text-gray-600">{activity.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Participants</h4>
                    <p className="text-gray-600">{activityParticipants.length} registered</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Duration: {getDuration()}</span>
                <span>Created: {new Date(activity.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Badge Information */}
          {activityData.badge && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Earn This Badge</h2>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={activityData.badge .image_url}
                    alt={activityData.badge .badge_name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{activityData.badge .badge_name}</h3>
                    <p className="text-gray-700 mb-3">{activityData.badge .description}</p>
                    <div className="bg-white/80 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-1">Criteria:</h4>
                      <p className="text-sm text-gray-600">{activityData.badge .criteria}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Participants */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Participants ({activityParticipants.length})
              </h2>
              
              {/* Bonus Statistics */}
              <div className="flex items-center space-x-4">
                {!isActivityPast ? (
                  // Activity not started yet - show registration stats
                  <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      {activityParticipants.filter(p => p.status === 'registered').length} Registered
                    </span>
                  </div>
                ) : (
                  // Activity ended - show completion and badge stats
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {activityParticipants.filter(p => p.status === 'completed').length} Completed
                      </span>
                    </div>
                    {activity.badge && (
                      <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full">
                        <img
                          src={activity.badge.image_url}
                          alt="Badge"
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm font-medium text-purple-700">
                          {activityParticipants.filter(p => p.status === 'completed').length} Badges Issued
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bonus Statistics Bar */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {activityParticipants.filter(p => p.status === 'registered').length}
                  </div>
                  <div className="text-sm text-gray-600">Registered</div>
                </div>
                
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-yellow-600">
                    {activityParticipants.filter(p => p.status === 'attended').length}
                  </div>
                  <div className="text-sm text-gray-600">Attended</div>
                </div>
                
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {activityParticipants.filter(p => p.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                
                {activity.badge && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600">
                      {activityParticipants.filter(p => p.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600">Badges Earned</div>
                  </div>
                )}
              </div>
              
              {/* Progress Bar for Activity Status */}
              {!isActivityPast && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Registration Progress</span>
                    <span>{activityParticipants.length}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((activityParticipants.length / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Completion Rate for Ended Activities */}
              {isActivityPast && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Completion Rate</span>
                    <span>
                      {activityParticipants.length > 0 
                        ? Math.round((activityParticipants.filter(p => p.status === 'completed').length / activityParticipants.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${activityParticipants.length > 0 
                          ? (activityParticipants.filter(p => p.status === 'completed').length / activityParticipants.length) * 100
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            {participantUsers.length > 0 ? (
              isActivityPast ? (
                // Leaderboard for ended activities
                <div className="space-y-3">
                  {participantUsers
                    .sort((a, b) => {
                      const aData = activityParticipants.find(p => p.user_id === a?.user_id);
                      const bData = activityParticipants.find(p => p.user_id === b?.user_id);
                      
                      // Sort by status priority: completed > attended > registered
                      const statusPriority = { completed: 3, attended: 2, registered: 1 };
                      const aPriority = statusPriority[aData?.status || 'registered'] || 0;
                      const bPriority = statusPriority[bData?.status || 'registered'] || 0;
                      
                      if (aPriority !== bPriority) {
                        return bPriority - aPriority;
                      }
                      
                      // If same status, sort by join date (earlier is better)
                      return new Date(aData?.created_at || '').getTime() - new Date(bData?.created_at || '').getTime();
                    })
                    .slice(0, 10)
                    .map((participant, index) => {
                      const participantData = activityParticipants.find(p => p.user_id === participant?.user_id);
                      const isTopThree = index < 3 && participantData?.status === 'completed';
                      const rankIcons = ['🥇', '🥈', '🥉'];
                      
                      return (
                        <div 
                          key={participant?.user_id} 
                          className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all ${
                            isTopThree 
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 hover:from-yellow-100 hover:to-orange-100' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => participant && handleParticipantClick(participant)}
                        >
                          {/* Rank */}
                          <div className="flex items-center justify-center w-8 h-8">
                            {isTopThree ? (
                              <span className="text-xl">{rankIcons[index]}</span>
                            ) : (
                              <span className={`font-bold text-lg ${participantData?.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                                #{index + 1}
                              </span>
                            )}
                          </div>
                          
                          {/* Profile */}
                          {participant?.profile_picture_url ? (
                            <img
                              src={participant.profile_picture_url}
                              alt={participant.full_name}
                              className={`rounded-full object-cover ${isTopThree ? 'w-12 h-12' : 'w-10 h-10'}`}
                            />
                          ) : (
                            <div className={`rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center ${isTopThree ? 'w-12 h-12' : 'w-10 h-10'}`}>
                              <span className={`text-white font-semibold ${isTopThree ? 'text-lg' : 'text-sm'}`}>
                                {(participant?.full_name || participant?.username || '').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          {/* Info */}
                          <div className="flex-1">
                            <p className={`font-medium text-gray-900 ${isTopThree ? 'text-lg' : ''}`}>
                              {participant?.full_name || participant?.username}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                participantData?.status === 'completed' ? 'bg-green-100 text-green-800' :
                                participantData?.status === 'attended' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {participantData?.status}
                              </span>
                              {participantData?.status === 'completed' && activity.badge && (
                                <div className="flex items-center space-x-1 text-purple-600">
                                  <img
                                    src={activity.badge.image_url}
                                    alt="Badge earned"
                                    className="w-4 h-4 rounded"
                                  />
                                  <span className="text-xs font-medium">Badge Earned</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Additional Info */}
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              Joined {new Date(participantData?.created_at || '').toLocaleDateString()}
                            </p>
                            {participantData?.status === 'completed' && (
                              <p className="text-xs text-green-600 font-medium">Completed</p>
                            )}
                          </div>
                          
                          {isActivityOrganizer && (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                // Regular grid for ongoing activities
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {participantUsers.slice(0, 8).map((participant) => {
                    const participantData = activityParticipants.find(p => p.user_id === participant?.user_id);
                    return (
                      <div 
                        key={participant?.user_id} 
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => participant && handleParticipantClick(participant)}
                      >
                        {participant?.profile_picture_url ? (
                          <img
                            src={participant.profile_picture_url}
                            alt={participant.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {(participant?.full_name || participant?.username || '').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{participant?.full_name || participant?.username}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              participantData?.status === 'completed' ? 'bg-green-100 text-green-800' :
                              participantData?.status === 'attended' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {participantData?.status}
                            </span>
                            {participantData?.status === 'completed' && activity.badge && (
                              <div className="flex items-center space-x-1 text-purple-600">
                                <img
                                  src={activity.badge.image_url}
                                  alt="Badge earned"
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-xs font-medium">Badge Earned</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {isActivityOrganizer && (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No participants yet. Be the first to join!</p>
              </div>
            )}
            
            {participantUsers.length > 8 && (
              <div className="mt-4 text-center">
                <button className="text-green-600 hover:text-green-700 font-medium">
                  {isActivityPast ? `View full leaderboard (${participantUsers.length} participants)` : `View all ${participantUsers.length} participants`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Join This Activity</h3>
            
            {!isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">You need to login to join activities.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all"
                >
                  Login to Join
                </button>
              </div>
            ) : participation ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">You're registered!</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">Status: {participation.status}</p>
                  {participation.status === 'completed' && activity.badge && (
                    <div className="flex items-center space-x-2 mt-2 text-purple-700">
                      <img
                        src={activity.badge.image_url}
                        alt="Badge earned"
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-sm font-medium">Badge Earned!</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLeaveActivity}
                  disabled={isLeaving || participation.status === 'completed'}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLeaving ? 'Leaving...' : 'Leave Activity'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {isActivityPast && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">This activity has ended.</p>
                  </div>
                )}
                {isActivityFull && !isActivityPast && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-orange-700 text-sm">This activity is full.</p>
                  </div>
                )}
                <button
                  onClick={handleJoinActivity}
                  disabled={isJoining || isActivityPast || isActivityFull}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isJoining ? 'Joining...' : 'Join Activity'}
                </button>
              </div>
            )}
          </div>

          {/* Organization Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Organizer</h3>
            
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={activity.organization?.org_logo_url || 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?w=60'}
                alt={activity.organization?.org_name || 'Organization'}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{activity.organization?.org_name}</h4>
                {activity.organization?.is_verified && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Verified</span>
                  </div>
                )}
              </div>
            </div>

            {activity.organization?.description && (
              <p className="text-gray-600 text-sm mb-4">{activity.organization.description}</p>
            )}

            <div className="space-y-2 text-sm">
              {activity.organization?.website_url && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Globe className="h-4 w-4" />
                  <a 
                    href={activity.organization?.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{activity.organization?.org_email}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Participants</span>
                <span className="font-semibold text-gray-900">{activityParticipants.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Registered</span>
                <span className="font-semibold text-blue-600">{activityParticipants.filter(p => p.status === 'registered').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">{activityParticipants.filter(p => p.status === 'completed').length}</span>
              </div>
              {activity.badge && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Badges Issued</span>
                  <span className="font-semibold text-purple-600">{activityParticipants.filter(p => p.status === 'completed').length}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold text-gray-900">{getDuration()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Badge Available</span>
                <span className="font-semibold text-gray-900">{activity.badge ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className={`font-semibold ${isActivityPast ? 'text-gray-500' : 'text-green-600'}`}>
                  {isActivityPast ? 'Ended' : 'Active'}
                </span>
              </div>
              {isActivityPast && activityParticipants.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-green-600">
                    {Math.round((activityParticipants.filter(p => p.status === 'completed').length / activityParticipants.length) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Participant Detail Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Participant Details</h2>
                <button
                  onClick={closeParticipantModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Participant Info */}
              <div className="space-y-6">
                {/* Profile Section */}
                <div className="flex items-center space-x-4">
                  {selectedParticipant.user.profile_picture_url ? (
                    <img
                      src={selectedParticipant.user.profile_picture_url}
                      alt={selectedParticipant.user.full_name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {(selectedParticipant.user.full_name || selectedParticipant.user.username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedParticipant.user.full_name || selectedParticipant.user.username}
                    </h3>
                    <p className="text-gray-600">@{selectedParticipant.user.username}</p>
                    <p className="text-sm text-gray-500">{selectedParticipant.user.email}</p>
                  </div>
                </div>

                {/* Bio */}
                {selectedParticipant.user.bio && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                    <p className="text-gray-700 text-sm">{selectedParticipant.user.bio}</p>
                  </div>
                )}

                {/* Participation Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Participation Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm font-medium capitalize ${
                        selectedParticipant.participation.status === 'completed' ? 'text-green-600' :
                        selectedParticipant.participation.status === 'attended' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {selectedParticipant.participation.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Joined:</span>
                      <span className="text-sm text-gray-700">
                        {new Date(selectedParticipant.participation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Role:</span>
                      <span className="text-sm text-gray-700 capitalize">{selectedParticipant.user.role.toLowerCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions - Only show for organizers */}
                {isActivityOrganizer && selectedParticipant.user.user_id !== user?.user_id && (
                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Organizer Actions</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-medium text-red-900 mb-1">Remove Participant</h5>
                          <p className="text-sm text-red-700 mb-3">
                            This will remove {selectedParticipant.user.full_name || selectedParticipant.user.username} from this activity. 
                            This action cannot be undone.
                          </p>
                          <button
                            onClick={handleKickParticipant}
                            disabled={isKickingOut}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            <UserX className="h-4 w-4" />
                            <span>{isKickingOut ? 'Removing...' : 'Remove from Activity'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="pt-4">
                  <button
                    onClick={closeParticipantModal}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDetailPage;
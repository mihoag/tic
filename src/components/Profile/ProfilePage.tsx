import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Award,
  Activity,
  Users,
  TrendingUp,
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/apiService';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    bio: '',
    privacy_setting: 'public' as 'public' | 'private' | 'friends_only'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        privacy_setting: user.privacy_setting || 'public'
      });
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleSave = async () => {
    if (!user?.user_id) return;
    
    // Check if any data has changed
    const hasChanges = 
      formData.full_name !== (user.full_name || '') ||
      formData.username !== (user.username || '') ||
      formData.email !== (user.email || '') ||
      formData.bio !== (user.bio || '') ||
      formData.privacy_setting !== (user.privacy_setting || 'public');
    
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const updateData: Partial<{
        full_name?: string;
        username: string;
        email: string;
        bio?: string;
        privacy_setting: 'public' | 'private' | 'friends_only';
      }> = {
        username: formData.username,
        email: formData.email,
        privacy_setting: formData.privacy_setting
      };

      if (formData.full_name.trim()) {
        updateData.full_name = formData.full_name.trim();
      }

      if (formData.bio.trim()) {
        updateData.bio = formData.bio.trim();
      }

      const response = await userService.updateUser(user.user_id, updateData);

      if (response.success) {
        // Update localStorage with new user data
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Refresh the page to reflect changes across the app
        window.location.reload();
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      full_name: user.full_name || '',
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      privacy_setting: user.privacy_setting || 'public'
    });
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt={user.full_name || user.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-green-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center border-4 border-green-100">
                  <span className="text-white text-3xl font-bold">
                    {(user.full_name || user.username)?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Full Name"
                      className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-green-500 outline-none w-full"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Username"
                      className="text-gray-600 bg-transparent border-b-2 border-gray-300 focus:border-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Email"
                      className="text-gray-600 bg-transparent border-b-2 border-gray-300 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {user.full_name || user.username}
                  </h1>
                  <p className="text-gray-600 mb-1">@{user.username}</p>
                  <p className="text-gray-600 mb-4">{user.email}</p>
                </div>
              )}

              {/* Privacy Setting */}
              <div className="flex items-center space-x-2 mt-4">
                {isEditing ? (
                  <select
                    value={formData.privacy_setting}
                    onChange={(e) => handleInputChange('privacy_setting', e.target.value as 'public' | 'private' | 'friends_only')}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-500 outline-none"
                  >
                    <option value="public">Public Profile</option>
                    <option value="friends_only">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    {user.privacy_setting === 'public' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    <span className="text-sm text-gray-600 capitalize">
                      {user.privacy_setting?.replace('_', ' ') || 'Public'} Profile
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isLoading ? 'Saving...' : 'Save'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 outline-none resize-none"
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {user.bio || 'No bio added yet.'}
            </p>
          )}
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-6 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Activities Joined</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Points Earned</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-sm text-gray-600">Level</div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">{user.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600 capitalize">
                {user.role?.toLowerCase()} Account
              </span>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Profile Visibility</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded capitalize">
                {user.privacy_setting?.replace('_', ' ') || 'Public'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Account Status</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email Verified</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Badges */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Badges</h2>
        <div className="text-center py-12">
          <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No badges yet</h3>
          <p className="text-gray-600">Join activities to start earning badges!</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
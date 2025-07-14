import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Award, 
  Clock, 
  ArrowLeft, 
  Save,
  Plus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockBadges } from '../../data/mockData';
import { activityService, badgeService } from '../../services/apiService';
import { Badge } from '../../types';

const CreateActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { organization, isOrganizer, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orgBadges, setOrgBadges] = useState<Badge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [badgeError, setBadgeError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    activity_name: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    badge_def_id: '',
    max_participants: '',
    requirements: '',
    contact_info: ''
  });

  useEffect(() => {
    const fetchOrgBadges = async () => {
      if (!organization?.org_id || !user?.user_id) return;
      
      setLoadingBadges(true);
      setBadgeError(null);
      
      try {
        const response = await badgeService.getBadges({ 
          org_id: organization.org_id,
        });
        
        if (response.success) {
          setOrgBadges(response.data || []);
        } else {
          setBadgeError('Failed to load badges');
        }
      } catch (error) {
        console.error('Error fetching organization badges:', error);
        setBadgeError('Failed to load badges');
        // Fallback to mock data for demo
        const mockOrgBadges = mockBadges.filter(badge => badge.org_id === organization.org_id);
        setOrgBadges(mockOrgBadges);
      } finally {
        setLoadingBadges(false);
      }
    };

    fetchOrgBadges();
  }, [organization?.org_id, user?.user_id]);

  if (!isOrganizer || !organization) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be an organization admin to create activities.</p>
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.activity_name.trim()) {
      newErrors.activity_name = 'Activity name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (startDate >= endDate) {
        newErrors.end_date = 'End date must be after start date';
      }

      if (startDate < new Date()) {
        newErrors.start_date = 'Start date cannot be in the past';
      }
    }

    if (formData.max_participants && parseInt(formData.max_participants) < 1) {
      newErrors.max_participants = 'Maximum participants must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user?.user_id || !organization?.org_id) {
      setErrors({ submit: 'User or organization information is missing' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await activityService.createActivity(organization.org_id, {
        activity_name: formData.activity_name.trim(),
        description: formData.description.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        location: formData.location.trim(),
        badge_def_id: formData.badge_def_id || undefined
      });
      
      if (response.success) {
        setShowSuccess(true);
        
        // Reset form
        setFormData({
          activity_name: '',
          description: '',
          start_date: '',
          end_date: '',
          location: '',
          badge_def_id: '',
          max_participants: '',
          requirements: '',
          contact_info: ''
        });
        
        // Redirect to activities page after a delay
        setTimeout(() => {
          navigate('/activities');
        }, 2000);
      } else {
        setErrors({ submit: response.error || 'Failed to create activity' });
      }
    } catch (error: unknown) {
      console.error('Error creating activity:', error);
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to create activity. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMinDateTime = () => {
    return formatDateTimeLocal(new Date());
  };

  if (showSuccess) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Activity Created Successfully!</h2>
          <p className="text-gray-600 mb-6">Your new ESG activity has been created and is now available for participants.</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/org-dashboard')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setShowSuccess(false);
                setFormData({
                  activity_name: '',
                  description: '',
                  start_date: '',
                  end_date: '',
                  location: '',
                  badge_def_id: '',
                  max_participants: '',
                  requirements: '',
                  contact_info: ''
                });
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Another Activity
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/org-dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New ESG Activity</h1>
        <p className="text-lg text-gray-600">
          Design an engaging activity for your community to participate in
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Activity Details</h2>
              <p className="text-blue-100">Fill in the information below to create your activity</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Basic Information
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="activity_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Name *
                </label>
                <input
                  type="text"
                  id="activity_name"
                  name="activity_name"
                  value={formData.activity_name}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.activity_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Campus Earth Day Cleanup"
                />
                {errors.activity_name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.activity_name}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., University Main Campus"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.location}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className={`block w-full px-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe your activity, what participants will do, and why it matters..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Schedule
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="datetime-local"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    min={getMinDateTime()}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.start_date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.start_date}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="datetime-local"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    min={formData.start_date || getMinDateTime()}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.end_date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.end_date}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Badge & Participation */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Badge & Participation
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="badge_def_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Associated Badge (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="badge_def_id"
                    name="badge_def_id"
                    value={formData.badge_def_id}
                    onChange={handleInputChange}
                    disabled={loadingBadges}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingBadges ? 'Loading badges...' : 'No badge associated'}
                    </option>
                    {!loadingBadges && orgBadges.map(badge => (
                      <option key={badge.badge_def_id} value={badge.badge_def_id}>
                        {badge.badge_name}
                      </option>
                    ))}
                  </select>
                </div>
                {badgeError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{badgeError}</span>
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Select a badge that participants can earn by completing this activity
                </p>
              </div>

              <div>
                <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Participants (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="max_participants"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    min="1"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.max_participants ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 50"
                  />
                </div>
                {errors.max_participants && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.max_participants}</span>
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty for unlimited participants
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Additional Information
            </h3>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                Requirements (Optional)
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={3}
                value={formData.requirements}
                onChange={handleInputChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Any special requirements, equipment needed, or preparation instructions..."
              />
            </div>

            <div>
              <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information (Optional)
              </label>
              <input
                type="text"
                id="contact_info"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleInputChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contact person, phone number, or additional email..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/org-dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Activity</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivityPage;
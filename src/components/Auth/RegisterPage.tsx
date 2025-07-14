import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Mail, 
  Lock, 
  User, 
  Building, 
  Globe,
  AlertCircle,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { authService, organizationService } from '../../services/apiService';
import { ApiError } from '../../types';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    username: '',
    role: 'USER' as 'USER' | 'ORGANIZER',
    bio: '',
    org_name: '',
    org_email: '',
    org_description: '',
    website_url: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Basic validation
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.full_name) newErrors.full_name = 'Full name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) newErrors.username = 'Username can only contain letters, numbers and underscores';

    // Organization validation
    if (formData.role === 'ORGANIZER') {
      if (!formData.org_name) newErrors.org_name = 'Organization name is required';
      if (!formData.org_email) newErrors.org_email = 'Organization email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.org_email)) newErrors.org_email = 'Invalid organization email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Step 1: Register the user
      const userRegistrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        bio: formData.bio || undefined,
        privacy_setting: 'public' as const
      };

      const userResult = await authService.register(userRegistrationData);
      
      if (!userResult.success) {
        setErrors({ submit: userResult.message || 'Registration failed' });
        return;
      }

      // Step 2: If user is an organizer, create the organization
      if (formData.role === 'ORGANIZER' && formData.org_name) {
        try {
          const organizationData = {
            org_name: formData.org_name,
            org_email: formData.org_email,
            user_id_owner: userResult.data.user.user_id,
            description: formData.org_description || undefined,
            website_url: formData.website_url || undefined,
            is_verified: false
          };

          const orgResult = await organizationService.createOrganization(organizationData);
          
          if (!orgResult.success) {
            console.warn('Organization creation failed:', orgResult.message);
            // Don't fail the entire registration if org creation fails
          }
        } catch (orgError) {
          console.warn('Organization creation error:', orgError);
          // Don't fail the entire registration if org creation fails
        }
      }

      // Step 3: Navigate to dashboard on success
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof ApiError) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-2xl">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join PingBadge to earn ESG badges</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl">
          
          
          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.full_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.full_name && <p className="text-sm text-red-600 mt-1">{errors.full_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="johndoe"
                  />
                  {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="example@email.com"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio (optional)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share about yourself and your interests..."
                />
              </div>
            </div>

            {/* Account Type Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => handleInputChange('role', 'USER')}
                  className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                    formData.role === 'USER'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <User className={`h-6 w-6 ${formData.role === 'USER' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <h4 className="font-medium">Individual User</h4>
                      <p className="text-sm text-gray-600">Participate in activities and earn badges</p>
                    </div>
                    {formData.role === 'USER' && <Check className="h-5 w-5 text-blue-600 ml-auto" />}
                  </div>
                </div>

                <div
                  onClick={() => handleInputChange('role', 'ORGANIZER')}
                  className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                    formData.role === 'ORGANIZER'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Building className={`h-6 w-6 ${formData.role === 'ORGANIZER' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <h4 className="font-medium">Organization</h4>
                      <p className="text-sm text-gray-600">Create activities and manage badges</p>
                    </div>
                    {formData.role === 'ORGANIZER' && <Check className="h-5 w-5 text-blue-600 ml-auto" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Information (only for organizers) */}
            {formData.role === 'ORGANIZER' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.org_name}
                        onChange={(e) => handleInputChange('org_name', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.org_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Your Organization Name"
                      />
                    </div>
                    {errors.org_name && <p className="text-sm text-red-600 mt-1">{errors.org_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Email *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={formData.org_email}
                        onChange={(e) => handleInputChange('org_email', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.org_email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="organization@example.com"
                      />
                    </div>
                    {errors.org_email && <p className="text-sm text-red-600 mt-1">{errors.org_email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Description (optional)
                    </label>
                    <textarea
                      value={formData.org_description}
                      onChange={(e) => handleInputChange('org_description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about your organization and its mission..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL (optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        value={formData.website_url}
                        onChange={(e) => handleInputChange('website_url', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.yourorganization.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex space-x-3 pt-6">
              <Link
                to="/login"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center font-medium"
              >
                Already have an account? Sign in
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

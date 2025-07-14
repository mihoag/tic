import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Save, X, Image as ImageIcon, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../types';
import { mockBadges } from '../../data/mockData';
import { uploadImageToCloudinary, getOptimizedImageUrl } from '../../utils/cloudinary';
import { badgeService } from '../../services/apiService';

interface BadgeFormData {
  badge_name: string;
  description: string;
  criteria: string;
  image_url: string;
  is_active: boolean;
}

const initialFormData: BadgeFormData = {
  badge_name: '',
  description: '',
  criteria: '',
  image_url: '',
  is_active: true
};

const BadgePage: React.FC = () => {
  const { organization } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [formData, setFormData] = useState<BadgeFormData>(initialFormData);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!organization) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await badgeService.getBadges({ 
          org_id: organization.org_id,
        });
        
        if (response.success) {
          setBadges(response.data || []);
        } else {
          setError('Failed to load badges');
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
        setError('Failed to load badges');
        // Fallback to mock data for demo
        const orgBadges = mockBadges.filter(badge => badge.org_id === organization.org_id);
        setBadges(orgBadges);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [organization]);

  const handleCreateBadge = () => {
    setEditingBadge(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleEditBadge = (badge: Badge) => {
    setEditingBadge(badge);
    setFormData({
      badge_name: badge.badge_name,
      description: badge.description || '',
      criteria: badge.criteria || '',
      image_url: badge.image_url,
      is_active: badge.is_active
    });
    setIsModalOpen(true);
  };

  const handleDeleteBadge = (badgeId: string) => {
    if (window.confirm('Are you sure you want to delete this badge?')) {
      setBadges(badges.filter(badge => badge.badge_def_id !== badgeId));
      // In real app, make API call to delete badge
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // Use Cloudinary upload utility
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Image upload failed. Please try again.');
      // For demo purposes, use a placeholder image
      setFormData(prev => ({ 
        ...prev, 
        image_url: `https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?w=200&t=${Date.now()}` 
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.badge_name.trim() || !formData.description.trim() || !formData.criteria.trim()) {
      alert('Please fill in all required information');
      return;
    }

    if (!organization) {
      alert('Organization not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingBadge) {
        // Update existing badge (using mock data for now since API update might have different structure)
        const updatedBadge: Badge = {
          ...editingBadge,
          badge_name: formData.badge_name,
          description: formData.description,
          criteria: formData.criteria,
          image_url: formData.image_url || editingBadge.image_url,
          is_active: formData.is_active
        };
        
        setBadges(badges.map(badge => 
          badge.badge_def_id === editingBadge.badge_def_id ? updatedBadge : badge
        ));
      } else {
        // Create new badge using API
        const badgeData = {
          org_id: organization.org_id,
          badge_name: formData.badge_name,
          description: formData.description,
          criteria: formData.criteria,
          image_url: formData.image_url || 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?w=200',
          is_active: formData.is_active,
          badge_type: 'achievement' as const,
          rule_config: {}
        };
        
        const response = await badgeService.createBadge(organization.org_id, badgeData);
        
        if (response.success) {
          setBadges([...badges, response.data]);
        } else {
          throw new Error('Failed to create badge');
        }
      }

      setIsModalOpen(false);
      setFormData(initialFormData);
      setEditingBadge(null);
    } catch (error) {
      console.error('Error saving badge:', error);
      setError('Failed to save badge. Please try again.');
      alert('Failed to save badge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingBadge(null);
    setUploadError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Award className="h-8 w-8 text-blue-600" />
                Manage Badges
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage badges for your organization
              </p>
            </div>
            <button
              onClick={handleCreateBadge}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Create New Badge
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading badges...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <div key={badge.badge_def_id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center overflow-hidden">
                      {badge.image_url ? (
                        <img 
                          src={getOptimizedImageUrl(badge.image_url, 64, 64)} 
                          alt={badge.badge_name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditBadge(badge)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBadge(badge.badge_def_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {badge.badge_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {badge.description || 'No description available'}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    <strong>Tiêu chí:</strong> {badge.criteria || 'No criteria specified'}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      badge.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {badge.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {badge.created_at ? new Date(badge.created_at).toLocaleDateString('vi-VN') : 'Unknown date'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {badges.length === 0 && (
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có badge nào
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first badge to start rewarding participants
            </p>
            <button
              onClick={handleCreateBadge}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Create First Badge
            </button>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingBadge ? 'Edit Badge' : 'Create New Badge'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên Badge *
                    </label>
                    <input
                      type="text"
                      value={formData.badge_name}
                      onChange={(e) => setFormData({ ...formData, badge_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tên badge"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mô tả về badge này"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu chí đạt được *
                    </label>
                    <textarea
                      value={formData.criteria}
                      onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Điều kiện để nhận badge này"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh Badge
                    </label>
                    <div className="space-y-4">
                      {formData.image_url && (
                        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={getOptimizedImageUrl(formData.image_url, 96, 96)} 
                            alt="Badge preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              {isUploading ? (
                                <span>Đang tải lên...</span>
                              ) : (
                                <>
                                  <span className="font-semibold">Click để tải ảnh</span> hoặc kéo thả
                                </>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                      
                      {uploadError && (
                        <p className="text-sm text-red-600 text-center">{uploadError}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      Badge is active
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading || loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {editingBadge ? 'Update' : 'Create Badge'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgePage;

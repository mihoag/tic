// Cloudinary configuration
// Replace these values with your actual Cloudinary credentials

export const CLOUDINARY_CONFIG = {
  cloudName: 'drfyf0req', // Replace with your Cloudinary cloud name
  uploadPreset: 'ping-badge', // Replace with your Cloudinary upload preset
  apiKey: '772363968736568', // Replace with your Cloudinary API key
};

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

// Upload function for badges
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
  formData.append('folder', 'badges'); // Organize images in a folder

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.secure_url;
};

// Image transformation helpers
export const getOptimizedImageUrl = (url: string, width = 200, height = 200) => {
  if (!url.includes('cloudinary.com')) {
    return url; // Return original URL if it's not from Cloudinary
  }
  
  const baseUrl = url.split('/upload/')[0];
  const imagePath = url.split('/upload/')[1];
  
  return `${baseUrl}/upload/w_${width},h_${height},c_fill,f_auto,q_auto/${imagePath}`;
};

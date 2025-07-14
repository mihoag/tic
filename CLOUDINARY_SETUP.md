# Cloudinary Setup Instructions

## Overview
This application uses Cloudinary for image upload and management in the badge system. Follow these steps to configure Cloudinary for your project.

## Setup Steps

### 1. Create a Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/) and create a free account
2. After signup, you'll be redirected to your dashboard

### 2. Get Your Credentials
From your Cloudinary dashboard, you'll need:
- **Cloud Name**: Found in the dashboard header
- **API Key**: Found in the Account Details section
- **API Secret**: Found in the Account Details section (for server-side operations)

### 3. Create an Upload Preset
1. Go to Settings → Upload → Upload presets
2. Click "Add upload preset"
3. Configure the preset:
   - **Preset name**: `badge_uploads` (or any name you prefer)
   - **Signing Mode**: Set to "Unsigned" for client-side uploads
   - **Folder**: Set to `badges` to organize uploaded images
   - **Allowed formats**: jpg, png, gif, webp
   - **Max file size**: 5MB
   - **Image transformations**: 
     - Width: 400px
     - Height: 400px
     - Crop mode: Fill
     - Format: Auto
     - Quality: Auto

### 4. Configure the Application
1. Open `src/utils/cloudinary.ts`
2. Replace the placeholder values:
   ```typescript
   export const CLOUDINARY_CONFIG = {
     cloudName: 'your_actual_cloud_name', // Replace with your cloud name
     uploadPreset: 'badge_uploads', // Replace with your upload preset name
     apiKey: 'your_api_key', // Replace with your API key (optional for unsigned uploads)
   };
   ```

### 5. Environment Variables (Recommended)
For better security, create a `.env` file in your project root:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=badge_uploads
VITE_CLOUDINARY_API_KEY=your_api_key
```

Then update `src/utils/cloudinary.ts` to use environment variables:
```typescript
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'badge_uploads',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your_api_key',
};
```

## Features

### Image Upload
- Supports PNG, JPG, GIF, WebP formats
- Maximum file size: 5MB
- Automatic image optimization
- Images are stored in the `badges` folder

### Image Transformations
- Automatic resizing and optimization
- Different sizes for different use cases:
  - Thumbnail: 64x64px
  - Preview: 96x96px
  - Full size: 400x400px

### Error Handling
- File type validation
- File size validation
- Upload error handling with fallback images

## Usage in Components

The badge management system automatically handles:
1. Image upload validation
2. Progress indication during upload
3. Error handling and user feedback
4. Image optimization for different display sizes

## Security Considerations

1. **Upload Presets**: Use unsigned upload presets for client-side uploads
2. **File Validation**: Always validate file types and sizes on both client and server
3. **Rate Limiting**: Consider implementing rate limiting for uploads
4. **Folder Organization**: Images are automatically organized in the `badges` folder

## Troubleshooting

### Common Issues:

1. **Upload fails with 401 error**:
   - Check if your upload preset is set to "Unsigned"
   - Verify the cloud name is correct

2. **Images not displaying**:
   - Check the image URL format
   - Verify the cloud name in the URL

3. **Upload preset not found**:
   - Ensure the upload preset name matches exactly
   - Check that the preset is enabled

### Testing
To test the upload functionality:
1. Log in as an organizer account
2. Go to "Manage Badges"
3. Create a new badge
4. Upload an image and verify it appears correctly

## Cost Considerations

Cloudinary free tier includes:
- 25 GB storage
- 25 GB bandwidth per month
- Basic transformations

For production applications, consider upgrading to a paid plan based on your usage needs.

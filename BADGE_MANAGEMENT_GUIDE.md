## Badge Management System - Cloudinary Setup

### Quick Setup Instructions:

1. **Create Cloudinary Account**: Visit https://cloudinary.com and sign up
2. **Get Credentials**: Copy your Cloud Name from the dashboard
3. **Create Upload Preset**: Go to Settings > Upload > Add preset (set to "Unsigned")
4. **Update Config**: Edit `src/utils/cloudinary.ts` with your credentials

### Test the System:

1. Login with organizer account: admin@greentech.org
2. Navigate to "Manage Badges" in header
3. Click "Create Badge"
4. Upload an image and fill form
5. Save to see your badge in the collection

### Features Implemented:

✅ Badge CRUD operations (Create, Read, Update, Delete)
✅ Image upload to Cloudinary with validation
✅ Vietnamese language interface
✅ Responsive design
✅ Form validation and error handling
✅ Image optimization and resizing

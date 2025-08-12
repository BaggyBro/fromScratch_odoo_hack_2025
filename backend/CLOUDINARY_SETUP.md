# Cloudinary Profile Photo Integration

## Overview

This integration allows users to upload, manage, and store profile photos using Cloudinary's cloud storage service.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="ddlgm6pk5"
CLOUDINARY_API_KEY="763646348521217"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret_here"
CLOUDINARY_URL="cloudinary://763646348521217:your_api_secret@ddlgm6pk5"
```

## Features

### Backend API Endpoints

1. **Upload Profile Photo**
   - `POST /profile/photo/upload`
   - Requires authentication
   - Accepts photo URL in request body
   - Returns updated user profile

2. **Get Profile Photo**
   - `GET /profile/photo`
   - Requires authentication
   - Returns user's profile photo URL

3. **Delete Profile Photo**
   - `DELETE /profile/photo`
   - Requires authentication
   - Removes photo from Cloudinary and database

4. **Update Profile Photo**
   - `PUT /profile/photo`
   - Requires authentication
   - Replaces existing photo with new one

### Frontend Integration

The frontend includes:

1. **Profile Page** (`/profile`)
   - Upload new profile photos
   - Delete existing photos
   - Edit profile information
   - Real-time preview

2. **Signup Page**
   - Profile photo upload during registration
   - Automatic Cloudinary integration

## How It Works

### Upload Process

1. **Frontend**: User selects image file
2. **Cloudinary Upload**: File uploaded directly to Cloudinary
3. **Backend Processing**: Cloudinary URL saved to database
4. **Image Optimization**: Automatic resizing and optimization
5. **Response**: Updated user profile returned

### Image Transformations

All uploaded images are automatically:
- Resized to 400x400 pixels
- Cropped to fill with face detection
- Optimized for web delivery
- Stored in "profile-photos" folder

### Security Features

- Authentication required for all operations
- File size validation (5MB limit)
- Image format validation
- Secure URL generation
- Automatic cleanup of old photos

## API Usage Examples

### Upload Profile Photo

```javascript
// Frontend
const response = await profilePhotoAPI.uploadProfilePhoto(photoUrl);

// Backend
POST /profile/photo/upload
{
  "photoUrl": "https://res.cloudinary.com/ddlgm6pk5/image/upload/..."
}
```

### Get Profile Photo

```javascript
// Frontend
const response = await profilePhotoAPI.getProfilePhoto();

// Backend
GET /profile/photo
```

### Delete Profile Photo

```javascript
// Frontend
const response = await profilePhotoAPI.deleteProfilePhoto();

// Backend
DELETE /profile/photo
```

## Error Handling

The system handles various error scenarios:

- **Invalid file format**: Returns 400 error
- **File too large**: Returns 400 error with size limit message
- **Upload failures**: Returns 500 error with retry suggestion
- **Authentication errors**: Returns 401 error
- **Network issues**: Graceful fallback with user feedback

## File Structure

```
backend/
├── controllers/
│   └── profilePhoto.js          # Profile photo management
├── routes/
│   └── routes.js                # API routes
└── CLOUDINARY_SETUP.md          # This file

frontend/
├── src/
│   ├── pages/
│   │   ├── Profile.tsx          # Profile management page
│   │   └── auth/
│   │       └── Signup.tsx       # Signup with photo upload
│   └── lib/
│       └── api.ts               # API functions
```

## Benefits

1. **Scalable Storage**: Cloudinary handles image storage and delivery
2. **Automatic Optimization**: Images optimized for performance
3. **CDN Delivery**: Fast global image delivery
4. **Face Detection**: Smart cropping for profile photos
5. **Secure URLs**: Protected image URLs
6. **Easy Management**: Simple upload/delete operations

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check Cloudinary credentials
   - Verify file size and format
   - Check network connection

2. **Images Not Loading**
   - Verify Cloudinary URL format
   - Check CORS settings
   - Validate authentication

3. **Delete Not Working**
   - Check file permissions
   - Verify public_id extraction
   - Check Cloudinary API limits

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV="development"
```

This will show detailed error messages in the API responses. 
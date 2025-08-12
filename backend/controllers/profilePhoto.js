import { PrismaClient } from "@prisma/client";
import cloudinary from "cloudinary";
import multer from "multer";

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "ddlgm6pk5",
  api_key: process.env.CLOUDINARY_API_KEY || "763646348521217",
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Direct file upload to Cloudinary
export async function uploadProfilePhotoFile(req, res) {
  try {
    const userId = req.user.userId;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Convert buffer to base64 for Cloudinary
    const fileBuffer = req.file.buffer;
    const base64File = fileBuffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64File}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.v2.uploader.upload(dataURI, {
      folder: "profile-photos",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" }
      ]
    });

    // Update user profile with Cloudinary URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePic: uploadResult.secure_url
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePic: true,
        age: true,
        gender: true,
        city: true,
        country: true,
        description: true
      }
    });

    res.json({
      success: true,
      message: "Profile photo uploaded successfully",
      user: updatedUser,
      photoUrl: uploadResult.secure_url
    });

  } catch (error) {
    console.error("Profile photo upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload profile photo",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Upload profile photo to Cloudinary
export async function uploadProfilePhoto(req, res) {
  try {
    const userId = req.user.userId;
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        message: "Photo URL is required"
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.v2.uploader.upload(photoUrl, {
      folder: "profile-photos",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" }
      ]
    });

    // Update user profile with Cloudinary URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePic: uploadResult.secure_url
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePic: true,
        age: true,
        gender: true,
        city: true,
        country: true,
        description: true
      }
    });

    res.json({
      success: true,
      message: "Profile photo uploaded successfully",
      user: updatedUser,
      photoUrl: uploadResult.secure_url
    });

  } catch (error) {
    console.error("Profile photo upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload profile photo",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get user profile photo
export async function getProfilePhoto(req, res) {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        profilePic: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      profilePic: user.profilePic,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error("Get profile photo error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile photo"
    });
  }
}

// Delete profile photo
export async function deleteProfilePhoto(req, res) {
  try {
    const userId = req.user.userId;

    // Get current user to check if they have a profile photo
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePic: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // If user has a profile photo, delete it from Cloudinary
    if (user.profilePic) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = user.profilePic.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        const folder = "profile-photos";
        const fullPublicId = `${folder}/${publicId}`;
        
        await cloudinary.v2.uploader.destroy(fullPublicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error:", cloudinaryError);
        // Continue with database update even if Cloudinary delete fails
      }
    }

    // Update user to remove profile photo
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePic: null
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePic: true,
        age: true,
        gender: true,
        city: true,
        country: true,
        description: true
      }
    });

    res.json({
      success: true,
      message: "Profile photo deleted successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Delete profile photo error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete profile photo"
    });
  }
}

// Update profile photo (replace existing)
export async function updateProfilePhoto(req, res) {
  try {
    const userId = req.user.userId;
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        message: "Photo URL is required"
      });
    }

    // Get current user to check if they have a profile photo
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePic: true }
    });

    // Delete old photo from Cloudinary if it exists
    if (currentUser?.profilePic) {
      try {
        const urlParts = currentUser.profilePic.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        const folder = "profile-photos";
        const fullPublicId = `${folder}/${publicId}`;
        
        await cloudinary.v2.uploader.destroy(fullPublicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error:", cloudinaryError);
        // Continue with new upload even if old photo delete fails
      }
    }

    // Upload new photo to Cloudinary
    const uploadResult = await cloudinary.v2.uploader.upload(photoUrl, {
      folder: "profile-photos",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" }
      ]
    });

    // Update user profile with new Cloudinary URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePic: uploadResult.secure_url
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePic: true,
        age: true,
        gender: true,
        city: true,
        country: true,
        description: true
      }
    });

    res.json({
      success: true,
      message: "Profile photo updated successfully",
      user: updatedUser,
      photoUrl: uploadResult.secure_url
    });

  } catch (error) {
    console.error("Update profile photo error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile photo",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Export multer upload for use in routes
export { upload }; 
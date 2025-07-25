import cloudinary from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Validate image file
const validateImage = (file) => {
  // Check if file exists
  if (!file) {
    return { valid: false, message: "No file uploaded" };
  }

  // Check file type
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, message: "Only JPEG, PNG, and WebP images are allowed" };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, message: "Image size should be less than 5MB" };
  }

  return { valid: true };
};

// Upload image to Cloudinary
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      // No file uploaded, continue to next middleware
      return next();
    }

    // Validate image
    const validation = validateImage(req.file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Convert buffer to base64
    const fileStr = req.file.buffer.toString('base64');
    const fileType = req.file.mimetype;
    
    // Set upload options
    const uploadOptions = {
      folder: 'finvista/images',
      resource_type: 'auto',
      // Add quality optimization
      quality: "auto",
      fetch_format: "auto",
    };

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(
      `data:${fileType};base64,${fileStr}`,
      uploadOptions
    );

    // Add cloudinary URL and public_id to request object
    req.fileUrl = uploadResponse.secure_url;
    req.filePublicId = uploadResponse.public_id;
    next();
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading image. Please try again."
    });
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
    // console.log(`Successfully deleted image with public_id: ${publicId}`);
    return true;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return false;
  }
};
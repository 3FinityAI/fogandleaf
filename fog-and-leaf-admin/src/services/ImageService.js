/**
 * Image Service
 * Handles all image upload and management operations
 */

import axiosInstance from "../utils/axiosInstance";

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of files to upload
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<string[]>} - Array of uploaded image URLs
 */
export const uploadImages = async (files, onProgress = null) => {
  if (!files || files.length === 0) {
    throw new Error("No files provided for upload");
  }

  const formData = new FormData();

  // Add all files to FormData
  files.forEach((file) => {
    formData.append("images", file);
  });

  try {
    const response = await axiosInstance.post("/upload/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    if (response.data.success) {
      return response.data.images.map((img) => img.imageUrl);
    } else {
      throw new Error(response.data.message || "Upload failed");
    }
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error(
      `Upload failed: ${error.response?.data?.message || error.message}`
    );
  }
};

/**
 * Upload a single image to Cloudinary
 * @param {File} file - File to upload
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<string>} - Uploaded image URL
 */
export const uploadSingleImage = async (file, onProgress = null) => {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axiosInstance.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    if (response.data.success) {
      return response.data.imageUrl;
    } else {
      throw new Error(response.data.message || "Upload failed");
    }
  } catch (error) {
    console.error("Single image upload failed:", error);
    throw new Error(
      `Upload failed: ${error.response?.data?.message || error.message}`
    );
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteImage = async (publicId) => {
  if (!publicId) {
    throw new Error("Public ID is required for deletion");
  }

  try {
    const response = await axiosInstance.delete(`/upload/image/${publicId}`);
    return response.data.success;
  } catch (error) {
    console.error("Image deletion failed:", error);
    throw new Error(
      `Deletion failed: ${error.response?.data?.message || error.message}`
    );
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @returns {string|null} - Public ID or null if extraction fails
 */
export const extractPublicId = (cloudinaryUrl) => {
  try {
    const urlParts = cloudinaryUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) return null;

    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"],
  } = options;

  const errors = [];

  // Check file type
  if (!file.type.startsWith("image/")) {
    errors.push(`File "${file.name}" is not an image.`);
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    errors.push(
      `File "${file.name}" has unsupported format. Allowed: ${allowedTypes.join(
        ", "
      )}`
    );
  }

  // Check file extension
  const extension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));
  if (!allowedExtensions.includes(extension)) {
    errors.push(
      `File "${
        file.name
      }" has unsupported extension. Allowed: ${allowedExtensions.join(", ")}`
    );
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    errors.push(
      `File "${file.name}" is too large. Maximum size is ${maxSizeMB}MB.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

/**
 * Validate multiple files
 * @param {FileList|File[]} files - Files to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result with valid and invalid files
 */
export const validateFiles = (files, options = {}) => {
  const fileArray = Array.from(files);
  const validFiles = [];
  const invalidFiles = [];
  const allErrors = [];

  fileArray.forEach((file) => {
    const validation = validateFile(file, options);
    if (validation.isValid) {
      validFiles.push(file);
    } else {
      invalidFiles.push(file);
      allErrors.push(...validation.errors);
    }
  });

  return {
    validFiles,
    invalidFiles,
    errors: allErrors,
    isValid: allErrors.length === 0,
  };
};

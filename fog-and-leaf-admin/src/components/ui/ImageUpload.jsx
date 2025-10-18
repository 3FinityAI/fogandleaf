import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const ImageUpload = ({
  existingImages = [],
  onImagesChange,
  onUploadFunction, // New prop to pass upload function to parent
  maxImages = 10,
  maxSizePerImage = 5 * 1024 * 1024, // 5MB
  disabled = false,
  showPreview = true,
  className = "",
}) => {
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Handle file selection and validation
  const handleFileSelection = useCallback(
    (files) => {
      const fileArray = Array.from(files);
      const validFiles = [];
      const newErrors = [];

      // Check total image limit
      const totalImages =
        existingImages.length + uploadingFiles.length + fileArray.length;
      if (totalImages > maxImages) {
        newErrors.push(
          `Maximum ${maxImages} images allowed. You're trying to add ${totalImages} images.`
        );
        setErrors(newErrors);
        return;
      }

      fileArray.forEach((file) => {
        // Check file type
        if (!file.type.startsWith("image/")) {
          newErrors.push(`File "${file.name}" is not an image.`);
          return;
        }

        // Check file size
        if (file.size > maxSizePerImage) {
          const maxSizeMB = (maxSizePerImage / (1024 * 1024)).toFixed(1);
          newErrors.push(
            `File "${file.name}" is too large. Maximum size is ${maxSizeMB}MB.`
          );
          return;
        }

        // Check for duplicates
        const isDuplicate = uploadingFiles.some(
          (existing) =>
            existing.name === file.name && existing.size === file.size
        );

        if (!isDuplicate) {
          validFiles.push(file);
        }
      });

      if (newErrors.length > 0) {
        setErrors(newErrors);
        // Clear errors after 5 seconds
        setTimeout(() => setErrors([]), 5000);
      }

      if (validFiles.length > 0) {
        setUploadingFiles((prev) => [...prev, ...validFiles]);
        setErrors([]);
      }
    },
    [existingImages.length, uploadingFiles, maxImages, maxSizePerImage]
  );

  // Handle drag and drop
  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      if (!disabled) {
        setDragActive(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelection(files);
      }
    },
    [disabled, handleFileSelection]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e) => {
      const files = e.target.files;
      if (files.length > 0) {
        handleFileSelection(files);
      }
      // Reset file input
      e.target.value = "";
    },
    [handleFileSelection]
  );

  // Remove file from upload queue
  const removeUploadingFile = useCallback((index) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  }, []);

  // Remove existing image
  const removeExistingImage = useCallback(
    (index) => {
      const newImages = existingImages.filter((_, i) => i !== index);
      onImagesChange(newImages);
    },
    [existingImages, onImagesChange]
  );

  // Upload all files and add them to existing images
  const uploadFiles = useCallback(async () => {
    if (uploadingFiles.length === 0) return [];

    try {
      setUploadProgress({ 0: 0 }); // Single progress for all files

      const formData = new FormData();

      // Add all files to FormData
      uploadingFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axiosInstance.post("/upload/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress({ 0: percentCompleted });
        },
      });

      if (response.data.success) {
        const uploadedUrls = response.data.images.map((img) => img.imageUrl);

        // Add uploaded images to existing images immediately
        const newExistingImages = [...existingImages, ...uploadedUrls];
        onImagesChange(newExistingImages);

        // Clear uploaded files and progress after successful upload
        setUploadingFiles([]);
        setUploadProgress({});

        // Return the URLs for any additional processing
        return uploadedUrls;
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setErrors((prev) => [...prev, `Upload failed: ${error.message}`]);
      setUploadProgress({});
      return [];
    }
  }, [uploadingFiles, existingImages, onImagesChange]);

  // Get progress status for files (simplified for batch upload)
  const getOverallProgress = useCallback(() => {
    const progress = uploadProgress[0];
    if (progress === undefined) return { status: "pending", percentage: 0 };
    if (progress === -1) return { status: "error", percentage: 0 };
    if (progress === 100) return { status: "complete", percentage: 100 };
    return { status: "uploading", percentage: progress };
  }, [uploadProgress]);

  // Expose upload function to parent through a ref
  const uploadRef = useRef({ uploadFiles });
  uploadRef.current = { uploadFiles };

  // Pass upload function to parent via callback prop
  React.useEffect(() => {
    if (onUploadFunction) {
      onUploadFunction(uploadFiles);
    }
  }, [uploadFiles, onUploadFunction]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {!disabled && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
            ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              {dragActive ? "Drop images here" : "Upload product images"}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop your images here, or click to browse
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG, WebP up to{" "}
              {(maxSizePerImage / (1024 * 1024)).toFixed(1)}MB each (Max{" "}
              {maxImages} images)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Existing Images */}
      {showPreview && existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Current Images
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {existingImages.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/100/96";
                  }}
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files to Upload */}
      {uploadingFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Files to Upload ({uploadingFiles.length})
          </h4>
          <div className="space-y-2">
            {uploadingFiles.map((file, index) => {
              const overallProgress = getOverallProgress();
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>

                    {/* Progress Bar */}
                    {overallProgress.status !== "pending" && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              overallProgress.status === "error"
                                ? "bg-red-500"
                                : overallProgress.status === "complete"
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${overallProgress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    {overallProgress.status === "uploading" && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {overallProgress.status === "complete" && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                    {overallProgress.status === "error" && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    {(overallProgress.status === "pending" ||
                      overallProgress.status === "error") &&
                      !disabled && (
                        <button
                          type="button"
                          onClick={() => removeUploadingFile(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upload Button */}
          {uploadingFiles.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={uploadFiles}
                disabled={
                  disabled || getOverallProgress().status === "uploading"
                }
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${
                  getOverallProgress().status === "uploading"
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {getOverallProgress().status === "uploading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload {uploadingFiles.length} Image
                    {uploadingFiles.length > 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Summary */}
      {(existingImages.length > 0 || uploadingFiles.length > 0) && (
        <div className="text-xs text-gray-500 text-center">
          {existingImages.length + uploadingFiles.length} of {maxImages} images
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

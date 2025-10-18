import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

const ImageUpload = ({
  existingImages = [],
  onImagesChange,
  selectedFiles = [],
  onFilesChange,
  maxImages = 10,
  maxSizePerImage = 5 * 1024 * 1024, // 5MB
  disabled = false,
  showPreview = true,
  className = "",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Validate files
  const validateFiles = useCallback(
    (files) => {
      const fileArray = Array.from(files);
      const validFiles = [];
      const newErrors = [];

      // Check total image limit
      const totalImages =
        existingImages.length + selectedFiles.length + fileArray.length;
      if (totalImages > maxImages) {
        newErrors.push(
          `Maximum ${maxImages} images allowed. You're trying to add ${totalImages} images.`
        );
        setErrors(newErrors);
        return [];
      }

      fileArray.forEach((file) => {
        // Check file type
        if (!file.type.startsWith("image/")) {
          newErrors.push(`File "${file.name}" is not an image.`);
          return;
        }

        // Check specific image types
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          newErrors.push(`File "${file.name}" must be JPEG, PNG, or WebP.`);
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
        const isDuplicate = selectedFiles.some(
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
      } else {
        setErrors([]);
      }

      return validFiles;
    },
    [existingImages.length, selectedFiles, maxImages, maxSizePerImage]
  );

  // Handle file selection
  const handleFileSelection = useCallback(
    (files) => {
      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        const newFiles = [...selectedFiles, ...validFiles];
        onFilesChange(newFiles);
      }
    },
    [selectedFiles, onFilesChange, validateFiles]
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

  // Remove existing image
  const removeExistingImage = useCallback(
    (index) => {
      const newImages = existingImages.filter((_, i) => i !== index);
      onImagesChange(newImages);
    },
    [existingImages, onImagesChange]
  );

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

      {/* Selected Files to Upload */}
      {selectedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
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
                </div>

                <div className="flex-shrink-0">
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = selectedFiles.filter(
                          (_, i) => i !== index
                        );
                        onFilesChange(newFiles);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {(existingImages.length > 0 || selectedFiles.length > 0) && (
        <div className="text-xs text-gray-500 text-center">
          {existingImages.length + selectedFiles.length} of {maxImages} images
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

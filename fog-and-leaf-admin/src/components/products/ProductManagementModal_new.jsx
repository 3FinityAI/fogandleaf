import { useState, useEffect, useRef } from "react";
import {
  X,
  Package,
  Save,
  Edit3,
  Eye,
  Trash2,
  Upload,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const ProductManagementModal = ({ product, mode, onClose, onSave, isOpen }) => {
  const [formData, setFormData] = useState({
    // Required fields
    name: "",
    category: "",
    price: "",
    stockQuantity: "",

    // Optional fields
    description: "",
    longDescription: "",
    originalPrice: "",
    weight: "100",
    imageUrl: [],
    features: [],
    tags: [],
    brewingInstructions: "",
    origin: "",

    // Boolean fields
    isActive: true,
    inStock: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Image upload states
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Categories from the schema
  const categories = [
    { value: "blacktea", label: "Black Tea" },
    { value: "blendedtea", label: "Blended Tea" },
    { value: "greentea", label: "Green Tea" },
    { value: "herbal", label: "Herbal Tea" },
    { value: "oolong", label: "Oolong Tea" },
    { value: "whitetea", label: "White Tea" },
  ];

  useEffect(() => {
    if (product && mode !== "create") {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        price: product.price || "",
        stockQuantity: product.stockQuantity || "",
        description: product.description || "",
        longDescription: product.longDescription || "",
        originalPrice: product.originalPrice || "",
        weight: product.weight || "100",
        imageUrl: Array.isArray(product.imageUrl)
          ? product.imageUrl
          : product.imageUrl
          ? [product.imageUrl]
          : [],
        features: Array.isArray(product.features) ? product.features : [],
        tags: Array.isArray(product.tags) ? product.tags : [],
        brewingInstructions: product.brewingInstructions || "",
        origin: product.origin || "",
        isActive: product.isActive !== undefined ? product.isActive : true,
        inStock: product.inStock !== undefined ? product.inStock : true,
      });
    } else {
      setFormData({
        name: "",
        category: "",
        price: "",
        stockQuantity: "",
        description: "",
        longDescription: "",
        originalPrice: "",
        weight: "100",
        imageUrl: [],
        features: [],
        tags: [],
        brewingInstructions: "",
        origin: "",
        isActive: true,
        inStock: true,
      });
    }
    setError("");
    setImageFiles([]);
    setUploadingImages(false);
    setDragActive(false);
  }, [product, mode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayInputChange = (field, value) => {
    const arrayValue = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setFormData((prev) => ({
      ...prev,
      [field]: arrayValue,
    }));
  };

  // Image upload handlers
  const handleImageSelect = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Please select only image files");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Image size should be less than 5MB");
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...validFiles]);
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleImageSelect(files);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleImageSelect(files);
  };

  const removeImage = (index, isUploadedImage = false) => {
    if (isUploadedImage) {
      // Remove from existing imageUrl array
      setFormData((prev) => ({
        ...prev,
        imageUrl: prev.imageUrl.filter((_, i) => i !== index),
      }));
    } else {
      // Remove from new files to upload
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls = [];

    try {
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append("image", file);

        // TODO: Replace with actual Cloudinary upload endpoint
        const response = await axiosInstance.post("/upload/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          uploadedUrls.push(response.data.imageUrl);
        }
      }

      // Clear the image files after successful upload
      setImageFiles([]);

      return uploadedUrls;
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Failed to upload images. Please try again.");
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "view") return;

    setLoading(true);
    setError("");

    try {
      // Upload new images first if any
      const newImageUrls = await uploadImages();

      // Combine existing images with newly uploaded ones
      const allImageUrls = [...formData.imageUrl, ...newImageUrls];

      // Prepare data for API
      const apiData = {
        ...formData,
        imageUrl: allImageUrls,
        price: parseFloat(formData.price) || 0,
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : null,
        weight: parseFloat(formData.weight) || 100,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
      };

      let response;
      if (mode === "create") {
        response = await axiosInstance.post("/products", apiData);
      } else if (mode === "edit") {
        response = await axiosInstance.put(`/products/${product.id}`, apiData);
      } else if (mode === "delete") {
        response = await axiosInstance.delete(`/products/${product.id}`);
      }

      if (response.data.success) {
        onSave();
      } else {
        throw new Error(response.data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Product operation error:", err);
      setError(
        err.response?.data?.message || err.message || "Operation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    await handleSubmit({ preventDefault: () => {} });
  };

  if (!isOpen) return null;

  const isReadOnly = mode === "view";
  const isDeleting = mode === "delete";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {mode === "view" && <Eye className="h-5 w-5 text-blue-600" />}
            {mode === "edit" && <Edit3 className="h-5 w-5 text-green-600" />}
            {mode === "create" && <Package className="h-5 w-5 text-blue-600" />}
            {mode === "delete" && <Trash2 className="h-5 w-5 text-red-600" />}
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "view" && "View Product"}
              {mode === "edit" && "Edit Product"}
              {mode === "create" && "Create New Product"}
              {mode === "delete" && "Delete Product"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {isDeleting && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">
                Are you sure you want to delete "{product?.name}"? This action
                cannot be undone.
              </p>
            </div>
          )}

          {/* Main Form Layout */}
          <div className="space-y-8">
            {/* Top Section: Basic Info + Images */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Basic Information (2/3 width) */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isReadOnly || isDeleting}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      disabled={isReadOnly || isDeleting}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (grams) *
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      disabled={isReadOnly || isDeleting}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      disabled={isReadOnly || isDeleting}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price (₹)
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      disabled={isReadOnly || isDeleting}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      disabled={isReadOnly || isDeleting}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={isReadOnly || isDeleting}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Right: Product Images (1/3 width) */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Product Images
                </h3>

                {/* Existing Images */}
                {formData.imageUrl.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Images
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.imageUrl.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.src = "/api/placeholder/100/96";
                            }}
                          />
                          {!isReadOnly && !isDeleting && (
                            <button
                              type="button"
                              onClick={() => removeImage(index, true)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Upload Area */}
                {!isReadOnly && !isDeleting && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Images
                    </label>

                    {/* Compact Drag & Drop Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        dragActive
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-500 font-medium text-sm"
                      >
                        Choose files
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG up to 5MB
                      </p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>

                    {/* Preview New Images */}
                    {imageFiles.length > 0 && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Images ({imageFiles.length})
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {imageFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`New image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index, false)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                                {(file.size / 1024 / 1024).toFixed(1)}MB
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload Progress */}
                    {uploadingImages && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          <span className="text-blue-700 text-sm">
                            Uploading...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Section: Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Additional Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Long Description
                  </label>
                  <textarea
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleInputChange}
                    disabled={isReadOnly || isDeleting}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Origin
                  </label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    disabled={isReadOnly || isDeleting}
                    placeholder="e.g., Assam, India"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Features (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.features.join(", ")}
                    onChange={(e) =>
                      handleArrayInputChange("features", e.target.value)
                    }
                    disabled={isReadOnly || isDeleting}
                    placeholder="Organic, Premium, Handpicked"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Brewing & Tags
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brewing Instructions
                  </label>
                  <textarea
                    name="brewingInstructions"
                    value={formData.brewingInstructions}
                    onChange={handleInputChange}
                    disabled={isReadOnly || isDeleting}
                    rows={4}
                    placeholder="How to brew this tea..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(", ")}
                    onChange={(e) =>
                      handleArrayInputChange("tags", e.target.value)
                    }
                    disabled={isReadOnly || isDeleting}
                    placeholder="strong, aromatic, morning"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                {/* Status Controls */}
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium text-gray-900">Product Status</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        disabled={isReadOnly || isDeleting}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Active Product
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleInputChange}
                        disabled={isReadOnly || isDeleting}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">In Stock</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>

            {!isReadOnly && (
              <button
                type={isDeleting ? "button" : "submit"}
                onClick={isDeleting ? handleDelete : undefined}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                  isDeleting
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } disabled:opacity-50`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {uploadingImages ? "Uploading images..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isDeleting
                      ? "Delete Product"
                      : mode === "create"
                      ? "Create Product"
                      : "Save Changes"}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductManagementModal;

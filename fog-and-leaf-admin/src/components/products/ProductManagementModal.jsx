import { useState, useEffect } from "react";
import { X, Package, Save, Edit3, Eye, Trash2, Loader2 } from "lucide-react";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  formatProductData,
} from "../../services/ProductService";
import { uploadImages } from "../../services/ImageService";
import ImageUpload from "./ImageUpload";

const ProductManagementModal = ({ product, mode, onClose, onSave, isOpen }) => {
  const [formData, setFormData] = useState({
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const categories = [
    { value: "Black Tea", label: "Black Tea" },
    { value: "Blended Tea", label: "Blended Tea" },
    { value: "Green Tea", label: "Green Tea" },
    { value: "Herbal Tea", label: "Herbal Tea" },
    { value: "Oolong Tea", label: "Oolong Tea" },
    { value: "White Tea", label: "White Tea" },
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
      setSelectedFiles([]);
    } else if (mode === "create") {
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
      setSelectedFiles([]);
    }
    setError("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "view") return;

    setLoading(true);
    setError("");

    try {
      // Upload selected files first (if any)
      let newlyUploadedUrls = [];
      if (selectedFiles.length > 0) {
        newlyUploadedUrls = await uploadImages(selectedFiles);
      }

      // Combine existing images with newly uploaded ones
      const finalImageUrls = [...formData.imageUrl, ...newlyUploadedUrls];

      // Prepare data for API with all image URLs
      const apiData = formatProductData({
        ...formData,
        imageUrl: finalImageUrls,
      });

      let response;
      if (mode === "create") {
        response = await createProduct(apiData);
      } else if (mode === "edit") {
        response = await updateProduct(product.id, apiData);
      } else if (mode === "delete") {
        // Use permanent delete for admin panel
        response = await deleteProduct(product.id, true);
      }

      if (response.success) {
        setError("");

        setTimeout(() => {
          onSave();
        }, 500);
      } else {
        throw new Error(response.message || "Operation failed");
      }
    } catch (err) {
      console.error("Product operation error:", err);

      let errorMessage = "Operation failed";

      if (
        err.message.includes("already exists") ||
        err.message.includes("duplicate")
      ) {
        errorMessage =
          "This product already exists. Please check for duplicates or modify the product details.";
      } else if (
        err.message.includes("Server error") ||
        err.message.includes("try again later")
      ) {
        errorMessage =
          "Server error occurred. Please try again in a few moments.";
      } else if (err.message.includes("Invalid product data")) {
        errorMessage = "Please check all required fields and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      setTimeout(() => {
        setError("");
      }, 10000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    console.log("Delete confirmation for product:", product?.name);
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    console.log("Proceeding with delete operation...");
    await handleSubmit({ preventDefault: () => {} });
  };

  if (!isOpen) return null;

  const isReadOnly = mode === "view";
  const isDeleting = mode === "delete";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {mode === "view" && <Eye className="h-6 w-6 text-blue-600" />}
            {mode === "edit" && <Edit3 className="h-6 w-6 text-orange-600" />}
            {mode === "create" && (
              <Package className="h-6 w-6 text-green-600" />
            )}
            {mode === "delete" && <Trash2 className="h-6 w-6 text-red-600" />}
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "view" && "View Product"}
              {mode === "edit" && "Edit Product"}
              {mode === "create" && "Create New Product"}
              {mode === "delete" && "Delete Product"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
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

                <ImageUpload
                  existingImages={formData.imageUrl}
                  onImagesChange={(newImages) =>
                    setFormData((prev) => ({ ...prev, imageUrl: newImages }))
                  }
                  selectedFiles={selectedFiles}
                  onFilesChange={setSelectedFiles}
                  disabled={isReadOnly || isDeleting}
                  maxImages={10}
                  showPreview={true}
                />
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
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
                    Processing...
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

import { useState, useEffect } from "react";
import { X, Package, Save, Edit3, Eye, Trash2 } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const ProductManagementModal = ({ product, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    // Required fields (user input)
    name: "",
    category: "",
    price: "",
    weight: "100",
    stockQuantity: "",

    // Optional fields (user input)
    description: "",
    longDescription: "",
    originalPrice: "",
    imageUrl: [],
    features: [],
    tags: [],
    brewingInstructions: "",
    origin: "",

    // Boolean fields with defaults
    isActive: true,
    inStock: true,

    // Auto-generated fields (not in form):
    // - id: auto-increment primary key
    // - rating: defaults to 0, calculated from reviews
    // - reviewCount: defaults to 0, calculated from reviews
    // - createdAt: timestamp (automatic)
    // - updatedAt: timestamp (automatic)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        // Required fields
        name: product.name || "",
        category: product.category || "",
        price: product.price || "",
        weight: product.weight || "100",
        stockQuantity: product.stockQuantity || product.stock || "",

        // Optional fields
        description: product.description || "",
        longDescription: product.longDescription || "",
        originalPrice: product.originalPrice || "",
        imageUrl: Array.isArray(product.imageUrl)
          ? product.imageUrl
          : product.imageUrl
          ? [product.imageUrl]
          : [],
        features: Array.isArray(product.features) ? product.features : [],
        tags: Array.isArray(product.tags) ? product.tags : [],
        brewingInstructions: product.brewingInstructions || "",
        origin: product.origin || "",

        // Boolean fields
        isActive:
          product.isActive !== undefined
            ? product.isActive
            : product.status === "active",
        inStock: product.inStock !== undefined ? product.inStock : true,
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "view") return;

    setLoading(true);
    setError("");

    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        // Ensure arrays are properly formatted
        imageUrl: Array.isArray(formData.imageUrl) ? formData.imageUrl : [],
        features: Array.isArray(formData.features) ? formData.features : [],
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        // Convert string numbers to actual numbers
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : null,
        weight: parseFloat(formData.weight),
        stockQuantity: parseInt(formData.stockQuantity),
      };

      if (mode === "delete") {
        await axiosInstance.delete(`/products/${product.id}`);
      } else if (mode === "edit") {
        await axiosInstance.put(`/products/${product.id}`, apiData);
      } else if (mode === "add") {
        await axiosInstance.post("/products", apiData);
      }
      onSave();
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "view":
        return "Product Details";
      case "edit":
        return "Edit Product";
      case "add":
        return "Add New Product";
      case "delete":
        return "Delete Product";
      default:
        return "Product";
    }
  };

  const getIcon = () => {
    switch (mode) {
      case "view":
        return <Eye className="h-5 w-5" />;
      case "edit":
        return <Edit3 className="h-5 w-5" />;
      case "add":
        return <Package className="h-5 w-5" />;
      case "delete":
        return <Trash2 className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-xl font-semibold text-gray-900">
              {getTitle()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {mode === "delete" ? (
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <strong>{product?.name}</strong>
                ?
              </p>
              <p className="text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Required Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Black Tea">Black Tea</option>
                    <option value="Green Tea">Green Tea</option>
                    <option value="White Tea">White Tea</option>
                    <option value="Oolong Tea">Oolong Tea</option>
                    <option value="Herbal Tea">Herbal Tea</option>
                    <option value="Tea Accessories">Tea Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price ($)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (grams) *
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin
                  </label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="e.g., Sri Lanka, China, India"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        disabled={mode === "view"}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            inStock: e.target.checked,
                          }))
                        }
                        disabled={mode === "view"}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        In Stock
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Brief product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description
                </label>
                <textarea
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Detailed product information..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brewing Instructions
                </label>
                <textarea
                  name="brewingInstructions"
                  value={formData.brewingInstructions}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="How to brew this tea..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="features"
                    value={
                      Array.isArray(formData.features)
                        ? formData.features.join(", ")
                        : ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        features: e.target.value
                          .split(",")
                          .map((f) => f.trim())
                          .filter((f) => f),
                      }))
                    }
                    disabled={mode === "view"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="Organic, Caffeine-free, Premium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={
                      Array.isArray(formData.tags)
                        ? formData.tags.join(", ")
                        : ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter((t) => t),
                      }))
                    }
                    disabled={mode === "view"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="morning, relaxing, gift"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URLs (comma-separated)
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  value={
                    Array.isArray(formData.imageUrl)
                      ? formData.imageUrl.join(", ")
                      : ""
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      imageUrl: e.target.value
                        .split(",")
                        .map((url) => url.trim())
                        .filter((url) => url),
                    }))
                  }
                  disabled={mode === "view"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {mode === "view" ? "Close" : "Cancel"}
          </button>

          {mode !== "view" && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                mode === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  {mode === "delete" ? (
                    <Trash2 className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {mode === "delete" ? "Delete" : "Save"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagementModal;

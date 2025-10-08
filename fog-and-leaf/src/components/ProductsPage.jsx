import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "../hooks/useCart";
import {
  Star,
  Coffee,
  ShoppingCart,
  Grid,
  List,
  Plus,
  Minus,
} from "lucide-react";
import { motion } from "framer-motion";
import axiosInstance from "../utility/axiosInstance";

const ProductsPage = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState({}); // Track loading state per product

  const { addToCart, updateQuantity, getCartItem } = useCart();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/products");
        setProducts(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        // Fallback to hardcoded products if API fails
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback products in case API fails
  const fallbackProducts = [
    {
      id: 1,
      name: "Assam Tea",
      price: 299,
      originalPrice: 349,
      imageUrl: "/api/placeholder/400/400",
      description:
        "Rich, malty flavor with a robust character that awakens your senses",
      longDescription:
        "Our premium Assam tea is sourced from the finest gardens in the Brahmaputra valley. Known for its bold, malty flavor and bright copper color, this tea is perfect for morning consumption and pairs excellently with milk and sugar.",
      category: "Black Tea",
      origin: "Assam, India",
      weight: "100g",
      stockQuantity: 3,
      rating: 4.5,
      reviewCount: 127,
      inStock: true,
      isActive: true,
      features: [
        "Rich Malty Flavor",
        "High Caffeine",
        "Morning Tea",
        "Milk Tea Friendly",
      ],
    },
    {
      id: 2,
      name: "Assam Tea with Darjeeling Flavour",
      price: 349,
      originalPrice: 399,
      imageUrl: "/api/placeholder/400/400",
      description:
        "Perfect blend of strength and delicate aroma for the discerning palate",
      longDescription:
        "A masterful blend combining the robust strength of Assam with the delicate muscatel flavor of Darjeeling. This unique combination offers the best of both worlds - the body of Assam and the refined taste of Darjeeling.",
      category: "Blended Tea",
      origin: "Assam & Darjeeling, India",
      weight: "100g",
      stockQuantity: 15,
      rating: 4.8,
      reviewCount: 89,
      inStock: true,
      isActive: true,
      features: [
        "Unique Blend",
        "Balanced Flavor",
        "Premium Quality",
        "Limited Edition",
      ],
    },
    {
      id: 3,
      name: "Darjeeling Orthodox",
      price: 399,
      originalPrice: 449,
      imageUrl: "/api/placeholder/400/400",
      description: "Muscatel flavor with floral notes, the champagne of teas",
      longDescription:
        "Our orthodox Darjeeling tea is carefully processed using traditional methods to preserve its distinctive muscatel flavor and delicate aroma. Grown in the high-altitude gardens of Darjeeling, this tea offers a complex flavor profile with floral notes.",
      category: "Black Tea",
      origin: "Darjeeling, India",
      weight: "100g",
      stockQuantity: 2,
      rating: 4.3,
      reviewCount: 203,
      inStock: true,
      isActive: true,
      features: [
        "Muscatel Flavor",
        "Floral Notes",
        "Orthodox Processing",
        "High Altitude",
      ],
    },
  ];

  const handleAddToCart = async (product) => {
    setLoadingProducts((prev) => ({ ...prev, [product.id]: true }));

    try {
      const existingItem = getCartItem(product.id);
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;
      const availableStock = product.stockQuantity || 0;

      if (currentCartQuantity + 1 > availableStock) {
        alert(
          `Cannot add to cart. Only ${availableStock} items available in stock. You already have ${currentCartQuantity} in cart.`
        );
        return;
      }

      await addToCart(product, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError("Failed to add item to cart. Please try again.");
    } finally {
      setLoadingProducts((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleQuantityChange = async (product, newQuantity) => {
    setLoadingProducts((prev) => ({ ...prev, [product.id]: true }));

    try {
      const availableStock = product.stockQuantity || 0;

      if (newQuantity > availableStock) {
        alert(
          `Cannot add more items. Only ${availableStock} available in stock.`
        );
        return;
      }

      await updateQuantity(product.id, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("Failed to update quantity. Please try again.");
    } finally {
      setLoadingProducts((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, rgba(226,226,226,1) 0%, rgba(219,219,219,1) 50%, rgba(209,209,209,1) 50%, rgba(209,209,209,1) 50%, rgba(254,254,254,1) 100%)",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Premium Tea Collection
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Discover the finest teas from the misty hills of Assam and
              Darjeeling
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">
                {products.length} Products
              </span>
              {(() => {
                const outOfStockCount = products.filter(
                  (p) => p.stockQuantity === 0
                ).length;
                const criticalStockCount = products.filter(
                  (p) => p.stockQuantity > 0 && p.stockQuantity <= 3
                ).length;
                const lowStockCount = products.filter(
                  (p) => p.stockQuantity > 3 && p.stockQuantity <= 10
                ).length;

                return (
                  <div className="flex gap-2 flex-wrap">
                    {outOfStockCount > 0 && (
                      <Badge className="bg-red-100 text-red-800 border border-red-300">
                        ❌ {outOfStockCount} Out of Stock
                      </Badge>
                    )}
                    {criticalStockCount > 0 && (
                      <Badge className="bg-orange-100 text-orange-800 border border-orange-300">
                        ⚠️ {criticalStockCount} Critical Stock
                      </Badge>
                    )}
                    {lowStockCount > 0 && (
                      <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">
                        🔔 {lowStockCount} Limited Stock
                      </Badge>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-gray-600">Showing sample products</p>
            </div>
          ) : null}

          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr"
                : "grid-cols-1"
            }`}
          >
            {sortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  className={`hover:shadow-xl transition-all duration-300 group bg-white rounded-xl border shadow-sm ${
                    viewMode === "list"
                      ? "flex flex-row max-w-none h-48 gap-0 py-0"
                      : "flex flex-col max-w-sm mx-auto h-full gap-0 py-0"
                  } ${
                    product.stockQuantity === 0
                      ? "opacity-60 border-red-200"
                      : product.stockQuantity <= 3
                      ? "border-orange-200"
                      : product.stockQuantity <= 10
                      ? "border-yellow-200"
                      : "border-green-200"
                  }`}
                >
                  {/* Sale Badge */}
                  {product.originalPrice > product.price && (
                    <Badge
                      variant="destructive"
                      className="absolute top-2.5 right-2.5 z-10 bg-red-600 text-white"
                    >
                      Sale
                    </Badge>
                  )}

                  {/* Product Image */}
                  <div
                    className={`bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center relative flex-shrink-0 overflow-hidden ${
                      viewMode === "list"
                        ? "w-52 h-48"
                        : "w-full h-64 sm:h-56 md:h-48 lg:h-56"
                    }`}
                  >
                    {(() => {
                      // Optimized image URL extraction
                      const getImageUrl = (imageUrl) => {
                        if (!imageUrl) return null;
                        return Array.isArray(imageUrl) && imageUrl.length > 0
                          ? imageUrl[0]
                          : typeof imageUrl === "string"
                          ? imageUrl
                          : null;
                      };

                      const imageUrl = getImageUrl(product.imageUrl);
                      const isOutOfStock = product.stockQuantity === 0;

                      return (
                        <>
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className={`w-full h-full object-cover object-center group-hover:scale-110 transition-transform ${
                                isOutOfStock ? "opacity-40" : ""
                              }`}
                              onError={(e) => {
                                // If image fails to load, hide it and show coffee icon
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}

                          {/* Coffee icon fallback - only show if no image available */}
                          <div
                            className={`${
                              imageUrl ? "hidden" : "flex"
                            } items-center justify-center w-full h-full ${
                              isOutOfStock ? "opacity-40" : ""
                            }`}
                          >
                            <Coffee
                              className={`text-green-600 group-hover:scale-110 transition-transform ${
                                viewMode === "list" ? "h-16 w-16" : "h-24 w-24"
                              }`}
                            />
                          </div>
                        </>
                      );
                    })()}

                    {/* Stock Status Overlays */}
                    {product.stockQuantity === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        {(() => {
                          // Check if image is available
                          const hasImage =
                            product.imageUrl &&
                            (Array.isArray(product.imageUrl)
                              ? product.imageUrl.length > 0
                              : true);

                          return hasImage ? (
                            // For products with images - simple label overlay
                            <span className="text-white font-bold text-sm bg-red-600 px-3 py-1.5 rounded-lg shadow-lg border-2 border-red-700">
                              OUT OF STOCK
                            </span>
                          ) : (
                            // For products without images - more prominent styling
                            <div className="text-center">
                              <div className="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded-lg shadow-xl border-2 border-red-700 mb-2">
                                OUT OF STOCK
                              </div>
                              <div className="text-red-700 font-medium text-sm bg-red-100 px-3 py-1 rounded-md">
                                Product Unavailable
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {/* {product.stockQuantity > 0 &&
                      product.stockQuantity <= 3 && (
                        <div className="absolute inset-0 bg-orange-900 bg-opacity-20 flex items-center justify-center z-10">
                          <span className="text-white font-bold text-sm bg-orange-600 px-3 py-1 rounded-md shadow-lg">
                            ONLY {product.stockQuantity} LEFT
                          </span>
                        </div>
                      )} */}
                  </div>

                  {/* Product Info */}
                  <CardContent
                    className={`${
                      viewMode === "list"
                        ? "flex-1 p-4 flex gap-4"
                        : "p-4 sm:p-6 flex flex-col flex-1 justify-between"
                    }`}
                  >
                    {viewMode === "list" ? (
                      <>
                        {/* Left Section - Product Details */}
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 font-medium text-xs"
                              >
                                {product.category}
                              </Badge>
                              <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                {product.name}
                              </h3>
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 font-medium">
                            📍 {product.origin} • {product.weight}g
                          </p>

                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                            {product.description}
                          </p>

                          {/* Price & Rating Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-green-600">
                                ₹{product.price}
                              </span>
                              {product.originalPrice > product.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{product.originalPrice}
                                </span>
                              )}
                              {product.originalPrice > product.price && (
                                <Badge
                                  variant="destructive"
                                  className="bg-red-100 text-red-800 text-xs font-bold"
                                >
                                  {Math.round(
                                    ((product.originalPrice - product.price) /
                                      product.originalPrice) *
                                      100
                                  )}
                                  % OFF
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${
                                      i < Math.floor(product.rating || 0)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-gray-200 text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-bold text-gray-900">
                                {product.rating || 0}
                              </span>
                              <span className="text-xs text-gray-600">
                                ({product.reviewCount || 0})
                              </span>
                            </div>
                          </div>

                          {/* Features & Stock Row */}
                          <div className="flex items-center justify-between pb-1">
                            <div className="flex gap-1.5">
                              {product.features &&
                                product.features
                                  .slice(0, 2)
                                  .map((feature, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="border-green-200 text-green-700 text-xs px-2 py-1 font-medium"
                                    >
                                      {feature}
                                    </Badge>
                                  ))}
                            </div>

                            <div>
                              {product.stockQuantity === 0 ? (
                                <span className="inline-flex items-center text-red-700 text-xs font-bold bg-red-50 px-2 py-1 rounded border border-red-200">
                                  ❌ Out of Stock
                                </span>
                              ) : product.stockQuantity <= 3 ? (
                                <span className="inline-flex items-center text-orange-700 text-xs font-bold bg-orange-50 px-2 py-1 rounded border border-orange-200">
                                  ⚠️ Only {product.stockQuantity} left!
                                </span>
                              ) : product.stockQuantity <= 10 ? (
                                <span className="inline-flex items-center text-yellow-700 text-xs font-medium bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                                  🔔 Limited Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-green-700 text-xs font-medium bg-green-50 px-2 py-1 rounded border border-green-200">
                                  ✅ In Stock
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Actions Only */}
                        <div className="w-40 flex flex-col justify-center space-y-2.5 pl-4 border-l border-gray-200">
                          {/* Actions Section */}
                          <div className="space-y-2.5">
                            {(() => {
                              const cartItem = getCartItem(product.id);
                              const isOutOfStock = product.stockQuantity === 0;
                              const currentCartQuantity = cartItem
                                ? cartItem.quantity
                                : 0;
                              const wouldExceedStock =
                                currentCartQuantity >= product.stockQuantity;

                              if (isOutOfStock) {
                                return (
                                  <>
                                    <Button
                                      disabled
                                      variant="secondary"
                                      className="w-full h-9 font-semibold text-sm"
                                      size="sm"
                                    >
                                      Out of Stock
                                    </Button>
                                    <Link
                                      to={`/product/${product.id}`}
                                      className="w-full"
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full h-9 border-green-300 text-green-600 hover:bg-green-50 font-semibold text-sm"
                                      >
                                        View Details
                                      </Button>
                                    </Link>
                                  </>
                                );
                              }

                              if (cartItem) {
                                return (
                                  <>
                                    <div className="flex items-center justify-center bg-gray-50 border border-gray-300 rounded p-1.5">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 hover:bg-white"
                                        onClick={() =>
                                          handleQuantityChange(
                                            product,
                                            cartItem.quantity - 1
                                          )
                                        }
                                        disabled={loadingProducts[product.id]}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="px-3 py-1 text-sm font-bold min-w-[2.5rem] text-center">
                                        {cartItem.quantity}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 hover:bg-white"
                                        onClick={() =>
                                          handleQuantityChange(
                                            product,
                                            cartItem.quantity + 1
                                          )
                                        }
                                        disabled={
                                          loadingProducts[product.id] ||
                                          cartItem.quantity >=
                                            product.stockQuantity
                                        }
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <Link
                                      to={`/product/${product.id}`}
                                      className="w-full"
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full h-9 border-green-300 text-green-600 hover:bg-green-50 font-semibold text-sm"
                                      >
                                        Details
                                      </Button>
                                    </Link>
                                  </>
                                );
                              }

                              return (
                                <>
                                  <Button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={
                                      loadingProducts[product.id] ||
                                      wouldExceedStock
                                    }
                                    className="w-full h-9 bg-green-600 hover:bg-green-700 font-semibold text-sm"
                                    size="sm"
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    {wouldExceedStock
                                      ? "Max Qty"
                                      : loadingProducts[product.id]
                                      ? "Adding..."
                                      : "Add to Cart"}
                                  </Button>
                                  <Link
                                    to={`/product/${product.id}`}
                                    className="w-full"
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full h-9 border-green-300 text-green-600 hover:bg-green-50 font-semibold text-sm"
                                    >
                                      Details
                                    </Button>
                                  </Link>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Grid View Layout */
                      <>
                        {/* Top Section - Category, Title, Origin */}
                        <div className="space-y-2">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            {product.category}
                          </Badge>

                          <h3 className="font-semibold text-gray-900 text-xl">
                            {product.name}
                          </h3>

                          <p className="text-sm text-gray-500">
                            Origin: {product.origin} • {product.weight}g
                          </p>

                          {/* Description */}
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        {/* Middle Section - Features & Stock Status */}
                        <div className="space-y-3">
                          {/* Features */}
                          <div className="flex flex-wrap gap-1.5">
                            {product.features &&
                              product.features
                                .slice(0, 3)
                                .map((feature, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="border-green-200 text-green-800 text-xs px-2 py-0.5"
                                  >
                                    {feature}
                                  </Badge>
                                ))}
                          </div>

                          {/* Stock Status Warning */}
                          {product.stockQuantity === 0 ? (
                            <div>
                              <span className="text-red-700 text-xs font-bold bg-red-100 px-2 py-1 rounded border border-red-300">
                                ❌ Out of Stock
                              </span>
                            </div>
                          ) : product.stockQuantity <= 3 ? (
                            <div>
                              <span className="text-orange-700 text-xs font-bold bg-orange-100 px-2 py-1 rounded border border-orange-300">
                                ⚠️ Only {product.stockQuantity} left!
                              </span>
                            </div>
                          ) : product.stockQuantity <= 10 ? (
                            <div>
                              <span className="text-yellow-700 text-xs font-medium bg-yellow-100 px-2 py-1 rounded border border-yellow-300">
                                🔔 Limited Stock ({product.stockQuantity})
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-green-700 text-xs font-medium bg-green-100 px-2 py-1 rounded border border-green-300">
                                ✅ In Stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Section - Price & Actions */}
                        <div className="space-y-3 mt-auto">
                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-green-600">
                              ₹{product.price}
                            </span>
                            {product.originalPrice > product.price && (
                              <>
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{product.originalPrice}
                                </span>
                                <Badge
                                  variant="destructive"
                                  className="bg-red-100 text-red-800 text-xs"
                                >
                                  {Math.round(
                                    ((product.originalPrice - product.price) /
                                      product.originalPrice) *
                                      100
                                  )}
                                  % OFF
                                </Badge>
                              </>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {(() => {
                              const cartItem = getCartItem(product.id);
                              const isOutOfStock = product.stockQuantity === 0;
                              const currentCartQuantity = cartItem
                                ? cartItem.quantity
                                : 0;
                              const wouldExceedStock =
                                currentCartQuantity >= product.stockQuantity;

                              if (isOutOfStock) {
                                return (
                                  <>
                                    <Button
                                      disabled
                                      variant="secondary"
                                      className="flex-1"
                                      size="sm"
                                    >
                                      Out of Stock
                                    </Button>
                                    <Link to={`/product/${product.id}`}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-green-300 text-green-600 hover:bg-green-50"
                                      >
                                        View Details
                                      </Button>
                                    </Link>
                                  </>
                                );
                              }

                              if (cartItem) {
                                return (
                                  <>
                                    <div className="flex items-center border border-gray-300 rounded-md">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() =>
                                          handleQuantityChange(
                                            product,
                                            cartItem.quantity - 1
                                          )
                                        }
                                        disabled={loadingProducts[product.id]}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                        {cartItem.quantity}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() =>
                                          handleQuantityChange(
                                            product,
                                            cartItem.quantity + 1
                                          )
                                        }
                                        disabled={
                                          loadingProducts[product.id] ||
                                          cartItem.quantity >=
                                            product.stockQuantity
                                        }
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <Link to={`/product/${product.id}`}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-green-300 text-green-600 hover:bg-green-50"
                                      >
                                        View Details
                                      </Button>
                                    </Link>
                                  </>
                                );
                              }

                              return (
                                <>
                                  <Button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={
                                      loadingProducts[product.id] ||
                                      wouldExceedStock
                                    }
                                    className="bg-green-600 hover:bg-green-700 flex-1"
                                    size="sm"
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    {wouldExceedStock
                                      ? "Max Qty"
                                      : loadingProducts[product.id]
                                      ? "Adding..."
                                      : "Add to Cart"}
                                  </Button>
                                  <Link to={`/product/${product.id}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-green-300 text-green-600 hover:bg-green-50"
                                    >
                                      Details
                                    </Button>
                                  </Link>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Meta Information - Only in Grid View */}
                    {viewMode === "grid" && (
                      <>
                        <div
                          className="flex justify-between items-center border-t border-gray-100 pt-3 mt-4"
                          style={{
                            borderTop: "1px solid #F4F4F5",
                            paddingTop: "12px",
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(product.rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-300"
                                  }`}
                                />
                              ))}
                              <span
                                className="ml-1.5 text-xs text-gray-500"
                                style={{ fontSize: "11px", color: "#71717A" }}
                              >
                                {product.reviewCount || 0} Reviews
                              </span>
                            </div>
                          </div>
                          <div className="text-xs font-semibold">
                            {product.stockQuantity === 0 ? (
                              <span className="text-red-600">
                                ❌ Out of Stock
                              </span>
                            ) : product.stockQuantity <= 3 ? (
                              <span className="text-orange-600">
                                ⚠️ Only {product.stockQuantity} Left
                              </span>
                            ) : product.stockQuantity <= 10 ? (
                              <span className="text-yellow-600">
                                🔔 Limited Stock
                              </span>
                            ) : (
                              <span className="text-green-600">
                                ✅ In Stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* View Details Link - Only in Grid View */}
                        <div className="mt-3">
                          <Link
                            to={`/product/${product.id}`}
                            className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors duration-200"
                          >
                            View Details →
                          </Link>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-green-800 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Stay Updated with Our Latest Teas
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Be the first to know about new arrivals and exclusive offers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <Button className="bg-green-600 hover:bg-green-700 px-6 py-3">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;

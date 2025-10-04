import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axiosInstance from "../utility/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "../hooks/useCart";
import {
  Star,
  Coffee,
  ShoppingCart,
  Heart,
  Share2,
  Clock,
  Thermometer,
  Droplets,
  Leaf,
  Award,
  ArrowLeft,
  Plus,
  Minus,
} from "lucide-react";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart, updateQuantity, getCartItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current cart item for this product - recalculates when cart changes
  const cartItem = useMemo(() => {
    // Ensure ID type consistency - try both string and number versions
    const stringId = String(id);
    const numberId = parseInt(id);

    let item = getCartItem(stringId) || getCartItem(numberId);

    return item;
  }, [getCartItem, id]);

  // Fetch product from database
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/products/${id}`);

        // Check if response has the expected structure
        if (response.data.success) {
          setProduct(response.data.data);
        } else {
          setProduct(response.data);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Reset selectedImage when product changes or if selectedImage is out of bounds
  useEffect(() => {
    if (product && product.imageUrl && Array.isArray(product.imageUrl)) {
      if (selectedImage >= product.imageUrl.length) {
        setSelectedImage(0);
      }
    }
  }, [product, selectedImage]);

  // Mock product data - in a real app, this would come from an API
  // const products = {
  //   1: {
  //     id: 1,
  //     name: "Assam Tea",
  //     price: 299,
  //     originalPrice: 349,
  //     images: [
  //       "/api/placeholder/600/600",
  //       "/api/placeholder/600/600",
  //       "/api/placeholder/600/600",
  //     ],
  //     description:
  //       "Rich, malty flavor with a robust character that awakens your senses",
  //     longDescription:
  //       "Our premium Assam tea is sourced from the finest gardens in the Brahmaputra valley. Known for its bold, malty flavor and bright copper color, this tea is perfect for morning consumption and pairs excellently with milk and sugar.",

  //     category: "Black Tea",
  //     origin: "Assam, India",
  //     weight: "100g",
  //     inStock: true,
  //     stockCount: 25,
  //     features: [
  //       "Rich Malty Flavor",
  //       "High Caffeine",
  //       "Morning Tea",
  //       "Milk Tea Friendly",
  //     ],
  //     flavorProfile: {
  //       strength: 9,
  //       sweetness: 6,
  //       astringency: 7,
  //       aroma: 8,
  //     },
  //     brewingInstructions: {
  //       temperature: "95-100°C",
  //       steepTime: "3-5 minutes",
  //       teaAmount: "1 tsp per cup",
  //       resteeps: "2-3 times",
  //     },
  //     benefits: [
  //       "High in antioxidants",
  //       "Boosts energy and alertness",
  //       "Supports heart health",
  //       "May aid in weight management",
  //     ],
  //     ingredients: ["100% Pure Assam Black Tea Leaves"],
  //     storage: "Store in a cool, dry place away from direct sunlight",
  //   },
  //   2: {
  //     id: 2,
  //     name: "Assam Tea with Darjeeling Flavour",
  //     price: 349,
  //     originalPrice: 399,
  //     images: [
  //       "/api/placeholder/600/600",
  //       "/api/placeholder/600/600",
  //       "/api/placeholder/600/600",
  //     ],
  //     description:
  //       "Perfect blend of strength and delicate aroma for the discerning palate",
  //     longDescription:
  //       "A masterful blend combining the robust strength of Assam with the delicate muscatel flavor of Darjeeling. This unique combination offers the best of both worlds - the body of Assam and the refined taste of Darjeeling.",

  //     category: "Blended Tea",
  //     origin: "Assam & Darjeeling, India",
  //     weight: "100g",
  //     inStock: true,
  //     stockCount: 18,
  //     features: [
  //       "Unique Blend",
  //       "Balanced Flavor",
  //       "Premium Quality",
  //       "Limited Edition",
  //     ],
  //     flavorProfile: {
  //       strength: 8,
  //       sweetness: 7,
  //       astringency: 6,
  //       aroma: 9,
  //     },
  //     brewingInstructions: {
  //       temperature: "90-95°C",
  //       steepTime: "3-4 minutes",
  //       teaAmount: "1 tsp per cup",
  //       resteeps: "3-4 times",
  //     },
  //     benefits: [
  //       "Rich in antioxidants",
  //       "Balanced caffeine content",
  //       "Supports mental clarity",
  //       "Promotes relaxation",
  //     ],
  //     ingredients: ["Assam Black Tea (70%)", "Darjeeling Black Tea (30%)"],
  //     storage: "Store in a cool, dry place away from direct sunlight",
  //   },
  //   3: {
  //     id: 3,
  //     name: "Darjeeling Orthodox",
  //     price: 399,
  //     originalPrice: 449,
  //     images: [
  //       "/api/placeholder/600/600",
  //       "/api/placeholder/600/600",
  //       "/api/placeholder/600/600",
  //     ],
  //     description: "Muscatel flavor with floral notes, the champagne of teas",
  //     longDescription:
  //       "Our orthodox Darjeeling tea is carefully processed using traditional methods to preserve its distinctive muscatel flavor and delicate aroma. Grown in the high-altitude gardens of Darjeeling, this tea offers a complex flavor profile with floral notes.",

  //     category: "Black Tea",
  //     origin: "Darjeeling, India",
  //     weight: "100g",
  //     inStock: true,
  //     stockCount: 32,
  //     features: [
  //       "Muscatel Flavor",
  //       "Floral Notes",
  //       "Orthodox Processing",
  //       "High Altitude",
  //     ],
  //     flavorProfile: {
  //       strength: 6,
  //       sweetness: 8,
  //       astringency: 5,
  //       aroma: 10,
  //     },
  //     brewingInstructions: {
  //       temperature: "85-90°C",
  //       steepTime: "3-4 minutes",
  //       teaAmount: "1 tsp per cup",
  //       resteeps: "4-5 times",
  //     },
  //     benefits: [
  //       "High in antioxidants",
  //       "Low caffeine content",
  //       "Supports digestion",
  //       "Calming properties",
  //     ],
  //     ingredients: ["100% Pure Darjeeling Orthodox Black Tea Leaves"],
  //     storage: "Store in a cool, dry place away from direct sunlight",
  //   },
  // };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">
            Loading product...
          </h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    const availableStock = product.stockQuantity || 0;

    // If no item in cart, add 1 item
    if (!cartItem) {
      if (availableStock > 0) {
        try {
          await addToCart(product, 1);
        } catch (error) {
          console.error("Error adding to cart:", error);
        }
      } else {
        alert("Sorry, this item is out of stock.");
      }
      return;
    }

    // If item already in cart, add 1 more
    const newQuantity = cartItem.quantity + 1;

    if (newQuantity <= availableStock) {
      try {
        await updateQuantity(product.id, newQuantity);
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    } else {
      alert(
        `Cannot add more items. Only ${availableStock} available in stock.`
      );
    }
  };

  const updateLocalQuantity = async (change) => {
    if (!cartItem) {
      return; // Only works when item is in cart
    }

    const availableStock = product.stockQuantity || 0;
    const newQuantity = cartItem.quantity + change;

    if (newQuantity >= 1 && newQuantity <= availableStock) {
      try {
        await updateQuantity(product.id, newQuantity);
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    } else if (newQuantity > availableStock) {
      alert(
        `Cannot add more items. Only ${availableStock} available in stock.`
      );
    } else if (newQuantity <= 0) {
      // Remove from cart if quantity becomes 0 or less
      try {
        await updateQuantity(product.id, 0);
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-green-600">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-green-600">
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/products"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center overflow-hidden">
                {product.imageUrl &&
                Array.isArray(product.imageUrl) &&
                product.imageUrl.length > 0 &&
                product.imageUrl[selectedImage] ? (
                  <img
                    src={product.imageUrl[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`h-48 w-48 text-green-600 ${
                    product.imageUrl &&
                    Array.isArray(product.imageUrl) &&
                    product.imageUrl.length > 0 &&
                    product.imageUrl[selectedImage]
                      ? "hidden"
                      : "flex"
                  } items-center justify-center`}
                >
                  <Coffee className="h-48 w-48" />
                </div>
              </div>

              {/* Thumbnail Images - Smart Rendering */}
              {product.imageUrl &&
                Array.isArray(product.imageUrl) &&
                product.imageUrl.length > 1 && (
                  <div
                    className={`grid gap-4 ${
                      product.imageUrl.length === 2
                        ? "grid-cols-2"
                        : product.imageUrl.length === 3
                        ? "grid-cols-3"
                        : "grid-cols-4"
                    }`}
                  >
                    {product.imageUrl.slice(0, 4).map((imageUrl, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center border-2 transition-colors overflow-hidden ${
                          selectedImage === index
                            ? "border-green-600"
                            : "border-transparent"
                        }`}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-12 w-12 text-green-600 ${
                            imageUrl ? "hidden" : "flex"
                          } items-center justify-center`}
                        >
                          <Coffee className="h-12 w-12" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  {product.category || "Tea"}
                </Badge>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <Badge
                      variant="destructive"
                      className="bg-red-100 text-red-800"
                    >
                      Sale
                    </Badge>
                  )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 mb-4">
                {product.origin || "Premium Tea"} •{" "}
                {product.weight ? `${product.weight}g` : "100g"}
              </p>

              {/* Rating */}
              {/* <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div> */}
            </div>
            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-green-600">
                ₹{product.price}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <Badge
                    variant="destructive"
                    className="bg-red-100 text-red-800"
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
            {/* Description */}
            <p className="text-gray-700 text-lg">
              {product.description ||
                "Premium quality tea with exceptional flavor."}
            </p>
            {/* Features */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Key Features:
              </h3>
              <div className="flex flex-wrap gap-2">
                {(
                  product.features || [
                    "Premium Quality",
                    "Natural",
                    "Aromatic",
                    "Healthy",
                  ]
                ).map((feature, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-green-200 text-green-800"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              {cartItem && cartItem.quantity > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-800">
                    <ShoppingCart className="h-4 w-4 inline mr-1" />
                    {cartItem.quantity} in cart
                  </p>
                </div>
              )}

              {/* Show quantity controls only if item is in cart (quantity > 0) */}
              {cartItem && cartItem.quantity > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity in Cart
                  </label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateLocalQuantity(-1)}
                      disabled={false}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-medium w-12 text-center">
                      {cartItem.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateLocalQuantity(1)}
                      disabled={
                        cartItem.quantity >= (product.stockQuantity || 0)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-500 ml-4">
                      {(product.stockQuantity || 0) > 5
                        ? "Items in stock"
                        : `${product.stockQuantity || 0} in stock`}
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart button - always visible */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 text-white ${
                    !product.stockQuantity ||
                    product.stockQuantity === 0 ||
                    (cartItem && cartItem.quantity >= product.stockQuantity)
                      ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                  size="lg"
                  disabled={
                    !product.stockQuantity ||
                    product.stockQuantity === 0 ||
                    (cartItem && cartItem.quantity >= product.stockQuantity)
                  }
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stockQuantity === 0
                    ? "Out of Stock"
                    : cartItem && cartItem.quantity >= product.stockQuantity
                    ? "Max Quantity Reached"
                    : cartItem && cartItem.quantity > 0
                    ? "Add 1 More to Cart"
                    : "Add to Cart"}
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {/* Stock Status */}
            {(product.stockQuantity || 0) > 5 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">
                  In Stock - Ready to Ship
                </span>
              </div>
            )}

            {(product.stockQuantity || 0) > 0 &&
              (product.stockQuantity || 0) <= 5 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-600 font-medium">
                    Only {product.stockQuantity} left in stock
                  </span>
                </div>
              )}

            {(product.stockQuantity || 0) === 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600 font-medium">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="brewing">Brewing Guide</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">About This Tea</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {product.longDescription ||
                      product.description ||
                      "This is a premium quality tea with exceptional flavor and aroma. Carefully selected and processed to maintain its natural characteristics and health benefits."}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.flavorProfile && (
                      <div>
                        <h4 className="font-semibold mb-3">Flavor Profile</h4>
                        <div className="space-y-3">
                          {Object.entries(product.flavorProfile).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex items-center justify-between"
                              >
                                <span className="capitalize text-gray-700">
                                  {key}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-green-600 h-2 rounded-full"
                                      style={{
                                        width: `${(value / 10) * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {value}/10
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-3">Product Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ingredients:</span>
                          <span className="text-gray-900">
                            {(
                              product.ingredients || ["100% Pure Tea Leaves"]
                            ).join(", ")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weight:</span>
                          <span className="text-gray-900">
                            {product.weight ? `${product.weight}g` : "100g"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Origin:</span>
                          <span className="text-gray-900">
                            {product.origin || "Premium Tea Gardens"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Storage:</span>
                          <span className="text-gray-900">
                            {product.storage ||
                              "Store in a cool, dry place away from direct sunlight"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="brewing" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Perfect Brewing Instructions
                  </h3>
                  {product.brewingInstructions ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                          <Thermometer className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Temperature</h4>
                        <p className="text-gray-600">
                          {product.brewingInstructions.temperature}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                          <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Steep Time</h4>
                        <p className="text-gray-600">
                          {product.brewingInstructions.steepTime}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                          <Leaf className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Tea Amount</h4>
                        <p className="text-gray-600">
                          {product.brewingInstructions.teaAmount}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                          <Droplets className="h-8 w-8 text-purple-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Resteeps</h4>
                        <p className="text-gray-600">
                          {product.brewingInstructions.resteeps}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                          <Thermometer className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Temperature</h4>
                        <p className="text-gray-600">90-95°C</p>
                      </div>

                      <div className="text-center">
                        <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                          <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Steep Time</h4>
                        <p className="text-gray-600">3-5 minutes</p>
                      </div>

                      <div className="text-center">
                        <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                          <Leaf className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Tea Amount</h4>
                        <p className="text-gray-600">1 tsp per cup</p>
                      </div>

                      <div className="text-center">
                        <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                          <Droplets className="h-8 w-8 text-purple-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Resteeps</h4>
                        <p className="text-gray-600">2-3 times</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Pro Tip:
                    </h4>
                    <p className="text-green-700">
                      For the best flavor, use filtered water and preheat your
                      teapot. Adjust steeping time according to your taste
                      preference - longer for stronger tea.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benefits" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Health Benefits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(
                      product.benefits || [
                        "Rich in antioxidants",
                        "Supports overall health",
                        "Natural and refreshing",
                        "May boost energy levels",
                      ]
                    ).map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="bg-green-100 rounded-full p-2 mt-1">
                          <Award className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-gray-700">{benefit}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <strong>Disclaimer:</strong> These statements have not
                      been evaluated by medical authorities. This product is not
                      intended to diagnose, treat, cure, or prevent any disease.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Customer Reviews
                  </h3>
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Customer reviews feature coming soon!
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      We're working on implementing a comprehensive review
                      system.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

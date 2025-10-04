import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  Mountain,
  Droplets,
  Star,
  ArrowRight,
  Coffee,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../hooks/useCart";
import axiosInstance from "../utility/axiosInstance";
import HeroSection from "./HeroSection";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();

  // Fetch featured products from database
  useEffect(() => {
    const fallbackFeaturedProducts = [
      {
        id: 1,
        name: "Assam Tea",
        price: 299,
        originalPrice: 349,
        imageUrl: [
          "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758263752/tea11_i0qe9n.jpg",
        ],
        description: "Rich, malty flavor with a robust character",
        rating: 4.8,
        stockQuantity: 25,
        inStock: true,
      },
      {
        id: 2,
        name: "Darjeeling Orthodox",
        price: 399,
        originalPrice: 449,
        imageUrl: [
          "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758263752/tea11_i0qe9n.jpg",
        ],
        description: "Muscatel flavor with floral notes",
        rating: 4.7,
        stockQuantity: 12,
        inStock: true,
      },
      {
        id: 3,
        name: "Earl Grey Supreme",
        price: 379,
        originalPrice: 429,
        imageUrl: [
          "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758263752/tea11_i0qe9n.jpg",
        ],
        description: "Classic Earl Grey with bergamot oil",
        rating: 4.6,
        stockQuantity: 22,
        inStock: true,
      },
    ];

    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/products?limit=6"); // Get 6 products for homepage
        const products = response.data.data || [];

        // Filter for featured/highest rated products or take first 6
        const featured = products
          .filter(
            (product) => product.rating >= 4.5 || product.stockQuantity > 15
          )
          .slice(0, 6);

        // If not enough highly rated products, fill with others
        if (featured.length < 6) {
          const remaining = products
            .filter((product) => !featured.includes(product))
            .slice(0, 6 - featured.length);
          featured.push(...remaining);
        }

        setFeaturedProducts(featured.slice(0, 6));
        setError(null);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError("Failed to load featured products");
        // Fallback to static products
        setFeaturedProducts(fallbackFeaturedProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Handle add to cart
  const handleAddToCart = (product) => {
    if (product.inStock && product.stockQuantity > 0) {
      addToCart(product, 1);
    }
  };

  // Helper function to get the main product image
  const getProductImage = (product) => {
    if (
      product.imageUrl &&
      Array.isArray(product.imageUrl) &&
      product.imageUrl.length > 0
    ) {
      return product.imageUrl[0];
    }
    if (typeof product.imageUrl === "string") {
      return product.imageUrl;
    }
    if (product.image_url) {
      return product.image_url;
    }
    return "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758263752/tea11_i0qe9n.jpg"; // fallback
  };

  // Helper function to get stock status color
  const getStockStatusColor = (stockQuantity) => {
    if (stockQuantity === 0) return "bg-red-600 text-white";
    if (stockQuantity <= 3) return "bg-orange-600 text-white";
    if (stockQuantity <= 10) return "bg-yellow-600 text-white";
    return "bg-green-600 text-white";
  };

  const getStockStatusText = (product) => {
    if (!product.inStock || product.stockQuantity === 0) return "Out of Stock";
    if (product.stockQuantity <= 3) return "Limited Stock";
    if (product.stockQuantity <= 10) return "Low Stock";
    return "In Stock";
  };

  const features = [
    {
      icon: <Mountain className="h-8 w-8 text-green-600" />,
      title: "Mountain Grown",
      description: "Sourced from the pristine hills of Assam and Darjeeling",
    },
    {
      icon: <Droplets className="h-8 w-8 text-blue-600" />,
      title: "Morning Mist",
      description: "Harvested in the early morning mist for optimal flavor",
    },
    {
      icon: <Leaf className="h-8 w-8 text-green-700" />,
      title: "Premium Quality",
      description: "Hand-picked leaves processed with traditional methods",
    },
  ];

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section Component - Full Width Coverage */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Fog & Leaf?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our commitment to quality and tradition brings you the finest tea
              experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="text-center p-8 h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-green-100 text-green-800 px-4 py-2">
              Featured Collection
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Premium Tea Selection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular and highest-rated teas, handpicked for
              the perfect cup
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Coffee className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src =
                            "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758263752/tea11_i0qe9n.jpg";
                        }}
                      />
                      {product.originalPrice > product.price && (
                        <Badge className="absolute top-3 left-3 bg-green-600 text-white">
                          Save ₹{product.originalPrice - product.price}
                        </Badge>
                      )}
                      <Badge
                        className={`absolute top-3 right-3 ${getStockStatusColor(
                          product.stockQuantity
                        )}`}
                      >
                        {getStockStatusText(product)}
                      </Badge>
                    </div>

                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 flex-grow">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating}
                          </span>
                        </div>
                        {product.reviewCount && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({product.reviewCount} reviews)
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-green-600">
                            ₹{product.price}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-lg text-gray-500 line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link to={`/product/${product.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                            >
                              View Details
                            </Button>
                          </Link>

                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={
                              !product.inStock || product.stockQuantity === 0
                            }
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/products">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                Explore All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-800 to-green-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Begin Your Tea Journey?
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Join thousands of tea lovers who have discovered the magic of Fog
              & Leaf
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button
                  size="lg"
                  className="bg-white text-green-800 hover:bg-gray-100 px-8 py-3"
                >
                  Shop Now
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white text-green-800 hover:bg-gray-100 px-8 py-3"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

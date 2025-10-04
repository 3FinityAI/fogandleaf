import { useState, useEffect } from "react";
import {
  ArrowRight,
  Leaf,
  Coffee,
  Mountain,
  Star,
  Sunrise,
  Heart,
  Play,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Tea background images - 4 carefully selected images for hero carousel
  const heroImages = [
    {
      url: "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758267005/tea_garden_vph6an.jpg",
      alt: "Misty tea plantation in Darjeeling hills",
      theme: "green",
    },
    {
      url: "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758265791/closeupshot_xfchtc.jpg",
      alt: "Premium tea leaves macro photography",
      theme: "natural",
    },
    {
      url: "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758266518/tea_pouring_dvvjx1.jpg",
      alt: "Traditional tea pouring ceremony",
      theme: "warm",
    },
    {
      url: "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758263752/tea11_i0qe9n.jpg",
      alt: "Golden hour tea cup in natural garden setting",
      theme: "golden",
    },
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // 5 seconds per image for smoother flow
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Images with Enhanced Quality and Smooth Transitions */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <motion.div
            key={index}
            className={`absolute inset-0 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{
              opacity: index === currentImageIndex ? 1 : 0,
              scale: index === currentImageIndex ? 1.06 : 1.02,
            }}
            transition={{
              opacity: { duration: 1.5, ease: "easeInOut" },
              scale: { duration: 6, ease: "easeOut" },
            }}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="h-full w-full object-cover"
              style={{
                filter:
                  "brightness(0.88) contrast(1.15) saturate(1.2) blur(0px)",
                imageRendering: "high-quality",
              }}
              loading="eager"
            />
            {/* Enhanced overlay with better opacity control */}
            <div
              className={`absolute inset-0 transition-opacity duration-1500 ${
                image.theme === "golden"
                  ? "bg-gradient-to-br from-amber-900/45 via-orange-800/25 to-yellow-900/35"
                  : image.theme === "green"
                  ? "bg-gradient-to-br from-green-900/45 via-emerald-800/25 to-teal-900/35"
                  : image.theme === "natural"
                  ? "bg-gradient-to-br from-green-900/55 via-brown-800/35 to-amber-900/45"
                  : "bg-gradient-to-br from-orange-900/45 via-red-800/25 to-amber-900/35"
              } ${index === currentImageIndex ? "opacity-100" : "opacity-80"}`}
            />
          </motion.div>
        ))}

        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/15"></div>
      </div>

      {/* Simple Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-green-400/10 rounded-full blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-48 h-48 bg-amber-400/10 rounded-full blur-xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-6 text-center">
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <Badge className="bg-green-600/20 text-green-100 border-green-400/30 px-6 py-2 text-sm backdrop-blur-sm">
              <Star className="h-4 w-4 mr-2 fill-current" />
              Premium Tea Collection Since 1985
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight"
          >
            Where{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-300 to-amber-300">
              Mist Meets Magic
            </span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-green-100">
              In Every Sip
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl text-green-100 max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            From the misty hills of Assam and Darjeeling to your cup —
            experience the heritage, purity, and artistry of handpicked premium
            teas.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            <Link to="/products">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Coffee className="mr-3 h-5 w-5" />
                Explore Our Collection
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>

            <Link to="/about">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/60 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                <Play className="mr-3 h-5 w-5" />
                Our Story
              </Button>
            </Link>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-wrap gap-6 justify-center"
          >
            {[
              {
                icon: Mountain,
                label: "High Altitude Gardens",
                color: "text-green-300",
              },
              {
                icon: Sunrise,
                label: "Morning Mist Harvest",
                color: "text-amber-300",
              },
              {
                icon: Heart,
                label: "Handcrafted Excellence",
                color: "text-pink-300",
              },
              { icon: Leaf, label: "100% Organic", color: "text-emerald-300" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                className="flex items-center gap-3 px-6 py-3 bg-black/30 backdrop-blur-sm rounded-full border border-white/20 hover:bg-black/40 transition-all duration-300"
              >
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
                <span className="text-white/90 font-medium">
                  {feature.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        onClick={scrollToNextSection}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center text-white/70 hover:text-white transition-colors"
        >
          <span className="text-sm font-medium mb-2">Discover More</span>
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.div>

      {/* Enhanced Image Navigation Dots */}
      <div className="absolute bottom-8 right-8 flex flex-col space-y-3">
        <div className="flex space-x-2">
          {heroImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`group relative transition-all duration-300 ${
                index === currentImageIndex
                  ? "w-4 h-4"
                  : "w-3 h-3 hover:w-4 hover:h-4"
              }`}
              title={image.alt}
            >
              <div
                className={`w-full h-full rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "bg-white scale-125 shadow-lg"
                    : "bg-white/50 hover:bg-white/70 hover:scale-110"
                }`}
              />
              {/* Enhanced Progress ring for current image */}
              {index === currentImageIndex && (
                <div className="absolute inset-0 rounded-full border-2 border-white/30">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="100"
                      strokeDashoffset="100"
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 5, ease: "linear" }}
                      key={`progress-${currentImageIndex}`}
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Current image info */}
        <div className="text-right">
          <div className="text-white/70 text-xs font-medium">
            {currentImageIndex + 1} / {heroImages.length}
          </div>
          <div className="text-white/50 text-xs max-w-32 truncate">
            {heroImages[currentImageIndex]?.alt}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

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

const heroImages = [
  {
    url: "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758267005/tea_garden_vph6an.jpg",
    alt: "Misty tea plantation in Darjeeling hills",
    theme: "green",
    lqip: "https://res.cloudinary.com/dldsjwcpu/image/upload/e_blur:2000,q_1,w_20/v1758267005/tea_garden_vph6an.jpg",
  },
  {
    url: "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758265791/closeupshot_xfchtc.jpg",
    alt: "Premium tea leaves macro photography",
    theme: "natural",
    lqip: "https://res.cloudinary.com/dldsjwcpu/image/upload/e_blur:2000,q_1,w_20/v1758265791/closeupshot_xfchtc.jpg",
  },
  {
    url: "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758266518/tea_pouring_dvvjx1.jpg",
    alt: "Traditional tea pouring ceremony",
    theme: "warm",
    lqip: "https://res.cloudinary.com/dldsjwcpu/image/upload/e_blur:2000,q_1,w_20/v1758266518/tea_pouring_dvvjx1.jpg",
  },
  {
    url: "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758263752/tea11_i0qe9n.jpg",
    alt: "Golden hour tea cup in natural garden setting",
    theme: "golden",
    lqip: "https://res.cloudinary.com/dldsjwcpu/image/upload/e_blur:2000,q_1,w_20/v1758263752/tea11_i0qe9n.jpg",
  },
];

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload images on mount for instant switching
  useEffect(() => {
    setIsVisible(true);
    heroImages.forEach((img) => {
      const image = new window.Image();
      image.src = img.url;
    });
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      setImageLoaded(false); // Blur effect on image change
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  const currentImage = heroImages[currentImageIndex];

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Images with Blur Placeholder */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{
            opacity: 1,
            scale: 1.06,
          }}
          transition={{
            opacity: { duration: 1.2, ease: "easeInOut" },
            scale: { duration: 6, ease: "easeOut" },
          }}
        >
          {/* Blurred LQIP placeholder */}
          {!imageLoaded && (
            <img
              src={currentImage.lqip}
              alt=""
              className="h-full w-full object-cover blur-2xl scale-105 transition-opacity duration-300 opacity-60 absolute inset-0"
              aria-hidden="true"
              draggable={false}
              loading="eager"
            />
          )}
          {/* Main High-Quality Hero Image with srcSet for responsive loading */}
          <img
            src={currentImage.url}
            srcSet={
              `${currentImage.url.replace(
                "/upload/",
                "/upload/w_600/"
              )} 600w, ` +
              `${currentImage.url.replace(
                "/upload/",
                "/upload/w_1200/"
              )} 1200w, ` +
              `${currentImage.url.replace("/upload/", "/upload/w_2000/")} 2000w`
            }
            sizes="(max-width: 600px) 600px, (max-width: 1200px) 1200px, 2000px"
            alt={currentImage.alt}
            className={`h-full w-full object-cover transition-opacity duration-700 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="eager"
            style={{
              filter: "brightness(0.88) contrast(1.15) saturate(1.2)",
              imageRendering: "high-quality",
            }}
            draggable={false}
          />
          {/* Thematic overlays */}
          <div
            className={`absolute inset-0 transition-opacity duration-1500 ${
              currentImage.theme === "golden"
                ? "bg-gradient-to-br from-amber-900/45 via-orange-800/25 to-yellow-900/35"
                : currentImage.theme === "green"
                ? "bg-gradient-to-br from-green-900/45 via-emerald-800/25 to-teal-900/35"
                : currentImage.theme === "natural"
                ? "bg-gradient-to-br from-green-900/55 via-brown-800/35 to-amber-900/45"
                : "bg-gradient-to-br from-orange-900/45 via-red-800/25 to-amber-900/35"
            }`}
          />
        </motion.div>
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/15"></div>
      </div>

      {/* Floating Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-green-400/10 rounded-full blur-xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-48 h-48 bg-amber-400/10 rounded-full blur-xl"
          animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Text & Buttons appear instantly */}
      <div className="relative z-20 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-6 text-center">
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
          {/* Actions */}
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
          {/* Features */}
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

      {/* Navigation Dots and Current Image Info */}
      <div className="absolute bottom-8 right-8 flex flex-col space-y-3">
        <div className="flex space-x-2">
          {heroImages.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index);
                setImageLoaded(false);
              }}
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
        <div className="text-right">
          <div className="text-white/70 text-xs font-medium">
            {currentImageIndex + 1} / {heroImages.length}
          </div>
          <div className="text-white/50 text-xs max-w-32 truncate">
            {currentImage.alt}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

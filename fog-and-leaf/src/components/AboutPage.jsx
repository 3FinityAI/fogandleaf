import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mountain,
  Sunrise,
  Leaf,
  Heart,
  Users,
  Award,
  Coffee,
  Globe,
  Clock,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  const imageurl =
    "https://res.cloudinary.com/dldsjwcpu/image/upload/v1758263752/tea11_i0qe9n.jpg";
  const milestones = [
    {
      year: "1985",
      title: "The Beginning",
      description:
        "Founded in the misty hills of Assam by tea enthusiast Rajesh Kumar",
    },
    {
      year: "1995",
      title: "Expansion to Darjeeling",
      description:
        "Established partnerships with premium Darjeeling tea gardens",
    },
    {
      year: "2010",
      title: "Organic Certification",
      description: "Achieved organic certification for all our tea gardens",
    },
    {
      year: "2020",
      title: "Digital Transformation",
      description:
        "Launched online platform to bring premium teas directly to customers",
    },
  ];

  const values = [
    {
      icon: <Leaf className="h-8 w-8 text-green-600" />,
      title: "Sustainability",
      description:
        "We are committed to sustainable farming practices that protect our environment for future generations.",
    },
    {
      icon: <Heart className="h-8 w-8 text-green-600" />,
      title: "Quality",
      description:
        "Every leaf is hand-picked and processed with care to ensure the highest quality in every cup.",
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Community",
      description:
        "We support local farming communities and ensure fair trade practices in all our partnerships.",
    },
    {
      icon: <Award className="h-8 w-8 text-green-600" />,
      title: "Excellence",
      description:
        "Our commitment to excellence has earned us recognition from tea connoisseurs worldwide.",
    },
  ];

  const stats = [
    { number: "40+", label: "Years of Experience" },
    { number: "50+", label: "Tea Gardens" },
    { number: "10,000+", label: "Happy Customers" },
    { number: "25+", label: "Awards Won" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-10 left-10 w-32 h-32 bg-green-400/20 rounded-full blur-xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-green-600/20 text-green-100 border-green-400/30">
              Our Story
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              The Magic Behind
              <span className="block text-green-300">Fog & Leaf</span>
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              From the misty hills of Assam and Darjeeling, we bring you a
              journey of tradition, quality, and the pure magic of nature in
              every cup.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Where Mist Meets Magic
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Our story began in 1985 when Rajesh Kumar, a passionate tea
                enthusiast, discovered the extraordinary potential of the misty
                hills of Assam. Captivated by the unique terroir and the morning
                mist that kissed the tea leaves, he founded Fog & Leaf with a
                simple vision: to share the magic of premium Indian teas with
                the world.
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Today, we continue this legacy by working directly with tea
                gardens in Assam and Darjeeling, ensuring that every leaf is
                harvested at the perfect moment when the morning mist creates
                the ideal conditions for exceptional flavor development.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Mountain className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700">Mountain Grown</span>
                </div>
                <div className="flex items-center">
                  <Sunrise className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700">Morning Harvested</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div
                className="rounded-2xl p-8 h-96 flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url(${imageurl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="text-center text-white relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Premium Quality</h3>
                  <p className="text-green-100">Hand-picked with care</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-green-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-green-300 mb-2">
                  {stat.number}
                </div>
                <div className="text-green-100 text-sm md:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do, from sourcing to serving
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 flex justify-center">{value.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600">
              Key milestones in our tea journey
            </p>
          </motion.div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center space-x-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </div>
                <Card className="flex-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {milestone.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        {milestone.year}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{milestone.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Experience Our Story?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of tea lovers who have discovered the magic of Fog
              & Leaf. Every cup tells a story of tradition, quality, and
              nature's finest gifts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3"
                >
                  Explore Our Teas
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

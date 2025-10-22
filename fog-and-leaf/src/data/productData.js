// Fallback product data for offline or API failure scenarios
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

export default fallbackProducts;

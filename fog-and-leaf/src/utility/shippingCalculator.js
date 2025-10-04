// Shipping cost calculation utility
const SHIPPING_ZONES = {
  metro: {
    name: "Metro Cities",
    cities: [
      "mumbai",
      "delhi",
      "bangalore",
      "chennai",
      "kolkata",
      "hyderabad",
      "pune",
      "ahmedabad",
    ],
    baseCost: 40,
    costPerKg: 15,
    standardDays: "1-2",
    expressDays: "Same Day",
  },
  tier1: {
    name: "Tier 1 Cities",
    cities: [
      "jaipur",
      "lucknow",
      "kanpur",
      "nagpur",
      "indore",
      "thane",
      "bhopal",
      "visakhapatnam",
      "patna",
      "vadodara",
    ],
    baseCost: 50,
    costPerKg: 18,
    standardDays: "2-3",
    expressDays: "1-2",
  },
  tier2: {
    name: "Tier 2 Cities",
    cities: [
      "agra",
      "nashik",
      "faridabad",
      "meerut",
      "rajkot",
      "kalyan",
      "vasai",
      "bhiwandi",
      "saharanpur",
      "gorakhpur",
    ],
    baseCost: 60,
    costPerKg: 22,
    standardDays: "3-4",
    expressDays: "2-3",
  },
  tier3: {
    name: "Other Cities",
    cities: [], // Default for any city not in above lists
    baseCost: 75,
    costPerKg: 25,
    standardDays: "4-6",
    expressDays: "3-4",
  },
};

const DELIVERY_SPEEDS = {
  standard: {
    name: "Standard Delivery",
    multiplier: 1.0,
    icon: "🚚",
  },
  express: {
    name: "Express Delivery",
    multiplier: 1.8,
    icon: "⚡",
  },
  overnight: {
    name: "Overnight Delivery",
    multiplier: 2.5,
    icon: "🌙",
  },
};

// Weight calculation for tea products (convert grams to kg)
const calculateWeight = (cartItems) => {
  return cartItems.reduce((totalWeight, item) => {
    // Weight is stored in grams, convert to kg for shipping calculation
    // Default weight: 250g for tea packages if not specified
    const itemWeightInGrams = item.weight || 250; // 250g default for tea packages
    const itemWeightInKg = itemWeightInGrams / 1000; // Convert grams to kg
    return totalWeight + itemWeightInKg * item.quantity;
  }, 0);
};

// Determine shipping zone based on city
const getShippingZone = (city) => {
  if (!city) return SHIPPING_ZONES.tier3;

  const cityLower = city.toLowerCase().trim();

  for (const [_zoneKey, zone] of Object.entries(SHIPPING_ZONES)) {
    if (zone.cities.includes(cityLower)) {
      return zone;
    }
  }

  return SHIPPING_ZONES.tier3; // Default to tier3 for unknown cities
};

// Calculate shipping cost
export const calculateShippingCost = (
  cartItems,
  shippingAddress,
  deliverySpeed = "standard"
) => {
  if (!cartItems || cartItems.length === 0) {
    return {
      cost: 0,
      breakdown: {
        baseCost: 0,
        weightCost: 0,
        speedMultiplier: 1,
        finalCost: 0,
      },
      zone: null,
      weight: 0,
      deliveryDays: "N/A",
      freeShippingThreshold: 1000,
    };
  }

  const weight = calculateWeight(cartItems);
  const zone = getShippingZone(shippingAddress?.city);
  const speed = DELIVERY_SPEEDS[deliverySpeed] || DELIVERY_SPEEDS.standard;

  // Calculate base shipping cost
  const baseCost = zone.baseCost;
  const weightCost = Math.max(0, weight - 0.5) * zone.costPerKg; // First 500g free
  const subtotalBeforeSpeed = baseCost + weightCost;

  // Apply speed multiplier
  const finalCost = Math.round(subtotalBeforeSpeed * speed.multiplier);

  // Free shipping threshold
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  const freeShippingThreshold = 1000;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;

  return {
    cost: isFreeShipping ? 0 : finalCost,
    breakdown: {
      baseCost,
      weightCost,
      speedMultiplier: speed.multiplier,
      finalCost: isFreeShipping ? 0 : finalCost,
      originalCost: finalCost,
    },
    zone: zone.name,
    weight: parseFloat(weight.toFixed(2)),
    deliveryDays:
      deliverySpeed === "standard" ? zone.standardDays : zone.expressDays,
    freeShippingThreshold,
    isFreeShipping,
    speed: speed.name,
    speedIcon: speed.icon,
  };
};

// Get available delivery options for a location
export const getDeliveryOptions = (cartItems, shippingAddress) => {
  const options = [];

  Object.entries(DELIVERY_SPEEDS).forEach(([key, speed]) => {
    const calculation = calculateShippingCost(cartItems, shippingAddress, key);
    options.push({
      id: key,
      name: speed.name,
      icon: speed.icon,
      cost: calculation.cost,
      deliveryDays: calculation.deliveryDays,
      description: `Delivery in ${calculation.deliveryDays} business days`,
    });
  });

  return options;
};

// Estimate delivery date
export const estimateDeliveryDate = (deliveryDays) => {
  if (!deliveryDays || deliveryDays === "N/A") return "Not available";

  const today = new Date();
  const daysRange = deliveryDays.split("-");

  if (daysRange.length === 2) {
    const minDays = parseInt(daysRange[0]);
    const maxDays = parseInt(daysRange[1]);
    const minDate = new Date(today.getTime() + minDays * 24 * 60 * 60 * 1000);
    const maxDate = new Date(today.getTime() + maxDays * 24 * 60 * 60 * 1000);

    return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
  } else if (deliveryDays.includes("Same Day")) {
    return "Today";
  } else {
    const days = parseInt(deliveryDays);
    if (!isNaN(days)) {
      const deliveryDate = new Date(
        today.getTime() + days * 24 * 60 * 60 * 1000
      );
      return deliveryDate.toLocaleDateString();
    }
  }

  return deliveryDays;
};

export default {
  calculateShippingCost,
  getDeliveryOptions,
  estimateDeliveryDate,
};

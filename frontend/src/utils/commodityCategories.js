// Agricultural Commodity Categories and Similarity Mapping

export const COMMODITY_REGISTRY = {
  // Vegetables
  tomato: { name: 'Tomato', category: 'Vegetables', emoji: '🍅', avgKgPrice: 32, minKgPrice: 28, maxKgPrice: 38, market: 'Kolar APMC', state: 'Karnataka', trend: '+0.2%', isPositive: true },
  potato: { name: 'Potato', category: 'Vegetables', emoji: '🥔', avgKgPrice: 24, minKgPrice: 20, maxKgPrice: 28, market: 'Agra APMC', state: 'Uttar Pradesh', trend: '+1.5%', isPositive: true },
  onion: { name: 'Onion', category: 'Vegetables', emoji: '🧅', avgKgPrice: 26, minKgPrice: 22, maxKgPrice: 31, market: 'Lasalgaon APMC', state: 'Maharashtra', trend: '-2.1%', isPositive: false },
  beans: { name: 'Beans (French Beans)', category: 'Vegetables', emoji: '🫘', avgKgPrice: 42, minKgPrice: 36, maxKgPrice: 48, market: 'Chikkaballapur APMC', state: 'Karnataka', trend: '+3.4%', isPositive: true },
  'green chilli': { name: 'Green Chilli', category: 'Vegetables', emoji: '🌶️', avgKgPrice: 55, minKgPrice: 45, maxKgPrice: 65, market: 'Guntur APMC', state: 'Andhra Pradesh', trend: '+0.8%', isPositive: true },
  cauliflower: { name: 'Cauliflower', category: 'Vegetables', emoji: '🥦', avgKgPrice: 30, minKgPrice: 25, maxKgPrice: 35, market: 'Azadpur Mandi', state: 'Delhi', trend: '-1.0%', isPositive: false },
  cabbage: { name: 'Cabbage', category: 'Vegetables', emoji: '🥬', avgKgPrice: 20, minKgPrice: 16, maxKgPrice: 24, market: 'Pune APMC', state: 'Maharashtra', trend: '+0.5%', isPositive: true },
  carrot: { name: 'Carrot', category: 'Vegetables', emoji: '🥕', avgKgPrice: 38, minKgPrice: 32, maxKgPrice: 44, market: 'Ooty APMC', state: 'Tamil Nadu', trend: '+1.9%', isPositive: true },
  brinjal: { name: 'Brinjal (Eggplant)', category: 'Vegetables', emoji: '🍆', avgKgPrice: 28, minKgPrice: 22, maxKgPrice: 34, market: 'Hubli APMC', state: 'Karnataka', trend: '-0.5%', isPositive: false },
  garlic: { name: 'Garlic', category: 'Vegetables', emoji: '🧄', avgKgPrice: 140, minKgPrice: 120, maxKgPrice: 165, market: 'Mandsaur Mandi', state: 'Madhya Pradesh', trend: '+4.2%', isPositive: true },
  ginger: { name: 'Ginger', category: 'Vegetables', emoji: '🫚', avgKgPrice: 85, minKgPrice: 70, maxKgPrice: 98, market: 'Wayanad APMC', state: 'Kerala', trend: '+2.0%', isPositive: true },

  // Grains & Cereals
  wheat: { name: 'Wheat', category: 'Grains & Cereals', emoji: '🌾', avgKgPrice: 27, minKgPrice: 24, maxKgPrice: 30, market: 'Khanna Mandi', state: 'Punjab', trend: '+0.4%', isPositive: true },
  rice: { name: 'Rice (Paddy)', category: 'Grains & Cereals', emoji: '🍚', avgKgPrice: 34, minKgPrice: 30, maxKgPrice: 40, market: 'Karnal Mandi', state: 'Haryana', trend: '+1.1%', isPositive: true },
  bajra: { name: 'Bajra (Pearl Millet)', category: 'Grains & Cereals', emoji: '🥣', avgKgPrice: 22, minKgPrice: 19, maxKgPrice: 25, market: 'Jaipur APMC', state: 'Rajasthan', trend: '-0.8%', isPositive: false },
  maize: { name: 'Maize (Corn)', category: 'Grains & Cereals', emoji: '🌽', avgKgPrice: 23, minKgPrice: 20, maxKgPrice: 26, market: 'Davangere APMC', state: 'Karnataka', trend: '+2.3%', isPositive: true },
  barley: { name: 'Barley', category: 'Grains & Cereals', emoji: '🌾', avgKgPrice: 21, minKgPrice: 18, maxKgPrice: 24, market: 'Sri Ganganagar APMC', state: 'Rajasthan', trend: '+0.0%', isPositive: true },
  jowar: { name: 'Jowar (Sorghum)', category: 'Grains & Cereals', emoji: '🌾', avgKgPrice: 32, minKgPrice: 28, maxKgPrice: 37, market: 'Solapur APMC', state: 'Maharashtra', trend: '+1.6%', isPositive: true },

  // Pulses & Legumes
  'bengal gram': { name: 'Bengal Gram (Chana)', category: 'Pulses', emoji: '🫘', avgKgPrice: 68, minKgPrice: 60, maxKgPrice: 75, market: 'Bikaner APMC', state: 'Rajasthan', trend: '+1.4%', isPositive: true },
  'red gram': { name: 'Red Gram (Tur/Arhar)', category: 'Pulses', emoji: '🥣', avgKgPrice: 110, minKgPrice: 98, maxKgPrice: 125, market: 'Kalaburagi APMC', state: 'Karnataka', trend: '+2.8%', isPositive: true },
  'green gram': { name: 'Green Gram (Moong)', category: 'Pulses', emoji: '🌱', avgKgPrice: 88, minKgPrice: 78, maxKgPrice: 96, market: 'Indore Mandi', state: 'Madhya Pradesh', trend: '-1.2%', isPositive: false },
  soyabean: { name: 'Soyabean', category: 'Pulses', emoji: '🫛', avgKgPrice: 48, minKgPrice: 44, maxKgPrice: 53, market: 'Ujjain Mandi', state: 'Madhya Pradesh', trend: '+0.9%', isPositive: true },

  // Fruits
  apple: { name: 'Apple', category: 'Fruits', emoji: '🍎', avgKgPrice: 95, minKgPrice: 80, maxKgPrice: 120, market: 'Shimla Mandi', state: 'Himachal Pradesh', trend: '+3.1%', isPositive: true },
  banana: { name: 'Banana', category: 'Fruits', emoji: '🍌', avgKgPrice: 30, minKgPrice: 25, maxKgPrice: 36, market: 'Jalgaon APMC', state: 'Maharashtra', trend: '+0.7%', isPositive: true },
  mango: { name: 'Mango', category: 'Fruits', emoji: '🥭', avgKgPrice: 75, minKgPrice: 60, maxKgPrice: 95, market: 'Ratnagiri APMC', state: 'Maharashtra', trend: '+5.0%', isPositive: true },
  pomegranate: { name: 'Pomegranate', category: 'Fruits', emoji: '🫐', avgKgPrice: 115, minKgPrice: 95, maxKgPrice: 135, market: 'Solapur APMC', state: 'Maharashtra', trend: '-0.9%', isPositive: false },
  orange: { name: 'Orange', category: 'Fruits', emoji: '🍊', avgKgPrice: 48, minKgPrice: 40, maxKgPrice: 58, market: 'Nagpur APMC', state: 'Maharashtra', trend: '+1.8%', isPositive: true },

  // Plantation & Commercial
  arecanut: { name: 'Arecanut (Supari)', category: 'Plantation Crops', emoji: '🌰', avgKgPrice: 480, minKgPrice: 420, maxKgPrice: 520, market: 'Shimoga APMC', state: 'Karnataka', trend: '+1.5%', isPositive: true },
  cotton: { name: 'Cotton', category: 'Commercial Crops', emoji: '☁️', avgKgPrice: 72, minKgPrice: 65, maxKgPrice: 80, market: 'Rajkot APMC', state: 'Gujarat', trend: '-1.4%', isPositive: false },
  coconut: { name: 'Coconut', category: 'Plantation Crops', emoji: '🥥', avgKgPrice: 35, minKgPrice: 28, maxKgPrice: 42, market: 'Kochi Mandi', state: 'Kerala', trend: '+0.6%', isPositive: true },
};

/**
 * Returns commodity info or fuzzy matches by name
 */
export function getCommodityInfo(commodityName = '') {
  if (!commodityName) return null;
  const lower = commodityName.toLowerCase().trim();
  for (const [key, item] of Object.entries(COMMODITY_REGISTRY)) {
    if (lower.includes(key) || key.includes(lower)) {
      return item;
    }
  }
  return {
    name: commodityName,
    category: 'Agricultural Produce',
    emoji: '🌾',
    avgKgPrice: 35,
    minKgPrice: 30,
    maxKgPrice: 42,
    market: 'Regional APMC',
    state: 'India',
    trend: '+0.5%',
    isPositive: true,
  };
}

/**
 * Finds similar commodities in the same category
 */
export function getSimilarCommodities(commodityName = '', count = 4) {
  const current = getCommodityInfo(commodityName);
  const targetCategory = current?.category || 'Vegetables';
  const currentKey = commodityName.toLowerCase();

  // Find other items in the same category
  const sameCategory = Object.values(COMMODITY_REGISTRY).filter(
    (item) => item.category === targetCategory && !currentKey.includes(item.name.toLowerCase()) && !item.name.toLowerCase().includes(currentKey)
  );

  if (sameCategory.length >= count) {
    return sameCategory.slice(0, count);
  }

  // If not enough in same category, supplement with top active produce
  const otherItems = Object.values(COMMODITY_REGISTRY).filter(
    (item) => item.category !== targetCategory && !currentKey.includes(item.name.toLowerCase())
  );

  return [...sameCategory, ...otherItems].slice(0, count);
}

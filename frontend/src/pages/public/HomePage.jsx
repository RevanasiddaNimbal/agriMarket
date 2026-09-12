import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sprout,
  ShoppingBag,
  TrendingUp,
  Cloud,
  Sun,
  CloudSun,
  CloudRain,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Sparkles,
  BookOpen,
  ChevronRight,
  Tractor,
  Wheat,
  FlaskConical,
  BugOff,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { productService } from '@/services/product/productService';
import { categoryService } from '@/services/category/categoryService';
import { marketPriceService } from '@/services/marketPrice/marketPriceService';
import { cropInfoService } from '@/services/cropInfo/cropInfoService';
import { weatherService } from '@/services/weather/weatherService';
import { ProductCard } from '@/components/product/ProductCard';
import { DEFAULT_COORDINATES } from '@/config/constants';
import { useToast } from '@/hooks/useToast';

// 6 Backend Master Categories (from V17__seed_categories_master_data.sql)
const DEFAULT_CATEGORIES = [
  { id: 'seeds', name: 'Seeds' },
  { id: 'fertilizers', name: 'Fertilizers' },
  { id: 'pesticides', name: 'Pesticides' },
  { id: 'harvested', name: 'Harvested Products' },
  { id: 'pre-harvested', name: 'Pre-Harvested Products' },
  { id: 'equipment', name: 'Farm Equipment' },
];

// Particular icon, color scheme, and styling for each produce category
function getCategoryVisual(cat) {
  const name = (cat?.name || cat?.id || '').toLowerCase();

  if (name.includes('seed')) {
    return {
      Icon: Sprout,
      boxClass: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100 group-hover:border-emerald-200',
    };
  }
  if (name.includes('fertilizer')) {
    return {
      Icon: FlaskConical,
      boxClass: 'bg-teal-50 text-teal-600 border-teal-100 group-hover:bg-teal-100 group-hover:border-teal-200',
    };
  }
  if (name.includes('pesticide')) {
    return {
      Icon: BugOff,
      boxClass: 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-100 group-hover:border-rose-200',
    };
  }
  if (name.includes('pre-harvest') || name.includes('pre harvest')) {
    return {
      Icon: Clock,
      boxClass: 'bg-sky-50 text-sky-600 border-sky-100 group-hover:bg-sky-100 group-hover:border-sky-200',
    };
  }
  if (name.includes('harvest')) {
    return {
      Icon: Wheat,
      boxClass: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100 group-hover:border-amber-200',
    };
  }
  if (name.includes('equipment') || name.includes('farm') || name.includes('machin')) {
    return {
      Icon: Tractor,
      boxClass: 'bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-100 group-hover:border-orange-200',
    };
  }

  return {
    Icon: Sprout,
    boxClass: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100 group-hover:border-emerald-200',
  };
}

// Function to balance products across categories and prioritize harvested & pre-harvested
function getBalancedFeaturedProducts(products) {
  if (!Array.isArray(products) || products.length === 0) return [];

  // Group products by their category
  const groups = {};
  for (const p of products) {
    const rawCat = p.category_name || p.categoryName || p.category || 'Agricultural Produce';
    const catName = rawCat.trim();
    if (!groups[catName]) {
      groups[catName] = [];
    }
    groups[catName].push(p);
  }

  // Priority order: Harvested & Pre-Harvested crops first, then Seeds, Equipment, Fertilizers, Pesticides
  const priorityCategories = [
    'Harvested Products',
    'Pre-Harvested Products',
    'Harvested',
    'Pre-Harvested',
    'Seeds',
    'Farm Equipment',
    'Fertilizers',
    'Pesticides',
  ];

  // Active categories present in database
  const activeCategories = [
    ...priorityCategories.filter((cat) => groups[cat] && groups[cat].length > 0),
    ...Object.keys(groups).filter(
      (cat) => !priorityCategories.includes(cat) && groups[cat].length > 0
    ),
  ];

  // Select up to 8 diverse products across categories round-robin
  const balanced = [];
  let round = 0;
  let hasMore = true;

  while (balanced.length < 8 && hasMore) {
    hasMore = false;
    for (const cat of activeCategories) {
      if (groups[cat] && groups[cat][round]) {
        balanced.push(groups[cat][round]);
        hasMore = true;
        if (balanced.length >= 8) break;
      }
    }
    round++;
  }

  return balanced.length > 0 ? balanced : products.slice(0, 8);
}

// Featured Crops for Agronomy Advisory
const FEATURED_CROPS = [
  {
    id: 'crop-wheat',
    cropName: 'Wheat (Gehun)',
    scientificName: 'Triticum aestivum',
    lifeCycle: '120-150 Days',
    season: 'Rabi',
    soilType: 'Clayey Loam',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'crop-rice',
    cropName: 'Rice (Paddy)',
    scientificName: 'Oryza sativa',
    lifeCycle: '110-140 Days',
    season: 'Kharif',
    soilType: 'Heavy Clay Loam',
    imageUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'crop-tomato',
    cropName: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    lifeCycle: '90-120 Days',
    season: 'All Year',
    soilType: 'Well-drained Sandy Loam',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'crop-cotton',
    cropName: 'Cotton',
    scientificName: 'Gossypium hirsutum',
    lifeCycle: '150-180 Days',
    season: 'Kharif',
    soilType: 'Deep Black Soil',
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const { latitude, longitude, city, state: geoState, loading: geoLoading, isDefault } = useGeolocation();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [crops, setCrops] = useState(FEATURED_CROPS);
  const [mandiRates, setMandiRates] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Selling Auth Guard Navigator: displays formal notification and redirects to /login?redirect=/sell
  const handleAuthNavigation = (targetPath = '/sell') => {
    if (!isAuthenticated) {
      toast.info('Please sign in to list and sell your agricultural products on AgriMarket.');
      navigate(`/login?redirect=${targetPath}`);
    } else {
      navigate(targetPath);
    }
  };

  // Navigate to commodity price trend/detail page with full mandi metadata (public route)
  const handlePriceRowClick = (item) => {
    const p = item.raw || {};
    const params = new URLSearchParams();
    if (p.commodity || item.commodity) params.set('commodity', p.commodity || item.commodity);
    if (p.market) params.set('market', p.market);
    if (p.district) params.set('district', p.district);
    if (p.state) params.set('state', p.state);
    if (p.modal_price || p.modalPrice) params.set('modalPrice', p.modal_price || p.modalPrice);
    if (p.minimum_price || p.minimumPrice) params.set('minPrice', p.minimum_price || p.minimumPrice);
    if (p.maximum_price || p.maximumPrice) params.set('maxPrice', p.maximum_price || p.maximumPrice);
    params.set('unit', 'kg');

    navigate(`/market-prices/trend?${params.toString()}`);
  };

  // Helper to convert Quintal or kg price to ₹/kg
  const toKgFormatted = (val, unit) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    const num = Number(val);
    const isQuintal = !unit || String(unit).toLowerCase().includes('quintal');
    const perKg = isQuintal ? num / 100 : num;
    return `₹${perKg.toFixed(perKg % 1 === 0 ? 0 : 1)}/kg`;
  };

  // 1. Load Public Catalog Data (Immediate, Independent of Geolocation)
  useEffect(() => {
    async function loadCatalog() {
      // Fetch Mandi Prices
      try {
        const priceData = await marketPriceService.getMarketPrices({ size: 10 });
        const list = priceData?.prices || (Array.isArray(priceData) ? priceData : []);
        if (list.length > 0) {
          const mapped = list.slice(0, 4).map((p) => {
            const modalVal = p.modal_price || p.modalPrice;
            const minVal = p.minimum_price || p.minimumPrice;
            const maxVal = p.maximum_price || p.maximumPrice;
            const kgPrice = toKgFormatted(modalVal, p.unit) || '₹40/kg';
            const minKg = toKgFormatted(minVal, p.unit);
            const maxKg = toKgFormatted(maxVal, p.unit);
            const rangeStr = minKg && maxKg ? `${minKg.replace('/kg', '')}-${maxKg}` : 'Standard';

            return {
              raw: p,
              commodity: p.commodity || 'Agricultural Produce',
              market: `${p.market || 'Local Mandi'}${p.district ? ', ' + p.district : ''}`,
              price: kgPrice,
              range: rangeStr,
            };
          });
          setMandiRates(mapped);
        }
      } catch (err) {
        console.warn('Real mandi prices fetch fallback:', err);
      }

      // Fetch Categories
      try {
        const catData = await categoryService.getAllCategories();
        const list = Array.isArray(catData) ? catData : (catData?.content || []);
        if (list.length > 0) {
          setCategories(list);
        }
      } catch (err) {
        console.warn('Backend categories fetch fallback:', err);
      }

      // Fetch Products
      try {
        const prods = await productService.getAllProducts();
        if (Array.isArray(prods) && prods.length > 0) {
          const balanced = getBalancedFeaturedProducts(prods);
          setFeaturedProducts(balanced);
        }
      } catch (err) {
        console.warn('Backend products fetch fallback:', err);
      }

      // Fetch Crop Guides
      try {
        const cropRes = await cropInfoService.getFeaturedCrops();
        const list = Array.isArray(cropRes) ? cropRes : (cropRes?.content || []);
        if (list.length > 0) {
          setCrops(list.slice(0, 4));
        }
      } catch (err) {
        console.warn('Real crop guides fetch fallback:', err);
      }
    }

    loadCatalog();
  }, []);

  // 2. Load Real Weather for User's Current Location (Waits for GPS/IP Detection)
  useEffect(() => {
    // If still resolving user's real GPS/IP location, wait so we NEVER prematurely fetch default coordinates!
    if (geoLoading && latitude === null) return;

    const targetLat = latitude ?? DEFAULT_COORDINATES.latitude;
    const targetLon = longitude ?? DEFAULT_COORDINATES.longitude;

    async function loadUserWeather() {
      try {
        const [dailyRes, hourlyRes] = await Promise.allSettled([
          weatherService.getDailyWeather(targetLat, targetLon),
          weatherService.getHourlyWeather(targetLat, targetLon),
        ]);

        const days = dailyRes.status === 'fulfilled'
          ? (dailyRes.value?.dailyForecast || dailyRes.value?.daily_forecast || dailyRes.value?.forecast || [])
          : [];

        const hours = hourlyRes.status === 'fulfilled'
          ? (hourlyRes.value?.hourlyForecast || hourlyRes.value?.hourly_forecast || hourlyRes.value?.forecast || [])
          : [];

        if (days.length > 0) {
          const today = days[0];
          const displayLocation = city
            ? `${city}${geoState ? ', ' + geoState : ''}`
            : (geoState ? geoState : (isDefault ? 'Vijayapura, Karnataka' : 'Current Location'));

          // Find weather for the current hour at that particular time
          let currentHourTemp = null;
          let currentCondition = null;

          if (hours.length > 0) {
            const currentHour = new Date().getHours();
            const matched = hours.find((h) => {
              if (!h.time) return false;
              const d = new Date(h.time);
              return !isNaN(d) && d.getHours() === currentHour;
            }) || hours[0];

            if (matched && matched.temperatureCelsius !== undefined) {
              currentHourTemp = `${Math.round(matched.temperatureCelsius)}°C`;
              currentCondition = matched.weatherCondition;
            }
          }

          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const mappedForecast = days.slice(1, 6).map((d) => {
            const dateObj = new Date(d.date);
            const dayStr = !isNaN(dateObj) ? dayNames[dateObj.getDay()] : 'Day';
            let IconComp = CloudSun;
            if (d.precipitationProbabilityPercent > 50) IconComp = CloudRain;
            else if (d.precipitationProbabilityPercent <= 20) IconComp = Sun;

            return {
              date: d.date,
              day: dayStr,
              icon: IconComp,
              high: `${Math.round(d.maximumTemperatureCelsius)}°`,
              low: `${Math.round(d.minimumTemperatureCelsius)}°`,
            };
          });

          setWeatherData({
            locationName: displayLocation,
            currentTemp: currentHourTemp || `${Math.round(today.maximumTemperatureCelsius)}°C`,
            condition: currentCondition || today.weatherCondition || 'Partly Cloudy',
            highLow: `H: ${Math.round(today.maximumTemperatureCelsius)}°C L: ${Math.round(today.minimumTemperatureCelsius)}°C`,
            forecast: mappedForecast,
          });
        }
      } catch (err) {
        console.warn('Real weather fetch fallback:', err);
      }
    }

    loadUserWeather();
  }, [latitude, longitude, geoLoading, city, geoState, isDefault]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 animate-fade-in">
      {/* 1. HERO BANNER — Vibrant lush green crop field with 'Sell Your Product' */}
      <section className="relative overflow-hidden bg-[#15803d] text-white pt-12 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 shadow-soft-lg">
        {/* Subtle decorative curves in background */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none">
          <svg viewBox="0 0 500 500" className="w-full h-full object-cover">
            <circle cx="350" cy="250" r="180" fill="none" stroke="currentColor" strokeWidth="60" />
            <circle cx="350" cy="250" r="280" fill="none" stroke="currentColor" strokeWidth="40" />
            <circle cx="350" cy="250" r="380" fill="none" stroke="currentColor" strokeWidth="20" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Top pill badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/25 text-white text-xs font-semibold backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Direct from Indian farmers</span>
              </motion.div>

              {/* Main Heading with simple, formal text animation */}
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.15] text-white"
              >
                Buy Fresh Produce Directly from Farmers
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm sm:text-base md:text-lg text-emerald-50 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                No middlemen. No markups. Just fresh, quality agricultural products from farms to your doorstep.
              </motion.p>

              {/* Action Buttons: Browse Products & Sell Your Product */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
              >
                <button
                  type="button"
                  onClick={() => navigate('/marketplace')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-white text-emerald-900 font-extrabold text-sm sm:text-base rounded-xl shadow-soft-sm hover:bg-emerald-50 hover:shadow-soft-md transition-all active:scale-[0.99]"
                >
                  Browse Products
                </button>
                <button
                  type="button"
                  onClick={() => handleAuthNavigation('/sell')}
                  className="w-full sm:w-auto px-7 py-3.5 border-2 border-white/80 text-white font-extrabold text-sm sm:text-base rounded-xl hover:bg-white/15 transition-all active:scale-[0.99]"
                >
                  Sell Your Product
                </button>
              </motion.div>

              {/* Bottom Stat Counters */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-4 gap-4 pt-6 border-t border-white/20 max-w-lg mx-auto lg:mx-0 text-left"
              >
                <div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300">500+</div>
                  <div className="text-[11px] text-emerald-100 font-medium">Farmers</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300">1000+</div>
                  <div className="text-[11px] text-emerald-100 font-medium">Products</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300">50+</div>
                  <div className="text-[11px] text-emerald-100 font-medium">Markets</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300">10k+</div>
                  <div className="text-[11px] text-emerald-100 font-medium">Orders</div>
                </div>
              </motion.div>
            </div>

            {/* Right Visual: Lush Green Crop Field Image (Clean image only, no floating badges) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-soft-xl border-4 border-white/20 bg-emerald-950/40">
                  <img
                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1000"
                    alt="Lush green agriculture field"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCE CATEGORIES SECTION — Exact Backend Categories & Card Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
              CATEGORIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Explore Produce Categories
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Master Categories: Bigger, More Styleable with Particular Category Icons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
          {categories.map((cat) => {
            const { Icon, boxClass } = getCategoryVisual(cat);
            return (
              <div
                key={cat.id || cat.name}
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate(`/marketplace?category=${encodeURIComponent(cat.id || cat.name)}`)
                }
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  navigate(`/marketplace?category=${encodeURIComponent(cat.id || cat.name)}`)
                }
                className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 min-h-[175px] sm:min-h-[195px] lg:min-h-[210px] shadow-soft-sm hover:shadow-soft-lg hover:border-brand-500 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 cursor-pointer group select-none"
              >
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-2xl sm:rounded-3xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-soft-xs ${boxClass}`}
                >
                  <Icon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 transition-transform duration-300" />
                </div>
                <span className="font-extrabold text-slate-800 text-sm sm:text-base group-hover:text-brand-700 transition-colors tracking-tight leading-snug">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. POPULAR AGRICULTURAL PRODUCTS SECTION — Multi-Category Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
              FRESH FROM INDIAN FARMS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Popular Agricultural Produce
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showcasing fresh vegetables, grains, fruits, seeds, and organic fertilizers with per-kg pricing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 transition-colors"
          >
            <span>View All Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {featuredProducts.length > 0 ? (
            featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft-xs space-y-3 animate-pulse"
              >
                <div className="aspect-[4/3] bg-slate-100 rounded-xl" />
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                <div className="h-3 w-1/2 bg-slate-50 rounded" />
                <div className="h-9 bg-slate-100 rounded-xl" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. WEATHER FORECAST & MARKET PRICES (SIDE-BY-SIDE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Card: Weather Forecast */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-sm flex flex-col justify-between space-y-5">
            {weatherData ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Weather Forecast
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{weatherData.locationName}</span>
                    </div>
                  </div>
                  <Cloud className="w-6 h-6 text-blue-500 flex-shrink-0" />
                </div>

                {/* Current Temperature Display */}
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-4xl sm:text-5xl font-black text-emerald-700 tracking-tight">
                    {weatherData.currentTemp}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{weatherData.condition}</div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      {weatherData.highLow}
                    </div>
                  </div>
                </div>

                {/* 5-Day Forecast Row (Clickable to view that day's weather) */}
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {weatherData.forecast.map((item, idx) => {
                    const DayIcon = item.icon || CloudSun;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => navigate(item.date ? `/weather?date=${item.date}` : '/weather')}
                        className="bg-slate-50 hover:bg-emerald-50/80 hover:border-emerald-300 hover:shadow-soft-xs active:scale-95 rounded-2xl p-2.5 sm:p-3 text-center border border-slate-100/90 flex flex-col items-center justify-between gap-1.5 transition-all cursor-pointer group"
                        title={`View ${item.day} forecast`}
                      >
                        <span className="text-[11px] font-bold text-slate-600 group-hover:text-emerald-800 transition-colors">{item.day}</span>
                        <DayIcon className="w-5 h-5 text-blue-500 group-hover:scale-110 my-0.5 transition-transform" />
                        <div className="text-xs font-bold text-slate-900">{item.high}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{item.low}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <div className="h-6 w-36 bg-slate-100 rounded" />
                    <div className="h-3.5 w-24 bg-slate-50 rounded" />
                  </div>
                  <div className="w-6 h-6 bg-slate-100 rounded-full" />
                </div>
                <div className="h-10 w-28 bg-slate-100 rounded my-2" />
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <div key={d} className="h-20 bg-slate-50 rounded-2xl border border-slate-100/60" />
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Button */}
            <button
              type="button"
              onClick={() => navigate('/weather')}
              className="w-full py-2.5 rounded-xl border border-emerald-600/40 text-emerald-800 hover:bg-emerald-50/70 font-bold text-xs sm:text-sm text-center transition-all shadow-soft-xs active:scale-[0.99]"
            >
              View Full Forecast
            </button>
          </div>

          {/* Right Card: Market Prices */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-sm flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Market Prices
                  </h3>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Today's Mandi rates (per kg)
                  </div>
                </div>
                <TrendingUp className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              </div>

              {/* Price Items List in strictly ₹/kg (Clickable to view commodity price trend) */}
              <div className="divide-y divide-slate-100">
                {mandiRates.length > 0 ? (
                  mandiRates.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handlePriceRowClick(item)}
                      className="py-2.5 px-2 -mx-2 rounded-xl flex items-center justify-between hover:bg-emerald-50/60 active:scale-[0.99] transition-all cursor-pointer group"
                      title={`View ${item.commodity} price trends`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-900 transition-colors truncate">
                          {item.commodity}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">{item.market}</div>
                      </div>
                      <div className="text-right flex items-center gap-2 flex-shrink-0">
                        <div>
                          <div className="font-black text-emerald-700 text-sm sm:text-base">
                            {item.price}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{item.range}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3 py-2 animate-pulse">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="flex justify-between items-center py-1.5">
                        <div className="space-y-1">
                          <div className="h-4 w-28 bg-slate-100 rounded" />
                          <div className="h-3 w-40 bg-slate-50 rounded" />
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="h-4 w-14 bg-slate-100 rounded ml-auto" />
                          <div className="h-3 w-16 bg-slate-50 rounded ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Button */}
            <button
              type="button"
              onClick={() => navigate('/market-prices')}
              className="w-full py-2.5 rounded-xl border border-emerald-600/40 text-emerald-800 hover:bg-emerald-50/70 font-bold text-xs sm:text-sm text-center transition-all shadow-soft-xs active:scale-[0.99]"
            >
              View All Prices
            </button>
          </div>
        </div>
      </section>

      {/* 5. CROP INFORMATION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
              AGRONOMY ADVISORY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Featured Crop Cultivation Guides
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/crops')}
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 transition-colors"
          >
            <span>View All Crop Guides</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {crops.map((crop) => (
            <div
              key={crop.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/crops/${crop.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/crops/${crop.id}`)}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-xs hover:shadow-soft-md hover:border-brand-300 transition-all flex flex-col justify-between overflow-hidden group cursor-pointer"
            >
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={
                    crop.imageUrl ||
                    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfYuy6z-85PXiTxZ-gHXyJiFL6RMZ6QxirIntV_oXRlg&s=10'
                  }
                  alt={crop.cropName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfYuy6z-85PXiTxZ-gHXyJiFL6RMZ6QxirIntV_oXRlg&s=10';
                  }}
                />
                {crop.lifeCycle && (
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/95 text-brand-800 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/40 shadow-soft-xs">
                      {crop.lifeCycle}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-brand-700 transition-colors">
                    {crop.cropName}
                  </h4>
                  {crop.scientificName && (
                    <div className="text-[11px] italic text-slate-400">
                      {crop.scientificName}
                    </div>
                  )}
                  {crop.soilType && (
                    <div className="text-xs text-slate-500 mt-2">
                      Soil: <span className="font-semibold text-slate-700">{crop.soilType}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-700 group-hover:text-brand-800">
                  <span>Read Agronomy Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HOW IT WORKS SECTION — With Action Buttons */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <div className="max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
              TRANSPARENT & DIRECT
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How AgriMarket Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              A direct trading platform connecting genuine Indian growers directly with buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft-xs space-y-3 hover:shadow-soft-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 font-black text-lg flex items-center justify-center border border-emerald-100">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Browse or List Produce</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Farmers list active harvests with real-time weights, location, and transparent per-kg pricing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft-xs space-y-3 hover:shadow-soft-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 font-black text-lg flex items-center justify-center border border-amber-100">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Single-Item Direct Purchase</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Buyers select quantities with instant inventory validation and process payments with zero middleman surcharge.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft-xs space-y-3 hover:shadow-soft-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 font-black text-lg flex items-center justify-center border border-teal-100">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Secure Delivery with OTP</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track delivery status in real-time. Handover is finalized securely via dynamic email/SMS OTP verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GET STARTED / CALL TO ACTION CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#15803d] text-white p-8 sm:p-12 shadow-soft-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              JOIN THE REVOLUTION
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Trade Directly with Real Farmers?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed">
              Join thousands of farmers, traders, and consumers trading fresh agricultural produce with verified OTP delivery and transparent Mandi pricing.
            </p>
          </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-shrink-0">
                <button
                    type="button"
                    onClick={() => handleAuthNavigation('/sell')}
                    className="w-full sm:w-auto px-7 py-3 bg-white text-emerald-900 font-extrabold text-sm rounded-xl shadow-soft-sm hover:bg-emerald-50 transition-all active:scale-[0.99]"
                >
                    {isAuthenticated ? 'Sell Your Product' : 'Get Started'}
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/marketplace')}
                    className="w-full sm:w-auto px-7 py-3 border-2 border-white/80 text-white font-extrabold text-sm rounded-xl hover:bg-white/15 transition-all active:scale-[0.99]"
                >
                    Browse Products
                </button>
            </div>
        </div>
      </section>
    </div>
  );
}

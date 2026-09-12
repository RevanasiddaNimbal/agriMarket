import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, RotateCcw, MapPin, Calendar, Search } from 'lucide-react';
import { marketPriceService } from '@/services/marketPrice/marketPriceService';
import { locationService } from '@/services/location/locationService';
import { MarketPriceTable } from '@/components/market/MarketPriceTable';
import { Select } from '@/components/common/Select';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { EmptyState } from '@/components/empty-states/EmptyState';
import { Spinner } from '@/components/loaders/Spinner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuth } from '@/hooks/useAuth';

// 5 States strictly supported by the Mandi Market provider
const SUPPORTED_STATES = [
  'Karnataka',
  'Maharashtra',
  'Uttar Pradesh',
  'Punjab',
  'Madhya Pradesh',
];

// Fallback districts for supported states if backend DB does not have them yet
const FALLBACK_STATE_DISTRICTS = {
  Karnataka: [
    'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
    'Bidar', 'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
    'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan',
    'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal',
    'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
    'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayanagara', 'Vijayapura', 'Yadgir',
  ],
  Maharashtra: [
    'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed',
    'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli',
    'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur',
    'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded',
    'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani',
    'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
    'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal',
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha',
    'Auraiya', 'Ayodhya', 'Azamgarh', 'Baghpat', 'Bahraich',
    'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly',
    'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr',
    'Chandauli', 'Chitoot', 'Deoria', 'Etah', 'Etawah',
    'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar', 'Ghaziabad',
    'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur',
    'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi',
    'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi',
    'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj',
    'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut',
    'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh',
    'Prayagraj', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal',
    'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar',
    'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi',
  ],
  Punjab: [
    'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
    'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
    'Kapurthala', 'Ludhiana', 'Malerkotla', 'Mansa', 'Moga',
    'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar',
    'Sangrur', 'Shahid Bhagat Singh Nagar', 'Sri Muktsar Sahib', 'Tarn Taran',
  ],
  'Madhya Pradesh': [
    'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat',
    'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur',
    'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas',
    'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda',
    'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua', 'Katni',
    'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena',
    'Narsinghpur', 'Neemuch', 'Niwari', 'Panna', 'Raisen',
    'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna',
    'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur',
    'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain',
    'Umaria', 'Vidisha',
  ],
};

const QUICK_COMMODITIES = [
  'All',
  'Tomato',
  'Potato',
  'Onion',
  'Beans',
  'Wheat',
  'Rice',
  'Bajra',
  'Arecanut',
  'Green Chilli',
  'Apple',
];

// Helper to get today's date in YYYY-MM-DD local format
function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to sort prices based on active user filters, or current location as default
function sortMarketPrices(priceList, activeFilters, userState, userCity) {
  if (!Array.isArray(priceList) || priceList.length === 0) return [];

  const targetCmd = (activeFilters?.commodity || '').toLowerCase().trim();
  const targetState = (activeFilters?.state || '').toLowerCase().trim();
  const targetDistrict = (activeFilters?.district || '').toLowerCase().trim();
  const targetMarket = (activeFilters?.market || '').toLowerCase().trim();

  const uCity = (userCity || '').toLowerCase().trim();
  const uState = (userState || '').toLowerCase().trim();

  // If user searched/filtered by commodity, district, market, or chose non-default state
  const hasUserFilter = Boolean(
    targetCmd ||
    targetDistrict ||
    targetMarket ||
    (targetState && targetState !== 'karnataka')
  );

  return [...priceList].sort((a, b) => {
    const aDistrict = (a.district || '').trim();
    const bDistrict = (b.district || '').trim();
    const aDistrictLower = aDistrict.toLowerCase();
    const bDistrictLower = bDistrict.toLowerCase();

    const aState = (a.state || '').trim();
    const bState = (b.state || '').trim();
    const aStateLower = aState.toLowerCase();
    const bStateLower = bState.toLowerCase();

    const aCommodity = (a.commodity || '').trim();
    const bCommodity = (b.commodity || '').trim();
    const aCommodityLower = aCommodity.toLowerCase();
    const bCommodityLower = bCommodity.toLowerCase();

    const aMarket = (a.market || '').trim();
    const bMarket = (b.market || '').trim();
    const aMarketLower = aMarket.toLowerCase();
    const bMarketLower = bMarket.toLowerCase();

    // -------------------------------------------------------------
    // CASE 1: User applied filters -> Sort by filter match & district, state, name
    // -------------------------------------------------------------
    if (hasUserFilter) {
      // 1. Priority: Explicit District filter match
      if (targetDistrict) {
        const aDistMatch = aDistrictLower.includes(targetDistrict) || targetDistrict.includes(aDistrictLower);
        const bDistMatch = bDistrictLower.includes(targetDistrict) || targetDistrict.includes(bDistrictLower);
        if (aDistMatch && !bDistMatch) return -1;
        if (!aDistMatch && bDistMatch) return 1;
      }

      // 2. Priority: Explicit Market filter match
      if (targetMarket) {
        const aMktMatch = aMarketLower.includes(targetMarket) || targetMarket.includes(aMarketLower);
        const bMktMatch = bMarketLower.includes(targetMarket) || targetMarket.includes(bMarketLower);
        if (aMktMatch && !bMktMatch) return -1;
        if (!aMktMatch && bMktMatch) return 1;
      }

      // 3. Priority: Explicit Commodity filter match
      if (targetCmd) {
        const aCmdExact = aCommodityLower === targetCmd;
        const bCmdExact = bCommodityLower === targetCmd;
        if (aCmdExact && !bCmdExact) return -1;
        if (!aCmdExact && bCmdExact) return 1;

        const aCmdMatch = aCommodityLower.includes(targetCmd);
        const bCmdMatch = bCommodityLower.includes(targetCmd);
        if (aCmdMatch && !bCmdMatch) return -1;
        if (!aCmdMatch && bCmdMatch) return 1;
      }

      // 4. Nearest to user if within the filtered state (when district was not explicitly chosen)
      if (!targetDistrict && uCity && (targetState ? aStateLower.includes(targetState) : true)) {
        const aNearMatch = aDistrictLower.includes(uCity) || aMarketLower.includes(uCity) || uCity.includes(aDistrictLower);
        const bNearMatch = bDistrictLower.includes(uCity) || bMarketLower.includes(uCity) || uCity.includes(bDistrictLower);
        if (aNearMatch && !bNearMatch) return -1;
        if (!aNearMatch && bNearMatch) return 1;
      }

      // 5. Standard sort: District (A-Z), State (A-Z), Commodity Name (A-Z), Market Name (A-Z)
      const distComp = aDistrict.localeCompare(bDistrict, undefined, { sensitivity: 'base' });
      if (distComp !== 0) return distComp;

      const stateComp = aState.localeCompare(bState, undefined, { sensitivity: 'base' });
      if (stateComp !== 0) return stateComp;

      const cmdComp = aCommodity.localeCompare(bCommodity, undefined, { sensitivity: 'base' });
      if (cmdComp !== 0) return cmdComp;

      return aMarket.localeCompare(bMarket, undefined, { sensitivity: 'base' });
    }

    // -------------------------------------------------------------
    // CASE 2: No filters applied -> Default sort by Current Location
    // -------------------------------------------------------------
    // Priority 1: Exact or partial match with user's city/district
    if (uCity) {
      const aCityMatch = aDistrictLower.includes(uCity) || aMarketLower.includes(uCity) || uCity.includes(aDistrictLower);
      const bCityMatch = bDistrictLower.includes(uCity) || bMarketLower.includes(uCity) || uCity.includes(bDistrictLower);
      if (aCityMatch && !bCityMatch) return -1;
      if (!aCityMatch && bCityMatch) return 1;
    }

    // Priority 2: Match with user's state
    if (uState) {
      const aStateMatch = aStateLower.includes(uState) || uState.includes(aStateLower);
      const bStateMatch = bStateLower.includes(uState) || uState.includes(bStateLower);
      if (aStateMatch && !bStateMatch) return -1;
      if (!aStateMatch && bStateMatch) return 1;
    }

    // Priority 3: Fallback sort by District, State, Commodity Name, Market
    const distComp = aDistrict.localeCompare(bDistrict, undefined, { sensitivity: 'base' });
    if (distComp !== 0) return distComp;

    const stateComp = aState.localeCompare(bState, undefined, { sensitivity: 'base' });
    if (stateComp !== 0) return stateComp;

    const cmdComp = aCommodity.localeCompare(bCommodity, undefined, { sensitivity: 'base' });
    if (cmdComp !== 0) return cmdComp;

    return aMarket.localeCompare(bMarket, undefined, { sensitivity: 'base' });
  });
}

export function MarketPricesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const todayDate = useMemo(() => getTodayIsoDate(), []);

  // User location detection
  const { city: geoCity, state: geoState } = useGeolocation();
  const { user } = useAuth();

  const userState = user?.state || geoState || '';
  const userCity = user?.district || user?.city || geoCity || '';
  const userLocationName = [userCity, userState].filter(Boolean).join(', ');

  // Determine initial state (restricted to supported states, defaulting to Karnataka)
  const initialUrlState = searchParams.get('state');
  const matchedInitialState = SUPPORTED_STATES.find(
    (s) => s.toLowerCase() === (initialUrlState || '').toLowerCase()
  ) || 'Karnataka';

  const initialUrlCommodity = searchParams.get('commodity') || searchParams.get('q') || '';
  const initialUrlDistrict = searchParams.get('district') || '';
  const initialUrlMarket = searchParams.get('market') || '';
  const initialUrlDate = searchParams.get('date') || todayDate;

  // 1. Draft Filters State: for user typing without triggering backend calls
  const [filterDraft, setFilterDraft] = useState({
    commodity: initialUrlCommodity,
    state: matchedInitialState,
    district: initialUrlDistrict,
    market: initialUrlMarket,
    date: initialUrlDate,
  });

  // 2. Active Filters State: only this triggers backend search calls
  const [activeFilters, setActiveFilters] = useState({
    commodity: initialUrlCommodity,
    state: matchedInitialState,
    district: initialUrlDistrict,
    market: initialUrlMarket,
    date: initialUrlDate,
  });

  const [backendStates, setBackendStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load backend states master data on mount
  useEffect(() => {
    let isMounted = true;
    async function loadStates() {
      try {
        const statesData = await locationService.getStates();
        const list = Array.isArray(statesData) ? statesData : (statesData?.content || []);
        if (isMounted && list.length > 0) {
          setBackendStates(list);
        }
      } catch (err) {
        console.warn('Backend states fetch notice:', err);
      }
    }
    loadStates();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically load districts from backend location endpoint whenever state changes
  useEffect(() => {
    let isMounted = true;
    async function loadDistrictsForState() {
      const currentState = filterDraft.state || 'Karnataka';
      try {
        const stateObj = backendStates.find(
          (s) => s.name?.toLowerCase() === currentState.toLowerCase()
        );
        if (stateObj?.id) {
          const districtData = await locationService.getDistricts(stateObj.id);
          const list = Array.isArray(districtData) ? districtData : (districtData?.content || []);
          if (isMounted && list.length > 0) {
            setDistricts(list.map((d) => d.name));
            return;
          }
        }
      } catch (err) {
        console.warn('Backend districts fetch notice for', currentState, err);
      }

      // Fallback districts for supported states if not found in database
      if (isMounted) {
        setDistricts(FALLBACK_STATE_DISTRICTS[currentState] || []);
      }
    }

    loadDistrictsForState();
    return () => {
      isMounted = false;
    };
  }, [filterDraft.state, backendStates]);

  // Synchronize when searchParams changes (e.g. from Navbar search or external links)
  useEffect(() => {
    const qParam = searchParams.get('commodity') || searchParams.get('q') || '';
    const stParam = searchParams.get('state');
    const validState = SUPPORTED_STATES.find(
      (s) => s.toLowerCase() === (stParam || '').toLowerCase()
    ) || 'Karnataka';

    const dtParam = searchParams.get('district') || '';
    const mkParam = searchParams.get('market') || '';
    const dParam = searchParams.get('date') || todayDate;

    setFilterDraft({
      commodity: qParam,
      state: validState,
      district: dtParam,
      market: mkParam,
      date: dParam,
    });

    setActiveFilters({
      commodity: qParam,
      state: validState,
      district: dtParam,
      market: mkParam,
      date: dParam,
    });
  }, [searchParams, todayDate]);

  // Execute search ONLY when activeFilters change (NOT on every keystroke)
  const loadPrices = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (activeFilters.commodity.trim()) params.commodity = activeFilters.commodity.trim();
      if (activeFilters.state) params.state = activeFilters.state;
      if (activeFilters.district) params.district = activeFilters.district;
      if (activeFilters.market.trim()) params.market = activeFilters.market.trim();
      if (activeFilters.date) params.date = activeFilters.date;

      const data = await marketPriceService.getMarketPrices(params);
      const backendPrices = data?.prices || (Array.isArray(data) ? data : []);

      // Sort according to active filters or user's current location default
      const sortedPrices = sortMarketPrices(backendPrices, activeFilters, userState, userCity);
      setPrices(sortedPrices);
    } catch (err) {
      console.error('Failed to load market prices:', err);
      setPrices([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters, userState, userCity]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  // Trigger search on Form Submit (Enter key or Search button click)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveFilters({
      commodity: filterDraft.commodity.trim(),
      state: filterDraft.state,
      district: filterDraft.district,
      market: filterDraft.market.trim(),
      date: filterDraft.date,
    });
  };

  // Changing State dropdown immediately updates district options & triggers query for that state
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setFilterDraft((prev) => ({ ...prev, state: newState, district: '' }));
    setActiveFilters((prev) => ({ ...prev, state: newState, district: '' }));
  };

  // Changing District dropdown immediately triggers query for that district
  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setFilterDraft((prev) => ({ ...prev, district: newDistrict }));
    setActiveFilters((prev) => ({ ...prev, district: newDistrict }));
  };

  // Changing Date immediately triggers query for that date
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setFilterDraft((prev) => ({ ...prev, date: newDate }));
    setActiveFilters((prev) => ({ ...prev, date: newDate }));
  };

  // Quick commodity chip click triggers search immediately
  const handleChipClick = (c) => {
    const val = c === 'All' ? '' : c;
    setFilterDraft((prev) => ({ ...prev, commodity: val }));
    setActiveFilters((prev) => ({ ...prev, commodity: val }));
  };

  // Reset to default Karnataka state and today's date
  const handleReset = () => {
    const defaultState = 'Karnataka';
    setFilterDraft({
      commodity: '',
      state: defaultState,
      district: '',
      market: '',
      date: todayDate,
    });
    setActiveFilters({
      commodity: '',
      state: defaultState,
      district: '',
      market: '',
      date: todayDate,
    });
    setSearchParams({});
  };

  // Determines if the user has applied custom search or filter criteria
  const hasUserFilter = Boolean(
    activeFilters.commodity?.trim() ||
    activeFilters.district?.trim() ||
    activeFilters.market?.trim() ||
    (activeFilters.state && activeFilters.state.toLowerCase() !== 'karnataka')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <Breadcrumb items={[{ label: 'Market Prices' }]} />

      {/* Header - Simple & Minimal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-brand-600" />
            <span>Market Prices</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live commodity rates from APMC Mandis across India, standardized in ₹/kg.
          </p>
        </div>

        {hasUserFilter ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-soft-xs self-start sm:self-auto">
            <Search className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Filtered: <strong>{[activeFilters.district, activeFilters.state].filter(Boolean).join(', ')}</strong>
            </span>
          </div>
        ) : userLocationName ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-soft-xs self-start sm:self-auto">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>Near: <strong>{userLocationName}</strong></span>
          </div>
        ) : null}
      </div>

      {/* Quick Commodity Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap mr-1">
          Popular:
        </span>
        {QUICK_COMMODITIES.map((item) => {
          const isActive = (item === 'All' && !filterDraft.commodity) || filterDraft.commodity.toLowerCase() === item.toLowerCase();
          return (
            <button
              key={item}
              type="button"
              onClick={() => handleChipClick(item)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-soft-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Filter Bar with Enter-Only Submit & Restricted State/District Dropdowns */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft-sm space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          {/* Commodity Text (Enter or Search button to trigger) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Commodity
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filterDraft.commodity}
                onChange={(e) => setFilterDraft((prev) => ({ ...prev, commodity: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                placeholder="e.g. Tomato (press Enter)"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-soft-xs"
              />
            </div>
          </div>

          {/* State Dropdown (Restricted to Supported States Only, Defaults to Karnataka) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              State
            </label>
            <Select
              value={filterDraft.state}
              onChange={handleStateChange}
              placeholder=""
              className="rounded-xl text-xs sm:text-sm py-2.5 shadow-soft-xs font-medium"
            >
              {SUPPORTED_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </Select>
          </div>

          {/* District Dropdown (Dynamically loaded from backend endpoint) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              District
            </label>
            <Select
              value={filterDraft.district}
              onChange={handleDistrictChange}
              placeholder="All Districts"
              className="rounded-xl text-xs sm:text-sm py-2.5 shadow-soft-xs font-medium"
            >
              {districts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </Select>
          </div>

          {/* Market / Mandi Text (Enter or Search button to trigger) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Mandi Market
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filterDraft.market}
                onChange={(e) => setFilterDraft((prev) => ({ ...prev, market: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                placeholder="e.g. Kolar APMC"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-soft-xs"
              />
            </div>
          </div>

          {/* Arrival Date (Defaults to Today's date) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Arrival Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={filterDraft.date}
                onChange={handleDateChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-soft-xs cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500 flex-wrap">
            <span>
              Showing <strong className="text-slate-900">{prices.length}</strong> Mandi price records in <strong>₹/kg</strong>
            </span>
            <span className="text-brand-700 font-medium hidden sm:inline">
              • State: <strong>{activeFilters.state}</strong>
              {activeFilters.district && ` • District: ${activeFilters.district}`}
            </span>
            <span className="text-slate-400 hidden md:inline">
              • {hasUserFilter ? 'Sorted by district, state & commodity' : `Sorted by your location (${userLocationName || 'Nearby'})`}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center gap-1 cursor-pointer transition-colors px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-soft-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Rates</span>
            </button>
          </div>
        </div>
      </form>

      {/* Prices Table */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Spinner text="Loading Mandi market feeds..." />
        </div>
      ) : prices.length > 0 ? (
        <MarketPriceTable prices={prices} />
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="No Mandi price data found"
          description={`No market arrivals found for ${activeFilters.commodity || 'produce'} in ${activeFilters.district ? `${activeFilters.district}, ` : ''}${activeFilters.state} on ${activeFilters.date}. Try choosing another district or date.`}
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      )}
    </div>
  );
}

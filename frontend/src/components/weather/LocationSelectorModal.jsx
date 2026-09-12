import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Check,
  X,
  Map,
} from 'lucide-react';

// Comprehensive list of all Karnataka agricultural districts with exact coordinates
export const KARNATAKA_DISTRICTS = [
  // North Karnataka (Major agricultural hubs)
  { city: 'Belagavi', state: 'Karnataka', region: 'North Karnataka', latitude: 15.8497, longitude: 74.4977 },
  { city: 'Hubballi-Dharwad', state: 'Karnataka', region: 'North Karnataka', latitude: 15.3647, longitude: 75.1240 },
  { city: 'Vijayapura', state: 'Karnataka', region: 'North Karnataka', latitude: 16.8302, longitude: 75.7100 },
  { city: 'Bagalkote', state: 'Karnataka', region: 'North Karnataka', latitude: 16.1875, longitude: 75.6980 },
  { city: 'Kalaburagi', state: 'Karnataka', region: 'North Karnataka', latitude: 17.3297, longitude: 76.8343 },
  { city: 'Raichur', state: 'Karnataka', region: 'North Karnataka', latitude: 16.2076, longitude: 77.3463 },
  { city: 'Koppal', state: 'Karnataka', region: 'North Karnataka', latitude: 15.3456, longitude: 76.1558 },
  { city: 'Gadag', state: 'Karnataka', region: 'North Karnataka', latitude: 15.4299, longitude: 75.6315 },
  { city: 'Haveri', state: 'Karnataka', region: 'North Karnataka', latitude: 14.7954, longitude: 75.3992 },
  { city: 'Ballari', state: 'Karnataka', region: 'North Karnataka', latitude: 15.1394, longitude: 76.9214 },
  { city: 'Vijayanagara (Hosapete)', state: 'Karnataka', region: 'North Karnataka', latitude: 15.2750, longitude: 76.3888 },
  { city: 'Bidar', state: 'Karnataka', region: 'North Karnataka', latitude: 17.9104, longitude: 77.5199 },
  { city: 'Yadgir', state: 'Karnataka', region: 'North Karnataka', latitude: 16.7630, longitude: 77.1378 },

  // Central & Malnad Karnataka
  { city: 'Shivamogga', state: 'Karnataka', region: 'Central Karnataka', latitude: 13.9299, longitude: 75.5681 },
  { city: 'Davanagere', state: 'Karnataka', region: 'Central Karnataka', latitude: 14.4644, longitude: 75.9218 },
  { city: 'Chitradurga', state: 'Karnataka', region: 'Central Karnataka', latitude: 14.2251, longitude: 76.3980 },
  { city: 'Chikkamagaluru', state: 'Karnataka', region: 'Malnad', latitude: 13.3161, longitude: 75.7720 },
  { city: 'Hassan', state: 'Karnataka', region: 'South Karnataka', latitude: 13.0033, longitude: 76.1004 },

  // South Karnataka
  { city: 'Mysuru', state: 'Karnataka', region: 'South Karnataka', latitude: 12.2958, longitude: 76.6394 },
  { city: 'Mandya', state: 'Karnataka', region: 'South Karnataka', latitude: 12.5218, longitude: 76.8951 },
  { city: 'Tumakuru', state: 'Karnataka', region: 'South Karnataka', latitude: 13.3409, longitude: 77.1010 },
  { city: 'Chamarajanagar', state: 'Karnataka', region: 'South Karnataka', latitude: 11.9261, longitude: 76.9437 },
  { city: 'Ramanagara', state: 'Karnataka', region: 'South Karnataka', latitude: 12.7209, longitude: 77.2799 },
  { city: 'Kolar', state: 'Karnataka', region: 'South Karnataka', latitude: 13.1367, longitude: 78.1340 },
  { city: 'Chikkaballapura', state: 'Karnataka', region: 'South Karnataka', latitude: 13.4355, longitude: 77.7275 },
  { city: 'Bengaluru Urban', state: 'Karnataka', region: 'Bengaluru', latitude: 12.9716, longitude: 77.5946 },
  { city: 'Bengaluru Rural', state: 'Karnataka', region: 'Bengaluru', latitude: 13.2230, longitude: 77.5680 },

  // Coastal Karnataka
  { city: 'Udupi', state: 'Karnataka', region: 'Coastal Karnataka', latitude: 13.3409, longitude: 74.7421 },
  { city: 'Mangaluru', state: 'Karnataka', region: 'Coastal Karnataka', latitude: 12.9141, longitude: 74.8560 },
  { city: 'Karwar (Uttara Kannada)', state: 'Karnataka', region: 'Coastal Karnataka', latitude: 14.8136, longitude: 74.1298 },
  { city: 'Kodagu (Madikeri)', state: 'Karnataka', region: 'Malnad', latitude: 12.4244, longitude: 75.7382 },
];

export function LocationSelectorModal({
  isOpen,
  onClose,
  currentLat,
  currentLon,
  currentCity,
  onSelectLocation,
  onUseCurrentLocation,
  onOpenMap,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDistricts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return KARNATAKA_DISTRICTS;
    return KARNATAKA_DISTRICTS.filter(
      (d) =>
        d.city.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              Select Farming Location
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="p-5 space-y-3.5 overflow-y-auto">
          {/* 2 Primary Action Buttons: GPS & Map Selection (like Profile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Live GPS Location */}
            <button
              type="button"
              onClick={() => {
                onUseCurrentLocation();
                onClose();
              }}
              className="py-2.5 px-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 text-left flex items-center gap-2.5 transition-all cursor-pointer shadow-soft-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 truncate">
                  Use GPS Location
                </div>
                <div className="text-[10px] text-emerald-700 font-medium truncate">
                  {currentCity || 'Current Location'}
                </div>
              </div>
            </button>

            {/* 2. Select On Map Button (Opens Profile-style Map Modal) */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenMap) onOpenMap();
              }}
              className="py-2.5 px-3.5 rounded-2xl bg-brand-50 hover:bg-brand-100/70 border border-brand-200/80 text-left flex items-center gap-2.5 transition-all cursor-pointer shadow-soft-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Map className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 truncate">
                  Select on Map
                </div>
                <div className="text-[10px] text-brand-700 font-medium truncate">
                  Drop pin on your farm
                </div>
              </div>
            </button>
          </div>

          {/* Search Input for Karnataka Districts */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Karnataka district or taluk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          {/* Karnataka Districts Grid */}
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1">
              <span>Karnataka Districts ({filteredDistricts.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredDistricts.map((item) => {
                const isSelected =
                  Math.abs(currentLat - item.latitude) < 0.05 &&
                  Math.abs(currentLon - item.longitude) < 0.05;

                return (
                  <button
                    key={item.city}
                    type="button"
                    onClick={() => {
                      onSelectLocation(item.latitude, item.longitude, item.city, item.state);
                      onClose();
                    }}
                    className={`text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 shadow-soft-xs'
                        : 'bg-white border-slate-100 hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-xs text-slate-800">
                        {item.city}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.region}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-brand-600 stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>

            {filteredDistricts.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                No district found for "{searchQuery}". You can use the map above to select any location!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

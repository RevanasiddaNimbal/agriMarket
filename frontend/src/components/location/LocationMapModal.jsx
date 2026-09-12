import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Crosshair, Search, Check, Loader2, X, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

// Dynamically load Leaflet CDN CSS and JS
function loadLeafletLibrary() {
  return new Promise((resolve, reject) => {
    // Inject custom Leaflet CSS overrides for custom pin and controls
    if (!document.getElementById('leaflet-custom-styles')) {
      const style = document.createElement('style');
      style.id = 'leaflet-custom-styles';
      style.textContent = `
        .leaflet-div-icon.custom-map-pin {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .leaflet-container {
          font-family: inherit !important;
          isolation: isolate;
        }
        .leaflet-bar {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        .leaflet-bar a {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-bottom: 1px solid #f1f5f9 !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 16px !important;
          font-weight: bold !important;
        }
        .leaflet-bar a:hover {
          background-color: #f8fafc !important;
          color: #16a34a !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 14px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12) !important;
          padding: 2px !important;
        }
        .leaflet-popup-tip {
          box-shadow: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    if (window.L) {
      return resolve(window.L);
    }

    if (!document.getElementById('leaflet-cdn-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-cdn-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-cdn-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-cdn-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => resolve(window.L);
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    } else {
      const existing = document.getElementById('leaflet-cdn-js');
      existing.addEventListener('load', () => resolve(window.L));
    }
  });
}

// Helper to sanitize and extract Indian address components from Nominatim response
export function parseNominatimAddress(data, lat, lon) {
  const addr = data.address || {};

  const streetParts = [
    addr.house_number,
    addr.road || addr.street,
    addr.neighbourhood,
  ].filter(Boolean);
  const street = streetParts.join(', ');

  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.suburb ||
    addr.municipality ||
    addr.county ||
    '';

  const district = addr.state_district || addr.county || addr.district || city || '';
  const state = addr.state || 'Karnataka';

  // Extract 6-digit Indian PIN code
  const pinMatch = (addr.postcode || data.display_name || '').match(/\b[1-9][0-9]{5}\b/);
  const pincode = pinMatch ? pinMatch[0] : '';

  // Formulate addressLine1
  const addressLine1 =
    street ||
    addr.suburb ||
    addr.village ||
    addr.hamlet ||
    (data.display_name ? data.display_name.split(',').slice(0, 2).join(', ') : 'Selected Location');

  const latitude = parseFloat(Number(lat).toFixed(6));
  const longitude = parseFloat(Number(lon).toFixed(6));

  return {
    addressLine1,
    village: addr.village || addr.suburb || addr.hamlet || '',
    city: city || district || 'Local Area',
    district: district || city || 'Local District',
    state,
    pincode,
    latitude,
    longitude,
    formattedAddress: data.display_name || `${latitude}, ${longitude}`,
  };
}

// Reverse geocode lat/lon into Indian address components
export async function reverseGeocodeCoords(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    const data = await res.json();
    return parseNominatimAddress(data, lat, lon);
  } catch (err) {
    console.warn('Reverse geocode fallback:', err);
    return {
      addressLine1: 'Selected Location',
      village: '',
      city: 'Local Area',
      district: 'Local District',
      state: 'Karnataka',
      pincode: '',
      latitude: parseFloat(Number(lat).toFixed(6)),
      longitude: parseFloat(Number(lon).toFixed(6)),
      formattedAddress: `${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}`,
    };
  }
}

// Search places via Nominatim
export async function searchPlaces(query) {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query.trim()
      )}&countrycodes=in&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      ...item,
      parsedDetails: parseNominatimAddress(item, item.lat, item.lon),
    }));
  } catch (err) {
    console.warn('Places search error:', err);
    return [];
  }
}

// Detect current GPS position and reverse geocode
export async function getCurrentLocationAddress() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser'));
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const info = await reverseGeocodeCoords(pos.coords.latitude, pos.coords.longitude);
          resolve(info);
        } catch (err) {
          reject(err);
        }
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export function LocationMapModal({
  isOpen,
  onClose,
  onSelectLocation,
  initialCoords,
  initialAddress,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const onSelectLocationRef = useRef(onSelectLocation);
  const onCloseRef = useRef(onClose);

  // Keep callback refs updated
  useEffect(() => {
    onSelectLocationRef.current = onSelectLocation;
    onCloseRef.current = onClose;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialAddress || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Helper to attach Leaflet popup with active "Use This Location" action button
  const attachMarkerPopup = (marker, details) => {
    if (!marker || !details) return;

    const escapeHtml = (str) =>
      String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const cityText = escapeHtml(details.city || details.district || 'Selected Location');
    const addrText = escapeHtml(details.addressLine1);
    const pinText = details.pincode ? ` (${escapeHtml(details.pincode)})` : '';

    const popupHtml = `
      <div style="font-family: inherit; text-align: center; padding: 4px 2px; min-width: 175px; max-width: 220px;">
        <div style="font-weight: 800; color: #0f172a; font-size: 13px; margin-bottom: 2px;">
          📍 ${cityText}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 8px; line-height: 1.3;">
          ${addrText}${pinText}
        </div>
        <button id="leaflet-btn-select-location" style="width: 100%; background-color: #16a34a; color: white; border: none; padding: 7px 12px; border-radius: 8px; font-weight: 700; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 5px rgba(22, 163, 74, 0.25);">
          ✓ Use This Location
        </button>
      </div>
    `;

    marker.bindPopup(popupHtml).openPopup();
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setSearchResults([]);
    setShowSearchResults(false);

    loadLeafletLibrary()
      .then((L) => {
        if (!isMounted || !mapContainerRef.current) return;

        // Clean up previous map instance if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const defaultLat = initialCoords?.lat || 15.3173; // Karnataka, India default
        const defaultLng = initialCoords?.lng || 75.7139;

        const map = L.map(mapContainerRef.current, {
          center: [defaultLat, defaultLng],
          zoom: initialCoords ? 15 : 12,
          zoomControl: true,
        });

        mapInstanceRef.current = map;

        // Invalidate map size after render to ensure tiles render sharply
        setTimeout(() => {
          if (map && isMounted) {
            map.invalidateSize();
          }
        }, 250);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // Custom green pin icon
        const greenIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="background-color: #16a34a; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;"><div style="width: 10px; height: 10px; background-color: white; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -32],
        });

        const marker = L.marker([defaultLat, defaultLng], {
          draggable: true,
          icon: greenIcon,
        }).addTo(map);

        markerRef.current = marker;

        const updateLocation = async (lat, lon, autoOpenPopup = true) => {
          setIsGeocoding(true);
          const details = await reverseGeocodeCoords(lat, lon);
          if (isMounted) {
            setSelectedDetails(details);
            setIsGeocoding(false);
            if (autoOpenPopup) {
              attachMarkerPopup(marker, details);
            }
          }
        };

        // Trigger initial reverse geocoding
        updateLocation(defaultLat, defaultLng, true);

        // Click listener on Map
        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          updateLocation(e.latlng.lat, e.latlng.lng, true);
        });

        // Drag listener on Marker
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          updateLocation(pos.lat, pos.lng, true);
        });

        // Global delegate on popup button click
        map.on('popupopen', () => {
          const btn = document.getElementById('leaflet-btn-select-location');
          if (btn) {
            btn.onclick = () => {
              if (selectedDetails) {
                onSelectLocationRef.current(selectedDetails);
                onCloseRef.current();
              }
            };
          }
        });

        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Leaflet:', err);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Keep popup button handler bound whenever selectedDetails updates
  useEffect(() => {
    if (markerRef.current && selectedDetails) {
      attachMarkerPopup(markerRef.current, selectedDetails);
      const btn = document.getElementById('leaflet-btn-select-location');
      if (btn) {
        btn.onclick = () => {
          onSelectLocationRef.current(selectedDetails);
          onCloseRef.current();
        };
      }
    }
  }, [selectedDetails]);

  // Handle "Use Current Location" (GPS) button inside modal
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsGeocoding(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 16);
          markerRef.current.setLatLng([lat, lon]);
        }
        const details = await reverseGeocodeCoords(lat, lon);
        setSelectedDetails(details);
        setIsGeocoding(false);
        if (markerRef.current) {
          attachMarkerPopup(markerRef.current, details);
        }
      },
      () => {
        setIsGeocoding(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Search places via Nominatim
  const handleSearchPlace = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const results = await searchPlaces(searchQuery.trim());
      setSearchResults(results);

      // Auto-fly to top result if available
      if (results.length > 0) {
        const topResult = results[0];
        const lat = parseFloat(topResult.lat);
        const lon = parseFloat(topResult.lon);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 15);
          markerRef.current.setLatLng([lat, lon]);
        }
        setSelectedDetails(topResult.parsedDetails);
        if (markerRef.current) {
          attachMarkerPopup(markerRef.current, topResult.parsedDetails);
        }
      }
    } catch (err) {
      console.warn('Place search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Select a specific search suggestion
  const handleSelectSearchResult = (result, autoConfirm = false) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const details = result.parsedDetails;

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 16);
      markerRef.current.setLatLng([lat, lon]);
    }
    setSelectedDetails(details);
    setShowSearchResults(false);

    if (markerRef.current) {
      attachMarkerPopup(markerRef.current, details);
    }

    if (autoConfirm) {
      onSelectLocationRef.current(details);
      onCloseRef.current();
    }
  };

  // Direct confirmation handler
  const handleConfirm = () => {
    if (!selectedDetails) return;
    onSelectLocation(selectedDetails);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pick Location on Interactive Map"
      description="Search your town or click anywhere on the map to pinpoint your farm or delivery address."
      maxWidth="max-w-4xl"
    >
      <div className="space-y-3.5">
        {/* Search & Locate Me Toolbar */}
        <div className="relative z-[1500]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <form onSubmit={handleSearchPlace} className="flex-1 flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!showSearchResults && e.target.value) setShowSearchResults(true);
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowSearchResults(true);
                  }}
                  placeholder="Search city, taluk, village, landmark, or PIN code..."
                  className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <Button size="sm" type="submit" isLoading={isSearching} variant="secondary">
                Search
              </Button>
            </form>

            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={handleLocateMe}
              className="flex items-center gap-1.5 text-xs text-brand-700 font-bold border-brand-200 hover:bg-brand-50 whitespace-nowrap"
            >
              <Crosshair className="w-3.5 h-3.5 text-brand-600" />
              <span>Current GPS</span>
            </Button>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 sm:right-32 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl z-[1500] max-h-60 overflow-y-auto divide-y divide-slate-100">
              <div className="p-2.5 bg-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-500 sticky top-0">
                <span>Matching Locations ({searchResults.length})</span>
                <button
                  type="button"
                  onClick={() => setShowSearchResults(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {searchResults.map((res, idx) => (
                <div
                  key={idx}
                  className="p-3 hover:bg-emerald-50/60 transition-colors flex items-center justify-between gap-2 cursor-pointer text-xs"
                  onClick={() => handleSelectSearchResult(res, false)}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                        <span>{res.parsedDetails.city || res.parsedDetails.district || res.name}</span>
                        {res.parsedDetails.pincode && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                            {res.parsedDetails.pincode}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate leading-snug mt-0.5">
                        {res.display_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSearchResult(res, true);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Select</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map View Canvas with Floating Guidance Badge */}
        <div className="relative w-full h-[350px] sm:h-[420px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                <span>Loading Interactive Map...</span>
              </div>
            </div>
          )}

          {/* Floating Instructions Pill */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] pointer-events-none bg-slate-900 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5 border border-slate-700 opacity-95">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Click map or drag the green pin to position your plot</span>
          </div>

          <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
        </div>

        {/* Selected Address Preview & Confirm Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-soft-sm">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 flex-wrap">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="truncate text-sm font-bold text-slate-900">
                {selectedDetails?.city || selectedDetails?.district || 'Selected Location'}
              </span>
              {selectedDetails?.pincode && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex-shrink-0">
                  PIN: {selectedDetails.pincode}
                </span>
              )}
              {selectedDetails?.latitude && selectedDetails?.longitude && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 flex-shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" /> Coordinates Pinned
                </span>
              )}
              {isGeocoding && (
                <span className="text-[11px] font-normal text-slate-500 flex items-center gap-1 ml-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Resolving...
                </span>
              )}
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed truncate">
              {selectedDetails?.addressLine1 || selectedDetails?.formattedAddress || 'Click map or search to pinpoint address'}
            </p>
          </div>

          <div className="flex items-center gap-2 justify-end flex-shrink-0">
            <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-600">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={!selectedDetails || isGeocoding}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm px-4"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save Map Location</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

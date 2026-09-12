import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_COORDINATES } from '@/config/constants';

const GEO_STORAGE_KEY = 'agrimarket_user_location';

export function useGeolocation() {
  const [location, setLocation] = useState(() => {
    try {
      const cached = sessionStorage.getItem(GEO_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.latitude && parsed.longitude && !parsed.isDefault) {
          return { ...parsed, loading: false };
        }
      }
    } catch {}
    return {
      latitude: null,
      longitude: null,
      city: '',
      state: '',
      isDefault: false,
      error: null,
      loading: true,
    };
  });

  const saveLocation = useCallback((data) => {
    try {
      sessionStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(data));
    } catch {}
    setLocation(data);
  }, []);

  const detectUserLocation = useCallback(async () => {
    let resolved = false;

    // Helper 1: IP Geolocation using BigDataCloud or FreeIPAPI without GPS
    const fetchIpLocation = async () => {
      try {
        const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en');
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            return {
              latitude: Number(data.latitude),
              longitude: Number(data.longitude),
              city: data.city || data.locality || '',
              state: data.principalSubdivision || '',
              isDefault: false,
              error: null,
              loading: false,
            };
          }
        }
      } catch {}

      try {
        const res2 = await fetch('https://freeipapi.com/api/json');
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2.latitude && data2.longitude) {
            return {
              latitude: Number(data2.latitude),
              longitude: Number(data2.longitude),
              city: data2.cityName || '',
              state: data2.regionName || '',
              isDefault: false,
              error: null,
              loading: false,
            };
          }
        }
      } catch {}

      return null;
    };

    // Helper 2: Reverse Geocode coordinates to city/state
    const reverseGeocode = async (lat, lon) => {
      try {
        const geoRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );
        if (geoRes.ok) {
          const data = await geoRes.json();
          return {
            city: data.city || data.locality || '',
            state: data.principalSubdivision || '',
          };
        }
      } catch {}
      return { city: '', state: '' };
    };

    // Fast fallback: if GPS takes more than 2.5s (e.g. desktop without GPS chip), initiate IP detection
    const ipFallbackTimer = setTimeout(async () => {
      if (!resolved) {
        const ipLoc = await fetchIpLocation();
        if (ipLoc && !resolved) {
          resolved = true;
          saveLocation(ipLoc);
        }
      }
    }, 2500);

    // Try Browser GPS first (High Accuracy)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(ipFallbackTimer);
          resolved = true;
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const { city, state } = await reverseGeocode(lat, lon);

          saveLocation({
            latitude: lat,
            longitude: lon,
            city: city || 'Current Location',
            state: state || '',
            isDefault: false,
            error: null,
            loading: false,
          });
        },
        async (err) => {
          clearTimeout(ipFallbackTimer);
          if (resolved) return;

          // If GPS is denied or unavailable, fetch real IP location
          const ipLoc = await fetchIpLocation();
          if (ipLoc) {
            resolved = true;
            saveLocation(ipLoc);
          } else {
            // Last resort: default coordinates only if offline or all detection fails
            resolved = true;
            saveLocation({
              latitude: DEFAULT_COORDINATES.latitude,
              longitude: DEFAULT_COORDINATES.longitude,
              city: DEFAULT_COORDINATES.city,
              state: DEFAULT_COORDINATES.state,
              isDefault: true,
              error: err.message,
              loading: false,
            });
          }
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
      );
    } else {
      clearTimeout(ipFallbackTimer);
      const ipLoc = await fetchIpLocation();
      if (ipLoc) {
        saveLocation(ipLoc);
      } else {
        saveLocation({
          latitude: DEFAULT_COORDINATES.latitude,
          longitude: DEFAULT_COORDINATES.longitude,
          city: DEFAULT_COORDINATES.city,
          state: DEFAULT_COORDINATES.state,
          isDefault: true,
          error: 'Geolocation unavailable',
          loading: false,
        });
      }
    }
  }, [saveLocation]);

  useEffect(() => {
    // Only detect if not already cached
    if (location.latitude === null) {
      detectUserLocation();
    }
  }, [detectUserLocation, location.latitude]);

  const setManualLocation = (lat, lon, cityName, stateName) => {
    saveLocation({
      latitude: Number(lat),
      longitude: Number(lon),
      city: cityName || '',
      state: stateName || '',
      isDefault: false,
      error: null,
      loading: false,
    });
  };

  return { ...location, setManualLocation, refreshLocation: detectUserLocation };
}

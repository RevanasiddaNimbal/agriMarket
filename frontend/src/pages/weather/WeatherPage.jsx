import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CloudSun,
  MapPin,
  RefreshCw,
  Navigation,
  Calendar,
  Sliders,
  Map,
} from 'lucide-react';
import { weatherService } from '@/services/weather/weatherService';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Spinner } from '@/components/loaders/Spinner';
import { DEFAULT_COORDINATES } from '@/config/constants';

import { CurrentWeatherHero } from '@/components/weather/CurrentWeatherHero';
import { RiskGauge } from '@/components/weather/RiskGauge';
import { DailyBreakdownChart } from '@/components/weather/DailyBreakdownChart';
import { WeatherCard } from '@/components/weather/WeatherCard';
import { WeeklyRiskBreakdown } from '@/components/weather/WeeklyRiskBreakdown';
import { LocationSelectorModal } from '@/components/weather/LocationSelectorModal';
import { LocationMapModal } from '@/components/location/LocationMapModal';

export function WeatherPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get('date');

  const {
    latitude,
    longitude,
    city,
    state,
    loading: geoLoading,
    setManualLocation,
    refreshLocation,
    isDefault,
  } = useGeolocation();

  const toast = useToast();

  const [dailyForecast, setDailyForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [weeklyRisk, setWeeklyRisk] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Active coordinates
  const activeLat = latitude ?? DEFAULT_COORDINATES.latitude;
  const activeLon = longitude ?? DEFAULT_COORDINATES.longitude;

  const loadWeatherData = async (lat, lon) => {
    setIsLoading(true);
    try {
      const [dailyRes, hourlyRes, riskRes] = await Promise.allSettled([
        weatherService.getDailyWeather(lat, lon),
        weatherService.getHourlyWeather(lat, lon),
        weatherService.getWeeklyRisk(lat, lon),
      ]);

      if (dailyRes.status === 'fulfilled') {
        const days =
          dailyRes.value?.dailyForecast ||
          dailyRes.value?.daily_forecast ||
          dailyRes.value?.forecast ||
          [];
        setDailyForecast(days);
      }
      if (hourlyRes.status === 'fulfilled') {
        const hours =
          hourlyRes.value?.hourlyForecast ||
          hourlyRes.value?.hourly_forecast ||
          hourlyRes.value?.forecast ||
          [];
        setHourlyForecast(hours);
      }
      if (riskRes.status === 'fulfilled') {
        setWeeklyRisk(riskRes.value);
      }
    } catch (err) {
      toast.error('Failed to load real-time weather analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (geoLoading && latitude === null) return;
    loadWeatherData(activeLat, activeLon);
  }, [activeLat, activeLon, geoLoading]);

  // Selected Day: defaults to today (first day) or ?date= query param
  const selectedDay = useMemo(() => {
    if (dateParam && dailyForecast.length > 0) {
      const match = dailyForecast.find((d) => d.date === dateParam);
      if (match) return match;
    }
    return dailyForecast[0] || null;
  }, [dateParam, dailyForecast]);

  const isSelectedToday = selectedDay?.date === dailyForecast[0]?.date;

  // Selected day's risk object from weeklyRisk.dailyForecast
  const selectedDayRisk = useMemo(() => {
    if (!weeklyRisk?.dailyForecast || !selectedDay) return null;
    return weeklyRisk.dailyForecast.find((d) => d.date === selectedDay.date) || weeklyRisk.dailyForecast[0];
  }, [weeklyRisk, selectedDay]);

  // Min and Max temperatures across the whole week for visual temperature range bars
  const { minWeekTemp, maxWeekTemp } = useMemo(() => {
    if (dailyForecast.length === 0) return { minWeekTemp: 18, maxWeekTemp: 36 };
    const mins = dailyForecast.map((d) => Math.round(d.minimumTemperatureCelsius ?? 20));
    const maxs = dailyForecast.map((d) => Math.round(d.maximumTemperatureCelsius ?? 30));
    return {
      minWeekTemp: Math.min(...mins),
      maxWeekTemp: Math.max(...maxs),
    };
  }, [dailyForecast]);

  const handleSelectLocation = (lat, lon, cityName, stateName) => {
    setManualLocation(lat, lon, cityName, stateName);
    toast.success(`Location set to ${cityName || 'Selected Area'}`);
  };

  const handleMapLocationSelected = (locationDetails) => {
    if (!locationDetails) return;
    const lat = locationDetails.latitude;
    const lon = locationDetails.longitude;
    const cityName =
      locationDetails.city ||
      locationDetails.district ||
      locationDetails.village ||
      'Selected Farm';
    const stateName = locationDetails.state || 'Karnataka';

    setManualLocation(lat, lon, cityName, stateName);
    setIsMapModalOpen(false);
    toast.success(`Weather location set to ${cityName}`);
  };

  const handleUseCurrentLocation = () => {
    refreshLocation();
    toast.info('Detecting your local GPS coordinates...');
  };

  const locationSubtitle = city
    ? `${city}${state ? `, ${state}` : ''} • Live Open-Meteo`
    : `${activeLat.toFixed(2)}° N, ${activeLon.toFixed(2)}° E • Live Open-Meteo`;

  if (geoLoading || (isLoading && dailyForecast.length === 0)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" text="Loading farm weather feed..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Farm Weather' },
        ]}
      />

      {/* Page Header - Small, Simple, and Clean matching website style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Weather</span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              Live Forecast
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {locationSubtitle}
          </p>
        </div>

        {/* Simple & Clean Location Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 hover:border-brand-500 hover:bg-slate-50 transition-all shadow-soft-xs cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>{city || 'Change Location'}</span>
            <span className="text-[10px] text-slate-400 font-normal">▼</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMapModalOpen(true)}
            title="Pick exact location on interactive map"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-brand-500 hover:bg-slate-50 transition-all shadow-soft-xs cursor-pointer"
          >
            <Map className="w-3.5 h-3.5 text-brand-600" />
            <span>Map</span>
          </button>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            title="Use My Current GPS Location"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-brand-500 hover:bg-slate-50 transition-all shadow-soft-xs cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span>GPS</span>
          </button>

          <button
            type="button"
            onClick={() => loadWeatherData(activeLat, activeLon)}
            title="Refresh weather data"
            className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all shadow-soft-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. Top Section: Current Weather Hero + Farming Risk Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          {selectedDay && (
            <CurrentWeatherHero
              dailyWeather={selectedDay}
              hourlySample={isSelectedToday ? hourlyForecast[0] : null}
              cityName={city}
              stateName={state}
              latitude={activeLat}
              longitude={activeLon}
              isToday={isSelectedToday}
              onOpenLocationSelector={() => setIsLocationModalOpen(true)}
            />
          )}
        </div>

        <div className="lg:col-span-4">
          <RiskGauge
            score={selectedDayRisk?.farmingRisk?.overallRiskScore ?? weeklyRisk?.overallRiskScore ?? 0}
            level={selectedDayRisk?.farmingRisk?.overallRiskLevel || weeklyRisk?.overallRiskLevel || 'LOW'}
            title="Farming Risk"
            summary={selectedDayRisk?.farmingRisk?.summary || weeklyRisk?.summary}
            riskBreakdown={selectedDayRisk?.farmingRisk || weeklyRisk?.riskBreakdown}
          />
        </div>
      </div>

      {/* 2. Daily Breakdown Chart (Hourly Weather) */}
      {hourlyForecast.length > 0 && (
        <DailyBreakdownChart hourlyData={hourlyForecast} />
      )}

      {/* 3. 7-Day Extended Weather Forecast */}
      <div className="space-y-3 pt-2 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            <span>7-Day Forecast</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Click day to inspect
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {dailyForecast.map((day, idx) => {
            const isDaySelected = selectedDay?.date === day.date;
            const dayRisk = weeklyRisk?.dailyForecast?.find((d) => d.date === day.date);

            return (
              <div
                key={day.date || idx}
                onClick={() => setSearchParams({ date: day.date })}
                className="cursor-pointer"
                title={`Click to inspect ${day.date} forecast`}
              >
                <WeatherCard
                  dailyWeather={day}
                  farmingRisk={dayRisk?.farmingRisk}
                  isToday={idx === 0}
                  isSelected={isDaySelected}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Below 7-Day Forecast: Risk Factors & Farming Advisory */}
      {weeklyRisk && (
        <div className="pt-2 border-t border-slate-200/80">
          <WeeklyRiskBreakdown
            riskData={weeklyRisk}
            selectedDayRisk={selectedDayRisk}
          />
        </div>
      )}

      {/* Location Selector Modal (Karnataka Districts & Options) */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLat={activeLat}
        currentLon={activeLon}
        currentCity={city}
        currentState={state}
        isDefault={isDefault}
        onSelectLocation={handleSelectLocation}
        onUseCurrentLocation={handleUseCurrentLocation}
        onOpenMap={() => setIsMapModalOpen(true)}
      />

      {/* Interactive Map Modal (Profile-style Leaflet pin drop) */}
      <LocationMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectLocation={handleMapLocationSelected}
        initialCoords={{ lat: activeLat, lng: activeLon }}
        initialAddress={city ? `${city}, Karnataka` : 'Karnataka, India'}
      />
    </div>
  );
}

import React from 'react';
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  Sunrise,
  Sunset,
  Activity,
  MapPin,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

function getWeatherIcon(code = 0, pop = 0) {
  if (code >= 95) return <CloudLightning className="w-10 h-10 text-amber-500" />;
  if (code >= 51 || pop > 50) return <CloudRain className="w-10 h-10 text-sky-500" />;
  if (code >= 1 && code <= 3) return <CloudSun className="w-10 h-10 text-amber-500" />;
  if (code > 3) return <Cloud className="w-10 h-10 text-slate-400" />;
  return <Sun className="w-10 h-10 text-amber-500" />;
}

export function CurrentWeatherHero({
  dailyWeather,
  hourlySample,
  cityName,
  stateName,
  latitude,
  longitude,
  isToday = true,
  onOpenLocationSelector,
}) {
  if (!dailyWeather) return null;

  // Exact temperatures matching the 7-day broadcast cards below
  const maxTemp = Math.round(dailyWeather.maximumTemperatureCelsius ?? 0);
  const minTemp = Math.round(dailyWeather.minimumTemperatureCelsius ?? 0);
  const feelsLike = dailyWeather.apparentTemperatureCelsius != null
    ? Math.round(dailyWeather.apparentTemperatureCelsius)
    : Math.round((maxTemp + minTemp) / 2);

  const currentNowTemp = hourlySample?.temperatureCelsius != null
    ? Math.round(hourlySample.temperatureCelsius)
    : null;

  const condition = dailyWeather.weatherCondition || 'Clear';
  const pop = dailyWeather.precipitationProbabilityPercent ?? 0;
  const rainMm = dailyWeather.rainMillimeters ?? dailyWeather.precipitationMillimeters ?? 0;
  const windSpeed = Math.round(dailyWeather.maximumWindSpeedKmh ?? 0);
  const windGusts = Math.round(dailyWeather.maximumWindGustsKmh ?? windSpeed);
  const uvIndex = dailyWeather.uvIndexMax != null ? Number(dailyWeather.uvIndexMax).toFixed(0) : null;
  const et0 = dailyWeather.evapotranspirationMillimeters != null
    ? Number(dailyWeather.evapotranspirationMillimeters).toFixed(1)
    : null;

  const humidity = hourlySample?.relativeHumidityPercent != null
    ? Math.round(hourlySample.relativeHumidityPercent)
    : null;

  const sunriseTime = dailyWeather.sunrise
    ? new Date(dailyWeather.sunrise).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null;

  const sunsetTime = dailyWeather.sunset
    ? new Date(dailyWeather.sunset).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null;

  const locationDisplay = cityName
    ? `${cityName}${stateName ? `, ${stateName}` : ''}`
    : `${latitude?.toFixed(2)}° N, ${longitude?.toFixed(2)}° E`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-soft-sm space-y-5">
      {/* 1. Header: Location, Date & Live Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenLocationSelector}
            className="flex items-center gap-1.5 text-xs text-slate-700 font-bold bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-2xs"
          >
            <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
            <span className="truncate max-w-[220px]">{locationDisplay}</span>
            <span className="text-[10px] text-slate-400 font-normal">▼</span>
          </button>

          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{isToday ? 'Today, ' : ''}{formatDate(dailyWeather.date, false)}</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-soft-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Open-Meteo Feed</span>
        </span>
      </div>

      {/* 2. Main Hero: Weather Icon + Exact High/Low matching below */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-soft-xs">
            {getWeatherIcon(dailyWeather.weatherCode, pop)}
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {maxTemp}°
              </span>
              <span className="text-xl font-bold text-slate-400">
                / {minTemp}°C
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 mt-0.5">
              {condition}
            </h2>

            <p className="text-xs text-slate-500 font-medium mt-0.5">
              High: {maxTemp}°C • Low: {minTemp}°C • Feels like: {feelsLike}°C
              {isToday && currentNowTemp != null && ` • Current: ${currentNowTemp}°C`}
            </p>
          </div>
        </div>

        {/* 2 Quick Summary Highlight Badges */}
        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800">
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            <span>Precipitation: {pop}%</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800">
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            <span>Max Wind: {windSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* 3. Formal Metrics Grid - 100% Real Backend Data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100">
        {/* Rain */}
        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Droplets className="w-3.5 h-3.5 text-slate-500" />
            <span>Rain Chance</span>
          </div>
          <div className="text-base font-black text-slate-900 mt-1">
            {pop}%
          </div>
          <div className="text-[10px] text-slate-500">
            {rainMm > 0 ? `${rainMm.toFixed(1)} mm volume` : 'No rainfall expected'}
          </div>
        </div>

        {/* Wind */}
        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Wind className="w-3.5 h-3.5 text-slate-500" />
            <span>Wind Speed</span>
          </div>
          <div className="text-base font-black text-slate-900 mt-1">
            {windSpeed} km/h
          </div>
          <div className="text-[10px] text-slate-500">
            Gusts: up to {windGusts} km/h
          </div>
        </div>

        {/* Humidity */}
        {humidity != null && (
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Thermometer className="w-3.5 h-3.5 text-slate-500" />
              <span>Air Humidity</span>
            </div>
            <div className="text-base font-black text-slate-900 mt-1">
              {humidity}%
            </div>
            <div className="text-[10px] text-slate-500">
              {humidity > 70 ? 'High humidity' : 'Optimal range'}
            </div>
          </div>
        )}

        {/* UV Index */}
        {uvIndex != null && (
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Sun className="w-3.5 h-3.5 text-slate-500" />
              <span>UV Index</span>
            </div>
            <div className="text-base font-black text-slate-900 mt-1">
              {uvIndex}
            </div>
            <div className="text-[10px] text-slate-500">
              {Number(uvIndex) >= 8 ? 'Very High' : Number(uvIndex) >= 6 ? 'High' : 'Moderate'}
            </div>
          </div>
        )}

        {/* Evapotranspiration */}
        {et0 != null && (
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <span>Evapotranspiration</span>
            </div>
            <div className="text-base font-black text-slate-900 mt-1">
              {et0} mm
            </div>
            <div className="text-[10px] text-slate-500">
              Daily crop water loss
            </div>
          </div>
        )}

        {/* Sunrise & Sunset */}
        {sunriseTime && sunsetTime && (
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Sunrise className="w-3.5 h-3.5 text-slate-500" />
              <span>Daylight</span>
            </div>
            <div className="text-xs font-black text-slate-900 mt-1">
              {sunriseTime}
            </div>
            <div className="text-[10px] text-slate-500">
              Sunset: {sunsetTime}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

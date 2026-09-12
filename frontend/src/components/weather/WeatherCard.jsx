import React from 'react';
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  Cloud,
  Wind,
  Droplets,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

function getForecastIcon(code = 0, pop = 0) {
  if (code >= 95) return <CloudLightning className="w-7 h-7 text-amber-500" />;
  if (code >= 51 || pop > 50) return <CloudRain className="w-7 h-7 text-sky-500" />;
  if (code >= 1 && code <= 3) return <CloudSun className="w-7 h-7 text-amber-500" />;
  if (code > 3) return <Cloud className="w-7 h-7 text-slate-400" />;
  return <Sun className="w-7 h-7 text-amber-500" />;
}

function getDayName(dateStr, isToday) {
  if (isToday) return 'Today';
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getDay()];
}

function getShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function WeatherCard({
  dailyWeather,
  farmingRisk,
  isToday = false,
  isSelected = false,
}) {
  if (!dailyWeather) return null;

  const maxTemp = Math.round(dailyWeather.maximumTemperatureCelsius ?? 0);
  const minTemp = Math.round(dailyWeather.minimumTemperatureCelsius ?? 0);
  const condition = dailyWeather.weatherCondition || 'Clear';
  const pop = dailyWeather.precipitationProbabilityPercent ?? 0;
  const windSpeed = Math.round(dailyWeather.maximumWindSpeedKmh ?? 0);

  const rawLevel = farmingRisk?.overallRiskLevel || (pop > 60 || windSpeed > 35 ? 'HIGH' : pop > 35 || windSpeed > 25 ? 'MEDIUM' : 'LOW');

  let riskBadge = 'bg-slate-100 text-slate-600 border-slate-200';
  let riskLabel = 'Low Risk';

  if (rawLevel === 'HIGH' || rawLevel === 'CRITICAL') {
    riskBadge = 'bg-rose-50 text-rose-700 border-rose-200';
    riskLabel = 'High Risk';
  } else if (rawLevel === 'MEDIUM' || rawLevel === 'MODERATE') {
    riskBadge = 'bg-amber-50 text-amber-700 border-amber-200';
    riskLabel = 'Moderate';
  }

  const dayTitle = getDayName(dailyWeather.date, isToday);
  const dateSub = getShortDate(dailyWeather.date);

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl border transition-all relative flex flex-col justify-between space-y-3 ${
        isSelected
          ? 'bg-white border-brand-600 shadow-soft-md ring-2 ring-brand-500/20'
          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-soft-sm'
      }`}
    >
      {/* 1. Header: Day Name + Date and Risk Pill (No line) */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
            {dayTitle}
          </h4>
          <p className="text-xs text-slate-400 font-medium">
            {dateSub}
          </p>
        </div>

        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${riskBadge}`}>
          {riskLabel}
        </span>
      </div>

      {/* 2. Middle: Large Weather Icon + Big Clean Temperatures (No lines) */}
      <div className="flex items-center gap-3.5 py-1">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100/80 flex items-center justify-center flex-shrink-0">
          {getForecastIcon(dailyWeather.weatherCode, pop)}
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {maxTemp}°
            </span>
            <span className="text-xs font-bold text-slate-400">
              / {minTemp}°C
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">
            {condition}
          </p>
        </div>
      </div>

      {/* 3. Footer: 2 Clean Minimal Stat Pills (Rain & Wind) (No lines) */}
      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
        <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-50/90 border border-slate-100 text-slate-700 font-semibold text-[11px]">
          <Droplets className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{pop}% rain</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-50/90 border border-slate-100 text-slate-700 font-semibold text-[11px]">
          <Wind className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
}

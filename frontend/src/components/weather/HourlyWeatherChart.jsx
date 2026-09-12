import React from 'react';
import { Droplets, CloudSun } from 'lucide-react';

export function HourlyWeatherChart({ hourlyData = [] }) {
  if (!hourlyData || hourlyData.length === 0) return null;

  // Take the next 12-24 hours
  const displayHours = hourlyData.slice(0, 16);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-brand-600" />
          <span>Hourly Forecast Breakdown</span>
        </h3>
        <span className="text-xs text-slate-500">Scroll to view upcoming hours</span>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-2 scrollbar-thin">
        {displayHours.map((hour, idx) => {
          const time = hour.time ? new Date(hour.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : `${idx}:00`;
          const temp = Math.round(hour.temperatureCelsius ?? 26);
          const pop = hour.precipitationProbabilityPercent ?? 0;

          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-between min-w-[72px] p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-brand-300 hover:bg-brand-50/50 transition-all text-center flex-shrink-0"
            >
              <span className="text-[11px] font-semibold text-slate-500">{time}</span>
              <div className="my-2 text-base font-extrabold text-slate-900">{temp}°C</div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-sky-600">
                <Droplets className="w-3 h-3" />
                <span>{pop}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

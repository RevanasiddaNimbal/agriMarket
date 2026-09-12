import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  SprayCan,
  Droplets,
  Wind,
  Flame,
} from 'lucide-react';
import { RISK_LEVELS } from '@/config/constants';

export function RiskGauge({
  score = 0,
  level = 'LOW',
  title = 'Farming Risk',
  summary,
  riskBreakdown,
}) {
  const meta = RISK_LEVELS[level] || RISK_LEVELS.LOW;

  // Gauge colors based on score
  let strokeColor = '#10b981'; // Green
  let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (score > 75 || level === 'CRITICAL') {
    strokeColor = '#f43f5e'; // Red
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (score > 50 || level === 'HIGH') {
    strokeColor = '#f97316'; // Orange
    badgeClass = 'bg-orange-50 text-orange-700 border-orange-200';
  } else if (score > 30 || level === 'MEDIUM' || level === 'MODERATE') {
    strokeColor = '#f59e0b'; // Amber
    badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  // Real backend risk factors
  const sprayingLevel = riskBreakdown?.sprayingRisk?.riskLevel || riskBreakdown?.sprayingRiskLevel;
  const irrigationLevel = riskBreakdown?.irrigationRisk?.riskLevel || riskBreakdown?.irrigationRiskLevel;
  const windLevel = riskBreakdown?.windRisk?.riskLevel || riskBreakdown?.windRiskLevel;
  const heatLevel = riskBreakdown?.heatRisk?.riskLevel || riskBreakdown?.heatRiskLevel;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-soft-sm flex flex-col justify-between h-full space-y-4">
      {/* Small Simple Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-brand-600" />
          <span>{title}</span>
        </h3>

        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-soft-xs ${badgeClass}`}>
          {score <= 35 ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          <span>{meta.label || level}</span>
        </span>
      </div>

      {/* Main Circular Gauge Display */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100"
              strokeWidth="3.4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              stroke={strokeColor}
              strokeDasharray={`${Math.min(100, Math.max(4, score))}, 100`}
              strokeWidth="3.6"
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-700 ease-out"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{score}</span>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              / 100
            </span>
          </div>
        </div>

        {/* Backend Summary Text */}
        {summary && (
          <p className="text-xs text-slate-600 font-medium text-center leading-relaxed mt-2 px-2 max-w-xs">
            {summary}
          </p>
        )}
      </div>

      {/* Quick Field Status Badges from Backend */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
            <SprayCan className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
            <span className="truncate">Spraying</span>
          </div>
          <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
            sprayingLevel === 'HIGH' || sprayingLevel === 'CRITICAL'
              ? 'bg-rose-100 text-rose-700'
              : sprayingLevel === 'MEDIUM' || sprayingLevel === 'MODERATE'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {sprayingLevel ? sprayingLevel : (score > 50 ? 'High' : 'Low')}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
            <Droplets className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
            <span className="truncate">Irrigation</span>
          </div>
          <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
            irrigationLevel === 'HIGH' || irrigationLevel === 'CRITICAL'
              ? 'bg-rose-100 text-rose-700'
              : irrigationLevel === 'MEDIUM' || irrigationLevel === 'MODERATE'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {irrigationLevel ? irrigationLevel : (score > 40 ? 'Moderate' : 'Low')}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
            <Wind className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <span className="truncate">Wind</span>
          </div>
          <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
            windLevel === 'HIGH' || windLevel === 'CRITICAL'
              ? 'bg-rose-100 text-rose-700'
              : windLevel === 'MEDIUM' || windLevel === 'MODERATE'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-200/80 text-slate-700'
          }`}>
            {windLevel ? windLevel : 'Low'}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
            <Flame className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="truncate">Heat</span>
          </div>
          <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
            heatLevel === 'HIGH' || heatLevel === 'CRITICAL'
              ? 'bg-rose-100 text-rose-700'
              : heatLevel === 'MEDIUM' || heatLevel === 'MODERATE'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {heatLevel ? heatLevel : 'Low'}
          </span>
        </div>
      </div>
    </div>
  );
}

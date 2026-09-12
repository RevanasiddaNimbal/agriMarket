import React from 'react';
import {
  CloudRain,
  Wind,
  Flame,
  Sun,
  SprayCan,
  Droplets,
  CheckCircle2,
  ShieldAlert,
  Lightbulb,
} from 'lucide-react';
import { RISK_LEVELS } from '@/config/constants';

export function WeeklyRiskBreakdown({ riskData, selectedDayRisk }) {
  if (!riskData && !selectedDayRisk) return null;

  const dailyFarmingRisk = selectedDayRisk?.farmingRisk || riskData?.dailyForecast?.[0]?.farmingRisk;
  const weeklyBreakdown = riskData?.riskBreakdown;

  const factors = [
    {
      key: 'rainfall',
      label: 'Rainfall',
      icon: CloudRain,
      score: dailyFarmingRisk?.rainfallRisk?.score ?? weeklyBreakdown?.rainfallRiskScore ?? 0,
      level: dailyFarmingRisk?.rainfallRisk?.level || weeklyBreakdown?.rainfallRiskLevel || 'LOW',
      reason: dailyFarmingRisk?.rainfallRisk?.reason,
      recommendation: dailyFarmingRisk?.rainfallRisk?.recommendation,
    },
    {
      key: 'wind',
      label: 'Wind Gusts',
      icon: Wind,
      score: dailyFarmingRisk?.windRisk?.score ?? weeklyBreakdown?.windRiskScore ?? 0,
      level: dailyFarmingRisk?.windRisk?.level || weeklyBreakdown?.windRiskLevel || 'LOW',
      reason: dailyFarmingRisk?.windRisk?.reason,
      recommendation: dailyFarmingRisk?.windRisk?.recommendation,
    },
    {
      key: 'heat',
      label: 'Heatwave',
      icon: Flame,
      score: dailyFarmingRisk?.heatRisk?.score ?? weeklyBreakdown?.heatRiskScore ?? 0,
      level: dailyFarmingRisk?.heatRisk?.level || weeklyBreakdown?.heatRiskLevel || 'LOW',
      reason: dailyFarmingRisk?.heatRisk?.reason,
      recommendation: dailyFarmingRisk?.heatRisk?.recommendation,
    },
    {
      key: 'uv',
      label: 'Solar UV',
      icon: Sun,
      score: dailyFarmingRisk?.uvRisk?.score ?? weeklyBreakdown?.uvRiskScore ?? 0,
      level: dailyFarmingRisk?.uvRisk?.level || weeklyBreakdown?.uvRiskLevel || 'LOW',
      reason: dailyFarmingRisk?.uvRisk?.reason,
      recommendation: dailyFarmingRisk?.uvRisk?.recommendation,
    },
    {
      key: 'spraying',
      label: 'Spraying Window',
      icon: SprayCan,
      score: dailyFarmingRisk?.sprayingRisk?.score ?? weeklyBreakdown?.sprayingRiskScore ?? 0,
      level: dailyFarmingRisk?.sprayingRisk?.level || weeklyBreakdown?.sprayingRiskLevel || 'LOW',
      reason: dailyFarmingRisk?.sprayingRisk?.reason,
      recommendation: dailyFarmingRisk?.sprayingRisk?.recommendation,
    },
    {
      key: 'irrigation',
      label: 'Irrigation',
      icon: Droplets,
      score: dailyFarmingRisk?.irrigationRisk?.score ?? weeklyBreakdown?.irrigationRiskScore ?? 0,
      level: dailyFarmingRisk?.irrigationRisk?.level || weeklyBreakdown?.irrigationRiskLevel || 'LOW',
      reason: dailyFarmingRisk?.irrigationRisk?.reason,
      recommendation: dailyFarmingRisk?.irrigationRisk?.recommendation,
    },
  ];

  const recommendations = dailyFarmingRisk?.recommendations || [];
  const weeklyInsights = riskData?.weeklyInsights || [];
  const allAdvisories = recommendations.length > 0 ? recommendations : weeklyInsights;

  const getBadgeStyle = (level) => {
    if (level === 'HIGH' || level === 'CRITICAL') {
      return 'bg-rose-50 text-rose-800 border-rose-200/80';
    }
    if (level === 'MEDIUM' || level === 'MODERATE') {
      return 'bg-amber-50 text-amber-800 border-amber-200/80';
    }
    return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
  };

  const getMeterColor = (score) => {
    if (score > 60) return 'bg-rose-500';
    if (score > 35) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-5">
      {/* Risk Factors Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-brand-600" />
              <span>Risk Factors</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Assessed agronomic conditions for farm planning
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {factors.map((f) => {
            const Icon = f.icon;
            const meta = RISK_LEVELS[f.level] || RISK_LEVELS.LOW;

            return (
              <div
                key={f.key}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-soft-xs hover:border-slate-300 hover:shadow-soft-sm transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Header: Icon + Title + Risk Pill */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {f.label}
                      </h4>
                    </div>

                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getBadgeStyle(f.level)}`}>
                      {meta.label || f.level}
                    </span>
                  </div>

                  {/* Backend Reason */}
                  {f.reason && (
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {f.reason}
                    </p>
                  )}

                  {/* Tip */}
                  {f.recommendation && (
                    <p className="text-xs text-slate-600 leading-relaxed mt-2 pt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-800 mr-1">Tip:</span>
                      <span>{f.recommendation}</span>
                    </p>
                  )}
                </div>

                {/* Risk Index Line - Polished, clean, user-friendly UI */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Risk Index</span>
                    <span className="text-slate-800">{f.score} / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getMeterColor(f.score)}`}
                      style={{ width: `${Math.min(100, Math.max(5, f.score))}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Farming Advisory Section */}
      {allAdvisories.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-soft-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Lightbulb className="w-5 h-5 text-brand-600" />
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
              Farming Advisory
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {allAdvisories.map((advisory, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 font-medium leading-relaxed"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{advisory}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

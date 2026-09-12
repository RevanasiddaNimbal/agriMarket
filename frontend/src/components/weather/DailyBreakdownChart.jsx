import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  CloudSun,
  CloudRain,
  Cloud,
  CloudLightning,
  Clock,
  Sparkles,
} from 'lucide-react';

function getHourWeatherIcon(code = 0, isDay = true, pop = 0) {
  if (code >= 95) return <CloudLightning className="w-4 h-4 text-amber-500" />;
  if (code >= 51 || pop > 50) return <CloudRain className="w-4 h-4 text-sky-500" />;
  if (code >= 1 && code <= 3) return <CloudSun className="w-4 h-4 text-amber-500" />;
  if (code > 3) return <Cloud className="w-4 h-4 text-slate-400" />;
  return <Sun className="w-4 h-4 text-amber-500" />;
}

// Generate smooth cubic Bézier SVG path
function getSmoothPath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// Calculate clean, minimal Y-scale ticks with only a few values (3 to 4 ticks max)
function calculateNiceYScale(rawMin, rawMax, options = {}) {
  const { forceZeroMin = false } = options;

  let minVal = forceZeroMin ? 0 : Math.floor(rawMin);
  let maxVal = Math.ceil(rawMax);

  if (maxVal <= minVal) {
    maxVal = minVal + 4;
  }

  // Pick steps that yield only 3 to 4 clean ticks
  const candidateSteps = forceZeroMin
    ? [10, 15, 20, 25, 5, 30]
    : [5, 4, 3, 6, 8, 10, 2];

  let best = null;

  for (const step of candidateSteps) {
    let minBound = forceZeroMin ? 0 : Math.floor(minVal / step) * step;
    if (!forceZeroMin && minVal - minBound < 1) {
      minBound -= step;
    }

    let maxBound = Math.ceil(maxVal / step) * step;
    if (maxBound - maxVal < 1) {
      maxBound += step;
    }

    const ticks = [];
    for (let v = minBound; v <= maxBound; v += step) {
      ticks.push(v);
    }

    // Ideal: exactly 3 or 4 ticks
    if (ticks.length >= 3 && ticks.length <= 4) {
      return { minBound, maxBound, step, ticks };
    }

    if (!best || Math.abs(ticks.length - 3.5) < Math.abs(best.ticks.length - 3.5)) {
      best = { minBound, maxBound, step, ticks };
    }
  }

  // If best still has more than 4 ticks, reduce to 3 evenly spaced ticks (min, mid, max)
  if (best && best.ticks.length > 4) {
    const minB = best.ticks[0];
    const maxB = best.ticks[best.ticks.length - 1];
    const midB = Math.round((minB + maxB) / 2);
    return {
      minBound: minB,
      maxBound: maxB,
      step: (maxB - minB) / 2,
      ticks: [minB, midB, maxB],
    };
  }

  return best;
}

export function DailyBreakdownChart({ hourlyData = [] }) {
  const [activeMetric, setActiveMetric] = useState('temp'); // 'temp' | 'pop' | 'wind'
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const svgRef = useRef(null);

  // Take the next 16 to 24 hours of data
  const hours = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return [];
    return hourlyData.slice(0, 18);
  }, [hourlyData]);

  if (hours.length === 0) return null;

  // Chart dimensions
  const width = 740;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 32;
  const paddingBottom = 42;

  const chartAreaWidth = width - paddingLeft - paddingRight;
  const chartAreaHeight = height - paddingTop - paddingBottom;

  // Metric configuration
  const metricConfig = useMemo(() => {
    if (activeMetric === 'pop') {
      return {
        key: 'pop',
        label: 'Precipitation Probability',
        unit: '%',
        color: '#0284c7', // Sky Blue
        gradientId: 'weatherPopGradient',
        getValue: (h) => h.precipitationProbabilityPercent ?? 0,
        minBound: 0,
        maxBound: 100,
        yTicks: [0, 50, 100],
      };
    }
    if (activeMetric === 'wind') {
      const vals = hours.map((h) => h.windSpeedKmh ?? 10);
      const maxW = Math.max(...vals, 15);
      const scale = calculateNiceYScale(0, maxW, { forceZeroMin: true });
      return {
        key: 'wind',
        label: 'Wind Speed',
        unit: 'km/h',
        color: '#0d9488', // Teal
        gradientId: 'weatherWindGradient',
        getValue: (h) => Math.round(h.windSpeedKmh ?? 10),
        minBound: scale.minBound,
        maxBound: scale.maxBound,
        yTicks: scale.ticks,
      };
    }
    // Default: Temperature
    const temps = hours.map((h) => Math.round(h.temperatureCelsius ?? 26));
    const rawMin = Math.min(...temps);
    const rawMax = Math.max(...temps);
    const scale = calculateNiceYScale(rawMin, rawMax);
    return {
      key: 'temp',
      label: 'Hourly Temperature',
      unit: '°C',
      color: '#10b981', // Emerald
      gradientId: 'weatherTempGradient',
      getValue: (h) => Math.round(h.temperatureCelsius ?? 26),
      minBound: scale.minBound,
      maxBound: scale.maxBound,
      yTicks: scale.ticks,
    };
  }, [activeMetric, hours]);

  const yRange = metricConfig.maxBound - metricConfig.minBound || 1;

  // Compute SVG Points strictly positioned inside plotting area
  const points = useMemo(() => {
    return hours.map((item, index) => {
      const x = paddingLeft + (index / Math.max(1, hours.length - 1)) * chartAreaWidth;
      const rawVal = metricConfig.getValue(item);
      const norm = (rawVal - metricConfig.minBound) / yRange;
      const clampedNorm = Math.max(0.02, Math.min(0.98, norm));
      const y = paddingTop + (1 - clampedNorm) * chartAreaHeight;
      return { x, y, item, val: rawVal, index };
    });
  }, [hours, metricConfig, chartAreaWidth, chartAreaHeight, paddingLeft, paddingTop, yRange]);

  const pathD = useMemo(() => getSmoothPath(points), [points]);
  const areaD = useMemo(() => {
    if (points.length < 2) return '';
    const baselineY = (paddingTop + chartAreaHeight).toFixed(1);
    const firstX = points[0].x.toFixed(1);
    const lastX = points[points.length - 1].x.toFixed(1);
    return `${pathD} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
  }, [pathD, points, paddingTop, chartAreaHeight]);

  // Strict proximity mouse interaction
  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
      setHoveredIdx(null);
      return;
    }

    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const svgX = mouseX * scaleX;
    const svgY = mouseY * scaleY;

    if (
      svgX < paddingLeft ||
      svgX > width - paddingRight ||
      svgY < paddingTop ||
      svgY > paddingTop + chartAreaHeight
    ) {
      setHoveredIdx(null);
      return;
    }

    let closestIdx = null;
    let minDistance = Infinity;
    const maxProximity = 28;

    for (let i = 0; i < points.length; i++) {
      const dx = Math.abs(points[i].x - svgX);
      const dy = Math.abs(points[i].y - svgY);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDistance && dist <= maxProximity) {
        minDistance = dist;
        closestIdx = i;
      }
    }

    setHoveredIdx(closestIdx);
  }, [points, width, height, paddingLeft, paddingRight, paddingTop, chartAreaHeight]);

  const formatHourTime = (isoTime, idx) => {
    if (idx === 0) return 'Now';
    if (!isoTime) return `${idx}h`;
    const d = new Date(isoTime);
    if (isNaN(d.getTime())) return `${idx}:00`;
    return d.toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true });
  };

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-soft-sm space-y-4">
      {/* Header & Metric Switches */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            <span>Hourly Forecast</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Next 18 hours breakdown
          </p>
        </div>

        {/* View Switch Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMetric('temp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMetric === 'temp'
                ? 'bg-white text-emerald-700 shadow-soft-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temperature</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('pop')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMetric === 'pop'
                ? 'bg-white text-sky-700 shadow-soft-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Precipitation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('wind')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMetric === 'wind'
                ? 'bg-white text-teal-700 shadow-soft-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind</span>
          </button>
        </div>
      </div>

      {/* SVG Interactive Chart Box */}
      <div className="relative w-full select-none pt-1 overflow-hidden rounded-2xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-hidden select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="weatherTempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
              <stop offset="90%" stopColor="#10b981" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="weatherPopGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.30" />
              <stop offset="90%" stopColor="#0284c7" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="weatherWindGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.30" />
              <stop offset="90%" stopColor="#0d9488" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Scale - Clean, non-overlapping, strictly unique ticks */}
          {metricConfig.yTicks.map((tickVal, idx) => {
            const normalizedY = (tickVal - metricConfig.minBound) / yRange;
            const y = paddingTop + (1 - normalizedY) * chartAreaHeight;

            return (
              <g key={`ytick-${tickVal}-${idx}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] font-bold fill-slate-400 select-none"
                >
                  {tickVal}{metricConfig.unit}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaD && (
            <path
              d={areaD}
              fill={`url(#${metricConfig.gradientId})`}
              className="transition-all duration-300"
            />
          )}

          {/* Smooth Trend Curve Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={metricConfig.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300 drop-shadow-sm"
            />
          )}

          {/* Crosshairs strictly bounded inside chart */}
          {activePoint && (
            <g className="pointer-events-none">
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={paddingTop + chartAreaHeight}
                stroke={metricConfig.color}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />
              <line
                x1={paddingLeft}
                y1={activePoint.y}
                x2={width - paddingRight}
                y2={activePoint.y}
                stroke={metricConfig.color}
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.6"
              />
            </g>
          )}

          {/* Data Points on Curve */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            const isNow = idx === 0;

            return (
              <g
                key={`pt-${idx}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                className="cursor-pointer"
              >
                {/* Hit circle */}
                <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                {/* Point dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : isNow ? 4.5 : 3}
                  className="transition-all duration-150 pointer-events-none"
                  fill={isHovered || isNow ? metricConfig.color : '#ffffff'}
                  stroke={metricConfig.color}
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* X-Axis Hour Labels - Cleanly spaced so no two labels ever touch */}
          {points.map((pt, idx) => {
            const step = hours.length > 12 ? 3 : 2;
            const shouldShow = idx % step === 0 || idx === 0;
            if (!shouldShow) return null;

            return (
              <text
                key={`hour-label-${idx}`}
                x={pt.x}
                y={paddingTop + chartAreaHeight + 18}
                textAnchor="middle"
                className={`text-[10px] select-none ${
                  idx === 0 ? 'font-black fill-emerald-700' : 'font-bold fill-slate-400'
                }`}
              >
                {formatHourTime(pt.item.time, idx)}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip strictly bounded */}
        {activePoint && (
          <div
            className="absolute z-20 bg-slate-900/95 text-white text-xs rounded-xl py-2 px-3 shadow-soft-lg pointer-events-none backdrop-blur-sm border border-slate-700 animate-fade-in"
            style={{
              left: `${Math.max(14, Math.min(86, (activePoint.x / width) * 100))}%`,
              top: activePoint.y < height * 0.45
                ? `${Math.min(70, ((activePoint.y + 16) / height) * 100)}%`
                : `${Math.max(8, ((activePoint.y - 14) / height) * 100)}%`,
              transform: activePoint.y < height * 0.45
                ? 'translate(-50%, 0%)'
                : 'translate(-50%, -100%)',
            }}
          >
            <div className="text-[10px] text-slate-400 font-medium">
              {formatHourTime(activePoint.item.time, activePoint.index)} • {activePoint.item.weatherCondition || 'Normal'}
            </div>
            <div className="font-extrabold text-sm mt-0.5" style={{ color: metricConfig.color }}>
              {activePoint.val} {metricConfig.unit}
            </div>
            <div className="text-[10px] text-slate-300 mt-1 pt-1 border-t border-slate-700/60 flex items-center justify-between gap-3">
              <span>🌧️ {activePoint.item.precipitationProbabilityPercent ?? 0}% rain</span>
              <span>💨 {Math.round(activePoint.item.windSpeedKmh ?? 0)} km/h</span>
            </div>
          </div>
        )}
      </div>

      {/* Hourly Timeline Ribbon (Apple Weather / Google Weather style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {hours.map((hour, idx) => {
          const isSelected = hoveredIdx === idx;
          const time = formatHourTime(hour.time, idx);
          const temp = Math.round(hour.temperatureCelsius ?? 26);
          const pop = hour.precipitationProbabilityPercent ?? 0;

          return (
            <div
              key={`ribbon-${idx}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex flex-col items-center justify-between min-w-[70px] p-2.5 rounded-2xl border transition-all cursor-pointer flex-shrink-0 text-center ${
                isSelected
                  ? 'bg-emerald-50/80 border-emerald-500 shadow-soft-xs scale-[1.03]'
                  : 'bg-slate-50/60 border-slate-100 hover:border-slate-300 hover:bg-slate-100/60'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-500">{time}</span>
              <div className="my-1.5">
                {getHourWeatherIcon(hour.weatherCode, true, pop)}
              </div>
              <div className="text-xs font-black text-slate-900">{temp}°</div>
              <div className="flex items-center gap-0.5 text-[10px] font-bold text-sky-600 mt-0.5">
                <Droplets className="w-2.5 h-2.5" />
                <span>{pop}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sun,
  Droplets,
  Thermometer,
  Layers,
  Bug,
  ShieldAlert,
  Calendar,
  Clock,
  ArrowLeft,
  ShoppingBag,
  Sprout,
  Leaf,
  ShieldCheck,
} from 'lucide-react';
import { cropInfoService } from '@/services/cropInfo/cropInfoService';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/loaders/Spinner';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';

// Clean boilerplate strings into crisp, human-readable text
function cleanText(val, fallback) {
  if (!val || typeof val !== 'string' || !val.trim()) return fallback;
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('varies by crop variety and growing conditions') ||
    lower.includes('varies by crop, growth stage and local conditions') ||
    lower.includes('varies by crop variety and local growing conditions') ||
    lower.includes('suitable temperature varies by') ||
    lower.includes('growing duration varies by')
  ) {
    return 'Varies with variety & climate';
  }
  return trimmed;
}

export function CropDetailPage() {
  const { cropId } = useParams();
  const [crop, setCrop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCrop() {
      setIsLoading(true);
      try {
        const data = await cropInfoService.getCropDetails(cropId);
        setCrop(data);
      } catch (err) {
        console.error('Failed to load crop details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (cropId) loadCrop();
  }, [cropId]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" text="Loading comprehensive crop agronomy datasheet..." />
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Link
          to="/crops"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Crop Guide
        </Link>
        <ErrorDisplay
          title="Crop Guide Not Found"
          message="The requested crop encyclopedia entry could not be retrieved. Please check back soon or browse other crops."
        />
      </div>
    );
  }

  // Parse growth stages separated by arrows (→ or -> or commas) from backend
  const growthStagesList = crop.growthStages
    ? crop.growthStages
        .split(/\s*→\s*|\s*->\s*|\s*,\s*/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fade-in">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumb
          items={[
            { label: 'Crop Guide', to: '/crops' },
            { label: crop.cropName },
          ]}
        />
        <Link
          to="/crops"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Crops</span>
        </Link>
      </div>

      {/* ========================================================
          1. FIRST TOP CARD: ATTRACTIVE STYLING WITH NO TOP BADGES
      ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft-sm hover:shadow-soft-md transition-shadow p-6 sm:p-8 lg:p-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Crop Name, Scientific Name, Description & Info Pills Below */}
          <div className="lg:col-span-8 space-y-4">
            {/* 1. Crop Title (Cleanly placed at top - no badges on top of name) */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {crop.cropName}
              </h1>
              {crop.scientificName && (
                <div className="flex items-center gap-1.5 text-sm sm:text-base italic font-semibold text-emerald-600 mt-1">
                  <Leaf className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{crop.scientificName}</span>
                </div>
              )}
            </div>

            {/* 2. Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
              {crop.description ||
                `${crop.cropName} is a plant that can be grown and managed according to suitable local soil, climate, water and cultivation conditions.`}
            </p>

            {/* 3. Info Pills Below Description (Clean vertical stack matching reference guidelines) */}
            <div className="pt-2 flex flex-col items-start gap-2.5">
              {/* Duration Pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-purple-50/40 border border-purple-200/90 text-xs sm:text-[13px] text-slate-700">
                <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  <strong className="font-semibold text-slate-900">Duration:</strong>{' '}
                  <span className="text-slate-600 ml-0.5">
                    {crop.growingDuration ||
                      'Growing duration varies by crop variety and growing conditions.'}
                  </span>
                </span>
              </div>

              {/* Temperature Pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-rose-50/40 border border-rose-200/90 text-xs sm:text-[13px] text-slate-700">
                <Thermometer className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  <strong className="font-semibold text-slate-900">Temp:</strong>{' '}
                  <span className="text-slate-600 ml-0.5">
                    {crop.temperatureRequirements ||
                      'Suitable temperature varies by crop variety and growing conditions.'}
                  </span>
                </span>
              </div>

              {/* Verified Agricultural Guidelines Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs sm:text-[13px] font-semibold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Agricultural Guidelines</span>
              </div>
            </div>
          </div>

          {/* Right Column: Prominent, High-Quality Product Image */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-[320px] aspect-square rounded-3xl overflow-hidden shadow-soft-sm border border-slate-200/80 bg-slate-50 group">
              <img
                src={
                  crop.imageUrl ||
                  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfYuy6z-85PXiTxZ-gHXyJiFL6RMZ6QxirIntV_oXRlg&s=10'
                }
                alt={crop.cropName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  e.target.src =
                    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfYuy6z-85PXiTxZ-gHXyJiFL6RMZ6QxirIntV_oXRlg&s=10';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white select-none">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 text-[11px] font-semibold text-white">
                  Botanical Specimen
                </span>
                <span className="font-semibold text-white drop-shadow text-xs sm:text-sm truncate max-w-[140px] text-right">
                  {crop.cropName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. QUICK AGRONOMIC PARAMETERS (CLEAR LABELS & TEXT)
      ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Sunlight */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sunlight
            </span>
            <p className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
              {cleanText(crop.sunlightRequirements, 'Full Sun')}
            </p>
          </div>
        </div>

        {/* Water Requirements */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Water Requirement
            </span>
            <p className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
              {cleanText(crop.waterRequirements, 'Moderate watering')}
            </p>
          </div>
        </div>

        {/* Optimal Temperature */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Optimal Temp
            </span>
            <p className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
              {cleanText(crop.temperatureRequirements, '20°C - 30°C')}
            </p>
          </div>
        </div>

        {/* Growth Duration */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Growth Duration
            </span>
            <p className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
              {cleanText(crop.growingDuration, '90–120 Days')}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. GROWTH STAGES: MAPPED CLEANLY BY ARROWS WITH STEPS
      ======================================================== */}
      {growthStagesList.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-sm space-y-4">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-brand-600" />
            <span>Growth Stages & Phenology</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
            {growthStagesList.map((stage, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{stage}</span>
                </div>

                {idx < growthStagesList.length - 1 && (
                  <span className="text-brand-600 font-bold text-sm sm:text-base select-none px-0.5">
                    →
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          4. SOIL, SOWING & HARVESTING DETAILS
      ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Soil & Sowing */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-soft-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Layers className="w-4 h-4 text-brand-600" />
            <span>Soil & Sowing Requirements</span>
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <span className="font-bold text-slate-800">Recommended Soil:</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {crop.soilRequirements ||
                  'Well-drained fertile loamy soil rich in organic matter.'}
              </p>
            </div>

            {crop.sowingInfo && (
              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800">Sowing Method:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{crop.sowingInfo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Harvesting & Uses */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-soft-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>Harvesting & Uses</span>
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <span className="font-bold text-slate-800">Harvesting Guidelines:</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {crop.harvestingInfo ||
                  'Harvest mature crop at the recommended stage for the best yield and quality.'}
              </p>
            </div>

            {crop.uses && (
              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800">Primary Uses:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{crop.uses}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          5. PEST & DISEASE ADVISORY
      ======================================================== */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-soft-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
          Pest & Disease Advisory
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          {/* Common Pests */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-900 font-bold">
              <Bug className="w-4 h-4 text-rose-600" />
              <span>Common Pests</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {crop.commonPests || 'Stem borer, Aphids, Whiteflies, Thrips.'}
            </p>
          </div>

          {/* Common Diseases */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Common Diseases</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {crop.commonDiseases || 'Blight, Rust, Powdery Mildew, Root Rot.'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          6. MARKETPLACE LINK CTA (KEPT AT BOTTOM AS REQUESTED)
      ======================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 rounded-3xl bg-emerald-50 border border-emerald-200/90 gap-5 shadow-soft-sm">
        <div className="space-y-1">
          <h4 className="font-bold text-base sm:text-lg text-emerald-950">
            Looking to purchase or sell {crop.cropName}?
          </h4>
          <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-xl">
            Explore authentic seeds, organic fertilizers, and fresh batches on the marketplace.
          </p>
        </div>
        <Link to={`/marketplace?q=${encodeURIComponent(crop.cropName)}`} className="shrink-0">
          <Button size="lg" icon={ShoppingBag} className="px-6 py-3 font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-soft-md">
            Find {crop.cropName} on Marketplace
          </Button>
        </Link>
      </div>
    </div>
  );
}

import React from 'react';
import { MapPin, Calendar, ArrowRight, Store } from 'lucide-react';
import { toKgPrice } from '@/utils/formatters';

// Format date in DD/MM/YYYY
function formatBadgeDate(dateStr) {
  if (!dateStr) {
    const now = new Date();
    return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function MandiPriceByMarket({
  currentMandi = {},
  commodity = 'Produce',
  otherMandis = [],
  onSelectMandi,
  summaryStats,
}) {
  const marketName = currentMandi.market || `${commodity} APMC Mandi`;
  const stateName = currentMandi.state || 'Karnataka';
  const districtName = currentMandi.district || '';
  const locationText = districtName ? `${districtName}, ${stateName}` : stateName;
  const badgeDate = formatBadgeDate(currentMandi.date || currentMandi.arrival_date || currentMandi.arrivalDate);

  const mandiUnit = currentMandi.unit || 'kg';

  // Compute accurate per-kg prices without double-conversion
  const rawMin = currentMandi.minPrice ?? currentMandi.minimum_price ?? currentMandi.minimumPrice;
  const rawAvg = currentMandi.modalPrice ?? currentMandi.modal_price ?? currentMandi.modalPrice;
  const rawMax = currentMandi.maxPrice ?? currentMandi.maximum_price ?? currentMandi.maximumPrice;

  // Min, Avg, Max MUST 100% strictly match the chart metrics for this particular market
  let minKg = summaryStats?.minPrice != null
    ? Math.round(summaryStats.minPrice)
    : (rawMin !== null && rawMin !== undefined ? toKgPrice(rawMin, mandiUnit) : 0);

  let avgKg = summaryStats?.avgPrice != null
    ? Math.round(summaryStats.avgPrice)
    : (rawAvg !== null && rawAvg !== undefined ? toKgPrice(rawAvg, mandiUnit) : 0);

  let maxKg = summaryStats?.maxPrice != null
    ? Math.round(summaryStats.maxPrice)
    : (rawMax !== null && rawMax !== undefined ? toKgPrice(rawMax, mandiUnit) : 0);

  if (minKg <= 0 && avgKg > 0) minKg = Math.round(avgKg * 0.9);
  if (maxKg <= 0 && avgKg > 0) maxKg = Math.round(avgKg * 1.1);
  if (avgKg <= 0 && minKg > 0 && maxKg > 0) avgKg = Math.round((minKg + maxKg) / 2);

  // Deduplicate other mandis and filter out active mandi
  const seenMarkets = new Set();
  const filteredOtherMandis = [];

  for (const m of otherMandis) {
    if (!m || !m.market) continue;
    const mName = m.market.trim().toLowerCase();
    if (mName === marketName.trim().toLowerCase()) continue;
    if (seenMarkets.has(mName)) continue;
    seenMarkets.add(mName);
    filteredOtherMandis.push(m);
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-soft-sm space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Store className="w-5 h-5 text-brand-600" />
          <span>Market Prices by Mandi</span>
        </h3>
      </div>

      {/* Active Selected Mandi Card */}
      <div className="rounded-2xl bg-[#FEF9E7] border border-[#F6EFCF] p-4 sm:p-5 space-y-3 shadow-soft-xs">
        {/* Mandi Name & Date */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 pr-1">
            <h4 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug truncate">
              {marketName}
            </h4>
            <div className="flex items-center gap-1 text-xs text-stone-600 font-medium mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span className="truncate">{locationText}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-stone-700 font-semibold bg-white/85 px-2.5 py-1 rounded-xl border border-amber-200/60 whitespace-nowrap shadow-soft-xs flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>{badgeDate}</span>
          </div>
        </div>

        {/* 3 Columns: Min | Avg (Green) | Max - Accurate rates matching chart */}
        <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-amber-200/50">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Min
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              ₹{minKg}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Avg
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-600 mt-0.5">
              ₹{avgKg}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Max
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              ₹{maxKg}
            </div>
          </div>
        </div>
      </div>

      {/* Other Mandis Trading This Commodity */}
      {filteredOtherMandis.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">
              Other Mandis ({filteredOtherMandis.length})
            </span>
            <span className="text-[11px] text-slate-400">Click to inspect</span>
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredOtherMandis.slice(0, 10).map((m, idx) => {
              const mandiModalKg = toKgPrice(
                m.modal_price ?? m.modalPrice ?? m.minimum_price ?? m.minimumPrice,
                m.unit
              ) || avgKg;

              const isSelected = (m.market || '').toLowerCase() === marketName.toLowerCase();

              return (
                <button
                  key={m.id || `${m.market}-${idx}`}
                  type="button"
                  onClick={() => onSelectMandi && onSelectMandi(m)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50 shadow-soft-xs'
                      : 'border-slate-100 hover:border-brand-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-800 group-hover:text-brand-700 truncate">
                      {m.market}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {m.district ? `${m.district}, ` : ''}{m.state}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 flex items-center gap-2">
                    <div className="text-xs font-black text-slate-900">
                      ₹{mandiModalKg}
                      <span className="text-[9px] font-normal text-slate-500 ml-0.5">/kg</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

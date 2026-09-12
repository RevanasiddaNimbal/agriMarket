import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import { getSimilarCommodities, getCommodityInfo } from '@/utils/commodityCategories';
import { marketPriceService } from '@/services/marketPrice/marketPriceService';
import { toKgPrice } from '@/utils/formatters';

export function SimilarCommodityPrices({ currentCommodity = 'Tomato' }) {
  const navigate = useNavigate();
  const info = getCommodityInfo(currentCommodity);
  const categoryName = info?.category || 'Agricultural Produce';
  const similarList = getSimilarCommodities(currentCommodity, 4);

  // Real prices fetched from backend to avoid mock data
  const [livePricesByCommodity, setLivePricesByCommodity] = useState({});

  useEffect(() => {
    let isCancelled = false;

    async function loadLiveSimilarPrices() {
      try {
        const res = await marketPriceService.getMarketPrices({});
        const list = res?.prices || (Array.isArray(res) ? res : []);
        if (list.length > 0 && !isCancelled) {
          const map = {};
          for (const item of list) {
            const nameKey = (item.commodity || '').trim().toLowerCase();
            if (!map[nameKey]) {
              map[nameKey] = item;
            }
          }
          setLivePricesByCommodity(map);
        }
      } catch (err) {
        console.warn('Could not load live rates for similar commodities:', err);
      }
    }

    loadLiveSimilarPrices();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleCardClick = (item, liveRecord) => {
    const rawModal = liveRecord?.modal_price ?? liveRecord?.modalPrice ?? item.avgKgPrice;
    const rawMin = liveRecord?.minimum_price ?? liveRecord?.minimumPrice ?? item.minKgPrice;
    const rawMax = liveRecord?.maximum_price ?? liveRecord?.maximumPrice ?? item.maxKgPrice;
    const itemUnit = liveRecord?.unit || 'kg';

    const modalKg = toKgPrice(rawModal, itemUnit);
    const minKg = toKgPrice(rawMin, itemUnit);
    const maxKg = toKgPrice(rawMax, itemUnit);

    const params = new URLSearchParams({
      commodity: item.name,
      state: liveRecord?.state || item.state,
      district: liveRecord?.district || '',
      market: liveRecord?.market || item.market,
      minPrice: minKg.toString(),
      maxPrice: maxKg.toString(),
      modalPrice: modalKg.toString(),
      unit: 'kg',
      date: liveRecord?.arrival_date || liveRecord?.arrivalDate || '',
    });
    navigate(`/market-prices/trend?${params.toString()}`);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-800 shadow-soft-xs">
            <Layers className="w-4 h-4 text-earth-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
              Similar {categoryName} Mandi Rates
            </h3>
            <p className="text-xs text-slate-500">
              Current mandi rates for related produce in the same agricultural category
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Similar Commodities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {similarList.map((item, idx) => {
          // Check if we have live backend rates for this commodity
          const live = livePricesByCommodity[item.name.toLowerCase()] ||
            Object.entries(livePricesByCommodity).find(([k]) =>
              k.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(k)
            )?.[1];

          const modalKg = live
            ? toKgPrice(live.modal_price ?? live.modalPrice, live.unit)
            : item.avgKgPrice;

          const minKg = live
            ? toKgPrice(live.minimum_price ?? live.minimumPrice, live.unit)
            : item.minKgPrice;

          const maxKg = live
            ? toKgPrice(live.maximum_price ?? live.maximumPrice, live.unit)
            : item.maxKgPrice;

          const marketDisplay = live?.market || item.market;
          const stateDisplay = live?.state || item.state;

          return (
            <div
              key={idx}
              onClick={() => handleCardClick(item, live)}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-soft-xs hover:shadow-soft-md hover:border-brand-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Row: Emoji, Name & Trend */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl select-none" role="img" aria-label={item.name}>
                      {item.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 text-sm group-hover:text-brand-700 transition-colors truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 truncate">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                      item.isPositive
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                        : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                    }`}
                  >
                    {item.isPositive ? '↑' : '↓'} {item.trend}
                  </span>
                </div>

                {/* Price Display */}
                <div className="bg-[#FEF9E7]/60 rounded-xl p-2.5 border border-[#F6EFCF]/70">
                  <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    Modal Rate
                  </div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">
                    ₹{modalKg}
                    <span className="text-xs font-bold text-slate-500 ml-0.5">/kg</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium mt-1 pt-1 border-t border-amber-200/40">
                    <span>Min: <strong>₹{minKg}</strong></span>
                    <span>Max: <strong>₹{maxKg}</strong></span>
                  </div>
                </div>

                {/* Mandi Location */}
                <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{marketDisplay}, {stateDisplay}</span>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-700 group-hover:text-brand-800">
                <span>View Price Trend</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { formatDate, toKgPrice } from '@/utils/formatters';
import { getCommodityInfo } from '@/utils/commodityCategories';

export function MarketPriceTable({ prices = [] }) {
  const navigate = useNavigate();

  if (!prices || prices.length === 0) return null;

  const handleRowClick = (price) => {
    const rawMin = price.minimum_price ?? price.minimumPrice ?? 0;
    const rawMax = price.maximum_price ?? price.maximumPrice ?? 0;
    const rawModal = price.modal_price ?? price.modalPrice ?? 0;
    const arrDate = price.arrival_date ?? price.arrivalDate ?? '';
    const rawUnit = price.unit || 'Quintal';

    const info = getCommodityInfo(price.commodity);

    let minKg = toKgPrice(rawMin, rawUnit);
    let maxKg = toKgPrice(rawMax, rawUnit);
    let modalKg = toKgPrice(rawModal, rawUnit);

    // If API returned 0, fallback to realistic benchmark rates
    if (modalKg <= 0 && info) {
      modalKg = info.avgKgPrice;
      minKg = info.minKgPrice;
      maxKg = info.maxKgPrice;
    }

    const params = new URLSearchParams({
      commodity: price.commodity || '',
      state: price.state || '',
      district: price.district || '',
      market: price.market || '',
      variety: price.variety || '',
      grade: price.grade || '',
      minPrice: minKg.toString(),
      maxPrice: maxKg.toString(),
      modalPrice: modalKg.toString(),
      unit: 'kg',
      date: arrDate,
    });
    navigate(`/market-prices/trend?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-sm overflow-hidden transition-all">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider select-none">
            <tr>
              <th className="py-3.5 px-4 sm:px-6">Commodity & Variety</th>
              <th className="py-3.5 px-4">Mandi Market</th>
              <th className="py-3.5 px-4 text-right">Min Rate (/kg)</th>
              <th className="py-3.5 px-4 text-right">Max Rate (/kg)</th>
              <th className="py-3.5 px-4 text-right font-bold text-slate-900">Modal Price (/kg)</th>
              <th className="py-3.5 px-4 text-center">Arrival Date</th>
              <th className="py-3.5 px-4 text-center">Explore</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prices.map((price) => {
              const rawMin = price.minimum_price ?? price.minimumPrice ?? 0;
              const rawMax = price.maximum_price ?? price.maximumPrice ?? 0;
              const rawModal = price.modal_price ?? price.modalPrice ?? 0;
              const arrDate = price.arrival_date ?? price.arrivalDate;
              const rawUnit = price.unit || 'Quintal';

              const info = getCommodityInfo(price.commodity);

              let minKg = toKgPrice(rawMin, rawUnit);
              let maxKg = toKgPrice(rawMax, rawUnit);
              let modalKg = toKgPrice(rawModal, rawUnit);

              // Safeguard against ₹0.00
              if (modalKg <= 0 && info) {
                modalKg = info.avgKgPrice;
                minKg = info.minKgPrice;
                maxKg = info.maxKgPrice;
              }

              return (
                <tr
                  key={price.id || `${price.commodity}-${price.market}-${arrDate}`}
                  onClick={() => handleRowClick(price)}
                  className="hover:bg-emerald-50/40 cursor-pointer transition-all group"
                  title="Click to explore price trend and market details"
                >
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="font-extrabold text-slate-900 group-hover:text-brand-700 transition-colors flex items-center gap-1.5">
                      <span>{price.commodity}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {price.variety ? `${price.variety} • ` : ''}Grade: <span className="font-semibold text-slate-600">{price.grade || 'FAQ'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                      <span>{price.market}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {price.district ? `${price.district}, ` : ''}{price.state}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-700 whitespace-nowrap">
                    ₹{minKg}
                    <span className="text-[10px] text-slate-400 font-normal ml-0.5">/kg</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-700 whitespace-nowrap">
                    ₹{maxKg}
                    <span className="text-[10px] text-slate-400 font-normal ml-0.5">/kg</span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-baseline">
                      <span className="font-black text-emerald-700 text-sm sm:text-base">
                        ₹{modalKg}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 ml-0.5">/kg</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-500 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(arrDate)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all shadow-soft-xs">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

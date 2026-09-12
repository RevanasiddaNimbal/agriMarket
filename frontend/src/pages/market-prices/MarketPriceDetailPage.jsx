import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { marketPriceService } from '@/services/marketPrice/marketPriceService';
import { PriceTrendChart } from '@/components/market/PriceTrendChart';
import { MandiPriceByMarket } from '@/components/market/MandiPriceByMarket';
import { SimilarCommodityPrices } from '@/components/market/SimilarCommodityPrices';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Spinner } from '@/components/loaders/Spinner';
import { toKgPrice } from '@/utils/formatters';

export function MarketPriceDetailPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const commodity = searchParams.get('commodity') || 'Tomato';
  const state = searchParams.get('state') || '';
  const district = searchParams.get('district') || '';
  const market = searchParams.get('market') || '';
  const unit = searchParams.get('unit') || 'kg';
  const date = searchParams.get('date') || '';

  const initialMinPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : null;
  const initialMaxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : null;
  const initialModalPrice = searchParams.get('modalPrice') ? parseFloat(searchParams.get('modalPrice')) : null;

  const [days, setDays] = useState(7);
  const [trendData, setTrendData] = useState(null);
  const [otherMandis, setOtherMandis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartStats, setChartStats] = useState(null);

  // Active Mandi tracking
  const [activeMandi, setActiveMandi] = useState({
    market: market || `${commodity} APMC`,
    state: state || 'Karnataka',
    district: district || '',
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
    modalPrice: initialModalPrice,
    unit: unit,
    date: date,
  });

  // Keep activeMandi in sync if URL searchParams change
  useEffect(() => {
    setActiveMandi({
      market: market || `${commodity} APMC`,
      state: state || 'Karnataka',
      district: district || '',
      minPrice: initialMinPrice,
      maxPrice: initialMaxPrice,
      modalPrice: initialModalPrice,
      unit: unit,
      date: date,
    });
  }, [commodity, state, district, market, date, initialMinPrice, initialMaxPrice, initialModalPrice, unit]);

  // Fetch trend and other mandis
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);
      try {
        const today = new Date();
        const toDateStr = today.toISOString().split('T')[0];
        const fromDateObj = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
        const fromDateStr = fromDateObj.toISOString().split('T')[0];

        const [trendRes, mandisRes] = await Promise.allSettled([
          marketPriceService.getHistoricalPrices({
            commodity,
            state: activeMandi.state || undefined,
            district: activeMandi.district || undefined,
            market: activeMandi.market || undefined,
            fromDate: fromDateStr,
            toDate: toDateStr,
          }),
          marketPriceService.getMarketPrices({
            commodity,
          }),
        ]);

        if (!isCancelled) {
          if (trendRes.status === 'fulfilled') {
            setTrendData(trendRes.value);
          }
          if (mandisRes.status === 'fulfilled') {
            setOtherMandis(mandisRes.value?.prices || []);
          }
        }
      } catch (err) {
        console.error('Failed to load Mandi historical data:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [commodity, activeMandi.market, activeMandi.state, activeMandi.district, days]);

  const handleSelectMandi = (selectedMandi) => {
    const rawMin = selectedMandi.minimum_price ?? selectedMandi.minimumPrice ?? 0;
    const rawMax = selectedMandi.maximum_price ?? selectedMandi.maximumPrice ?? 0;
    const rawModal = selectedMandi.modal_price ?? selectedMandi.modalPrice ?? 0;
    const arrDate = selectedMandi.arrival_date ?? selectedMandi.arrivalDate ?? '';
    const mandiUnit = selectedMandi.unit || 'Quintal';

    const minKg = toKgPrice(rawMin, mandiUnit);
    const maxKg = toKgPrice(rawMax, mandiUnit);
    const modalKg = toKgPrice(rawModal, mandiUnit);

    setActiveMandi({
      market: selectedMandi.market || '',
      state: selectedMandi.state || '',
      district: selectedMandi.district || '',
      minPrice: minKg,
      maxPrice: maxKg,
      modalPrice: modalKg,
      unit: 'kg',
      date: arrDate,
    });
    setChartStats(null);

    const params = new URLSearchParams({
      commodity: commodity,
      state: selectedMandi.state || '',
      district: selectedMandi.district || '',
      market: selectedMandi.market || '',
      minPrice: minKg.toString(),
      maxPrice: maxKg.toString(),
      modalPrice: modalKg.toString(),
      unit: 'kg',
      date: arrDate,
    });
    setSearchParams(params, { replace: true });
  };

  const subtitleLocation = [activeMandi.market, activeMandi.district, activeMandi.state]
    .filter(Boolean)
    .join(' • ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Market Prices', to: '/market-prices' },
          { label: `${commodity} Rate Trend` },
        ]}
      />

      {/* Page Header - Clean, Small, and Simple as requested */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link to="/market-prices">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-700 transition-all shadow-soft-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Market Prices</span>
            </button>
          </Link>

          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{commodity}</span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Live Mandi Rates
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {subtitleLocation || 'All APMC Mandis across India'}
            </p>
          </div>
        </div>

        {/* Live Feed Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-soft-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live APMC Feed</span>
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-[45vh] flex items-center justify-center">
          <Spinner size="lg" text={`Loading ${commodity} market price feed...`} />
        </div>
      ) : (
        <>
          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Real Interactive Price Trend Chart */}
            <div className="lg:col-span-7 xl:col-span-8">
              <PriceTrendChart
                trendData={trendData}
                days={days}
                onDaysChange={setDays}
                commodity={commodity}
                market={activeMandi.market}
                currentModalPrice={activeMandi.modalPrice}
                currentMinPrice={activeMandi.minPrice}
                currentMaxPrice={activeMandi.maxPrice}
                unit={activeMandi.unit}
                onStatsChange={setChartStats}
              />
            </div>

            {/* Right Column: Market Prices by Mandi Card */}
            <div className="lg:col-span-5 xl:col-span-4">
              <MandiPriceByMarket
                currentMandi={activeMandi}
                commodity={commodity}
                otherMandis={otherMandis}
                onSelectMandi={handleSelectMandi}
                summaryStats={chartStats}
              />
            </div>
          </div>

          {/* Below Price Chart: Similar Category Commodity Prices */}
          <div className="pt-4 border-t border-slate-200">
            <SimilarCommodityPrices currentCommodity={commodity} />
          </div>
        </>
      )}
    </div>
  );
}

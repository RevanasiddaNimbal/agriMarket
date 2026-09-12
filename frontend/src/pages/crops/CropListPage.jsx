import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Search, Sprout, ArrowRight, X, Sparkles } from 'lucide-react';
import { cropInfoService } from '@/services/cropInfo/cropInfoService';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/loaders/Spinner';
import { EmptyState } from '@/components/empty-states/EmptyState';

export function CropListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [crops, setCrops] = useState([]);
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [activeQuery, setActiveQuery] = useState(urlQuery);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize when URL query param changes (e.g. from Navbar search)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchInput(q);
    setActiveQuery(q);
  }, [searchParams]);

  // Trigger search ONLY on Enter press or form submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchInput.trim();
    setActiveQuery(trimmed);
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveQuery('');
    setSearchParams({});
  };

  useEffect(() => {
    async function loadCrops() {
      setIsLoading(true);
      try {
        if (activeQuery) {
          const res = await cropInfoService.searchCrops(activeQuery);
          setCrops(res?.crops || []);
        } else {
          const res = await cropInfoService.getFeaturedCrops();
          setCrops(res || []);
        }
      } catch (err) {
        console.error('Failed to load crop info:', err);
        setCrops([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadCrops();
  }, [activeQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <Breadcrumb items={[{ label: 'Crop Agronomy Guide' }]} />

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-brand-600" />
            <span>Crop Encyclopedia & Agronomy Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Comprehensive botanical, soil, irrigation, and pest management guide for Indian crops.
          </p>
        </div>

        {/* Enter-key only Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(e);
                }
              }}
              placeholder="Search crop by name (press Enter)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-soft-sm transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="md"
            className="rounded-2xl px-5 bg-brand-600 hover:bg-brand-700 text-white font-bold shrink-0 shadow-soft-sm"
          >
            Search
          </Button>
        </form>
      </div>

      {/* Active Search Filter Pill */}
      {activeQuery && (
        <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 px-4 py-2.5 rounded-2xl text-xs">
          <span className="text-emerald-950 font-medium">
            Showing search results for <strong className="font-bold text-brand-700">"{activeQuery}"</strong> ({crops.length} {crops.length === 1 ? 'guide' : 'guides'} found)
          </span>
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-emerald-700 font-bold hover:text-emerald-900 underline ml-2 cursor-pointer"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Crop Cards Grid */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner text="Loading crop agronomy guides..." />
        </div>
      ) : crops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {crops.map((crop) => (
            <Link
              key={crop.id}
              to={`/crops/${crop.id}`}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-soft-sm hover:shadow-soft-md hover:border-brand-300 transition-all flex flex-col justify-between overflow-hidden group hover:-translate-y-0.5"
            >
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={
                    crop.imageUrl ||
                    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfYuy6z-85PXiTxZ-gHXyJiFL6RMZ6QxirIntV_oXRlg&s=10'
                  }
                  alt={crop.cropName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfYuy6z-85PXiTxZ-gHXyJiFL6RMZ6QxirIntV_oXRlg&s=10';
                  }}
                />
                {crop.lifeCycle && (
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/95 text-brand-800 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/60 shadow-soft-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-brand-600" />
                      <span>{crop.lifeCycle}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-brand-700 transition-colors">
                    {crop.cropName}
                  </h3>
                  {crop.scientificName && (
                    <p className="text-xs italic text-brand-600 font-medium mt-0.5">{crop.scientificName}</p>
                  )}
                  {crop.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {crop.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600">
                  <span>View Cultivation Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sprout}
          title="No crop guides found"
          description={
            activeQuery
              ? `No crop guide matching "${activeQuery}". Try searching for Wheat, Rice, Tomato, Cotton, etc.`
              : 'Try searching with a different crop name or variety.'
          }
          actionLabel="Clear Search"
          onAction={handleClearSearch}
        />
      )}
    </div>
  );
}

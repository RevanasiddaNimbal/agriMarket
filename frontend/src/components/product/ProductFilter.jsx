import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, RotateCcw, CornerDownLeft } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';

export function ProductFilter({
  filters,
  categories = [],
  onChange,
  onReset,
  className,
}) {
  const [minPriceDraft, setMinPriceDraft] = useState(filters.minPrice || '');
  const [maxPriceDraft, setMaxPriceDraft] = useState(filters.maxPrice || '');
  const [locationDraft, setLocationDraft] = useState(filters.location || '');

  // Keep local drafts synchronized when external filters change (e.g. on Reset)
  useEffect(() => {
    setMinPriceDraft(filters.minPrice || '');
    setMaxPriceDraft(filters.maxPrice || '');
    setLocationDraft(filters.location || '');
  }, [filters.minPrice, filters.maxPrice, filters.location]);

  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value, page: 0 });
  };

  // Apply location and price range filters only when confirmed (e.g. on Enter key press)
  const handleApplyPriceAndLocation = () => {
    onChange({
      ...filters,
      minPrice: minPriceDraft,
      maxPrice: maxPriceDraft,
      location: locationDraft.trim(),
      page: 0,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyPriceAndLocation();
    }
  };

  const hasPendingChanges =
    String(minPriceDraft) !== String(filters.minPrice || '') ||
    String(maxPriceDraft) !== String(filters.maxPrice || '') ||
    String(locationDraft).trim() !== String(filters.location || '').trim();

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft-sm space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          <h3 className="font-bold text-sm text-slate-900">Filters</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Category
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => handleChange('categoryId', '')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              !filters.categoryId
                ? 'bg-brand-50 text-brand-800 border border-brand-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleChange('categoryId', cat.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filters.categoryId === cat.id
                  ? 'bg-brand-50 text-brand-800 border border-brand-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Price Range (₹)
          </label>
          <span className="text-[10px] font-medium text-slate-400">
            Press Enter ↵
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPriceDraft}
            onChange={(e) => setMinPriceDraft(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPriceDraft}
            onChange={(e) => setMaxPriceDraft(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Location
          </label>
          <span className="text-[10px] font-medium text-slate-400">
            Press Enter ↵
          </span>
        </div>
        <Input
          placeholder="City, District, State..."
          value={locationDraft}
          onChange={(e) => setLocationDraft(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Quick Apply Button if user entered unapplied changes */}
      {hasPendingChanges && (
        <button
          type="button"
          onClick={handleApplyPriceAndLocation}
          className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-soft-xs transition-all flex items-center justify-center gap-1.5 animate-fade-in"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
          <span>Apply Filter (Enter ↵)</span>
        </button>
      )}

      {/* Sorting */}
      <div>
        <Select
          label="Sort By"
          placeholder={null}
          value={`${filters.sortBy || 'createdAt'}_${filters.sortDirection || 'DESC'}`}
          onChange={(e) => {
            const [sortBy, sortDirection] = e.target.value.split('_');
            onChange({ ...filters, sortBy, sortDirection, page: 0 });
          }}
          options={[
            { id: 'price_ASC', name: 'Price: Low to High' },
            { id: 'price_DESC', name: 'Price: High to Low' },
            { id: 'createdAt_DESC', name: 'Latest Arrival' },
            { id: 'createdAt_ASC', name: 'Oldest Arrival' },
          ]}
        />
      </div>
    </div>
  );
}

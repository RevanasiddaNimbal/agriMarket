import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, SlidersHorizontal, Search, RotateCcw, X, Tag } from 'lucide-react';
import { productService } from '@/services/product/productService';
import { categoryService } from '@/services/category/categoryService';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilter } from '@/components/product/ProductFilter';
import { Pagination } from '@/components/common/Pagination';
import { Drawer } from '@/components/common/Drawer';
import { Button } from '@/components/common/Button';
import { Breadcrumb } from '@/components/common/Breadcrumb';

// Check if string is a valid UUID format
function isUuid(str) {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

// Resolve category by UUID, exact name, slug, or normalized text match
export function resolveCategory(identifier, categoryList = []) {
  if (!identifier || !Array.isArray(categoryList) || categoryList.length === 0) return null;
  const raw = String(identifier).trim().toLowerCase();

  // 1. Exact match by category ID (UUID)
  const byId = categoryList.find((c) => c.id && c.id.toLowerCase() === raw);
  if (byId) return byId;

  // 2. Exact match by category Name (case-insensitive)
  const byName = categoryList.find((c) => c.name && c.name.toLowerCase() === raw);
  if (byName) return byName;

  // 3. Known slugs & aliases mapped to database master category names
  const slugToNameMap = {
    seeds: 'seeds',
    seed: 'seeds',
    fertilizers: 'fertilizers',
    fertilizer: 'fertilizers',
    pesticides: 'pesticides',
    pesticide: 'pesticides',
    harvested: 'harvested products',
    'harvested-products': 'harvested products',
    harvested_products: 'harvested products',
    'pre-harvested': 'pre-harvested products',
    'pre-harvested-products': 'pre-harvested products',
    preharvested: 'pre-harvested products',
    'preharvested-products': 'pre-harvested products',
    equipment: 'farm equipment',
    'farm-equipment': 'farm equipment',
    farmequipment: 'farm equipment',
    machinery: 'farm equipment',
    tools: 'farm equipment',
  };

  const targetName = slugToNameMap[raw];
  if (targetName) {
    const match = categoryList.find((c) => c.name && c.name.toLowerCase() === targetName);
    if (match) return match;
  }

  // 4. Clean alphanumeric match (removes spaces, hyphens, underscores)
  const cleanRaw = raw.replace(/[^a-z0-9]/g, '');
  const byCleanName = categoryList.find((c) => {
    const cleanCatName = (c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanCatName === cleanRaw;
  });
  if (byCleanName) return byCleanName;

  // 5. Inclusion match (e.g. 'equipment' matching 'farm equipment')
  const byInclusion = categoryList.find((c) => {
    const cleanCatName = (c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanCatName.includes(cleanRaw) || cleanRaw.includes(cleanCatName);
  });
  if (byInclusion) return byInclusion;

  return null;
}

export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [isCategoriesLoaded, setIsCategoriesLoaded] = useState(false);
  const [products, setProducts] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({
    page: 0,
    totalPages: 1,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // Filters State initialized from search params
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    categoryId: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    location: searchParams.get('location') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortDirection: searchParams.get('sortDirection') || 'DESC',
    page: parseInt(searchParams.get('page') || '0', 10),
    size: 16,
  });

  // Load Categories on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const catData = await categoryService.getAllCategories();
        const list = Array.isArray(catData) ? catData : (catData?.content || []);
        if (isMounted) {
          setCategories(list);
          setIsCategoriesLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        if (isMounted) setIsCategoriesLoaded(true);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync URL search params with filters state and resolve category slugs to UUID
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const catParam = searchParams.get('category') || '';
    const minParam = searchParams.get('minPrice') || '';
    const maxParam = searchParams.get('maxPrice') || '';
    const locParam = searchParams.get('location') || '';
    const sortParam = searchParams.get('sortBy') || 'createdAt';
    const sortDirParam = searchParams.get('sortDirection') || 'DESC';
    const pageParam = parseInt(searchParams.get('page') || '0', 10);

    setSearchInput(qParam);

    let resolvedCategoryId = '';
    if (catParam) {
      if (isUuid(catParam)) {
        resolvedCategoryId = catParam;
      } else if (categories.length > 0) {
        const match = resolveCategory(catParam, categories);
        resolvedCategoryId = match ? match.id : catParam;
      } else {
        resolvedCategoryId = catParam;
      }
    }

    setFilters((prev) => {
      if (
        prev.query === qParam &&
        prev.categoryId === resolvedCategoryId &&
        prev.minPrice === minParam &&
        prev.maxPrice === maxParam &&
        prev.location === locParam &&
        prev.sortBy === sortParam &&
        prev.sortDirection === sortDirParam &&
        prev.page === pageParam
      ) {
        return prev;
      }
      return {
        ...prev,
        query: qParam,
        categoryId: resolvedCategoryId,
        minPrice: minParam,
        maxPrice: maxParam,
        location: locParam,
        sortBy: sortParam,
        sortDirection: sortDirParam,
        page: pageParam,
        size: prev.size || 16,
      };
    });
  }, [searchParams, categories]);

  // Centralized filter update handler that keeps filters state & URL search params synchronized
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newFilters.query?.trim()) next.set('q', newFilters.query.trim());
      else next.delete('q');

      if (newFilters.categoryId) {
        const matched = categories.find((c) => c.id === newFilters.categoryId);
        if (matched) {
          next.set('category', matched.name.toLowerCase().replace(/\s+/g, '-'));
        } else {
          next.set('category', newFilters.categoryId);
        }
      } else {
        next.delete('category');
      }

      if (newFilters.minPrice) next.set('minPrice', newFilters.minPrice);
      else next.delete('minPrice');

      if (newFilters.maxPrice) next.set('maxPrice', newFilters.maxPrice);
      else next.delete('maxPrice');

      if (newFilters.location?.trim()) next.set('location', newFilters.location.trim());
      else next.delete('location');

      next.set('page', String(newFilters.page || 0));
      return next;
    });
  }, [categories, setSearchParams]);

  // Fetch Products based on filters
  const fetchProducts = useCallback(async () => {
    const rawCategory = filters.categoryId;
    // If category is a slug but categories have not loaded yet to resolve the UUID, wait
    if (rawCategory && !isUuid(rawCategory) && !isCategoriesLoaded) {
      return;
    }

    setIsLoading(true);
    try {
      let effectiveCategoryId = '';
      if (rawCategory) {
        if (isUuid(rawCategory)) {
          effectiveCategoryId = rawCategory;
        } else {
          const resolved = resolveCategory(rawCategory, categories);
          effectiveCategoryId = resolved ? resolved.id : rawCategory;
        }
      }

      const params = {
        page: filters.page,
        size: filters.size,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
      };

      if (filters.query.trim()) params.query = filters.query.trim();
      if (effectiveCategoryId) params.categoryId = effectiveCategoryId;
      if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
      if (filters.location.trim()) params.location = filters.location.trim();

      const searchResult = await productService.searchProducts(params);

      setProducts(searchResult.products || searchResult.content || []);
      setPaginationMeta({
        page: searchResult.page || 0,
        totalPages: searchResult.totalPages || 1,
        totalElements: searchResult.totalElements || 0,
        hasNext: searchResult.hasNext || false,
        hasPrevious: searchResult.hasPrevious || false,
      });
    } catch (err) {
      console.error('Failed to search products:', err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.page,
    filters.size,
    filters.sortBy,
    filters.sortDirection,
    filters.categoryId,
    filters.minPrice,
    filters.maxPrice,
    filters.location,
    filters.query,
    categories,
    isCategoriesLoaded,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Active category object for UI badge / pills
  const activeCategory = resolveCategory(filters.categoryId, categories);

  // Trigger search ONLY on Enter press or form submit (same as Crop Guide)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchInput.trim();
    handleFilterChange({
      ...filters,
      query: trimmed,
      page: 0,
    });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    handleFilterChange({
      ...filters,
      query: '',
      page: 0,
    });
  };

  const handleClearCategory = () => {
    handleFilterChange({
      ...filters,
      categoryId: '',
      page: 0,
    });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams({});
    setFilters({
      query: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      page: 0,
      size: 16,
    });
  };

  const hasAnyFilterActive = Boolean(
    filters.query ||
    filters.categoryId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.location
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Agricultural Marketplace' }]} />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Agricultural Produce Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified crops, grains, seeds, and organic goods directly from growers.
          </p>
        </div>

        {/* Enter-key only Search Form (Matching Crop Guide) */}
        <div className="flex items-center gap-2.5 w-full md:max-w-md">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1">
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
                placeholder="Search products by name, crop, or seller (press Enter)..."
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

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            className="lg:hidden shrink-0 rounded-2xl"
            onClick={() => setIsMobileFilterOpen(true)}
            icon={SlidersHorizontal}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {hasAnyFilterActive && (
        <div className="flex flex-wrap items-center gap-2 bg-emerald-50/80 border border-emerald-200/90 p-3 rounded-2xl text-xs shadow-soft-xs">
          <span className="text-emerald-950 font-bold mr-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-brand-600" />
            <span>Active Filters:</span>
          </span>

          {/* Active Category Pill */}
          {activeCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-brand-300 text-brand-900 font-bold shadow-soft-xs">
              <span>Category: {activeCategory.name}</span>
              <button
                type="button"
                onClick={handleClearCategory}
                className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                title="Remove category filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {/* Active Query Pill */}
          {filters.query && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-brand-300 text-brand-900 font-bold shadow-soft-xs">
              <span>Search: "{filters.query}"</span>
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                title="Remove search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {/* Active Price Pill */}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-brand-300 text-brand-900 font-bold shadow-soft-xs">
              <span>
                Price: ₹{filters.minPrice || '0'} - {filters.maxPrice ? `₹${filters.maxPrice}` : 'Any'}
              </span>
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, minPrice: '', maxPrice: '', page: 0 })}
                className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                title="Remove price filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {/* Active Location Pill */}
          {filters.location && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-brand-300 text-brand-900 font-bold shadow-soft-xs">
              <span>Location: {filters.location}</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, location: '', page: 0 })}
                className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                title="Remove location filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-emerald-700 font-extrabold hover:text-emerald-950 underline ml-auto text-xs cursor-pointer py-1"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Main Catalog Grid & Desktop Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-24">
          <ProductFilter
            filters={filters}
            categories={categories}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Mobile Filter Drawer */}
        <Drawer
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          title="Filter Produce"
        >
          <ProductFilter
            filters={filters}
            categories={categories}
            onChange={(f) => {
              handleFilterChange(f);
              setIsMobileFilterOpen(false);
            }}
            onReset={() => {
              handleResetFilters();
              setIsMobileFilterOpen(false);
            }}
          />
        </Drawer>

        {/* Products Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-2 border-b border-slate-200">
            <span>
              Showing <strong className="text-slate-900">{products.length}</strong> items
              {activeCategory && (
                <span> in <strong className="text-brand-700">{activeCategory.name}</strong></span>
              )}
              {paginationMeta.totalElements > 0 && ` of ${paginationMeta.totalElements} total`}
            </span>
          </div>

          <ProductGrid
            products={products}
            isLoading={isLoading}
            emptyTitle={activeCategory ? `No ${activeCategory.name} found` : "No farm products match your search"}
            emptyDescription="Try adjusting your keywords, price range, or category filter to discover more listings."
            onResetFilters={handleResetFilters}
          />

          <Pagination
            page={paginationMeta.page}
            totalPages={paginationMeta.totalPages}
            totalElements={paginationMeta.totalElements}
            hasNext={paginationMeta.hasNext}
            hasPrevious={paginationMeta.hasPrevious}
            onPageChange={(newPage) => handleFilterChange({ ...filters, page: newPage })}
          />
        </div>
      </div>
    </div>
  );
}

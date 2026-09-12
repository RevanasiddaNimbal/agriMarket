import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  X,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Trash2,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Power,
} from 'lucide-react';
import { adminService } from '@/services/admin/adminService';
import { categoryService } from '@/services/category/categoryService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency, formatQuantity, formatDate } from '@/utils/formatters';

const DEFAULT_PRODUCE_IMAGE =
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600';

function getProductImage(product) {
  if (!product) return DEFAULT_PRODUCE_IMAGE;
  const images = product.images || [];
  const primary = images.find((img) => img.primary || img.is_primary || img.isPrimary);
  return (
    primary?.imageUrl ||
    primary?.image_url ||
    images[0]?.imageUrl ||
    images[0]?.image_url ||
    product.imageUrl ||
    product.image_url ||
    DEFAULT_PRODUCE_IMAGE
  );
}

export function AdminProductsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // Search & Filter State (Enter-key triggered search)
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Delete Modal State
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Categories on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      try {
        const catData = await categoryService.getAllCategories();
        if (isMounted && Array.isArray(catData)) {
          setCategories(catData);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Products
  const loadProducts = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
      };
      if (appliedSearch && appliedSearch.trim()) {
        params.query = appliedSearch.trim();
      }
      if (selectedStatus && selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }
      if (selectedCategory && selectedCategory !== 'ALL') {
        params.categoryId = selectedCategory;
      }

      const data = await adminService.getProducts(params);
      const productList = data?.products || data?.content || (Array.isArray(data) ? data : []);
      setProducts(productList);
      setTotalCount(data?.totalElements ?? productList.length);
      setTotalPages(
        data?.totalPages ?? Math.max(1, Math.ceil((data?.totalElements ?? productList.length) / pageSize))
      );
      setCurrentPage(data?.page ?? page);
    } catch (err) {
      console.error('Failed to load products:', err);
      toast.error('Failed to load product catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger search / filter changes (resets to page 0)
  useEffect(() => {
    setCurrentPage(0);
    loadProducts(0);
  }, [appliedSearch, selectedStatus, selectedCategory]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      loadProducts(newPage);
    }
  };

  const handleToggleStatus = async (product) => {
    setActionLoadingId(product.id);
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updateProductStatus(product.id, newStatus);
      toast.success(`Produce "${product.name}" marked as ${newStatus}.`);

      // Update local state instantly
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update product status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await adminService.deleteProduct(deletingProduct.id);
      toast.success(`Produce "${deletingProduct.name}" deleted successfully.`);
      setDeletingProduct(null);
      await loadProducts(currentPage);
    } catch (err) {
      setDeletingProduct(null);
      const code = err?.code || '';
      const msg = err?.message || '';
      if (
        code === 'DATA_INTEGRITY_VIOLATION' ||
        err?.status === 409 ||
        msg.toLowerCase().includes('data constraint') ||
        msg.toLowerCase().includes('order')
      ) {
        toast.error('Cannot delete: Linked to existing orders. Deactivate instead.');
      } else {
        toast.error(err.message || 'Failed to delete product.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter products for immediate reactivity
  const displayedProducts = products.filter((p) => {
    if (onlyLowStock && Number(p.quantity || 0) > 10) {
      return false;
    }
    if (selectedStatus && selectedStatus !== 'ALL') {
      if ((p.status || '').toUpperCase() !== selectedStatus.toUpperCase()) {
        return false;
      }
    }
    if (selectedCategory && selectedCategory !== 'ALL') {
      const catId = p.categoryId || p.category_id || p.category?.id;
      if (catId && catId !== selectedCategory) {
        return false;
      }
    }
    return true;
  });

  // Situational Telemetry counts
  const activeCount = products.filter((p) => p.status === 'ACTIVE').length;
  const inactiveCount = products.filter((p) => p.status === 'INACTIVE').length;
  const lowStockCount = products.filter((p) => Number(p.quantity || 0) <= 10).length;

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* 1. Header Bar - Consistent Material Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-soft-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Product Catalog Governance
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit farmer crop listings, check category compliance, moderate statuses, and monitor inventory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link to="/marketplace">
            <Button
              variant="outline"
              size="sm"
              icon={ExternalLink}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Public Marketplace
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isLoading}
            onClick={() => loadProducts(currentPage)}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Situational Metric Cards (Clickable Filter Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Listings */}
        <div
          onClick={() => {
            setSelectedStatus('ALL');
            setOnlyLowStock(false);
          }}
          title="Click to view all produce listings"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStatus === 'ALL' && !onlyLowStock
              ? 'border-purple-300 bg-purple-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Listings
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {totalCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Catalog items</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Active Listings */}
        <div
          onClick={() => {
            setSelectedStatus('ACTIVE');
            setOnlyLowStock(false);
          }}
          title="Click to filter active produce"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStatus === 'ACTIVE' && !onlyLowStock
              ? 'border-emerald-300 bg-emerald-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Listings
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 tracking-tight">
              {activeCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Live on marketplace</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Inactive / Delisted */}
        <div
          onClick={() => {
            setSelectedStatus('INACTIVE');
            setOnlyLowStock(false);
          }}
          title="Click to filter inactive/delisted produce"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStatus === 'INACTIVE' && !onlyLowStock
              ? 'border-rose-300 bg-rose-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Inactive Listings
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-rose-700 mt-1 tracking-tight">
              {inactiveCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Delisted / paused</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div
          onClick={() => {
            setOnlyLowStock((prev) => !prev);
            setSelectedStatus('ALL');
          }}
          title="Click to filter produce with low stock (<=10)"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            onlyLowStock
              ? 'border-amber-300 bg-amber-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Low Stock (≤10)
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-700 mt-1 tracking-tight">
              {lowStockCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Replenishment needed</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar (Enter Key Driven) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit(e);
              }}
              placeholder="Search produce by name (press Enter)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-soft-xs transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="md"
            className="rounded-2xl px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold shrink-0 shadow-soft-xs"
          >
            Search
          </Button>
        </form>

        {/* Filter Controls: Category & Status */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-soft-xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-soft-xs cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(appliedSearch || selectedStatus !== 'ALL' || selectedCategory !== 'ALL' || onlyLowStock) && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setAppliedSearch('');
                setSelectedStatus('ALL');
                setSelectedCategory('ALL');
                setOnlyLowStock(false);
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2 shrink-0 px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 4. Results Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-900">{displayedProducts.length}</strong> of{' '}
          <strong className="text-slate-900">{totalCount}</strong> listings
        </span>
        {totalPages > 1 && (
          <span>
            Page <strong className="text-slate-900">{currentPage + 1}</strong> of{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* 5. Product Table / Empty State / Loading State */}
      {isLoading ? (
        <div className="py-16 flex justify-center bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs">
          <Spinner text="Loading produce catalog..." />
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/90 p-8 shadow-soft-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-soft-xs">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No produce listings found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {appliedSearch || selectedStatus !== 'ALL' || selectedCategory !== 'ALL'
              ? 'No produce matches your current filters. Try changing your search keyword or clearing filters.'
              : 'There are currently no produce listings recorded in the marketplace.'}
          </p>
          {(appliedSearch || selectedStatus !== 'ALL' || selectedCategory !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchInput('');
                setAppliedSearch('');
                setSelectedStatus('ALL');
                setSelectedCategory('ALL');
              }}
            >
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-soft-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Produce & Farm Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Unit Price</th>
                  <th className="py-3.5 px-4 text-right">Stock Level</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Governance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {displayedProducts.map((p) => {
                  const isActionLoading = actionLoadingId === p.id;
                  const thumb = getProductImage(p);
                  const isLowStock = Number(p.quantity || 0) <= 10;
                  const isOutOfStock = Number(p.quantity || 0) <= 0;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/admin/products/${p.id}`)}
                      className="hover:bg-emerald-50/20 transition-colors cursor-pointer group"
                    >
                      {/* Produce & Details */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={thumb}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200/90 bg-slate-100 flex-shrink-0 shadow-soft-xs"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_PRODUCE_IMAGE;
                            }}
                          />
                          <div>
                            <span
                              className="font-bold text-slate-900 group-hover:text-emerald-700 text-left transition-colors line-clamp-1 block"
                            >
                              {p.name}
                            </span>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[160px] sm:max-w-xs">{p.location || 'Direct Farm'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: {p.id?.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                          {p.categoryName || 'Produce'}
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {formatCurrency(p.price)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">/{p.unit || 'KG'}</span>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-800 text-xs sm:text-sm">
                          {formatQuantity(p.quantity, p.unit)}
                        </div>
                        <div className="mt-0.5">
                          {isOutOfStock ? (
                            <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                              In Stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70 shadow-2xs'
                              : 'bg-rose-50 text-rose-700 border-rose-200/70 shadow-2xs'
                          }`}
                        >
                          {p.status === 'ACTIVE' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" /> Inactive
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active / Deactivate */}
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(p);
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              p.status === 'ACTIVE'
                                ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                                : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                            title={p.status === 'ACTIVE' ? 'Deactivate Produce' : 'Activate Produce'}
                          >
                            {isActionLoading ? (
                              <Spinner size="xs" />
                            ) : p.status === 'ACTIVE' ? (
                              <Power className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingProduct(p);
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Produce Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
                className="text-xs"
              >
                Previous
              </Button>
              <div className="text-xs font-semibold text-slate-700">
                Page {currentPage + 1} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={ChevronRight}
                disabled={currentPage >= totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deletingProduct && (
        <Modal
          isOpen={!!deletingProduct}
          onClose={() => !isDeleting && setDeletingProduct(null)}
          title="Delete Produce Listing"
          description="Confirm produce listing removal from the platform catalog."
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-slate-600">
            <p className="leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{deletingProduct.name}"</strong>?
              This will permanently remove the produce listing and its inventory records from the marketplace.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeletingProduct(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={isDeleting}
                icon={Trash2}
                onClick={handleConfirmDelete}
              >
                Delete Produce
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

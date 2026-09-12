import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  Search,
  X,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
} from 'lucide-react';
import { adminService } from '@/services/admin/adminService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency, formatQuantity } from '@/utils/formatters';

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

export function AdminInventoryPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // Search & Filter state
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedStockLevel, setSelectedStockLevel] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Loading & Action states
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjustment Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('add'); // 'add' | 'remove'
  const [adjustQty, setAdjustQty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products with inventory
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

      const data = await adminService.getProducts(params);
      const productList = data?.products || data?.content || (Array.isArray(data) ? data : []);
      setProducts(productList);
      setTotalCount(data?.totalElements ?? productList.length);
      setTotalPages(
        data?.totalPages ?? Math.max(1, Math.ceil((data?.totalElements ?? productList.length) / pageSize))
      );
      setCurrentPage(data?.page ?? page);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      toast.error('Failed to load inventory stock levels.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(0);
  }, [appliedSearch, selectedStatus]);

  // Search Submit Handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setCurrentPage(0);
  };

  // Clear Search Handler
  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setCurrentPage(0);
  };

  // Filter products by stock level client-side for immediate responsiveness
  const displayedProducts = products.filter((p) => {
    const qty = Number(p.quantity || 0);
    if (selectedStockLevel === 'IN_STOCK' && qty <= 10) return false;
    if (selectedStockLevel === 'LOW_STOCK' && (qty <= 0 || qty > 10)) return false;
    if (selectedStockLevel === 'OUT_OF_STOCK' && qty > 0) return false;

    if (selectedStatus && selectedStatus !== 'ALL') {
      if ((p.status || '').toUpperCase() !== selectedStatus.toUpperCase()) {
        return false;
      }
    }
    return true;
  });

  // Situational Telemetry Counts
  const healthyCount = products.filter((p) => Number(p.quantity || 0) > 10).length;
  const lowStockCount = products.filter((p) => {
    const q = Number(p.quantity || 0);
    return q > 0 && q <= 10;
  }).length;
  const outOfStockCount = products.filter((p) => Number(p.quantity || 0) <= 0).length;

  // Handle Page Change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      loadProducts(newPage);
    }
  };

  // Handle Stock Adjustment
  const handleAdjustStock = async (e) => {
    e.preventDefault();
    const qty = parseFloat(adjustQty);
    if (isNaN(qty) || qty <= 0) {
      toast.warning('Please specify a valid positive quantity.');
      return;
    }

    // Platform rule: Deduction cannot exceed current physical stock
    if (adjustType === 'remove' && qty > currentStockVal) {
      toast.warning(
        `Inventory Rule: Cannot remove ${qty} ${selectedProduct.unit || 'units'}. Available physical stock is only ${currentStockVal} ${selectedProduct.unit || 'units'}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (adjustType === 'add') {
        await adminService.addProductStock(selectedProduct.id, qty);
        toast.success(`Successfully added ${qty} ${selectedProduct.unit || 'units'} to ${selectedProduct.name}.`);
      } else {
        await adminService.removeProductStock(selectedProduct.id, qty);
        toast.success(`Successfully removed ${qty} ${selectedProduct.unit || 'units'} from ${selectedProduct.name}.`);
      }

      // Optimistic client update for instant reactivity
      setProducts((prev) =>
        prev.map((item) => {
          if (item.id === selectedProduct.id) {
            const current = Number(item.quantity || 0);
            const newQty = adjustType === 'add' ? current + qty : Math.max(0, current - qty);
            return { ...item, quantity: newQty };
          }
          return item;
        })
      );

      setSelectedProduct(null);
      setAdjustQty('');
      // Background sync
      await loadProducts(currentPage);
    } catch (err) {
      console.error('Failed to adjust stock:', err);
      const code = err?.code || '';
      if (code === 'INVENTORY_QUANTITY_LESS_THAN_RESERVED') {
        toast.error(
          'Inventory Rule Violation: The requested deduction cannot be applied because the remaining quantity would be less than the stock reserved for pending customer orders.',
          { duration: 7000 }
        );
      } else if (code === 'INVENTORY_INSUFFICIENT_STOCK' || code === 'INSUFFICIENT_STOCK') {
        toast.error(
          'Inventory Rule Violation: Insufficient physical stock available to complete this deduction.',
          { duration: 6000 }
        );
      } else {
        toast.error(err.message || 'Failed to update product stock.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate projected new stock for the modal preview
  const currentStockVal = selectedProduct ? Number(selectedProduct.quantity || 0) : 0;
  const adjustVal = parseFloat(adjustQty) || 0;
  const projectedStockVal =
    adjustType === 'add'
      ? currentStockVal + adjustVal
      : Math.max(0, currentStockVal - adjustVal);

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* 1. Header Bar - Matching Admin Products and Admin Users */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0 shadow-soft-xs">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Stock & Inventory Monitoring
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor warehouse & farm stock levels, trace inventory depletion, and execute administrative stock adjustments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link to="/admin/products">
            <Button
              variant="outline"
              size="sm"
              icon={Package}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Product Catalog
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
        {/* Card 1: Total Monitored Listings */}
        <div
          onClick={() => setSelectedStockLevel('ALL')}
          title="Click to view all monitored produce"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStockLevel === 'ALL'
              ? 'border-sky-300 bg-sky-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Monitored
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {totalCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Catalogued produce</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Healthy Stock */}
        <div
          onClick={() => setSelectedStockLevel('IN_STOCK')}
          title="Click to filter healthy stock (>10)"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStockLevel === 'IN_STOCK'
              ? 'border-emerald-300 bg-emerald-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Healthy Stock (&gt;10)
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 tracking-tight">
              {healthyCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Sufficient inventory</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Low Stock Warning */}
        <div
          onClick={() => setSelectedStockLevel('LOW_STOCK')}
          title="Click to filter low stock (≤10)"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStockLevel === 'LOW_STOCK'
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
            <p className="text-[10px] text-slate-400 mt-0.5">Replenishment advised</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Out of Stock */}
        <div
          onClick={() => setSelectedStockLevel('OUT_OF_STOCK')}
          title="Click to filter out of stock (0)"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStockLevel === 'OUT_OF_STOCK'
              ? 'border-rose-300 bg-rose-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Out of Stock (0)
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-rose-700 mt-1 tracking-tight">
              {outOfStockCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Urgent action required</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar (Enter-Key Driven) */}
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

        {/* Filter Controls: Stock Level & Catalog Status */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Stock Level Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Stock Level:
            </label>
            <select
              value={selectedStockLevel}
              onChange={(e) => setSelectedStockLevel(e.target.value)}
              className="w-full sm:w-auto text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-soft-xs cursor-pointer"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock (&gt;10)</option>
              <option value="LOW_STOCK">Low Stock (≤10)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>
          </div>

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

          {/* Reset Filters */}
          {(appliedSearch || selectedStockLevel !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setAppliedSearch('');
                setSelectedStockLevel('ALL');
                setSelectedStatus('ALL');
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
          <strong className="text-slate-900">{totalCount}</strong> monitored products
        </span>
        {totalPages > 1 && (
          <span>
            Page <strong className="text-slate-900">{currentPage + 1}</strong> of{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* 5. Inventory Table / Empty State / Loading State */}
      {isLoading ? (
        <div className="py-16 flex justify-center bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs">
          <Spinner text="Loading stock & inventory..." />
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/90 p-8 shadow-soft-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mx-auto shadow-soft-xs">
            <Boxes className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No inventory records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {appliedSearch || selectedStockLevel !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No products match your current filters. Try changing your search query or clearing filters.'
              : 'There are currently no products available to monitor in inventory.'}
          </p>
          {(appliedSearch || selectedStockLevel !== 'ALL' || selectedStatus !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchInput('');
                setAppliedSearch('');
                setSelectedStockLevel('ALL');
                setSelectedStatus('ALL');
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
                  <th className="py-3.5 px-4 sm:px-6">Produce & Origin</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Unit Price</th>
                  <th className="py-3.5 px-4 text-right">Physical Stock</th>
                  <th className="py-3.5 px-4 text-center">Stock Health</th>
                  <th className="py-3.5 px-4 text-center">Catalog Status</th>
                  <th className="py-3.5 px-4 text-right">Stock Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {displayedProducts.map((p) => {
                  const thumb = getProductImage(p);
                  const qty = Number(p.quantity || 0);
                  const isOutOfStock = qty <= 0;
                  const isLowStock = qty > 0 && qty <= 10;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/admin/products/${p.id}`)}
                      className="hover:bg-emerald-50/20 transition-colors cursor-pointer group"
                    >
                      {/* Produce & Origin */}
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

                      {/* Physical Stock */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-slate-900 text-sm sm:text-base">
                          {formatQuantity(p.quantity, p.unit)}
                        </div>
                        <span className="text-[10px] text-slate-400">Available physical</span>
                      </td>

                      {/* Stock Health Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/70 shadow-2xs">
                            <XCircle className="w-3.5 h-3.5" />
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/70 shadow-2xs">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Healthy
                          </span>
                        )}
                      </td>

                      {/* Catalog Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70 shadow-2xs'
                              : 'bg-rose-50 text-rose-700 border-rose-200/70 shadow-2xs'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {p.status || 'ACTIVE'}
                        </span>
                      </td>

                      {/* Stock Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Adjust Stock Button */}
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={Boxes}
                            className="text-xs font-semibold px-3 shadow-soft-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(p);
                              setAdjustType('add');
                              setAdjustQty('');
                            }}
                          >
                            Adjust Stock
                          </Button>
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

      {/* 6. Material Stock Adjustment Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => !isSubmitting && setSelectedProduct(null)}
          title={`Stock Governance — ${selectedProduct.name}`}
          description="Directly add or remove physical inventory units for this produce item."
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleAdjustStock} className="space-y-4 text-slate-800">
            {/* Product Summary Preview */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <img
                src={getProductImage(selectedProduct)}
                alt={selectedProduct.name}
                className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-white shrink-0 shadow-soft-xs"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_PRODUCE_IMAGE;
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {selectedProduct.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span>Unit: <strong className="text-slate-700">{selectedProduct.unit || 'KG'}</strong></span>
                  <span>•</span>
                  <span>Price: <strong className="text-slate-700">{formatCurrency(selectedProduct.price)}</strong></span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Stock</span>
                <span className="text-sm font-black text-slate-900">
                  {formatQuantity(selectedProduct.quantity, selectedProduct.unit)}
                </span>
              </div>
            </div>

            {/* Action Mode Toggle */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Adjustment Action:
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`flex items-center justify-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    adjustType === 'add'
                      ? 'bg-emerald-600 text-white shadow-soft-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('remove')}
                  className={`flex items-center justify-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    adjustType === 'remove'
                      ? 'bg-rose-600 text-white shadow-soft-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Remove Stock
                </button>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Adjustment Quantity ({selectedProduct.unit || 'units'})
              </label>
              <input
                type="number"
                min="0.001"
                step="any"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                placeholder="Enter quantity (e.g., 25)"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-soft-xs"
              />
            </div>

            {/* Projected Stock Preview Card */}
            {adjustVal > 0 && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  adjustType === 'add'
                    ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-800'
                    : adjustVal > currentStockVal
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50/70 border-rose-200/80 text-rose-800'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>Current Stock:</span>
                  <span>{currentStockVal} {selectedProduct.unit || 'KG'}</span>
                </div>
                <div className="flex items-center justify-between font-semibold mt-1">
                  <span>{adjustType === 'add' ? 'Addition:' : 'Deduction:'}</span>
                  <span>
                    {adjustVal} {selectedProduct.unit || 'KG'}
                  </span>
                </div>
                <div className="border-t border-current/20 my-1.5 pt-1.5 flex items-center justify-between font-bold text-sm">
                  <span>Projected Final Stock:</span>
                  <span>{projectedStockVal} {selectedProduct.unit || 'KG'}</span>
                </div>
                {adjustType === 'remove' && adjustVal > currentStockVal && (
                  <p className="text-[11px] text-amber-700 mt-1 font-medium">
                    ⚠️ Requested deduction exceeds current stock. Resulting stock will reach 0.
                  </p>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setSelectedProduct(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                loading={isSubmitting}
                className={`font-bold text-white shadow-soft-xs ${
                  adjustType === 'add'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {adjustType === 'add' ? 'Confirm Add Stock' : 'Confirm Remove Stock'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}


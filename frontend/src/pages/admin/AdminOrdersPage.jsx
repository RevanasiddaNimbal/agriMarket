import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  X,
  RefreshCw,
  Edit,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import { adminService } from '@/services/admin/adminService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';
import { ORDER_STATUS } from '@/config/constants';

const DEFAULT_PRODUCE_IMAGE =
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600';

const CROP_FALLBACKS = {
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=300',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=300',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=300',
  carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&q=80&w=300',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300',
  paddy: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300',
  wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=300',
  cotton: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&q=80&w=300',
  maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=300',
  corn: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=300',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=300',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=300',
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=300',
  chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=300',
  garlic: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&q=80&w=300',
};

function getOrderItemImage(item, productsMap = {}) {
  if (!item) return DEFAULT_PRODUCE_IMAGE;
  const prodId = item.productId || item.product_id;
  const prod = prodId ? productsMap[prodId] : null;

  if (prod) {
    const images = prod.images || [];
    const primary = images.find((img) => img.primary || img.is_primary || img.isPrimary);
    const url =
      primary?.imageUrl ||
      primary?.image_url ||
      images[0]?.imageUrl ||
      images[0]?.image_url ||
      prod.imageUrl ||
      prod.image_url;
    if (url) return url;
  }

  if (item.imageUrl || item.image_url) {
    return item.imageUrl || item.image_url;
  }

  const name = (item.productName || item.product_name || '').toLowerCase();
  for (const [cropKey, fallbackUrl] of Object.entries(CROP_FALLBACKS)) {
    if (name.includes(cropKey)) return fallbackUrl;
  }

  return DEFAULT_PRODUCE_IMAGE;
}

function getOrderTotalAmount(order) {
  if (!order) return 0;
  if (order.total_amount !== undefined && order.total_amount !== null) {
    const val = Number(order.total_amount);
    if (!isNaN(val) && val > 0) return val;
  }
  if (order.totalAmount !== undefined && order.totalAmount !== null) {
    const val = Number(order.totalAmount);
    if (!isNaN(val) && val > 0) return val;
  }
  const items = order.items || [];
  if (items.length > 0) {
    return items.reduce((sum, item) => {
      const sub = Number(
        item.subtotal ??
          Number(item.quantity || 0) * Number(item.unit_price ?? item.unitPrice ?? 0)
      );
      return sum + (isNaN(sub) ? 0 : sub);
    }, 0);
  }
  return 0;
}

function getOrderDate(order) {
  if (!order) return null;
  return (
    order.created_date ||
    order.createdDate ||
    order.createdAt ||
    order.created_at ||
    order.date ||
    order.timestamp
  );
}

function getOrderStatusBadge(status) {
  const meta = ORDER_STATUS[status] || {
    label: status || 'Pending',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const badgeStyles =
    status === 'DELIVERED'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
      : status === 'OUT_FOR_DELIVERY'
      ? 'bg-teal-50 text-teal-700 border-teal-200/80'
      : status === 'SHIPPED'
      ? 'bg-sky-50 text-sky-700 border-sky-200/80'
      : status === 'PROCESSING'
      ? 'bg-purple-50 text-purple-700 border-purple-200/80'
      : status === 'CONFIRMED'
      ? 'bg-blue-50 text-blue-700 border-blue-200/80'
      : status === 'CANCELLED'
      ? 'bg-rose-50 text-rose-700 border-rose-200/80'
      : 'bg-amber-50 text-amber-700 border-amber-200/80';

  const dotStyles =
    status === 'DELIVERED'
      ? 'bg-emerald-500'
      : status === 'OUT_FOR_DELIVERY'
      ? 'bg-teal-500'
      : status === 'SHIPPED'
      ? 'bg-sky-500'
      : status === 'PROCESSING'
      ? 'bg-purple-500'
      : status === 'CONFIRMED'
      ? 'bg-blue-500'
      : status === 'CANCELLED'
      ? 'bg-rose-500'
      : 'bg-amber-500';

  const label =
    status === 'PENDING_PAYMENT'
      ? 'Pending Payment'
      : status === 'OUT_FOR_DELIVERY'
      ? 'Out for Delivery'
      : meta.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border shadow-2xs ${badgeStyles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`} />
      {label}
    </span>
  );
}

const STATUS_OPTIONS = [
  { id: 'PENDING_PAYMENT', name: 'Pending Payment' },
  { id: 'CONFIRMED', name: 'Confirmed' },
  { id: 'PROCESSING', name: 'Processing' },
  { id: 'SHIPPED', name: 'Shipped' },
  { id: 'OUT_FOR_DELIVERY', name: 'Out for Delivery' },
  { id: 'DELIVERED', name: 'Delivered' },
  { id: 'CANCELLED', name: 'Cancelled' },
];

export function AdminOrdersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 15;

  // Modals State
  const [statusOrder, setStatusOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadOrdersAndProducts = async () => {
    setIsLoading(true);
    try {
      const [ordersData, prodsData] = await Promise.allSettled([
        adminService.getAllOrders(),
        adminService.getProducts({ page: 0, size: 300 }),
      ]);

      if (ordersData.status === 'fulfilled') {
        setOrders(Array.isArray(ordersData.value) ? ordersData.value : []);
      } else {
        toast.error('Failed to load platform orders.');
      }

      if (prodsData.status === 'fulfilled') {
        const pList =
          prodsData.value?.products ||
          prodsData.value?.content ||
          (Array.isArray(prodsData.value) ? prodsData.value : []);
        const pMap = {};
        pList.forEach((p) => {
          if (p.id) pMap[p.id] = p;
        });
        setProductsMap(pMap);
      }
    } catch (err) {
      console.error('Failed to load orders/products:', err);
      toast.error('Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrdersAndProducts();
  }, []);

  // Search handlers
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setCurrentPage(0);
  };

  // Update Status handler
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusOrder || !newStatus) return;

    setIsUpdating(true);
    setActionError(null);
    try {
      await adminService.updateOrderStatus(statusOrder.id, newStatus);
      toast.success(`Order #${statusOrder.id.slice(0, 8)} status updated to ${newStatus}.`);

      // Optimistic client update
      setOrders((prev) =>
        prev.map((o) => (o.id === statusOrder.id ? { ...o, status: newStatus } : o))
      );
      setStatusOrder(null);
      await loadOrdersAndProducts();
    } catch (err) {
      // Immediately close modal on rule violation
      setStatusOrder(null);
      const code = err?.code || err?.response?.data?.code || '';
      const rawMsg = err?.message || err?.response?.data?.message || '';

      let cleanMsg = 'Invalid status transition: Not permitted for this order.';
      if (
        code === 'ORDER_INVALID_STATUS_TRANSITION' ||
        rawMsg.toLowerCase().includes('transition') ||
        rawMsg.toLowerCase().includes('status') ||
        err?.status === 400 ||
        err?.response?.status === 400
      ) {
        cleanMsg = 'Invalid status transition: Not permitted for this order.';
      } else if (rawMsg) {
        cleanMsg = rawMsg;
      }

      toast.error(cleanMsg);
      setActionError(cleanMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    // Status filter
    if (selectedStatus === 'PROCESSING_OR_CONFIRMED') {
      if (o.status !== 'PROCESSING' && o.status !== 'CONFIRMED') return false;
    } else if (selectedStatus === 'IN_TRANSIT') {
      if (o.status !== 'SHIPPED' && o.status !== 'OUT_FOR_DELIVERY') return false;
    } else if (selectedStatus !== 'ALL') {
      if ((o.status || '').toUpperCase() !== selectedStatus.toUpperCase()) return false;
    }

    // Search query filter (Order ID, item names)
    if (appliedSearch) {
      const q = appliedSearch.toLowerCase();
      const idMatch = (o.id || '').toLowerCase().includes(q);
      const itemsMatch = (o.items || []).some((item) =>
        (item.productName || item.product_name || item.name || '').toLowerCase().includes(q)
      );
      if (!idMatch && !itemsMatch) return false;
    }

    return true;
  });

  // Telemetry counts
  const totalCount = orders.length;
  const processingCount = orders.filter(
    (o) => o.status === 'PROCESSING' || o.status === 'CONFIRMED'
  ).length;
  const inTransitCount = orders.filter(
    (o) => o.status === 'SHIPPED' || o.status === 'OUT_FOR_DELIVERY'
  ).length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 shadow-soft-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Order Governance & Monitoring
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit order fulfillment lifecycles, inspect crop consignments with photos, and update order progression states.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isLoading}
            onClick={loadOrdersAndProducts}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Refresh Orders
          </Button>
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800 animate-fade-in shadow-soft-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer transition-colors"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Situational Metric Cards (Clickable Filter Cards with subtle, elegant highlighting) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Orders */}
        <div
          onClick={() => setSelectedStatus('ALL')}
          title="Click to view all orders"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStatus === 'ALL'
              ? 'border-purple-300 bg-purple-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Orders
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {totalCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Platform orders</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Processing & Confirmed */}
        <div
          onClick={() => setSelectedStatus('PROCESSING_OR_CONFIRMED')}
          title="Click to filter processing / confirmed orders"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStatus === 'PROCESSING_OR_CONFIRMED'
              ? 'border-sky-300 bg-sky-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Processing
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-sky-700 mt-1 tracking-tight">
              {processingCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Ready for packing/dispatch</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: In Transit */}
        <div
          onClick={() => setSelectedStatus('IN_TRANSIT')}
          title="Click to filter in-transit & dispatched orders"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStatus === 'IN_TRANSIT'
              ? 'border-amber-300 bg-amber-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              In Transit
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-700 mt-1 tracking-tight">
              {inTransitCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Dispatched & delivery</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Delivered */}
        <div
          onClick={() => setSelectedStatus('DELIVERED')}
          title="Click to filter delivered orders"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStatus === 'DELIVERED'
              ? 'border-emerald-300 bg-emerald-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Delivered
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 tracking-tight">
              {deliveredCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Completed consignments</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
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
              placeholder="Search by Order ID or produce item (press Enter)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-soft-xs transition-all"
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
            className="rounded-2xl px-5 bg-purple-700 hover:bg-purple-800 text-white font-bold shrink-0 shadow-soft-xs"
          >
            Search
          </Button>
        </form>

        {/* Filter Controls: Status Dropdown & Reset */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full sm:w-auto text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-soft-xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {(appliedSearch || selectedStatus !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setAppliedSearch('');
                setSelectedStatus('ALL');
                setCurrentPage(0);
              }}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 underline underline-offset-2 shrink-0 px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 4. Results Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-900">{filteredOrders.length}</strong> of{' '}
          <strong className="text-slate-900">{totalCount}</strong> orders
        </span>
        {totalPages > 1 && (
          <span>
            Page <strong className="text-slate-900">{currentPage + 1}</strong> of{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* 5. Orders Table / Empty State / Loading State */}
      {isLoading ? (
        <div className="py-16 flex justify-center bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs">
          <Spinner text="Loading platform orders..." />
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/90 p-8 shadow-soft-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto shadow-soft-xs">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {appliedSearch || selectedStatus !== 'ALL'
              ? 'No orders match your current filters. Try changing your search query or clearing filters.'
              : 'There are currently no customer orders placed on the platform.'}
          </p>
          {(appliedSearch || selectedStatus !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchInput('');
                setAppliedSearch('');
                setSelectedStatus('ALL');
                setCurrentPage(0);
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
                  <th className="py-3.5 px-4 sm:px-6">Order ID & Date</th>
                  <th className="py-3.5 px-4">Produce Consignment</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-center">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right">Order Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {paginatedOrders.map((o) => {
                  const meta = ORDER_STATUS[o.status] || { label: o.status, color: 'slate' };
                  const items = o.items || [];
                  const itemCount = items.length;
                  const firstItem = items[0];
                  const primaryThumb = firstItem
                    ? getOrderItemImage(firstItem, productsMap)
                    : DEFAULT_PRODUCE_IMAGE;
                  const totalAmt = getOrderTotalAmount(o);
                  const orderDate = getOrderDate(o);

                  return (
                    <tr
                      key={o.id}
                      onClick={() => navigate(`/admin/orders/${o.id}`)}
                      className="hover:bg-purple-50/30 transition-colors cursor-pointer group"
                    >
                      {/* Order Ref & Placed Date */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <span
                          className="font-mono text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors block"
                        >
                          #{o.id?.slice(0, 8).toUpperCase()}
                        </span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {orderDate ? `${formatDate(orderDate, false)} • ${formatTime(orderDate)}` : 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Produce Consignment (With Image Preview) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 max-w-md">
                          {/* Produce Image */}
                          <div className="relative flex-shrink-0">
                            <img
                              src={primaryThumb}
                              alt={firstItem?.productName || firstItem?.product_name || 'Produce'}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200/90 bg-slate-100 shadow-soft-xs group-hover:border-purple-300 transition-colors"
                              onError={(e) => {
                                e.currentTarget.src = DEFAULT_PRODUCE_IMAGE;
                              }}
                            />
                            {itemCount > 1 && (
                              <span className="absolute -top-1.5 -right-1.5 bg-purple-700 text-white text-[9px] font-black rounded-full px-1.5 py-0.2 shadow-2xs border-2 border-white">
                                +{itemCount - 1}
                              </span>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                              {firstItem
                                ? firstItem.productName || firstItem.product_name || 'Crop Produce'
                                : 'Empty Consignment'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                              <span className="font-semibold text-slate-700">
                                {firstItem?.quantity} {firstItem?.unit || 'units'}
                              </span>
                              {firstItem?.unit_price || firstItem?.unitPrice ? (
                                <span>
                                  @ {formatCurrency(firstItem.unit_price ?? firstItem.unitPrice)}/{firstItem?.unit || 'unit'}
                                </span>
                              ) : null}
                              {itemCount > 1 && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60 ml-1">
                                  {itemCount} items total
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                          {formatCurrency(totalAmt)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Order Value</span>
                      </td>

                      {/* Fulfillment Status with Distinct Styling per status */}
                      <td className="py-3.5 px-4 text-center">
                        {getOrderStatusBadge(o.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Update Status Button */}
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={Edit}
                            className="text-xs font-semibold px-2.5 shadow-soft-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatusOrder(o);
                              setNewStatus(o.status);
                            }}
                          >
                            Status
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

      {/* 6. Update Order Status Modal */}
      {statusOrder && (
        <Modal
          isOpen={!!statusOrder}
          onClose={() => !isUpdating && setStatusOrder(null)}
          title={`Update Status — Order #${statusOrder.id?.slice(0, 8)}`}
          description="Transition order to next fulfillment state."
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-slate-800">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
                <span className="text-sm font-black text-slate-900">
                  {formatCurrency(getOrderTotalAmount(statusOrder))}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block text-right">Current State</span>
                <span className="text-xs font-bold text-purple-700">
                  {statusOrder.status}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Select New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-soft-xs cursor-pointer"
                required
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUpdating}
                onClick={() => setStatusOrder(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                loading={isUpdating}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-soft-xs"
              >
                Save Status
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. View Order Consignment Details Modal with Produce Images */}
      {viewingOrder && (
        <Modal
          isOpen={!!viewingOrder}
          onClose={() => setViewingOrder(null)}
          title="Consignment & Order Details"
          description={`Order Reference #${viewingOrder.id?.slice(0, 8).toUpperCase()} • Placed ${
            getOrderDate(viewingOrder) ? formatDate(getOrderDate(viewingOrder), true) : 'N/A'
          }`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs text-slate-800">
            {/* Top Overview Card */}
            <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100/90 flex items-center justify-between gap-3 shadow-soft-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Total Order Value
                </span>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(getOrderTotalAmount(viewingOrder))}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                  {viewingOrder.items?.length || 0} produce consignment item{
                    (viewingOrder.items?.length || 0) === 1 ? '' : 's'
                  }
                </span>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Fulfillment Status
                </span>
                {getOrderStatusBadge(viewingOrder.status)}
              </div>
            </div>

            {/* Logistics & Dispatch Card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-soft-xs text-slate-600">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800 text-xs block truncate">
                    Consignment Dispatch
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Standard Route Delivery
                  </span>
                </div>
              </div>

              <Link
                to="/admin/deliveries"
                onClick={() => setViewingOrder(null)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100/80 px-2.5 py-1.5 rounded-lg border border-purple-200/80 transition-colors shrink-0 shadow-2xs"
              >
                <span>Track Dispatch</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Line Items List with Produce Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Purchased Produce Consignment ({viewingOrder.items?.length || 0})
                </h4>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(viewingOrder.items || []).map((item, idx) => {
                  const itemImg = getOrderItemImage(item, productsMap);
                  const itemSubtotal = Number(
                    item.subtotal ??
                      Number(item.quantity || 0) * Number(item.unit_price ?? item.unitPrice ?? 0)
                  );

                  return (
                    <div
                      key={item.id || idx}
                      className="p-3 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      {/* Thumbnail & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={itemImg}
                          alt={item.productName || item.product_name || 'Produce'}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200/90 bg-slate-100 shrink-0 shadow-soft-xs"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_PRODUCE_IMAGE;
                          }}
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-900 text-xs truncate">
                            {item.productName || item.product_name || 'Crop Produce'}
                          </h5>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <span className="font-semibold text-slate-700">
                              {item.quantity} {item.unit || 'units'}
                            </span>
                            <span>×</span>
                            <span>
                              {formatCurrency(item.unit_price ?? item.unitPrice)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Line Subtotal */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block font-medium">Subtotal</span>
                        <span className="font-black text-slate-900 text-sm">
                          {formatCurrency(itemSubtotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => {
                  setStatusOrder(viewingOrder);
                  setNewStatus(viewingOrder.status);
                  setViewingOrder(null);
                }}
                className="text-xs"
              >
                Update Status
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewingOrder(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

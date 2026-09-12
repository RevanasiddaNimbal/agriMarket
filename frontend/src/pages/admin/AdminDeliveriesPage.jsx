import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  RefreshCw,
  Search,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ShieldCheck,
  Edit,
  Package,
} from 'lucide-react';
import { adminService } from '@/services/admin/adminService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/loaders/Spinner';
import { formatDate, formatTime } from '@/utils/formatters';
import { normalizeApiError } from '@/services/api/apiErrorHandler';

export function AdminDeliveriesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  // Status Modal State
  const [statusDelivery, setStatusDelivery] = useState(null);
  const [selectedTargetStatus, setSelectedTargetStatus] = useState('SHIPPED');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadDeliveries = async () => {
    setIsLoading(true);
    try {
      const [delData, ordersData] = await Promise.all([
        adminService.getAllDeliveries(),
        adminService.getAllOrders().catch(() => []),
      ]);
      const ordersList = Array.isArray(ordersData) ? ordersData : [];
      const ordersMap = new Map(ordersList.map((o) => [o.id, o]));

      const enriched = (Array.isArray(delData) ? delData : []).map((d) => {
        const orderId = d.orderId || d.order_id;
        const matchedOrder = ordersMap.get(orderId);
        const isOtpVerified = Boolean(d.otpVerified ?? d.otp_verified);
        const status = (matchedOrder?.status || (isOtpVerified ? 'DELIVERED' : 'PROCESSING')).toUpperCase();
        const isDelivered = status === 'DELIVERED' || isOtpVerified;
        const effectiveDeliveredAt =
          d.deliveredAt ||
          d.delivered_at ||
          (isDelivered
            ? matchedOrder?.lastModifiedDate || matchedOrder?.last_modified_date || d.updatedAt || d.updated_at
            : null);

        return {
          ...d,
          order: matchedOrder,
          status,
          isDelivered,
          effectiveDeliveredAt,
        };
      });
      setDeliveries(enriched);
    } catch (err) {
      console.error('Failed to load deliveries:', err);
      const apiErr = normalizeApiError(err);
      toast.error(apiErr.message || 'Failed to load delivery dispatches.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setCurrentPage(0);
  };

  const handleFilterClick = (status) => {
    setFilterStatus(status);
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setFilterStatus('ALL');
    setCurrentPage(0);
  };

  const handleOpenStatusModal = (deliveryItem, e) => {
    e.stopPropagation();
    setStatusDelivery(deliveryItem);
    const curr = (deliveryItem.status || 'CONFIRMED').toUpperCase();
    if (curr === 'CONFIRMED') {
      setSelectedTargetStatus('PROCESSING');
    } else if (curr === 'PROCESSING') {
      setSelectedTargetStatus('SHIPPED');
    } else if (curr === 'SHIPPED') {
      setSelectedTargetStatus('OUT_FOR_DELIVERY');
    } else if (curr === 'OUT_FOR_DELIVERY') {
      setSelectedTargetStatus('DELIVERED');
    } else {
      setSelectedTargetStatus('DELIVERED');
    }
  };

  const handleConfirmStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusDelivery || !selectedTargetStatus) return;

    setIsUpdatingStatus(true);
    try {
      const deliveryId = statusDelivery.id;
      const orderId = statusDelivery.orderId || statusDelivery.order_id;
      const currentStatus = (statusDelivery.status || 'PROCESSING').toUpperCase();

      if (selectedTargetStatus === 'PROCESSING') {
        await adminService.updateOrderStatus(orderId, 'PROCESSING');
        toast.success(`Consignment #${deliveryId.slice(0, 8).toUpperCase()} moved to PROCESSING.`);
      } else if (selectedTargetStatus === 'SHIPPED') {
        if (currentStatus === 'CONFIRMED') {
          await adminService.updateOrderStatus(orderId, 'PROCESSING');
        }
        await adminService.markAsShipped(deliveryId);
        toast.success(`Consignment #${deliveryId.slice(0, 8).toUpperCase()} marked as SHIPPED.`);
      } else if (selectedTargetStatus === 'OUT_FOR_DELIVERY') {
        if (currentStatus === 'CONFIRMED') {
          await adminService.updateOrderStatus(orderId, 'PROCESSING');
          await adminService.markAsShipped(deliveryId);
        } else if (currentStatus === 'PROCESSING') {
          await adminService.markAsShipped(deliveryId);
        }
        await adminService.markAsOutForDelivery(deliveryId);
        toast.success(`Consignment #${deliveryId.slice(0, 8).toUpperCase()} marked as OUT FOR DELIVERY.`);
      } else if (selectedTargetStatus === 'DELIVERED') {
        if (currentStatus === 'CONFIRMED') {
          await adminService.updateOrderStatus(orderId, 'PROCESSING');
          await adminService.markAsShipped(deliveryId);
          await adminService.markAsOutForDelivery(deliveryId);
        } else if (currentStatus === 'PROCESSING') {
          await adminService.markAsShipped(deliveryId);
          await adminService.markAsOutForDelivery(deliveryId);
        } else if (currentStatus === 'SHIPPED') {
          await adminService.markAsOutForDelivery(deliveryId);
        }
        await adminService.updateOrderStatus(orderId, 'DELIVERED');
        toast.success(`Consignment #${deliveryId.slice(0, 8).toUpperCase()} marked as DELIVERED.`);
      }

      setStatusDelivery(null);
      await loadDeliveries();
    } catch (err) {
      console.error('Failed to update delivery status:', err);
      setStatusDelivery(null);
      const parsed = normalizeApiError(err);
      const cleanMsg =
        parsed.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Delivery status update rejected by platform governance rules.';
      toast.error(cleanMsg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Metrics calculation
  const totalCount = deliveries.length;
  const processingCount = deliveries.filter((d) =>
    ['CONFIRMED', 'PROCESSING'].includes(d.status)
  ).length;
  const inTransitCount = deliveries.filter((d) =>
    ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(d.status)
  ).length;
  const deliveredCount = deliveries.filter(
    (d) => d.isDelivered || d.status === 'DELIVERED'
  ).length;

  // Filtered deliveries list
  const filteredDeliveries = deliveries.filter((d) => {
    if (filterStatus === 'PROCESSING' && !['CONFIRMED', 'PROCESSING'].includes(d.status)) {
      return false;
    }
    if (filterStatus === 'IN_TRANSIT' && !['SHIPPED', 'OUT_FOR_DELIVERY'].includes(d.status)) {
      return false;
    }
    if (filterStatus === 'DELIVERED' && !(d.isDelivered || d.status === 'DELIVERED')) {
      return false;
    }

    if (appliedSearch) {
      const q = appliedSearch.toLowerCase();
      const idMatch = (d.id || '').toLowerCase().includes(q);
      const orderMatch = (d.orderId || d.order_id || '').toLowerCase().includes(q);
      if (!idMatch && !orderMatch) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDeliveries.length / pageSize));
  const paginatedDeliveries = filteredDeliveries.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="emerald">DELIVERED</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge variant="amber">OUT FOR DELIVERY</Badge>;
      case 'SHIPPED':
        return <Badge variant="cyan">SHIPPED</Badge>;
      case 'PROCESSING':
        return <Badge variant="purple">PROCESSING</Badge>;
      case 'CONFIRMED':
        return <Badge variant="blue">CONFIRMED</Badge>;
      case 'CANCELLED':
        return <Badge variant="rose">CANCELLED</Badge>;
      default:
        return <Badge variant="blue">{status || 'CONFIRMED'}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center flex-shrink-0 shadow-soft-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Deliveries
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              View and manage all order deliveries. Update delivery status and track progress.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isLoading}
            onClick={loadDeliveries}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Situational Metric Cards (Clickable Filter Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Dispatches */}
        <div
          onClick={() => handleFilterClick('ALL')}
          title="Click to view all dispatches"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            filterStatus === 'ALL'
              ? 'border-cyan-300 bg-cyan-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Deliveries
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {totalCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">All deliveries</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: In Processing */}
        <div
          onClick={() => handleFilterClick('PROCESSING')}
          title="Click to filter orders in hub processing"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            filterStatus === 'PROCESSING'
              ? 'border-purple-300 bg-purple-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              In Processing
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-purple-700 mt-1 tracking-tight">
              {processingCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Being prepared</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: In Transit */}
        <div
          onClick={() => handleFilterClick('IN_TRANSIT')}
          title="Click to filter consignments in transit or out for delivery"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            filterStatus === 'IN_TRANSIT'
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
            <p className="text-[10px] text-slate-400 mt-0.5">On the way</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Verified Delivered */}
        <div
          onClick={() => handleFilterClick('DELIVERED')}
          title="Click to filter delivered shipments"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            filterStatus === 'DELIVERED'
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
            <p className="text-[10px] text-slate-400 mt-0.5">Completed</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search by Delivery or Order ID */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 flex items-center">
          <input
            type="text"
            placeholder="Search by Delivery ID or Order ID... (Press Enter)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Filter Dropdown & Reset */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Filter:
            </span>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterClick(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 font-semibold"
            >
              <option value="ALL">All Deliveries</option>
              <option value="PROCESSING">In Processing</option>
              <option value="IN_TRANSIT">Shipped / Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>

          {(appliedSearch || filterStatus !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="border-slate-200 text-slate-600 hover:bg-slate-100 text-xs"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filter summary feedback badge */}
      {(appliedSearch || filterStatus !== 'ALL') && (
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <span>
            Showing {filteredDeliveries.length} of {deliveries.length} deliveries
          </span>
          <button
            onClick={handleResetFilters}
            className="text-cyan-700 hover:underline font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* 4. Deliveries Table */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner text="Loading deliveries..." />
        </div>
      ) : paginatedDeliveries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3 shadow-soft-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Deliveries Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {appliedSearch || filterStatus !== 'ALL'
              ? 'No deliveries match your search or filter.'
              : 'There are no deliveries yet.'}
          </p>
          {(appliedSearch || filterStatus !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-2 text-xs border-slate-200"
            >
              Reset All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-soft-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Delivery ID</th>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4">Delivered Date & Time</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDeliveries.map((d) => {
                  const orderId = d.orderId || d.order_id || '';
                  const createdDate = d.createdAt || d.created_at || d.order?.createdDate;
                  const deliveredAt = d.effectiveDeliveredAt;

                  return (
                    <tr
                      key={d.id}
                      onClick={() => navigate(`/admin/deliveries/${d.id}`)}
                      className="hover:bg-cyan-50/20 transition-colors group cursor-pointer"
                    >
                      {/* Delivery ID */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                          #{d.id?.substring(0, 8).toUpperCase()}
                        </span>
                      </td>

                      {/* Order Ref */}
                      <td className="py-3.5 px-4">
                        {orderId ? (
                          <Link
                            to={`/admin/orders/${orderId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-mono text-xs font-semibold text-slate-700 hover:text-purple-700 hover:underline flex items-center gap-1"
                            title="View order in orders monitoring"
                          >
                            #{orderId.substring(0, 8).toUpperCase()}
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(d.status)}
                      </td>

                      {/* Dispatched / Created */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {createdDate ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 text-xs">
                              {formatDate(createdDate, false)}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {formatTime(createdDate)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Delivered At */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {deliveredAt ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-emerald-700 text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {formatDate(deliveredAt, false)}
                            </span>
                            <span className="text-[11px] text-emerald-600 font-bold">
                              {formatTime(deliveredAt)}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {d.status === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : d.status === 'SHIPPED' ? 'In Transit' : 'Pending'}
                          </span>
                        )}
                      </td>

                      {/* Dispatch Progression Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!d.isDelivered && d.status !== 'DELIVERED' ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={Edit}
                              className="text-xs font-semibold px-2.5 shadow-soft-xs"
                              onClick={(e) => handleOpenStatusModal(d, e)}
                            >
                              Status
                            </Button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 px-2 py-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Delivered
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 5. Pagination Bar */}
          {totalPages > 1 && (
            <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                Showing <span className="font-semibold text-slate-900">{currentPage * pageSize + 1}</span> to{' '}
                <span className="font-semibold text-slate-900">
                  {Math.min((currentPage + 1) * pageSize, filteredDeliveries.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-900">{filteredDeliveries.length}</span> dispatches
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-2.5 py-1 text-xs border-slate-200 text-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                </Button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter((page) => {
                      return (
                        page === 0 ||
                        page === totalPages - 1 ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      const hasGap = prev !== undefined && page - prev > 1;

                      return (
                        <React.Fragment key={page}>
                          {hasGap && <span className="px-1 text-slate-400">...</span>}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                              currentPage === page
                                ? 'bg-cyan-700 text-white'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {page + 1}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-2.5 py-1 text-xs border-slate-200 text-slate-700 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Update Dispatch Status Modal */}
      {statusDelivery && (
        <Modal
          isOpen={Boolean(statusDelivery)}
          onClose={() => !isUpdatingStatus && setStatusDelivery(null)}
          title="Update Dispatch Status"
          size="sm"
        >
          <form onSubmit={handleConfirmStatusUpdate} className="space-y-4">
            <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 font-medium">
                Consignment #{statusDelivery.id.slice(0, 8).toUpperCase()}
              </span>
              <div>{getStatusBadge(statusDelivery.status)}</div>
            </div>

            <p className="text-xs text-slate-500">
              Select the next status for this delivery.
            </p>

            <div className="space-y-2">
              {/* Option: PROCESSING (If confirmed) */}
              {statusDelivery.status === 'CONFIRMED' && (
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTargetStatus === 'PROCESSING'
                      ? 'border-purple-400 bg-purple-50/50 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="tableDeliveryStatus"
                    value="PROCESSING"
                    checked={selectedTargetStatus === 'PROCESSING'}
                    onChange={(e) => setSelectedTargetStatus(e.target.value)}
                    className="mt-0.5 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Mark as Processing
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Order is being packed and prepared for dispatch.
                    </span>
                  </div>
                </label>
              )}

              {/* Option: SHIPPED (If confirmed or processing) */}
              {['CONFIRMED', 'PROCESSING'].includes(statusDelivery.status) && (
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTargetStatus === 'SHIPPED'
                      ? 'border-cyan-400 bg-cyan-50/50 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="tableDeliveryStatus"
                    value="SHIPPED"
                    checked={selectedTargetStatus === 'SHIPPED'}
                    onChange={(e) => setSelectedTargetStatus(e.target.value)}
                    className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Mark as Shipped
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Package has been handed over to the delivery carrier.
                    </span>
                  </div>
                </label>
              )}

              {/* Option: OUT_FOR_DELIVERY (If shipped or before) */}
              {['CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(statusDelivery.status) && (
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTargetStatus === 'OUT_FOR_DELIVERY'
                      ? 'border-cyan-400 bg-cyan-50/50 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="tableDeliveryStatus"
                    value="OUT_FOR_DELIVERY"
                    checked={selectedTargetStatus === 'OUT_FOR_DELIVERY'}
                    onChange={(e) => setSelectedTargetStatus(e.target.value)}
                    className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Mark as Out for Delivery
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Carrier is on the way to deliver to the customer.
                    </span>
                  </div>
                </label>
              )}

              {/* Option: DELIVERED */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedTargetStatus === 'DELIVERED'
                    ? 'border-emerald-400 bg-emerald-50/50 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="tableDeliveryStatus"
                  value="DELIVERED"
                  checked={selectedTargetStatus === 'DELIVERED'}
                  onChange={(e) => setSelectedTargetStatus(e.target.value)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Mark as Delivered
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Order has been delivered to the customer.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => setStatusDelivery(null)}
                className="border-slate-200 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={isUpdatingStatus}
                className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs"
              >
                Confirm Update
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

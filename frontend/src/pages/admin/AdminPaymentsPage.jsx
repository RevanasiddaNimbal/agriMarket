import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  RefreshCw,
  Search,
  X,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
} from 'lucide-react';
import { adminService } from '@/services/admin/adminService';
import { paymentService } from '@/services/payment/paymentService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';
import { normalizeApiError } from '@/services/api/apiErrorHandler';

export function AdminPaymentsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  // Modals state
  const [viewingPayment, setViewingPayment] = useState(null);
  const [refundingPayment, setRefundingPayment] = useState(null);
  const [isRefunding, setIsRefunding] = useState(false);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load payments:', err);
      const apiErr = normalizeApiError(err);
      toast.error(apiErr.message || 'Failed to load payment records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
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

  const handleCardClick = (statusKey) => {
    setFilterStatus(statusKey);
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setFilterStatus('ALL');
    setFilterMethod('ALL');
    setCurrentPage(0);
  };

  // Refund handler
  const handleConfirmRefund = async () => {
    if (!refundingPayment) return;
    const paymentToRefund = refundingPayment;
    setIsRefunding(true);

    try {
      await paymentService.refundPayment(paymentToRefund.orderId);
      toast.success(`Refund processed successfully for order #${paymentToRefund.orderId.substring(0, 8)}.`);

      // Optimistically update
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentToRefund.id
            ? { ...p, status: 'REFUNDED', refundedAt: new Date().toISOString() }
            : p
        )
      );
      setRefundingPayment(null);
      await loadPayments();
    } catch (err) {
      console.error('Failed to refund payment:', err);
      const apiErr = normalizeApiError(err);
      // Immediately close modal and show concise rule message
      setRefundingPayment(null);
      toast.error(apiErr.message || 'Refund could not be processed.');
    } finally {
      setIsRefunding(false);
    }
  };

  // Telemetry metrics
  const totalCount = payments.length;
  const successCount = payments.filter((p) => p.status === 'SUCCESS').length;
  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
  const refundedCount = payments.filter(
    (p) => p.status === 'REFUNDED' || Boolean(p.refundedAt)
  ).length;

  const totalSettledAmount = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Filtered payments list
  const filteredPayments = payments.filter((p) => {
    const pStatus = (p.status || '').toUpperCase();
    const pMethod = (p.paymentMethod || '').toUpperCase();

    // Status filter
    if (filterStatus !== 'ALL' && pStatus !== filterStatus) return false;

    // Method filter
    if (filterMethod !== 'ALL' && pMethod !== filterMethod) return false;

    // Search query
    if (appliedSearch) {
      const q = appliedSearch.toLowerCase();
      const idMatch = (p.id || '').toLowerCase().includes(q);
      const orderMatch = (p.orderId || '').toLowerCase().includes(q);
      const provMatch = (p.providerPaymentId || p.provider || '').toLowerCase().includes(q);
      if (!idMatch && !orderMatch && !provMatch) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const paginatedPayments = filteredPayments.slice(
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
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-soft-xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Payments & Settlement Logs
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervise payment settlements, gateway statuses, disbursement balances, and customer refunds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isLoading}
            onClick={loadPayments}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* 2. Situational Clickable Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Payments */}
        <div
          onClick={() => handleCardClick('ALL')}
          title="Click to view all payments"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            filterStatus === 'ALL'
              ? 'border-purple-300 bg-purple-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Payments
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {totalCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">All logged orders</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Settled / Success */}
        <div
          onClick={() => handleCardClick('SUCCESS')}
          title="Click to filter settled & successful payments"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            filterStatus === 'SUCCESS'
              ? 'border-emerald-300 bg-emerald-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Settled / Success
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 tracking-tight">
              {successCount}
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              {formatCurrency(totalSettledAmount)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Pending Payments */}
        <div
          onClick={() => handleCardClick('PENDING')}
          title="Click to filter pending payments"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            filterStatus === 'PENDING'
              ? 'border-amber-300 bg-amber-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending Payments
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-700 mt-1 tracking-tight">
              {pendingCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Awaiting capture</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Refunded */}
        <div
          onClick={() => handleCardClick('REFUNDED')}
          title="Click to filter refunded payments"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            filterStatus === 'REFUNDED'
              ? 'border-rose-300 bg-rose-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Refunded
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-rose-700 mt-1 tracking-tight">
              {refundedCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Processed refunds</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center flex-shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 flex items-center">
          <input
            type="text"
            placeholder="Search by Payment ID, Order ID, or Provider... (Press Enter)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 transition-colors"
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

        {/* Filters & Reset */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Method:
            </span>
            <select
              value={filterMethod}
              onChange={(e) => {
                setFilterMethod(e.target.value);
                setCurrentPage(0);
              }}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-semibold"
            >
              <option value="ALL">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="COD">Cash on Delivery</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Status:
            </span>
            <select
              value={filterStatus}
              onChange={(e) => handleCardClick(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="REFUNDED">Refunded</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {(appliedSearch || filterStatus !== 'ALL' || filterMethod !== 'ALL') && (
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

      {/* Filter summary feedback */}
      {(appliedSearch || filterStatus !== 'ALL' || filterMethod !== 'ALL') && (
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <span>
            Showing <strong className="text-slate-900">{filteredPayments.length}</strong> of{' '}
            <strong>{payments.length}</strong> payments
            {filterStatus !== 'ALL' && (
              <span className="ml-1 text-emerald-700 font-semibold">
                (Status: {filterStatus})
              </span>
            )}
            {filterMethod !== 'ALL' && (
              <span className="ml-1 text-purple-700 font-semibold">
                (Method: {filterMethod})
              </span>
            )}
            {appliedSearch && (
              <span className="ml-1 text-slate-700">
                (Search: &quot;{appliedSearch}&quot;)
              </span>
            )}
          </span>
          <button
            onClick={handleResetFilters}
            className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* 4. Material Data Table */}
      {isLoading ? (
        <div className="py-16 flex justify-center bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs">
          <Spinner text="Loading payment settlement logs..." />
        </div>
      ) : paginatedPayments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Payments Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {appliedSearch || filterStatus !== 'ALL' || filterMethod !== 'ALL'
              ? 'No payment settlement records match your search query or filter selection.'
              : 'There are currently no payment transactions recorded on the platform.'}
          </p>
          {(appliedSearch || filterStatus !== 'ALL' || filterMethod !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="border-slate-200 text-xs mt-2"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Payment ID</th>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPayments.map((p) => {
                  const pDate =
                    p.paidAt ||
                    p.paid_at ||
                    p.createdDate ||
                    p.created_date ||
                    p.createdAt ||
                    p.refundedAt ||
                    p.date;

                  const canRefund = p.status === 'SUCCESS';

                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/admin/payments/${p.id}`)}
                      className="hover:bg-emerald-50/20 transition-colors group cursor-pointer"
                    >
                      {/* Payment ID */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          #{p.id?.substring(0, 8).toUpperCase()}
                        </span>
                      </td>

                      {/* Order Ref */}
                      <td className="py-3.5 px-4">
                        {p.orderId ? (
                          <Link
                            to={`/admin/orders/${p.orderId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-mono text-xs font-semibold text-slate-700 hover:text-purple-700 hover:underline"
                            title="View order in orders monitoring"
                          >
                            #{p.orderId.substring(0, 8).toUpperCase()}
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {p.paymentMethod || 'ONLINE'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 tracking-tight text-xs sm:text-sm">
                        {formatCurrency(p.amount)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            p.status === 'SUCCESS'
                              ? 'emerald'
                              : p.status === 'FAILED'
                              ? 'rose'
                              : p.status === 'REFUNDED'
                              ? 'purple'
                              : 'amber'
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {pDate ? (
                          <div className="flex flex-col items-center justify-center">
                            <span className="font-semibold text-slate-800 text-xs">
                              {formatDate(pDate, false)}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {formatTime(pDate)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canRefund && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRefundingPayment(p);
                              }}
                              className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50 px-2.5 py-1 font-semibold"
                              title="Process order payment refund"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Refund
                            </Button>
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
                  {Math.min((currentPage + 1) * pageSize, filteredPayments.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-900">{filteredPayments.length}</span> records
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
                            type="button"
                            onClick={() => handlePageChange(page)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                              currentPage === page
                                ? 'bg-emerald-700 text-white shadow-2xs'
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

      {/* 6. View Payment Details Modal */}
      {viewingPayment && (
        <Modal
          isOpen={true}
          onClose={() => setViewingPayment(null)}
          title="Payment Audit Details"
          description={`Payment Ref #${viewingPayment.id?.slice(0, 8).toUpperCase()} • Settled via Platform Gateway`}
          size="md"
        >
          <div className="space-y-4 text-xs sm:text-sm text-slate-800">
            {/* Top Financial Breakdown Card */}
            <div
              className={`p-4 rounded-2xl border shadow-soft-xs flex items-center justify-between gap-3 ${
                viewingPayment.status === 'SUCCESS'
                  ? 'bg-emerald-50/50 border-emerald-100'
                  : viewingPayment.status === 'REFUNDED'
                  ? 'bg-purple-50/50 border-purple-100'
                  : viewingPayment.status === 'FAILED'
                  ? 'bg-rose-50/50 border-rose-100'
                  : 'bg-amber-50/50 border-amber-100'
              }`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Gross Settlement Amount
                </span>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(viewingPayment.amount)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                  {viewingPayment.paidAt
                    ? `Paid on ${formatDate(viewingPayment.paidAt, true)}`
                    : 'Awaiting Settlement Clearance'}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Status
                </span>
                <Badge
                  variant={
                    viewingPayment.status === 'SUCCESS'
                      ? 'emerald'
                      : viewingPayment.status === 'FAILED'
                      ? 'rose'
                      : viewingPayment.status === 'REFUNDED'
                      ? 'purple'
                      : 'amber'
                  }
                >
                  {viewingPayment.status}
                </Badge>
              </div>
            </div>

            {/* Structured Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Payment Method & Gateway Provider */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Payment Method & Gateway
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-soft-xs text-emerald-600">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {viewingPayment.paymentMethod || 'ONLINE'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {viewingPayment.provider || 'Platform Gateway'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Consignment Order */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Associated Consignment
                </span>
                {viewingPayment.orderId ? (
                  <Link
                    to="/admin/orders"
                    onClick={() => setViewingPayment(null)}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-colors group shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-purple-700 block truncate">
                          Order #{viewingPayment.orderId.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          View in Orders
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 shrink-0" />
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">No order linked</span>
                )}
              </div>
            </div>

            {/* Refund Notification Banner if refunded */}
            {viewingPayment.refundedAt && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200/80 flex items-center justify-between text-xs text-rose-900">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Refund Reversed & Disbursed</span>
                    <span className="text-[11px] text-rose-600 font-medium">
                      Processed on {formatDate(viewingPayment.refundedAt, true)}
                    </span>
                  </div>
                </div>
                <span className="font-mono font-black text-xs text-rose-700">
                  -{formatCurrency(viewingPayment.amount)}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {viewingPayment.status === 'SUCCESS' && !viewingPayment.refundedAt ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const target = viewingPayment;
                    setViewingPayment(null);
                    setRefundingPayment(target);
                  }}
                  className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Refund Payment
                </Button>
              ) : (
                <div />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingPayment(null)}
                className="border-slate-200 text-xs"
              >
                Close Record
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Process Refund Modal (Clean confirmation, closes immediately on rule violation) */}
      {refundingPayment && (
        <Modal
          isOpen={true}
          onClose={() => !isRefunding && setRefundingPayment(null)}
          title="Confirm Payment Refund"
          size="sm"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-900">
              <RotateCcw className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Authorize Full Order Refund</p>
                <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                  You are initiating a refund of{' '}
                  <strong className="font-black text-rose-900">
                    {formatCurrency(refundingPayment.amount)}
                  </strong>{' '}
                  for Order #{refundingPayment.orderId?.substring(0, 8)}.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payment ID:</span>
                <span className="font-mono font-semibold text-slate-800">
                  #{refundingPayment.id?.substring(0, 10)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Refund Method:</span>
                <span className="font-semibold text-slate-800">Original Payment Source</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={isRefunding}
                onClick={() => setRefundingPayment(null)}
                className="border-slate-200 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                loading={isRefunding}
                onClick={handleConfirmRefund}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Confirm Refund
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

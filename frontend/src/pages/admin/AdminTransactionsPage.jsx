import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign,
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
  CreditCard,
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
} from 'lucide-react';
import { adminService } from '@/services/admin/adminService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';
import { normalizeApiError } from '@/services/api/apiErrorHandler';

export function AdminTransactionsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  // View modal state
  const [viewingTx, setViewingTx] = useState(null);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      const apiErr = normalizeApiError(err);
      toast.error(apiErr.message || 'Failed to load transaction ledger.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
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

  const handleCardClick = (filterKey) => {
    setSelectedFilter(filterKey);
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setSelectedFilter('ALL');
    setSelectedType('ALL');
    setCurrentPage(0);
  };

  // Telemetry metric counts
  const totalCount = transactions.length;
  const successCount = transactions.filter((t) => t.status === 'SUCCESS').length;
  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;
  const refundCount = transactions.filter(
    (t) =>
      t.status === 'REFUNDED' ||
      t.transactionType === 'REFUND' ||
      t.type === 'REFUND'
  ).length;

  const totalVolume = transactions
    .filter((t) => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Filtered transactions list
  const filteredTransactions = transactions.filter((tx) => {
    const txType = (tx.transactionType || tx.type || '').toUpperCase();
    const txStatus = (tx.status || '').toUpperCase();

    // Metric card filter
    if (selectedFilter === 'SUCCESS' && txStatus !== 'SUCCESS') return false;
    if (selectedFilter === 'PENDING' && txStatus !== 'PENDING') return false;
    if (
      selectedFilter === 'REFUND' &&
      txType !== 'REFUND' &&
      txStatus !== 'REFUNDED'
    )
      return false;

    // Type filter dropdown
    if (selectedType !== 'ALL' && txType !== selectedType) return false;

    // Search query
    if (appliedSearch) {
      const q = appliedSearch.toLowerCase();
      const idMatch = (tx.id || '').toLowerCase().includes(q);
      const orderMatch = (tx.orderId || tx.order_id || '').toLowerCase().includes(q);
      const paymentMatch = (tx.paymentId || tx.payment_id || '').toLowerCase().includes(q);
      const provMatch = (tx.providerTransactionId || tx.provider || '').toLowerCase().includes(q);
      if (!idMatch && !orderMatch && !paymentMatch && !provMatch) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = filteredTransactions.slice(
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
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Platform Transaction Ledger
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive audit trail of platform financial debits, payments, settlements, and refund logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isLoading}
            onClick={loadTransactions}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Refresh Ledger
          </Button>
        </div>
      </div>

      {/* 2. Clickable Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Records */}
        <div
          onClick={() => handleCardClick('ALL')}
          title="Click to view all transactions"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedFilter === 'ALL'
              ? 'border-purple-300 bg-purple-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Records
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {totalCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Vol: {formatCurrency(totalVolume)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Successful Transactions */}
        <div
          onClick={() => handleCardClick('SUCCESS')}
          title="Click to filter successful transactions"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedFilter === 'SUCCESS'
              ? 'border-emerald-300 bg-emerald-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Successful
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 tracking-tight">
              {successCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Settled entries</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Pending Transactions */}
        <div
          onClick={() => handleCardClick('PENDING')}
          title="Click to filter pending transactions"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedFilter === 'PENDING'
              ? 'border-amber-300 bg-amber-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-700 mt-1 tracking-tight">
              {pendingCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Awaiting gateway</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Refunds & Reversals */}
        <div
          onClick={() => handleCardClick('REFUND')}
          title="Click to filter refunds and reversals"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedFilter === 'REFUND'
              ? 'border-rose-300 bg-rose-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Refunds / Reversals
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-rose-700 mt-1 tracking-tight">
              {refundCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Reversed orders</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center flex-shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 flex items-center">
          <input
            type="text"
            placeholder="Search by Txn ID, Order ID, or Provider... (Press Enter)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 transition-colors"
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
              Type:
            </span>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(0);
              }}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 font-semibold"
            >
              <option value="ALL">All Types</option>
              <option value="PAYMENT">Payment</option>
              <option value="REFUND">Refund</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Status:
            </span>
            <select
              value={selectedFilter}
              onChange={(e) => handleCardClick(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="REFUND">Refund</option>
            </select>
          </div>

          {(appliedSearch || selectedFilter !== 'ALL' || selectedType !== 'ALL') && (
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
      {(appliedSearch || selectedFilter !== 'ALL' || selectedType !== 'ALL') && (
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <span>
            Showing <strong className="text-slate-900">{filteredTransactions.length}</strong> of{' '}
            <strong>{transactions.length}</strong> transactions
            {selectedFilter !== 'ALL' && (
              <span className="ml-1 text-purple-700 font-semibold">
                (Status: {selectedFilter})
              </span>
            )}
            {selectedType !== 'ALL' && (
              <span className="ml-1 text-indigo-700 font-semibold">
                (Type: {selectedType})
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
            className="text-purple-700 hover:text-purple-800 font-semibold underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* 4. Material Data Table */}
      {isLoading ? (
        <div className="py-16 flex justify-center bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs">
          <Spinner text="Loading transaction records..." />
        </div>
      ) : paginatedTransactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Transactions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {appliedSearch || selectedFilter !== 'ALL' || selectedType !== 'ALL'
              ? 'No transaction records match your search query or filter selection.'
              : 'There are currently no transaction ledger entries recorded on the platform.'}
          </p>
          {(appliedSearch || selectedFilter !== 'ALL' || selectedType !== 'ALL') && (
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
                  <th className="py-3.5 px-4 sm:px-6">Transaction ID</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Related Order</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTransactions.map((tx) => {
                  const txType = (tx.transactionType || tx.type || 'PAYMENT').toUpperCase();
                  const txDate =
                    tx.createdDate ||
                    tx.created_date ||
                    tx.createdAt ||
                    tx.created_at ||
                    tx.timestamp ||
                    tx.paidAt ||
                    tx.paid_at ||
                    tx.date;

                  const isRefund = txType === 'REFUND';

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => navigate(`/admin/transactions/${tx.id}`)}
                      className="hover:bg-purple-50/20 transition-colors group cursor-pointer"
                    >
                      {/* Transaction ID */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                          #{tx.id?.substring(0, 8).toUpperCase()}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                            isRefund
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isRefund ? (
                            <RotateCcw className="w-2.5 h-2.5 text-rose-600" />
                          ) : (
                            <CreditCard className="w-2.5 h-2.5 text-emerald-600" />
                          )}
                          {txType}
                        </span>
                      </td>

                      {/* Related Order */}
                      <td className="py-3.5 px-4">
                        {tx.orderId || tx.order_id ? (
                          <Link
                            to={`/admin/orders/${tx.orderId || tx.order_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700 hover:text-purple-700 hover:underline"
                            title="View order in order monitoring"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                            <span>#{(tx.orderId || tx.order_id).substring(0, 8).toUpperCase()}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-black tracking-tight text-xs sm:text-sm ${
                            isRefund ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {isRefund ? '-' : ''}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            tx.status === 'SUCCESS'
                              ? 'emerald'
                              : tx.status === 'FAILED'
                              ? 'rose'
                              : tx.status === 'REFUNDED'
                              ? 'purple'
                              : 'amber'
                          }
                        >
                          {tx.status}
                        </Badge>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {txDate ? (
                          <div className="flex flex-col items-center justify-center">
                            <span className="font-semibold text-slate-800 text-xs">
                              {formatDate(txDate, false)}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {formatTime(txDate)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors ml-auto" />
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
                  {Math.min((currentPage + 1) * pageSize, filteredTransactions.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-900">{filteredTransactions.length}</span> records
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
                                ? 'bg-purple-700 text-white shadow-2xs'
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

      {/* 6. View Transaction Audit Modal */}
      {viewingTx && (() => {
        const txType = (viewingTx.transactionType || viewingTx.type || 'PAYMENT').toUpperCase();
        const isRefund = txType === 'REFUND';
        const orderId = viewingTx.orderId || viewingTx.order_id;
        const paymentId = viewingTx.paymentId || viewingTx.payment_id;
        const txDate =
          viewingTx.createdDate ||
          viewingTx.created_date ||
          viewingTx.createdAt ||
          viewingTx.created_at ||
          viewingTx.timestamp ||
          viewingTx.paidAt ||
          viewingTx.paid_at ||
          viewingTx.date;

        return (
          <Modal
            isOpen={true}
            onClose={() => setViewingTx(null)}
            title="Transaction Audit Details"
            description={`Ledger Reference #${viewingTx.id?.slice(0, 8).toUpperCase()} • Recorded ${
              txDate ? formatDate(txDate, true) : 'N/A'
            }`}
            size="md"
          >
            <div className="space-y-4 text-xs sm:text-sm text-slate-800">
              {/* Top Financial Breakdown Card */}
              <div
                className={`p-4 rounded-2xl border shadow-soft-xs flex items-center justify-between gap-3 ${
                  isRefund
                    ? 'bg-rose-50/50 border-rose-100'
                    : 'bg-purple-50/50 border-purple-100'
                }`}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    Ledger Movement Amount
                  </span>
                  <span
                    className={`text-xl font-black tracking-tight ${
                      isRefund ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {isRefund ? '-' : ''}
                    {formatCurrency(viewingTx.amount)}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                    {txDate ? `Settled on ${formatDate(txDate, true)}` : 'Recorded in platform ledger'}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                      isRefund
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isRefund ? (
                      <RotateCcw className="w-2.5 h-2.5 text-rose-600" />
                    ) : (
                      <CreditCard className="w-2.5 h-2.5 text-emerald-600" />
                    )}
                    {txType}
                  </span>
                  <Badge
                    variant={
                      viewingTx.status === 'SUCCESS'
                        ? 'emerald'
                        : viewingTx.status === 'FAILED'
                        ? 'rose'
                        : viewingTx.status === 'REFUNDED'
                        ? 'purple'
                        : 'amber'
                    }
                  >
                    {viewingTx.status}
                  </Badge>
                </div>
              </div>

              {/* Structured Linked Records */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Platform Linked Records */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    Platform References
                  </span>

                  {orderId ? (
                    <Link
                      to="/admin/orders"
                      onClick={() => setViewingTx(null)}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-colors group shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-purple-700 block truncate">
                            Order #{orderId.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Consignment
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 shrink-0" />
                    </Link>
                  ) : null}

                  {paymentId ? (
                    <Link
                      to="/admin/payments"
                      onClick={() => setViewingTx(null)}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors group shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-emerald-700 block truncate">
                            Payment #{paymentId.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Settlement
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                    </Link>
                  ) : null}

                  {!orderId && !paymentId && (
                    <span className="text-xs text-slate-400 font-medium block pt-1">
                      Direct ledger transaction
                    </span>
                  )}
                </div>

                {/* Gateway Execution Details */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    Gateway & Nature
                  </span>
                  <div className="space-y-1.5 pt-0.5">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Gateway Channel
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {viewingTx.provider || 'Platform Pay Gateway'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Movement Type
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {isRefund
                          ? 'Settlement Reversal (Debit)'
                          : 'Settlement Clearance (Credit)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingTx(null)}
                  className="border-slate-200 text-xs"
                >
                  Close Audit Record
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

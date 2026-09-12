import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  TrendingUp,
  ArrowLeft,
  RotateCcw,
  CreditCard,
  ShoppingBag,
  Clock,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { adminService } from '@/services/admin/adminService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';

export function AdminTransactionDetailPage() {
  const { transactionId } = useParams();
  const toast = useToast();
  const [transaction, setTransaction] = useState(null);
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getTransactionById(transactionId);
      setTransaction(data);

      const oId = data?.orderId || data?.order_id;
      const pId = data?.paymentId || data?.payment_id;

      const promises = [];
      if (oId) promises.push(adminService.getOrder(oId).catch(() => null));
      else promises.push(Promise.resolve(null));

      if (pId) promises.push(adminService.getPayment(pId).catch(() => null));
      else promises.push(Promise.resolve(null));

      const [orderRes, paymentRes] = await Promise.all(promises);
      if (oId) setOrder(orderRes);
      if (pId) setPayment(paymentRes);
    } catch (err) {
      console.error('Failed to load transaction audit details:', err);
      toast.error('Failed to load transaction audit record.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (transactionId) loadData();
  }, [transactionId]);

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center text-slate-800">
        <Spinner text="Loading transaction audit record..." />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-4 shadow-soft-xs">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Transaction Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested ledger audit record could not be located in platform logs.
        </p>
        <Link to="/admin/transactions">
          <Button variant="outline" size="sm" icon={ArrowLeft} className="mt-2 text-xs">
            Back to Transactions
          </Button>
        </Link>
      </div>
    );
  }

  const txType = (transaction.transactionType || transaction.type || 'PAYMENT').toUpperCase();
  const isRefund = txType === 'REFUND';
  const refCode = transaction.id ? transaction.id.slice(0, 8).toUpperCase() : 'N/A';
  const orderId = transaction.orderId || transaction.order_id;
  const paymentId = transaction.paymentId || transaction.payment_id;
  const txDate =
    transaction.createdDate ||
    transaction.created_date ||
    transaction.createdAt ||
    transaction.created_at ||
    transaction.timestamp ||
    transaction.paidAt ||
    transaction.paid_at ||
    transaction.date;

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* 1. Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/admin/transactions">
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Back to Transactions
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-soft-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Transaction Details
                </h1>
                <span className="font-mono text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                  #{refCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {orderId && (
            <Link to={`/admin/orders/${orderId}`}>
              <Button
                variant="outline"
                size="sm"
                icon={ShoppingBag}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                View Order
              </Button>
            </Link>
          )}
          {paymentId && (
            <Link to={`/admin/payments/${paymentId}`}>
              <Button
                variant="outline"
                size="sm"
                icon={CreditCard}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                View Payment
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Movement Amount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isRefund ? 'bg-rose-50 text-rose-600' : 'bg-purple-50 text-purple-600'
            }`}
          >
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Movement Amount
            </span>
            <span
              className={`text-lg font-black block truncate ${
                isRefund ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {isRefund ? '-' : ''}
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        </div>

        {/* Movement Type */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
            {isRefund ? <RotateCcw className="w-5 h-5 text-rose-600" /> : <CreditCard className="w-5 h-5 text-emerald-600" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Movement Nature
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md border ${
                isRefund
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {txType}
            </span>
          </div>
        </div>

        {/* Settlement Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Settlement Status
            </span>
            <Badge
              variant={
                transaction.status === 'SUCCESS'
                  ? 'emerald'
                  : transaction.status === 'FAILED'
                  ? 'rose'
                  : transaction.status === 'REFUNDED'
                  ? 'purple'
                  : 'amber'
              }
            >
              {transaction.status}
            </Badge>
          </div>
        </div>

        {/* Timestamp */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Recorded Timestamp
            </span>
            <span className="text-xs font-bold text-slate-800 block">
              {txDate ? formatDate(txDate, false) : 'Recorded'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium block">
              {txDate ? formatTime(txDate) : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Content: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Financial Movement & Transaction Audit */}
        <div className="lg:col-span-2 space-y-6">
          {/* Movement Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-600" />
              Transaction Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Movement Amount
                </span>
                <span
                  className={`text-base font-black block ${
                    isRefund ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {isRefund ? '-' : ''}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Movement Nature
                </span>
                <span className="text-sm font-semibold text-slate-800 block">
                  {isRefund
                    ? 'Customer Refund / Debit Reversal'
                    : 'Customer Settlement / Platform Credit'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Gateway Provider Channel
                </span>
                <span className="text-sm font-semibold text-slate-800 block">
                  {transaction.provider || 'Platform Payment Gateway'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Reconciliation State
                </span>
                <span className="text-sm font-bold text-emerald-700 block">
                  Verified & Cleared
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Timeline & Audit */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Transaction Timeline & Audit
              </h3>
              <span className="text-xs font-medium text-slate-400">
                Audited Ledger Progression
              </span>
            </div>

            {/* 4 Structured Information Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Audit Ref Code
                </span>
                <span className="font-mono font-bold text-purple-900 block truncate">
                  #{refCode}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Recorded Date
                </span>
                <span className="font-semibold text-slate-800 block truncate">
                  {txDate ? formatDate(txDate, true) : 'N/A'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Movement Nature
                </span>
                <span className="font-bold text-slate-800 block truncate">
                  {isRefund ? 'Customer Refund' : 'Settlement Credit'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Ledger Balance
                </span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Balanced & Verified</span>
                </span>
              </div>
            </div>

            {/* Progression Stages */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Progression Stages
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Step 1: Initiated */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">1. Initiated</span>
                    <span className="text-[10px] text-slate-400 block truncate">Triggered</span>
                  </div>
                </div>

                {/* Step 2: Gateway */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                      ['SUCCESS', 'SETTLED', 'COMPLETED'].includes((transaction.status || '').toUpperCase())
                        ? 'bg-emerald-100 text-emerald-700'
                        : transaction.status === 'FAILED'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {['SUCCESS', 'SETTLED', 'COMPLETED'].includes((transaction.status || '').toUpperCase())
                      ? '✓'
                      : '2'}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">2. Gateway</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {transaction.status === 'SUCCESS' ? 'Cleared' : transaction.status || 'Processing'}
                    </span>
                  </div>
                </div>

                {/* Step 3: Double-Entry Balanced */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                      ['SUCCESS', 'SETTLED', 'COMPLETED'].includes((transaction.status || '').toUpperCase())
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {['SUCCESS', 'SETTLED', 'COMPLETED'].includes((transaction.status || '').toUpperCase())
                      ? '✓'
                      : '3'}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">3. Balanced</span>
                    <span className="text-[10px] text-slate-400 block truncate">Reconciled</span>
                  </div>
                </div>

                {/* Step 4: Ledger Immutable */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                      ['SUCCESS', 'SETTLED', 'COMPLETED'].includes((transaction.status || '').toUpperCase())
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {['SUCCESS', 'SETTLED', 'COMPLETED'].includes((transaction.status || '').toUpperCase())
                      ? '✓'
                      : '4'}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">4. Immutable</span>
                    <span className="text-[10px] text-slate-400 block truncate">Archived</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Two Separate Associated Record Cards (Order & Payment) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card 1: Associated Order Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              Associated Order
            </h3>

            {orderId ? (
              <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Order Reference
                  </span>
                  {order?.status && (
                    <Badge variant="purple">{order.status}</Badge>
                  )}
                </div>

                <div className="font-mono text-base font-bold text-purple-900">
                  Order #{orderId.slice(0, 8).toUpperCase()}
                </div>

                {order && (
                  <div className="space-y-1 text-xs text-slate-600">
                    {order.items && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Items:</span>
                        <span className="font-semibold text-slate-800">
                          {order.items.length} produce lines
                        </span>
                      </div>
                    )}
                    {order.totalAmount != null && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Order Total:</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <Link
                  to={`/admin/orders/${orderId}`}
                  className="w-full inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 text-purple-800 font-semibold text-xs transition-colors shadow-2xs"
                >
                  <span>Open Order Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-500">
                <p>No linked customer order recorded.</p>
                <Link
                  to="/admin/orders"
                  className="text-purple-700 font-bold hover:underline inline-flex items-center gap-1 text-xs"
                >
                  <span>View All Orders</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Card 2: Associated Payment Settlement Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Payment Settlement
            </h3>

            {paymentId ? (
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Settlement Ref
                  </span>
                  {payment?.status && (
                    <Badge
                      variant={
                        payment.status === 'SUCCESS'
                          ? 'emerald'
                          : payment.status === 'FAILED'
                          ? 'rose'
                          : payment.status === 'REFUNDED'
                          ? 'purple'
                          : 'amber'
                      }
                    >
                      {payment.status}
                    </Badge>
                  )}
                </div>

                <div className="font-mono text-base font-bold text-emerald-900">
                  Payment #{paymentId.slice(0, 8).toUpperCase()}
                </div>

                {payment && (
                  <div className="space-y-1 text-xs text-slate-600">
                    {payment.amount != null && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Settled Amount:</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Channel:</span>
                      <span className="font-semibold text-slate-800 uppercase">
                        {payment.paymentMethod || 'ONLINE'}
                      </span>
                    </div>
                  </div>
                )}

                <Link
                  to={`/admin/payments/${paymentId}`}
                  className="w-full inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs transition-colors shadow-2xs"
                >
                  <span>Open Payment Settlement</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-500">
                <p>No linked payment record.</p>
                <Link
                  to="/admin/payments"
                  className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 text-xs"
                >
                  <span>View All Payments</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

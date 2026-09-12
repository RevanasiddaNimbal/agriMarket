import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
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

export function AdminPaymentDetailPage() {
  const { paymentId } = useParams();
  const toast = useToast();
  const [payment, setPayment] = useState(null);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const pData = await adminService.getPayment(paymentId);
      setPayment(pData);

      const targetOrderId = pData?.orderId || pData?.order_id;
      if (targetOrderId) {
        const orderRes = await adminService.getOrder(targetOrderId).catch(() => null);
        setOrder(orderRes);
      }
    } catch (err) {
      console.error('Failed to load payment details:', err);
      toast.error('Failed to load payment settlement details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (paymentId) loadData();
  }, [paymentId]);

  const handleConfirmRefund = async () => {
    const targetOrderId = payment?.orderId || payment?.order_id;
    if (!targetOrderId) {
      toast.error('Associated Order ID is missing for this payment.');
      return;
    }

    setIsRefunding(true);
    try {
      await paymentService.refundPayment(targetOrderId);
      setIsRefundModalOpen(false);
      toast.success('Payment refund successfully processed.');
      await loadData();
    } catch (err) {
      setIsRefundModalOpen(false);
      const parsed = normalizeApiError(err);
      toast.error(parsed?.message || 'Refund rejected by platform governance rules.');
    } finally {
      setIsRefunding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center text-slate-800">
        <Spinner text="Loading payment settlement..." />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-4 shadow-soft-xs">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CreditCard className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Payment Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested payment settlement could not be located in platform ledger.
        </p>
        <Link to="/admin/payments">
          <Button variant="outline" size="sm" icon={ArrowLeft} className="mt-2 text-xs">
            Back to Payments
          </Button>
        </Link>
      </div>
    );
  }

  const refCode = payment.id ? payment.id.slice(0, 8).toUpperCase() : 'N/A';
  const orderId = payment.orderId || payment.order_id;
  const orderRef = orderId ? orderId.slice(0, 8).toUpperCase() : null;
  const canRefund = payment.status === 'SUCCESS' && !payment.refundedAt;

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/admin/payments">
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Back to Payments
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-soft-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Payment Details
                </h1>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  #{refCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
          {canRefund && (
            <Button
              size="sm"
              variant="outline"
              icon={RotateCcw}
              onClick={() => setIsRefundModalOpen(true)}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold shadow-soft-xs"
            >
              Process Refund
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Paid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Total Amount
            </span>
            <span className="text-lg font-black text-slate-900 block truncate">
              {formatCurrency(payment.amount)}
            </span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Payment Status
            </span>
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
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Payment Method
            </span>
            <span className="text-xs font-bold text-slate-900 uppercase block">
              {payment.paymentMethod || 'ONLINE'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium block truncate">
              {payment.provider || 'Platform Gateway'}
            </span>
          </div>
        </div>

        {/* Payment Date */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Payment Date
            </span>
            <span className="text-xs font-bold text-slate-800 block">
              {payment.paidAt ? formatDate(payment.paidAt, false) : 'Pending'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium block">
              {payment.paidAt ? formatTime(payment.paidAt) : 'Awaiting Settlement'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Content: 2-Column Responsive Layout - Equal Bottom Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column (2 Cols): Settlement Breakdown & Ledger */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
          {/* Refund Notice Banner if Refunded */}
          {payment.refundedAt && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200/90 flex items-center justify-between gap-3 shadow-soft-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-rose-900">Payment Refunded</h4>
                  <p className="text-xs text-rose-700">
                    Disbursed back to customer on {formatDate(payment.refundedAt, true)}.
                  </p>
                </div>
              </div>
              <span className="font-black text-rose-800 text-base font-mono">
                -{formatCurrency(payment.amount)}
              </span>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Payment Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Payment Amount
                  </span>
                  <span className="text-base font-black text-slate-900 block">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Payment Method
                  </span>
                  <span className="text-sm font-bold text-slate-800 uppercase block">
                    {payment.paymentMethod || 'ONLINE'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Gateway Provider
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {payment.provider || 'Platform Payment Gateway'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Settlement Status
                  </span>
                  <span className="text-sm font-bold text-emerald-700 block">
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Financial Settlement</span>
              <span className="font-mono text-[11px] font-semibold text-emerald-700">Cleared</span>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Associated Order Card */}
        <div className="lg:col-span-1 flex flex-col justify-between space-y-6">
          {/* Associated Order Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
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
                    Order #{orderRef}
                  </div>

                  {order && (
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Produce Items:</span>
                        <span className="font-semibold text-slate-800">
                          {order.items?.length || 0} items
                        </span>
                      </div>
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

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Order Linkage</span>
              <span className="font-mono text-[11px] font-semibold text-purple-700">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Confirm Refund Modal */}
      {isRefundModalOpen && (
        <Modal
          isOpen={isRefundModalOpen}
          onClose={() => !isRefunding && setIsRefundModalOpen(false)}
          title="Confirm Payment Refund"
          size="sm"
        >
          <div className="space-y-4 text-xs sm:text-sm text-slate-800">
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 flex items-start gap-3 text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Refund Payment to Customer?</p>
                <p className="text-xs text-rose-700 mt-1">
                  This will disburse the full settlement amount of{' '}
                  <span className="font-black text-rose-900">{formatCurrency(payment.amount)}</span> back
                  to the buyer.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-mono font-bold text-slate-800">#{orderRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Amount:</span>
                <span className="font-bold text-slate-900">{formatCurrency(payment.amount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={isRefunding}
                onClick={() => setIsRefundModalOpen(false)}
                className="border-slate-200 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={isRefunding}
                onClick={handleConfirmRefund}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold"
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

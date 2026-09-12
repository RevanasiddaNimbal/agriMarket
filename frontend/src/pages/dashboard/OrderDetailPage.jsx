import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt,
  RotateCcw,
  Truck,
  ArrowLeft,
  ShieldCheck,
  User,
} from 'lucide-react';
import { orderService } from '@/services/order/orderService';
import { productService } from '@/services/product/productService';
import { paymentService } from '@/services/payment/paymentService';
import { deliveryService } from '@/services/delivery/deliveryService';
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline';
import { InvoiceModal } from '@/components/order/InvoiceModal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/loaders/Spinner';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate, formatQuantity } from '@/utils/formatters';
import { ORDER_STATUS } from '@/config/constants';

export function OrderDetailPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const toast = useToast();
  const navigate = useNavigate();

  const stateOrder = location.state?.order || null;
  const [isSellerView, setIsSellerView] = useState(
    location.state?.isSellerView ?? false
  );
  const [order, setOrder] = useState(stateOrder);
  const [payment, setPayment] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [isLoading, setIsLoading] = useState(!stateOrder);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Check if current user is seller of this order by checking my products if not passed in state
  useEffect(() => {
    if (location.state?.isSellerView !== undefined) {
      setIsSellerView(location.state.isSellerView);
    } else if (order?.items?.length) {
      productService
        .getMyProducts()
        .then((prods) => {
          if (Array.isArray(prods)) {
            const pIds = new Set(prods.map((p) => p.id));
            const isSoldByMe = order.items.some((item) =>
              pIds.has(item.product_id || item.productId)
            );
            if (isSoldByMe) setIsSellerView(true);
          }
        })
        .catch(() => {});
    }
  }, [order, location.state]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [orderData, paymentData, deliveryData] = await Promise.allSettled([
        orderService.getOrder(orderId),
        paymentService.getPaymentByOrderId(orderId),
        deliveryService.getDeliveryByOrderId(orderId),
      ]);

      if (orderData.status === 'fulfilled') setOrder(orderData.value);
      if (paymentData.status === 'fulfilled') setPayment(paymentData.value);
      if (deliveryData.status === 'fulfilled') setDelivery(deliveryData.value);
    } catch (err) {
      toast.error('Failed to load order information.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) loadData();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setIsActionLoading(true);
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order has been cancelled.');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!window.confirm('Initiate refund request for this order?')) return;

    setIsActionLoading(true);
    try {
      await paymentService.refundPayment(orderId);
      toast.success('Refund processed successfully!');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to process refund.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner text="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <ErrorDisplay
        title="Order Not Found"
        message="The specified order record could not be retrieved."
        onRetry={loadData}
      />
    );
  }

  const statusMeta = ORDER_STATUS[order.status] || { label: order.status, color: 'slate' };
  const canCancel = order.status === 'PENDING_PAYMENT' || order.status === 'CONFIRMED';
  const canRefund = order.status === 'CANCELLED' && payment && payment.status === 'SUCCESS';
  const customerName =
    order.customer_name ||
    order.customerName ||
    order.user?.fullName ||
    order.user?.full_name;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/orders">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Orders
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Order #{order.id?.substring(0, 8)}
              </h1>
              {isSellerView && (
                <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
                  Customer Order (Harvest Sale)
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-500">
                Placed on {formatDate(order.created_date || order.createdDate, true)}
              </p>
              {customerName && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  <User className="w-3 h-3 text-slate-400" />
                  Customer: {customerName}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={statusMeta.color} size="md">
            {statusMeta.label}
          </Badge>
          <Button size="sm" variant="outline" icon={Receipt} onClick={() => setShowInvoice(true)}>
            View Invoice
          </Button>
          <Link to={`/orders/${order.id}/track`} state={{ order, isSellerView }}>
            <Button size="sm" variant="secondary" icon={Truck}>
              Live Tracking
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft-sm">
        <h3 className="font-bold text-sm text-slate-900 mb-2">Order Fulfillment Status</h3>
        <OrderStatusTimeline status={order.status} />
      </div>

      {/* Items & Payment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchased Items */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-soft-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-600" />
            <span>Harvest Produce</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{item.product_name || item.productName}</h4>
                  <p className="text-xs text-slate-500">
                    {formatQuantity(item.quantity, item.unit)} × {formatCurrency(item.unit_price ?? item.unitPrice)}
                  </p>
                </div>
                <div className="text-right font-extrabold text-slate-900 text-sm">
                  {formatCurrency(item.subtotal)}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-sm">
            <span className="font-bold text-slate-600">Total Order Amount:</span>
            <span className="text-xl font-extrabold text-brand-700">{formatCurrency(order.total_amount ?? order.totalAmount)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            {isSellerView ? (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Fulfillment Note:</span>
                <span>Prepare produce for dispatch. Recipient customer will verify the delivery OTP directly with courier upon arrival.</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {canCancel && (
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={isActionLoading}
                    onClick={handleCancelOrder}
                    icon={XCircle}
                  >
                    Cancel Order
                  </Button>
                )}

                {canRefund && (
                  <Button
                    variant="earth"
                    size="sm"
                    isLoading={isActionLoading}
                    onClick={handleRefund}
                    icon={RotateCcw}
                  >
                    Claim Payment Refund
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment & Delivery Summary Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100">
              Payment Record
            </h4>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-slate-800">{payment?.status || 'PENDING'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Method:</span>
              <span className="font-semibold text-slate-800">{payment?.paymentMethod || 'MOCK'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount:</span>
              <span className="font-bold text-brand-700">{formatCurrency(payment?.amount || order.totalAmount)}</span>
            </div>
          </div>

          {delivery && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft-sm space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100">
                Delivery Verification
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  {isSellerView ? 'Customer Handover:' : 'OTP Verified:'}
                </span>
                <span className="font-bold text-slate-800">
                  {delivery.otpVerified
                    ? 'Yes (Verified)'
                    : isSellerView
                    ? 'Pending Customer OTP'
                    : 'Pending Handover'}
                </span>
              </div>
              {delivery.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivered On:</span>
                  <span className="font-semibold text-slate-800">{formatDate(delivery.deliveredAt, true)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showInvoice && (
        <InvoiceModal order={order} isOpen={showInvoice} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
}

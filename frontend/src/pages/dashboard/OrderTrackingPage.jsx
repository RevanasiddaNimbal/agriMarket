import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  Truck,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Mail,
  RefreshCw,
  ShoppingBag,
  User,
} from 'lucide-react';
import { orderService } from '@/services/order/orderService';
import { productService } from '@/services/product/productService';
import { deliveryService } from '@/services/delivery/deliveryService';
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/loaders/Spinner';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate, formatQuantity } from '@/utils/formatters';

export function OrderTrackingPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const toast = useToast();

  const stateOrder = location.state?.order || null;
  const [isSellerView, setIsSellerView] = useState(
    location.state?.isSellerView ?? false
  );

  const buildTrackingObject = (source, deliveryData = null) => {
    if (!source) return null;
    return {
      orderId: source.id || source.orderId || orderId,
      status: source.status || 'CONFIRMED',
      totalAmount: source.total_amount ?? source.totalAmount ?? 0,
      createdDate: source.created_date ?? source.createdDate ?? new Date().toISOString(),
      items: source.items || [],
      delivery: deliveryData || source.delivery || null,
      customerName:
        source.customer_name || source.customerName || source.user?.fullName || source.user?.full_name,
    };
  };

  const [tracking, setTracking] = useState(() => buildTrackingObject(stateOrder));
  const [isLoading, setIsLoading] = useState(!stateOrder);
  const [otp, setOtp] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);

  // Check if current user is seller of this order by checking products if not in state
  useEffect(() => {
    if (location.state?.isSellerView !== undefined) {
      setIsSellerView(location.state.isSellerView);
    } else if (tracking?.items?.length) {
      productService
        .getMyProducts()
        .then((prods) => {
          if (Array.isArray(prods)) {
            const pIds = new Set(prods.map((p) => p.id));
            const isSoldByMe = tracking.items.some((item) =>
              pIds.has(item.product_id || item.productId)
            );
            if (isSoldByMe) setIsSellerView(true);
          }
        })
        .catch(() => {});
    }
  }, [tracking, location.state]);

  const loadTracking = async () => {
    if (!stateOrder) setIsLoading(true);
    try {
      let liveData = null;
      try {
        liveData = await orderService.trackOrder(orderId);
      } catch (trackErr) {
        // Fallback: load order details directly
        try {
          const ord = await orderService.getOrder(orderId);
          if (ord) {
            liveData = buildTrackingObject(ord);
          }
        } catch (ordErr) {
          // Both endpoints failed or restricted
        }
      }

      if (liveData) {
        setTracking((prev) => ({
          ...(prev || {}),
          ...liveData,
          items: liveData.items?.length ? liveData.items : prev?.items || [],
        }));
      } else if (!stateOrder) {
        toast.error('Could not load live dispatch telemetry. Displaying recorded order status.');
      }
    } catch (err) {
      if (!stateOrder) {
        toast.error('Failed to load tracking details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) loadTracking();
  }, [orderId]);

  const handleGenerateOtp = async () => {
    setIsGeneratingOtp(true);
    try {
      await deliveryService.generateDeliveryOtp(orderId);
      toast.success('Delivery OTP generated and sent to your registered email address.');
      await loadTracking();
    } catch (err) {
      toast.error(err.message || 'Failed to generate delivery OTP.');
    } finally {
      setIsGeneratingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.warning('Please enter the OTP sent to your email.');
      return;
    }

    setIsOtpLoading(true);
    try {
      await deliveryService.verifyDeliveryOtp(orderId, otp.trim());
      toast.success('Delivery confirmed and marked as DELIVERED successfully!');
      setOtp('');
      await loadTracking();
    } catch (err) {
      toast.error(err.message || 'Invalid or expired OTP.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner text="Tracking order dispatch telemetry..." />
      </div>
    );
  }

  if (!tracking) {
    return (
      <ErrorDisplay
        title="Tracking Unavailable"
        message="Unable to track this order at the moment."
        onRetry={loadTracking}
      />
    );
  }

  const delivery = tracking.delivery;
  const isDelivered = tracking.status === 'DELIVERED' || delivery?.otpVerified;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to={`/orders/${orderId}`} state={{ order: tracking, isSellerView }}>
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Order Details
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-brand-600" />
                <span>Live Order Tracking #{orderId.substring(0, 8)}</span>
              </h1>
              {isSellerView && (
                <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
                  Farmer Dispatch View
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Real-time agricultural produce dispatch tracking</p>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft-sm">
        <h3 className="font-bold text-sm text-slate-900 mb-2">Delivery Status</h3>
        <OrderStatusTimeline status={tracking.status} />
      </div>

      {/* Produce / Crops Being Tracked */}
      {tracking.items?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <span>Produce in this Shipment</span>
            </h3>
            {tracking.customerName && (
              <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                Customer: <strong className="text-slate-800">{tracking.customerName}</strong>
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {tracking.items.map((item, idx) => (
              <div key={item.id || item.product_id || idx} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <h4 className="font-bold text-slate-900">{item.product_name || item.productName || 'Produce Item'}</h4>
                  <p className="text-xs text-slate-500">
                    {formatQuantity(item.quantity, item.unit)} × {formatCurrency(item.unit_price ?? item.unitPrice)}
                  </p>
                </div>
                <span className="font-extrabold text-slate-900">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Value:</span>
            <span className="text-sm font-extrabold text-slate-900">{formatCurrency(tracking.totalAmount)}</span>
          </div>
        </div>
      )}

      {/* OTP Handover Verification Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft-sm space-y-4 max-w-xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              {isSellerView ? 'Customer Delivery Handover' : 'Delivery Handover & OTP Verification'}
            </h3>
            <p className="text-xs text-slate-500">
              {isSellerView
                ? 'Courier coordinates verification directly with customer upon arrival'
                : 'Secure confirmation upon receiving your farm produce'}
            </p>
          </div>
        </div>

        {isDelivered ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-brand-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <span>
              {isSellerView
                ? 'Customer verified the delivery OTP. Produce has been successfully delivered and handed over.'
                : 'This order has been verified and successfully delivered to the destination.'}
            </span>
          </div>
        ) : isSellerView ? (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>In Transit / Pending Customer Handover</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              This shipment contains harvested produce from your farm listing. When the courier arrives at the destination, recipient customer{tracking.customerName ? ` (${tracking.customerName})` : ''} will verify their delivery OTP directly to confirm handover.
            </p>
            <div className="pt-2 border-t border-amber-200/60 flex items-center gap-2 text-[11px] text-amber-900 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span>No OTP verification required from you as the seller. You can monitor the fulfillment status live above.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600 leading-relaxed">
              When the delivery agent arrives with your harvest, provide the OTP sent to your registered email to complete the handover.
            </p>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                isLoading={isGeneratingOtp}
                onClick={handleGenerateOtp}
                icon={Mail}
              >
                Send / Resend OTP to Email
              </Button>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-3 pt-3 border-t border-slate-100">
              <Input
                label="Enter 6-Digit Delivery OTP"
                placeholder="e.g. 123456"
                icon={KeyRound}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
              <Button type="submit" size="md" className="w-full" isLoading={isOtpLoading}>
                Verify Delivery & Confirm Handover
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

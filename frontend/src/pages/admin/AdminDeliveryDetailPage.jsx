import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShoppingBag,
  ArrowUpRight,
  Edit,
  Package,
  MapPin,
  Calendar,
} from 'lucide-react';
import { adminService } from '@/services/admin/adminService';
import { addressService } from '@/services/address/addressService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';
import { normalizeApiError } from '@/services/api/apiErrorHandler';

export function AdminDeliveryDetailPage() {
  const { deliveryId } = useParams();
  const toast = useToast();

  const [delivery, setDelivery] = useState(null);
  const [order, setOrder] = useState(null);
  const [address, setAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status Update Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedTargetStatus, setSelectedTargetStatus] = useState('SHIPPED');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const delData = await adminService.getDelivery(deliveryId);
      setDelivery(delData);

      const targetOrderId = delData?.orderId || delData?.order_id;
      if (targetOrderId) {
        const orderRes = await adminService.getOrder(targetOrderId).catch(() => null);
        setOrder(orderRes);

        const addrId = orderRes?.addressId || orderRes?.address_id;
        if (addrId) {
          const addrRes = await addressService.getAddress(addrId).catch(() => null);
          setAddress(addrRes);
        }
      }
    } catch (err) {
      console.error('Failed to load delivery dispatch:', err);
      toast.error('Failed to load delivery dispatch details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deliveryId) loadData();
  }, [deliveryId]);

  const refCode = delivery?.id ? delivery.id.slice(0, 8).toUpperCase() : 'N/A';
  const orderId = delivery?.orderId || delivery?.order_id;
  const orderRef = orderId ? orderId.slice(0, 8).toUpperCase() : null;
  const isOtpVerified = Boolean(delivery?.otpVerified ?? delivery?.otp_verified);

  // Compute actual consignment fulfillment status
  const currentStatus = (order?.status || (isOtpVerified ? 'DELIVERED' : 'PROCESSING')).toUpperCase();
  const isDelivered = currentStatus === 'DELIVERED' || isOtpVerified;
  const isOutForDelivery = currentStatus === 'OUT_FOR_DELIVERY';
  const isShipped = currentStatus === 'SHIPPED' || isOutForDelivery || isDelivered;
  const isProcessing = currentStatus === 'PROCESSING' || isShipped;

  // Compute effective timestamps
  const createdDate = delivery?.createdAt || delivery?.created_at || order?.createdDate || order?.created_date;
  const dispatchedDate = isShipped ? (delivery?.updatedAt || delivery?.updated_at || createdDate) : null;
  const effectiveDeliveredAt =
    delivery?.deliveredAt ||
    delivery?.delivered_at ||
    (isDelivered
      ? order?.lastModifiedDate || order?.last_modified_date || delivery?.updatedAt || delivery?.updated_at
      : null);

  const items = order?.items || [];
  const orderTotal = order?.total_amount ?? order?.totalAmount ?? 0;

  // Open modal with appropriate default option based on current status
  const handleOpenStatusModal = () => {
    if (currentStatus === 'CONFIRMED') {
      setSelectedTargetStatus('PROCESSING');
    } else if (currentStatus === 'PROCESSING') {
      setSelectedTargetStatus('SHIPPED');
    } else if (currentStatus === 'SHIPPED') {
      setSelectedTargetStatus('OUT_FOR_DELIVERY');
    } else if (currentStatus === 'OUT_FOR_DELIVERY') {
      setSelectedTargetStatus('DELIVERED');
    } else {
      setSelectedTargetStatus('DELIVERED');
    }
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusUpdate = async (e) => {
    e.preventDefault();
    if (!orderId || !selectedTargetStatus) return;

    setIsUpdatingStatus(true);
    try {
      if (selectedTargetStatus === 'PROCESSING') {
        await adminService.updateOrderStatus(orderId, 'PROCESSING');
        toast.success(`Consignment #${refCode} status advanced to PROCESSING.`);
      } else if (selectedTargetStatus === 'SHIPPED') {
        if (currentStatus === 'CONFIRMED') {
          // Progress through PROCESSING first so backend rule passes smoothly
          await adminService.updateOrderStatus(orderId, 'PROCESSING');
        }
        await adminService.markAsShipped(deliveryId);
        toast.success(`Consignment #${refCode} marked as SHIPPED.`);
      } else if (selectedTargetStatus === 'OUT_FOR_DELIVERY') {
        if (currentStatus === 'CONFIRMED') {
          await adminService.updateOrderStatus(orderId, 'PROCESSING');
          await adminService.markAsShipped(deliveryId);
        } else if (currentStatus === 'PROCESSING') {
          await adminService.markAsShipped(deliveryId);
        }
        await adminService.markAsOutForDelivery(deliveryId);
        toast.success(`Consignment #${refCode} marked as OUT FOR DELIVERY.`);
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
        toast.success(`Consignment #${refCode} marked as DELIVERED.`);
      }

      setIsStatusModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to update delivery status:', err);
      setIsStatusModalOpen(false);
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

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center text-slate-800">
        <Spinner text="Loading delivery details..." />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-4 shadow-soft-xs">
        <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto">
          <Truck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Delivery Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested delivery dispatch record could not be found.
        </p>
        <Link to="/admin/deliveries">
          <Button variant="outline" size="sm" icon={ArrowLeft} className="mt-2 text-xs">
            Back to Deliveries
          </Button>
        </Link>
      </div>
    );
  }

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
      {/* 1. Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/admin/deliveries">
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Back to Deliveries
            </Button>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shadow-soft-xs">
              <Truck className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Delivery Details
              </h1>
              <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">
                #{refCode}
              </span>
              {getStatusBadge(currentStatus)}
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

          {!isDelivered ? (
            <Button
              size="sm"
              variant="primary"
              icon={Edit}
              onClick={handleOpenStatusModal}
              className="bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-soft-xs"
            >
              Update Status
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Delivered</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards Row - Equal Height */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
        {/* Card 1: Handover / Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3 h-full">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDelivered ? 'bg-emerald-50 text-emerald-600' : 'bg-cyan-50 text-cyan-600'
            }`}
          >
            {isDelivered ? <CheckCircle2 className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Dispatch Status
            </span>
            <div className="truncate">{getStatusBadge(currentStatus)}</div>
          </div>
        </div>

        {/* Card 2: Associated Order */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3 h-full">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Associated Order
            </span>
            <span className="font-mono text-sm font-bold text-purple-900 block truncate">
              #{orderRef || 'N/A'}
            </span>
            <span className="text-[11px] font-bold text-slate-600 block truncate">
              {formatCurrency(orderTotal)}
            </span>
          </div>
        </div>

        {/* Card 3: Dispatched Date */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3 h-full">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Dispatched Date
            </span>
            <span className="text-xs font-bold text-slate-800 block truncate">
              {dispatchedDate ? formatDate(dispatchedDate, false) : 'Not shipped yet'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium block truncate">
              {dispatchedDate ? formatTime(dispatchedDate) : 'Pending'}
            </span>
          </div>
        </div>

        {/* Card 4: Delivered Date & Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3 h-full">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDelivered ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {isDelivered ? <CheckCircle2 className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Delivered Date & Time
            </span>
            {effectiveDeliveredAt ? (
              <>
                <span className="text-xs font-bold text-emerald-700 block truncate">
                  {formatDate(effectiveDeliveredAt, false)}
                </span>
                <span className="text-[11px] text-emerald-600 font-bold block truncate">
                  {formatTime(effectiveDeliveredAt)}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-amber-700 block truncate">
                  {isOutForDelivery ? 'Out for Delivery' : isShipped ? 'In Transit' : 'Being Prepared'}
                </span>
                <span className="text-[11px] text-slate-400 font-medium block truncate">
                  Not delivered yet
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Delivery Summary & Structured Progression */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Delivery Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-600" />
              Delivery Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Delivery Channel
                </span>
                <span className="text-sm font-semibold text-slate-800 block">
                  Platform Delivery
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Current Status
                </span>
                <span
                  className={`text-sm font-bold block ${
                    isDelivered
                      ? 'text-emerald-700'
                      : isOutForDelivery
                      ? 'text-amber-700'
                      : isShipped
                      ? 'text-cyan-700'
                      : 'text-purple-700'
                  }`}
                >
                  {isDelivered
                    ? 'Delivered to Customer'
                    : isOutForDelivery
                    ? 'Out for Delivery'
                    : isShipped
                    ? 'Shipped & In Transit'
                    : 'Being Prepared'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Shipped Date
                </span>
                <span className="text-sm font-semibold text-slate-800 block truncate">
                  {dispatchedDate ? formatDate(dispatchedDate, true) : 'Not yet shipped'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Delivered Date
                </span>
                {effectiveDeliveredAt ? (
                  <span className="text-sm font-bold text-emerald-700 flex items-center gap-1 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{formatDate(effectiveDeliveredAt, true)}</span>
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-slate-500 block truncate">
                    {isOutForDelivery ? 'Out for Delivery' : 'Not delivered yet'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Dispatch Progression & Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-600" />
                Delivery Timeline
              </h3>
              <span className="text-xs font-medium text-slate-400">
                Status History
              </span>
            </div>

            {/* 4 Structured Information Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Delivery ID
                </span>
                <span className="font-mono font-bold text-cyan-900 block truncate">
                  #{refCode}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Order Date
                </span>
                <span className="font-semibold text-slate-800 block truncate">
                  {createdDate ? formatDate(createdDate, true) : 'N/A'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Shipped Date
                </span>
                <span className="font-semibold text-slate-800 block truncate">
                  {dispatchedDate ? formatDate(dispatchedDate, true) : 'Not yet shipped'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Delivered Date
                </span>
                <span className={`font-semibold block truncate ${isDelivered ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {effectiveDeliveredAt ? formatDate(effectiveDeliveredAt, true) : 'Not delivered yet'}
                </span>
              </div>
            </div>

            {/* Progression Stages */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Delivery Steps
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Step 1: Order Confirmed / Processing */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">1. Confirmed</span>
                    <span className="text-[10px] text-slate-400 block truncate">Hub Allocated</span>
                  </div>
                </div>

                {/* Step 2: Shipped / Dispatched */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                      isShipped ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isShipped ? '✓' : '2'}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">2. Dispatched</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {isShipped ? 'In Transit' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Step 3: Out for Delivery */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                      isDelivered
                        ? 'bg-emerald-100 text-emerald-700'
                        : isOutForDelivery
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDelivered ? '✓' : '3'}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">3. Out for Delivery</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {isDelivered ? 'Completed' : isOutForDelivery ? 'Out for Delivery' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Step 4: Delivered */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                      isDelivered ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDelivered ? '✓' : '4'}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">4. Delivered</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {isDelivered ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Associated Order & Destination Details */}
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
                  Order #{orderRef}
                </div>

                {order && (
                  <div className="space-y-1 text-xs text-slate-600">
                    {items.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Items:</span>
                        <span className="font-semibold text-slate-800">
                          {items.length} product{items.length === 1 ? '' : 's'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Order Amount:</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(orderTotal)}
                      </span>
                    </div>
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

          {/* Card 2: Delivery Address Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-600" />
              Delivery Address
            </h3>

            {address ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs text-slate-800">
                <p className="font-bold text-sm text-slate-900 leading-snug">
                  {address.addressLine1 || address.address_line1}
                  {(address.addressLine2 || address.address_line2) && `, ${address.addressLine2 || address.address_line2}`}
                </p>
                {[address.village, address.city, address.district].filter(Boolean).length > 0 && (
                  <p className="text-slate-600 font-medium">
                    {[address.village, address.city, address.district].filter(Boolean).join(', ')}
                  </p>
                )}
                {[address.state, address.pincode].filter(Boolean).length > 0 && (
                  <p className="text-slate-600 font-medium">
                    {[address.state, address.pincode].filter(Boolean).join(' - ')}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500">
                <p>No delivery address recorded for this order.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Update Dispatch Status Modal */}
      {isStatusModalOpen && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => !isUpdatingStatus && setIsStatusModalOpen(false)}
          title="Update Dispatch Status"
          size="sm"
        >
          <form onSubmit={handleConfirmStatusUpdate} className="space-y-4">
            <p className="text-xs text-slate-500">
              Select the next status for delivery #{refCode}.
            </p>

            <div className="space-y-2">
              {/* Option: PROCESSING (If confirmed) */}
              {currentStatus === 'CONFIRMED' && (
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTargetStatus === 'PROCESSING'
                      ? 'border-purple-400 bg-purple-50/50 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryStatus"
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
              {['CONFIRMED', 'PROCESSING'].includes(currentStatus) && (
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTargetStatus === 'SHIPPED'
                      ? 'border-cyan-400 bg-cyan-50/50 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryStatus"
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
              {['CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(currentStatus) && (
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTargetStatus === 'OUT_FOR_DELIVERY'
                      ? 'border-cyan-400 bg-cyan-50/50 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryStatus"
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
                  name="deliveryStatus"
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
                onClick={() => setIsStatusModalOpen(false)}
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

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  Edit,
  Truck,
  Package,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { adminService } from '@/services/admin/adminService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
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
      prod.imageUrl ||
      prod.image_url ||
      prod.primaryImageUrl;
    if (url) return url;
  }

  const name = (item.productName || item.product_name || item.name || '').toLowerCase();
  for (const [cropKey, fallbackUrl] of Object.entries(CROP_FALLBACKS)) {
    if (name.includes(cropKey)) {
      return fallbackUrl;
    }
  }

  return DEFAULT_PRODUCE_IMAGE;
}

function getOrderTotalAmount(order) {
  if (!order) return 0;
  if (order.total_amount != null && !isNaN(Number(order.total_amount))) {
    return Number(order.total_amount);
  }
  if (order.totalAmount != null && !isNaN(Number(order.totalAmount))) {
    return Number(order.totalAmount);
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
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase px-3 py-1 rounded-full border shadow-2xs ${badgeStyles}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotStyles}`} />
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

export function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [productsMap, setProductsMap] = useState({});
  const [delivery, setDelivery] = useState(null);
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status update modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [orderRes, prodsRes, deliveriesRes, paymentsRes] = await Promise.all([
        adminService.getOrder(orderId),
        adminService.getProducts({ page: 0, size: 100 }).catch(() => ({ content: [] })),
        adminService.getAllDeliveries().catch(() => []),
        adminService.getAllPayments().catch(() => []),
      ]);

      const pMap = {};
      const prodList = prodsRes?.content || prodsRes || [];
      if (Array.isArray(prodList)) {
        prodList.forEach((p) => {
          if (p?.id) pMap[p.id] = p;
        });
      }
      setProductsMap(pMap);
      setOrder(orderRes);
      setNewStatus(orderRes?.status || 'PENDING_PAYMENT');

      // Match delivery and payment for this order
      const delList = Array.isArray(deliveriesRes) ? deliveriesRes : [];
      const matchedDelivery = delList.find((d) => (d.orderId || d.order_id) === orderId);
      setDelivery(matchedDelivery || null);

      const payList = Array.isArray(paymentsRes) ? paymentsRes : [];
      const matchedPayment = payList.find((p) => (p.orderId || p.order_id) === orderId);
      setPayment(matchedPayment || null);
    } catch (err) {
      console.error('Failed to load order details:', err);
      toast.error('Failed to load order details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) loadData();
  }, [orderId]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus || !order) return;

    setIsUpdating(true);
    setActionError(null);
    try {
      await adminService.updateOrderStatus(order.id, newStatus);
      toast.success(`Order status updated to ${newStatus}.`);
      setOrder((prev) => ({ ...prev, status: newStatus }));
      setStatusModalOpen(false);
    } catch (err) {
      // Immediately close modal on rule violation
      setStatusModalOpen(false);
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

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center text-slate-800">
        <Spinner text="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-4 shadow-soft-xs">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Order Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested order could not be located on the platform.
        </p>
        <Link to="/admin/orders">
          <Button variant="outline" size="sm" icon={ArrowLeft} className="mt-2 text-xs">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const totalAmount = getOrderTotalAmount(order);
  const orderDate = getOrderDate(order);
  const items = order.items || [];
  const refCode = order.id ? order.id.slice(0, 8).toUpperCase() : 'N/A';

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* 1. Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/admin/orders">
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Back to Orders
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-soft-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Order Details
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
          {delivery ? (
            <Link to={`/admin/deliveries/${delivery.id}`}>
              <Button
                variant="outline"
                size="sm"
                icon={Truck}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Delivery Dispatch
              </Button>
            </Link>
          ) : (
            <Link to="/admin/deliveries">
              <Button
                variant="outline"
                size="sm"
                icon={Truck}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Deliveries
              </Button>
            </Link>
          )}

          {payment && (
            <Link to={`/admin/payments/${payment.id}`}>
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

          <Button
            size="sm"
            variant="primary"
            icon={Edit}
            onClick={() => setStatusModalOpen(true)}
            className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-soft-xs"
          >
            Update Status
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

      {/* 2. Top Metric Cards Row - Equal Height */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
        {/* Total Amount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3 h-full">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Total Order Value
            </span>
            <span className="text-lg font-black text-slate-900 block truncate">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3 h-full">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Order Status
            </span>
            <div>{getOrderStatusBadge(order.status)}</div>
          </div>
        </div>

        {/* Order Date */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3 h-full">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Order Date
            </span>
            <span className="text-xs font-bold text-slate-800 block">
              {orderDate ? formatDate(orderDate, false) : 'N/A'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium block">
              {orderDate ? formatTime(orderDate) : ''}
            </span>
          </div>
        </div>

        {/* Items Ordered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs flex items-center gap-3 h-full">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Items Ordered
            </span>
            <span className="text-lg font-black text-slate-900 block">
              {items.length} Product{items.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Grid - Equal Bottom Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column (2 Cols): Items & Financial Summary */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
          {/* Items in this Order */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  Items in this Order ({items.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any product to view its catalog details.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const itemImg = getOrderItemImage(item, productsMap);
                const itemSubtotal = Number(
                  item.subtotal ??
                    Number(item.quantity || 0) * Number(item.unit_price ?? item.unitPrice ?? 0)
                );
                const prodId = item.productId || item.product_id;

                const cardContent = (
                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-purple-50/20 hover:border-purple-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group">
                    {/* Item Thumbnail & Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={itemImg}
                        alt={item.productName || item.product_name || 'Produce'}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200/90 bg-white shrink-0 shadow-soft-xs group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_PRODUCE_IMAGE;
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                            {item.productName || item.product_name || 'Crop Produce'}
                          </h4>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 shrink-0" />
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-700">
                            Quantity: {item.quantity} {item.unit || 'units'}
                          </span>
                          <span>•</span>
                          <span>Unit Price: {formatCurrency(item.unit_price ?? item.unitPrice)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/50">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Line Total
                      </span>
                      <span className="text-base font-black text-slate-900 tracking-tight">
                        {formatCurrency(itemSubtotal)}
                      </span>
                    </div>
                  </div>
                );

                return prodId ? (
                  <Link key={item.id || idx} to={`/admin/products/${prodId}`} className="block">
                    {cardContent}
                  </Link>
                ) : (
                  <div key={item.id || idx}>{cardContent}</div>
                );
              })}
            </div>
          </div>

          {/* Order Lifecycle Timeline & History (Positioned below Items of Order with Structured Styling) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-6 space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Order Timeline & History
                </h3>
                <span className="text-xs font-medium text-slate-400">
                  Lifecycle Progression Tracker
                </span>
              </div>

              {/* 4 Structured Information Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Order Placed
                  </span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {orderDate ? formatDate(orderDate, true) : 'N/A'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Last Progression
                  </span>
                  <span className="font-semibold text-slate-800 block truncate">
                    {order.last_modified_date || order.lastModifiedDate
                      ? formatDate(order.last_modified_date || order.lastModifiedDate, true)
                      : orderDate
                      ? formatDate(orderDate, true)
                      : 'N/A'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Current Lifecycle
                  </span>
                  <span className="font-bold text-purple-700 block truncate">
                    {order.status || 'PENDING'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Escrow Protection
                  </span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Secured & Insured</span>
                  </span>
                </div>
              </div>

              {/* Lifecycle Stage Steps */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Progression Stages
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* Step 1: Placed */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                      ✓
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">1. Placed</span>
                      <span className="text-[10px] text-slate-400 block truncate">Order recorded</span>
                    </div>
                  </div>

                  {/* Step 2: Payment */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                        ['PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)
                          ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {['PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)
                        ? '✓'
                        : '2'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">2. Payment</span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {payment?.status === 'SUCCESS' ? 'Settled' : 'Escrow Hold'}
                      </span>
                    </div>
                  </div>

                  {/* Step 3: Dispatch */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                        ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)
                        ? '✓'
                        : '3'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">3. Dispatch</span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {delivery?.status || 'Fulfillment'}
                      </span>
                    </div>
                  </div>

                  {/* Step 4: Handover */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                        ['DELIVERED'].includes(order.status)
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {['DELIVERED'].includes(order.status) ? '✓' : '4'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">4. Delivered</span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {delivery?.deliveredAt ? 'Completed' : 'Awaiting'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Navigation Cards to Delivery & Payment */}
        <div className="flex flex-col justify-between space-y-6">
          {/* Delivery Dispatch Navigation Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-600" />
              Delivery Dispatch
            </h3>

            {delivery ? (
              <div className="p-4 rounded-xl bg-cyan-50/40 border border-cyan-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Consignment Ref
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                      delivery.otpVerified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {delivery.otpVerified ? 'OTP Verified' : 'Pending OTP'}
                  </span>
                </div>

                <div className="font-mono text-sm font-bold text-slate-900">
                  #{delivery.id?.slice(0, 8).toUpperCase()}
                </div>

                <Link
                  to={`/admin/deliveries/${delivery.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white hover:bg-cyan-50 border border-cyan-200 text-cyan-800 font-semibold text-xs transition-colors shadow-2xs"
                >
                  <span>Open Delivery Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-500">
                <p>No dispatch consignment assigned yet.</p>
                <Link
                  to="/admin/deliveries"
                  className="text-cyan-700 font-bold hover:underline inline-flex items-center gap-1 text-xs"
                >
                  <span>View All Deliveries</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Payment Settlement Navigation Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Payment Settlement
              </h3>

              {payment ? (
                <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Settlement Ref
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

                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      #{payment.id?.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>

                  <Link
                    to={`/admin/payments/${payment.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs transition-colors shadow-2xs"
                  >
                    <span>Open Payment Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-500">
                  <p>Payment settlement pending or not recorded.</p>
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

      {/* 4. Update Status Modal */}
      {statusModalOpen && (
        <Modal
          isOpen={statusModalOpen}
          onClose={() => !isUpdating && setStatusModalOpen(false)}
          title={`Update Status — Order #${refCode}`}
          description="Transition order to next fulfillment state."
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-slate-800">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
                <span className="text-sm font-black text-slate-900">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block text-right">
                  Current State
                </span>
                <span className="text-xs font-bold text-purple-700 block text-right">
                  {order.status}
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
                onClick={() => setStatusModalOpen(false)}
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
    </div>
  );
}

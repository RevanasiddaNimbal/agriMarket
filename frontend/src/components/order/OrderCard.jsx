import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, MapPin, Receipt, ArrowRight, Truck, User } from 'lucide-react';
import { formatCurrency, formatDate, formatQuantity } from '@/utils/formatters';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ORDER_STATUS } from '@/config/constants';
import { InvoiceModal } from './InvoiceModal';

export function OrderCard({ order, isSellerView = false }) {
  const [showInvoice, setShowInvoice] = useState(false);
  const statusMeta = ORDER_STATUS[order.status] || { label: order.status, color: 'slate' };
  const customerName = order.customer_name || order.customerName || order.user?.fullName || order.user?.full_name;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft-sm hover:shadow-soft-md transition-all space-y-4">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Order #{order.id?.substring(0, 8)}</span>
              {customerName && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  <User className="w-3 h-3 text-slate-400" />
                  {customerName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Placed on {formatDate(order.created_date || order.createdDate, true)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusMeta.color}>{statusMeta.label}</Badge>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 flex-shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{item.product_name || item.productName}</h4>
                  <p className="text-xs text-slate-500">
                    {formatQuantity(item.quantity, item.unit)} × {formatCurrency(item.unit_price ?? item.unitPrice)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">{formatCurrency(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info & Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-500">Total Order Amount:</span>
            <span className="text-base font-extrabold text-slate-900 ml-1.5">
              {formatCurrency(order.total_amount ?? order.totalAmount)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={Receipt}
              onClick={() => setShowInvoice(true)}
            >
              Invoice
            </Button>
            <Link to={`/orders/${order.id}`} state={{ order, isSellerView }}>
              <Button size="sm" variant="secondary" icon={Eye}>
                Details & Tracking
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {showInvoice && (
        <InvoiceModal order={order} isOpen={showInvoice} onClose={() => setShowInvoice(false)} />
      )}
    </>
  );
}

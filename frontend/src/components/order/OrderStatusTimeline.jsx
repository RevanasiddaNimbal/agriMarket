import React from 'react';
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CheckCheck,
  XCircle,
} from 'lucide-react';

export function OrderStatusTimeline({ status }) {
  const steps = [
    { key: 'PENDING_PAYMENT', label: 'Order Placed', icon: Clock },
    { key: 'CONFIRMED', label: 'Payment Confirmed', icon: CheckCircle2 },
    { key: 'PROCESSING', label: 'Preparing Harvest', icon: Package },
    { key: 'SHIPPED', label: 'Dispatched', icon: Truck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: MapPin },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCheck },
  ];

  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center justify-center p-6 bg-rose-50 rounded-2xl border border-rose-200 text-rose-700 gap-3">
        <XCircle className="w-6 h-6 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Order Cancelled</h4>
          <p className="text-xs text-rose-600">This order has been cancelled and any paid funds are eligible for refund.</p>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between">
        {/* Connecting Progress Line */}
        <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-slate-200 -z-0">
          <div
            className="h-full bg-brand-600 transition-all duration-500"
            style={{
              width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%`,
            }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-soft-md scale-110'
                    : isDone
                    ? 'bg-brand-600 text-white shadow-soft-sm'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] font-bold mt-2 text-center max-w-[80px] leading-tight ${
                  isCurrent
                    ? 'text-brand-800'
                    : isDone
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

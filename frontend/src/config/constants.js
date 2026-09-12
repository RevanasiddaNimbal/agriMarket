export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

export const ORDER_STATUS = {
  PENDING_PAYMENT: { label: 'Pending Payment', color: 'amber' },
  CONFIRMED: { label: 'Confirmed', color: 'blue' },
  PROCESSING: { label: 'Processing', color: 'indigo' },
  SHIPPED: { label: 'Shipped', color: 'purple' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'cyan' },
  DELIVERED: { label: 'Delivered', color: 'emerald' },
  CANCELLED: { label: 'Cancelled', color: 'rose' },
};

export const PAYMENT_METHODS = {
  UPI: 'UPI',
  CARD: 'Credit / Debit Card',
  NET_BANKING: 'Net Banking',
  MOCK: 'Mock Payment (Demo Gateway)',
};

export const PAYMENT_STATUS = {
  PENDING: { label: 'Pending', color: 'amber' },
  PROCESSING: { label: 'Processing', color: 'blue' },
  SUCCESS: { label: 'Successful', color: 'emerald' },
  FAILED: { label: 'Failed', color: 'rose' },
  REFUNDED: { label: 'Refunded', color: 'slate' },
};

export const ADDRESS_TYPES = {
  HOME: 'Home',
  FARM: 'Farm / Agricultural Land',
  OTHER: 'Other',
};

export const RISK_LEVELS = {
  LOW: { label: 'Low Risk', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  MODERATE: { label: 'Moderate Risk', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  HIGH: { label: 'High Risk', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  SEVERE: { label: 'Severe Risk', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
};

export const DEFAULT_COORDINATES = {
  latitude: 16.8302,
  longitude: 75.71,
  city: 'Vijayapura',
  state: 'Karnataka',
};

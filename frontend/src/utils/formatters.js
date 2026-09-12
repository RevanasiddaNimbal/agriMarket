export function formatCurrency(amount, currency = 'INR') {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(num);
}

function parseDate(dateValue) {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return isNaN(dateValue.getTime()) ? null : dateValue;
  if (Array.isArray(dateValue)) {
    // Jackson array format: [year, month, day, hour, minute, second]
    const [y, m, d, hr = 0, min = 0, sec = 0] = dateValue;
    const parsed = new Date(y, m - 1, d, hr, min, sec);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(dateValue);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(dateString, includeTime = false) {
  const date = parseDate(dateString);
  if (!date) return '-';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
  };

  return new Intl.DateTimeFormat('en-IN', options).format(date);
}

export function formatTime(dateString) {
  const date = parseDate(dateString);
  if (!date) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatQuantity(qty, unit = 'KG') {
  if (qty === null || qty === undefined) return `0 ${unit}`;
  const num = typeof qty === 'string' ? parseFloat(qty) : qty;
  return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)} ${unit}`;
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function toKgPrice(amount, unit) {
  if (amount === null || amount === undefined || isNaN(amount)) return 0;
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (num <= 0) return 0;

  const unitLower = (unit || '').toLowerCase();
  // If unit explicitly indicates kg, never divide
  if (unitLower.includes('kg')) {
    return Math.round(num);
  }
  // If unit explicitly indicates Quintal, convert to kg
  if (unitLower.includes('quintal')) {
    return Math.round(num / 100);
  }
  // If unit is unspecified:
  // In APMC mandis, prices >= 150 are quintal rates (e.g. ₹1,500 - ₹9,000/quintal)
  // Prices < 150 are already ₹/kg rates (e.g. ₹20 - ₹80/kg)
  if (num >= 150) {
    return Math.round(num / 100);
  }
  return Math.round(num);
}

export function formatKgPrice(amount, unit = 'Quintal') {
  const kgVal = toKgPrice(amount, unit);
  return `₹${kgVal}`;
}

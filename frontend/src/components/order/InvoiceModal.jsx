import React from 'react';
import { Sprout, Printer } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { formatCurrency, formatDate, formatQuantity } from '@/utils/formatters';

export function InvoiceModal({ order, isOpen, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Invoice Receipt" maxWidth="max-w-2xl">
      <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-6 text-slate-800 print:border-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AgriMarket / FasalMitra</h2>
              <p className="text-[11px] text-slate-500">Direct Farmer Agricultural Marketplace</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-1 rounded-md border border-brand-200">
              Tax Invoice
            </span>
            <p className="text-xs text-slate-500 mt-1">Invoice #{order.id?.substring(0, 8)}</p>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider">Order Date:</span>
            <p className="text-slate-800 font-medium mt-0.5">{formatDate(order.created_date || order.createdDate, true)}</p>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider">Order Status:</span>
            <p className="text-slate-800 font-semibold mt-0.5">{order.status}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600">
              <tr>
                <th className="py-3 px-4">Item Description</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.product_name || item.productName}</td>
                  <td className="py-3 px-4 text-center">{formatQuantity(item.quantity, item.unit)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(item.unit_price ?? item.unitPrice)}</td>
                  <td className="py-3 px-4 text-right font-bold">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(order.total_amount ?? order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform / Middleman Fee:</span>
              <span className="font-semibold text-brand-600">₹0.00 (Zero Fee)</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid:</span>
              <span className="text-brand-700">{formatCurrency(order.total_amount ?? order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 print:hidden">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" icon={Printer} onClick={handlePrint}>
            Print Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
}

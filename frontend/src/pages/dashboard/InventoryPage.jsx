import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Minus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sprout,
} from 'lucide-react';
import { inventoryService } from '@/services/inventory/inventoryService';
import { productService } from '@/services/product/productService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/loaders/Spinner';
import { EmptyState } from '@/components/empty-states/EmptyState';
import { formatCurrency, formatQuantity } from '@/utils/formatters';

export function InventoryPage() {
  const toast = useToast();
  const [inventoryList, setInventoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjustment Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustType, setAdjustType] = useState('add'); // 'add', 'remove'
  const [adjustQty, setAdjustQty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const [invRes, prodsRes] = await Promise.allSettled([
        inventoryService.getMyInventory(),
        productService.getMyProducts(),
      ]);

      const rawInventory =
        invRes.status === 'fulfilled' && Array.isArray(invRes.value) ? invRes.value : [];
      const myProducts =
        prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value) ? prodsRes.value : [];

      const prodsMap = new Map(myProducts.map((p) => [p.id, p]));

      // Merge inventory items with product info
      const list = rawInventory.map((item) => {
        const pId = item.productId || item.product_id;
        const prod = prodsMap.get(pId);
        const avail = Number(item.availableQuantity ?? item.available_quantity ?? 0);
        const res = Number(item.reservedQuantity ?? item.reserved_quantity ?? 0);
        const unit = item.unit || prod?.unit || 'KG';

        return {
          ...item,
          productId: pId,
          product_id: pId,
          productName: prod?.name || prod?.title || `Produce #${pId?.substring(0, 8)}`,
          category: prod?.category || prod?.categoryName || 'Agricultural Produce',
          price: prod?.price ?? null,
          unit,
          availableQuantity: avail,
          reservedQuantity: res,
          available: item.available !== undefined ? item.available : avail > 0,
          imageUrl: prod?.imageUrl || prod?.image_url || prod?.images?.[0]?.imageUrl || null,
        };
      });

      // Include any product owned by farmer that doesn't have an inventory entry yet
      const registeredIds = new Set(list.map((i) => i.productId));
      myProducts.forEach((prod) => {
        if (prod.id && !registeredIds.has(prod.id)) {
          const qty = Number(prod.quantity ?? 0);
          list.push({
            productId: prod.id,
            product_id: prod.id,
            productName: prod.name || prod.title || `Produce #${prod.id.substring(0, 8)}`,
            category: prod.category || prod.categoryName || 'Agricultural Produce',
            price: prod.price ?? null,
            unit: prod.unit || 'KG',
            availableQuantity: qty,
            reservedQuantity: 0,
            available: qty > 0,
            imageUrl: prod.imageUrl || prod.image_url || prod.images?.[0]?.imageUrl || null,
          });
        }
      });

      setInventoryList(list);
    } catch (err) {
      toast.error('Failed to load farm inventory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    const qty = parseFloat(adjustQty);

    if (isNaN(qty) || qty <= 0) {
      toast.warning('Please specify a valid quantity greater than 0.');
      return;
    }

    const pId = selectedItem?.productId || selectedItem?.product_id;
    if (!pId) {
      toast.error('Product identifier not found. Please refresh and try again.');
      return;
    }

    const currentAvail = Number(selectedItem.availableQuantity ?? 0);
    const unit = selectedItem.unit || 'units';

    if (adjustType === 'remove' && qty > currentAvail) {
      toast.error(
        `Cannot remove ${qty} ${unit}. Available stock is only ${currentAvail} ${unit}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (adjustType === 'add') {
        await inventoryService.addStock(pId, qty);
        toast.success(`Successfully added ${qty} ${unit} to stock.`);
      } else if (adjustType === 'remove') {
        await inventoryService.removeStock(pId, qty);
        toast.success(`Successfully removed ${qty} ${unit} from stock.`);
      }

      setSelectedItem(null);
      setAdjustQty('');
      await loadInventory();
    } catch (err) {
      toast.error(err.message || 'Failed to adjust inventory stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner text="Loading physical stock levels..." />
      </div>
    );
  }

  // Live calculation preview values for the modal
  const parsedQty = parseFloat(adjustQty) || 0;
  const currentAvail = Number(selectedItem?.availableQuantity ?? 0);
  const currentReserved = Number(selectedItem?.reservedQuantity ?? 0);
  const itemUnit = selectedItem?.unit || 'units';

  let projectedAvail = currentAvail;
  if (adjustType === 'add') {
    projectedAvail = currentAvail + parsedQty;
  } else if (adjustType === 'remove') {
    projectedAvail = Math.max(0, currentAvail - parsedQty);
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Stock & Inventory Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time available stock, customer reserved quantities, and adjust batch numbers.
          </p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadInventory}>
          Refresh Stock
        </Button>
      </div>

      {inventoryList.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Produce / Crop</th>
                  <th className="py-3.5 px-4 text-right">Available Stock</th>
                  <th className="py-3.5 px-4 text-right">Reserved (In Orders)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Stock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryList.map((item) => {
                  const pId = item.productId || item.product_id;
                  const avail = item.availableQuantity ?? 0;
                  const res = item.reservedQuantity ?? 0;

                  return (
                    <tr key={pId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 flex-shrink-0">
                              <Sprout className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                              {item.productName}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-slate-400 font-mono">
                                #{pId?.substring(0, 8)}
                              </span>
                              {item.price && (
                                <span className="text-[11px] font-semibold text-slate-500">
                                  {formatCurrency(item.price)}/{item.unit}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-brand-700 text-sm sm:text-base">
                        {formatQuantity(avail, item.unit)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-500">
                        {formatQuantity(res, item.unit)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.available ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5" /> Depleted
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Boxes}
                          onClick={() => {
                            setSelectedItem(item);
                            setAdjustType('add');
                            setAdjustQty('');
                          }}
                        >
                          Adjust Stock
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Boxes}
          title="No inventory records"
          description="Your products will automatically appear in inventory tracking once created."
          actionLabel="List Produce"
          onAction={() => {
            window.location.href = '/sell';
          }}
        />
      )}

      {/* Stock Adjustment Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Adjust Stock — ${
            selectedItem.productName ||
            `Product #${(selectedItem.productId || selectedItem.product_id)?.substring(0, 8)}`
          }`}
        >
          <form onSubmit={handleStockAdjustment} className="space-y-4">
            {/* Action Type Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAdjustType('add')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  adjustType === 'add'
                    ? 'bg-white text-brand-700 shadow-soft-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stock</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('remove')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  adjustType === 'remove'
                    ? 'bg-white text-rose-700 shadow-soft-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Remove Stock</span>
              </button>
            </div>

            {/* Interactive Live Calculation Helper Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-600">
                <span>Current Available Stock:</span>
                <span className="font-semibold text-slate-900">
                  {formatQuantity(currentAvail, itemUnit)}
                </span>
              </div>
              {currentReserved > 0 && (
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Reserved in Orders:</span>
                  <span className="font-medium text-amber-700">
                    {formatQuantity(currentReserved, itemUnit)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 font-bold text-xs">
                <span className="text-slate-700">Projected Available:</span>
                <span
                  className={
                    adjustType === 'remove' && parsedQty > currentAvail
                      ? 'text-rose-600'
                      : 'text-brand-700'
                  }
                >
                  {formatQuantity(projectedAvail, itemUnit)}
                </span>
              </div>
            </div>

            <Input
              label={
                adjustType === 'add'
                  ? `Quantity to Add (${itemUnit})`
                  : `Quantity to Remove (${itemUnit})`
              }
              type="number"
              min="0.001"
              step="any"
              placeholder={adjustType === 'add' ? 'e.g. 50' : 'e.g. 20'}
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              required
            />

            {adjustType === 'remove' && currentAvail > 0 && (
              <p className="text-[11px] text-slate-500">
                Maximum quantity you can remove is {formatQuantity(currentAvail, itemUnit)}.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                variant={adjustType === 'remove' ? 'danger' : 'primary'}
                isLoading={isSubmitting}
              >
                {adjustType === 'add' ? 'Add to Stock' : 'Remove from Stock'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  PlusCircle,
  Edit,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { productService } from '@/services/product/productService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/empty-states/EmptyState';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency, formatQuantity } from '@/utils/formatters';

export function SellingPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMyProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getMyProducts();
      setProducts(data || []);
    } catch (err) {
      toast.error('Failed to load your listed products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyProducts();
  }, []);

  const handleDeleteProduct = async (productId, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await productService.deleteProduct(productId);
      toast.success('Product deleted successfully.');
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner text="Loading your farm listings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Listed Produce & Crops</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your active marketplace listings, pricing, and images.</p>
        </div>
        <Link to="/sell">
          <Button variant="earth" icon={PlusCircle}>
            List New Produce
          </Button>
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Unit Price</th>
                  <th className="py-3.5 px-4 text-right">Stock</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const imgUrl =
                    product.images?.find((img) => img.primary)?.imageUrl ||
                    product.images?.[0]?.imageUrl ||
                    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=200';

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 line-clamp-1">{product.name}</h4>
                            <p className="text-[11px] text-slate-500">{product.location || 'Direct Farm'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {product.categoryName || 'Produce'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        {formatCurrency(product.price)} <span className="text-[10px] font-normal text-slate-400">/{product.unit || 'unit'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                        {formatQuantity(product.quantity, product.unit)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={product.status === 'ACTIVE' ? 'emerald' : 'rose'}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/products/${product.id}`} title="View Product Page">
                            <Button size="sm" variant="ghost" className="p-1.5">
                              <Eye className="w-4 h-4 text-slate-500" />
                            </Button>
                          </Link>
                          <Link to={`/dashboard/selling/edit/${product.id}`} title="Edit Product">
                            <Button size="sm" variant="ghost" className="p-1.5">
                              <Edit className="w-4 h-4 text-brand-600" />
                            </Button>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
          icon={Layers}
          title="No listed products yet"
          description="You have not added any harvest or crop listings to the marketplace."
          actionLabel="List Your First Crop"
          onAction={() => {
            window.location.href = '/sell';
          }}
        />
      )}
    </div>
  );
}

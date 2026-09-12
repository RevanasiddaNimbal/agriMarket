import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  ArrowRight,
  Share2,
  Sparkles,
  Sprout,
  ArrowLeft,
} from 'lucide-react';
import { productService } from '@/services/product/productService';
import { inventoryService } from '@/services/inventory/inventoryService';
import { ImageGallery } from '@/components/product/ImageGallery';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/common/Button';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Spinner } from '@/components/loaders/Spinner';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { formatCurrency, formatQuantity } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

export function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const [prod, imgs, avail, otherRes] = await Promise.all([
          productService.getProductById(productId),
          productService.getProductImages(productId).catch(() => []),
          inventoryService.getAvailability(productId).catch(() => null),
          productService.searchProducts({ size: 8 }).catch(() => ({ products: [] })),
        ]);

        setProduct(prod);
        setImages(imgs || []);
        setAvailability(avail);

        const list = otherRes?.products || otherRes?.content || [];
        setRelatedProducts(list.filter((p) => p && p.id !== productId).slice(0, 4));
      } catch (err) {
        setError(err.message || 'Unable to load product details.');
      } finally {
        setIsLoading(false);
      }
    }

    if (productId) {
      loadDetails();
      window.scrollTo(0, 0);
    }
  }, [productId]);

  const maxAvailable = availability?.availableQuantity ?? availability?.available_quantity ?? product?.quantity ?? 0;
  const isAvailable = maxAvailable > 0 && product?.status === 'ACTIVE';

  const handleBuyNow = () => {
    if (!isAvailable) {
      toast.error('This product is currently out of stock.');
      return;
    }
    navigate(`/checkout/${productId}?qty=${quantity}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Product link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" text="Loading farm produce specifications..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorDisplay
          title="Product Not Found"
          message={error || 'The requested product could not be loaded.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const totalPrice = (product.price || 0) * quantity;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-7 animate-fade-in">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { label: 'Marketplace', to: '/marketplace' },
            { label: product.categoryName || 'Produce', to: `/marketplace?category=${product.categoryId}` },
            { label: product.name },
          ]}
        />
        <Link
          to="/marketplace"
          className="text-xs font-bold text-slate-500 hover:text-brand-700 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Market
        </Link>
      </div>

      {/* Main Product Card — Compact, Well-Proportioned Layout */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-soft-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-7 items-start">
          {/* Left Column: Compact Square Image Gallery & Guarantees */}
          <div className="md:col-span-5 space-y-4">
            <ImageGallery images={images.length > 0 ? images : product.images} fallbackTitle={product.name} />

            {/* Compact Trust Badges */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                <span className="truncate">Direct Farm Sourced</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Truck className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                <span className="truncate">Secure OTP Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Specs, Quantity Selector & Buy Action */}
          <div className="md:col-span-7 space-y-4">
            {/* Badges & Share Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                  {product.categoryName || 'Agricultural Produce'}
                </span>
                {isAvailable ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                  </span>
                )}
              </div>

              <button
                onClick={handleShare}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Share product"
                title="Share produce link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>
              {product.location && (
                <div className="flex items-center gap-1 text-xs font-medium text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Farm Origin: {product.location}</span>
                </div>
              )}
            </div>

            {/* Compact Price & Stock Card */}
            <div className="p-4 rounded-2xl bg-[#FEF9E7]/70 border border-[#F6EFCF] flex items-center justify-between gap-4 shadow-soft-xs">
              <div>
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  Direct Farmer Rate
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">/{product.unit || 'kg'}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  Inventory
                </div>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                  {formatQuantity(maxAvailable, product.unit)}
                </div>
              </div>
            </div>

            {/* Purchase Quantity Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Select Quantity ({product.unit || 'unit'})
                </label>
                <span className="text-slate-500">
                  Total: <strong className="text-slate-900 text-sm font-black">{formatCurrency(totalPrice)}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-slate-200 rounded-xl bg-white shadow-soft-xs overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-40"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={maxAvailable || 1}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setQuantity(Math.max(1, Math.min(val, maxAvailable || 1)));
                      }
                    }}
                    className="w-14 text-center font-bold text-slate-900 focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxAvailable || 1, q + 1))}
                    className="p-2.5 text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-40"
                    disabled={quantity >= maxAvailable}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary Buy Now Button */}
                <Button
                  size="md"
                  variant="primary"
                  className="flex-1 justify-center py-2.5 text-sm font-bold shadow-soft-sm"
                  disabled={!isAvailable}
                  onClick={handleBuyNow}
                  icon={ShoppingBag}
                >
                  {isAvailable ? `Buy Now — ${formatCurrency(totalPrice)}` : 'Out of Stock'}
                </Button>
              </div>
            </div>

            {/* Specifications Quick Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Unit Type</span>
                <span className="font-bold text-slate-800 capitalize">{product.unit || 'Kilogram'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Quality Status</span>
                <span className="font-bold text-emerald-700">Farmer Verified</span>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="pt-3 border-t border-slate-100 space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Produce Description
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explore Other Farm Produce Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-brand-600" />
              <div>
                <h2 className="font-extrabold text-lg text-slate-900">
                  Explore Other Farm Produce
                </h2>
                <p className="text-xs text-slate-500">
                  Fresh harvests and agricultural supplies available directly from growers
                </p>
              </div>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
            >
              <span>View All Market Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

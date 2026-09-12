import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Trash2,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Power,
  AlertTriangle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { adminService } from '@/services/admin/adminService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/loaders/Spinner';
import { Modal } from '@/components/common/Modal';
import { formatCurrency, formatQuantity, formatDate } from '@/utils/formatters';
import { getUserAvatar, getInitialsAvatar } from '@/utils/avatarUtils';

const DEFAULT_PRODUCE_IMAGE =
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600';

export function AdminProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProductData = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getProductById(productId);
      setProduct(data);

      // Attempt to fetch farmer details if farmerId or farmer_id is available
      const farmerId = data?.farmerId || data?.farmer_id;
      if (farmerId) {
        try {
          const farmerData = await adminService.getUserById(farmerId);
          setFarmer(farmerData);
        } catch (err) {
          console.warn('Farmer profile lookup omitted:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
      toast.error('Failed to load produce record.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadProductData();
    }
  }, [productId]);

  const handleToggleStatus = async () => {
    if (!product) return;
    setIsTogglingStatus(true);
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updateProductStatus(product.id, newStatus);
      toast.success(`Produce listing marked as ${newStatus}.`);
      setProduct((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      toast.error(err.message || 'Failed to update produce status.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await adminService.deleteProduct(product.id);
      toast.success(`Produce "${product.name}" deleted successfully.`);
      setIsDeleteDialogOpen(false);
      navigate('/admin/products');
    } catch (err) {
      setIsDeleteDialogOpen(false);
      const code = err?.code || '';
      const msg = err?.message || '';
      if (
        code === 'DATA_INTEGRITY_VIOLATION' ||
        err?.status === 409 ||
        msg.toLowerCase().includes('data constraint') ||
        msg.toLowerCase().includes('order')
      ) {
        toast.error('Cannot delete: Linked to existing orders. Deactivate instead.');
      } else {
        toast.error(err.message || 'Failed to delete produce listing.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs">
        <Spinner text="Loading produce details..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/90 p-8 shadow-soft-xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-base text-slate-900">Produce Record Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested produce listing does not exist or may have been deleted.
        </p>
        <Link to="/admin/products">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to Products Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const activeImageUrl =
    images[selectedImageIndex]?.imageUrl ||
    images[selectedImageIndex]?.image_url ||
    product.imageUrl ||
    product.image_url ||
    DEFAULT_PRODUCE_IMAGE;

  const isLowStock = Number(product.quantity || 0) <= 10;
  const isOutOfStock = Number(product.quantity || 0) <= 0;

  const farmerId = farmer?.id || product?.farmerId || product?.farmer_id;
  const farmerName =
    farmer?.fullName ||
    product?.farmerName ||
    product?.farmer_name ||
    'Registered Farmer';
  const farmLocation = product?.location || 'Direct Farm Origin';

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* 1. Top Header Bar matching AdminUserDetailPage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/admin/products">
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Back to Products
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-soft-xs">
              <Package className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Produce: {product.name || 'Product Details'}
            </h1>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <Link to={`/products/${product.id}`}>
            <Button
              variant="outline"
              size="sm"
              icon={ExternalLink}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              View in Marketplace
            </Button>
          </Link>

          <Button
            size="sm"
            variant={product.status === 'ACTIVE' ? 'outline' : 'earth'}
            icon={product.status === 'ACTIVE' ? Power : CheckCircle2}
            loading={isTogglingStatus}
            onClick={handleToggleStatus}
            className="text-xs font-semibold"
          >
            {product.status === 'ACTIVE' ? 'Deactivate Listing' : 'Activate Listing'}
          </Button>

          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-xs font-semibold"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* 2. Main Content: 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Produce Identity & Media */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft-xs space-y-5">
          {/* Main Image View */}
          <div className="space-y-2">
            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-soft-xs">
              <img
                src={activeImageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_PRODUCE_IMAGE;
                }}
              />
            </div>

            {/* Thumbnail Strip if Multiple Images */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.imageUrl || img.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Title & Badges */}
          <div className="space-y-2 pb-3 border-b border-slate-100">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{product.name}</h2>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                  product.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                    : 'bg-rose-50 text-rose-700 border-rose-200/70'
                }`}
              >
                {product.status === 'ACTIVE' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-rose-600" /> Inactive
                  </>
                )}
              </span>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{product.location || 'Direct Farm Origin'}</span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              ID: {product.id}
            </div>
          </div>

          {/* Price & Stock Highlight Blocks */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Unit Price</span>
              <span className="font-black text-slate-900 text-lg mt-0.5 block">
                {formatCurrency(product.price)}
              </span>
              <span className="text-[10px] text-slate-400">per {product.unit || 'KG'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Stock</span>
              <span className="font-bold text-slate-900 text-lg mt-0.5 block">
                {formatQuantity(product.quantity, product.unit)}
              </span>
              <div className="mt-1">
                {isOutOfStock ? (
                  <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Low Stock
                  </span>
                ) : (
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    In Stock
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Category Chip */}
          <div className="pt-2 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Category:</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/60">
              {product.categoryName || 'Produce'}
            </span>
          </div>
        </div>

        {/* Right Column: Ownership, Audit & Detailed Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Farmer & Origin Ownership */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                <User className="w-4 h-4" /> Farmer & Origin Ownership
              </h3>
              {farmerId && (
                <Link
                  to={`/admin/users/${farmerId}`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
                >
                  <span>View Farmer Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Farmer Profile Card */}
            {farmer ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-3.5">
                  <img
                    src={getUserAvatar(farmer)}
                    alt={farmer.fullName || farmerName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-soft-xs bg-slate-100 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = getInitialsAvatar(farmer?.fullName || farmerName);
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {farmer.fullName || farmerName}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {farmer.email}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1 font-semibold">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {farmer.phoneNumber || 'No phone provided'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 sm:self-center">
                  {farmer.phoneVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      <ShieldCheck className="w-3 h-3" /> Phone Verified
                    </span>
                  )}
                  {farmer.emailVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      <ShieldCheck className="w-3 h-3" /> Email Verified
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <img
                  src={getInitialsAvatar(farmerName)}
                  alt={farmerName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-soft-xs bg-slate-100 flex-shrink-0"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{farmerName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Registered Farmer</p>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Produce Audit & Telemetry Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft-xs space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-purple-700 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4" /> Produce Audit & Telemetry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Listed Date</span>
                <p className="text-slate-900 font-bold mt-1 text-sm">
                  {formatDate(product.createdAt || product.created_at, true) || 'N/A'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Last Updated</span>
                <p className="text-slate-900 font-bold mt-1 text-sm">
                  {formatDate(product.updatedAt || product.updated_at, true) || 'N/A'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Category ID</span>
                <p className="text-slate-900 font-mono font-bold mt-1 text-xs truncate" title={product.categoryId}>
                  {product.categoryId || 'N/A'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Active Marketplace Status</span>
                <p className="text-slate-900 font-bold mt-1 text-sm flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      product.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  {product.status === 'ACTIVE' ? 'Catalog Active' : 'Catalog Inactive'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Produce Description & Harvest Notes */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft-xs space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-emerald-600" /> Produce Description & Harvest Notes
            </h3>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
              {product.description || 'No detailed description provided for this produce listing.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <Modal
          isOpen={isDeleteDialogOpen}
          onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
          title="Delete Produce Listing"
          description="Permanently remove produce listing from the platform catalog."
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-slate-600">
            <p className="leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{product.name}"</strong>?
              This action cannot be undone and will permanently erase this produce listing and its inventory history.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={isDeleting}
                icon={Trash2}
                onClick={handleDeleteProduct}
              >
                Delete Produce
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

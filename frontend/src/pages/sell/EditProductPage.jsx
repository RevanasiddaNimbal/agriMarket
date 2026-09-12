import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Edit,
  Upload,
  Trash2,
  Check,
  Star,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { productService } from '@/services/product/productService';
import { categoryService } from '@/services/category/categoryService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Spinner } from '@/components/loaders/Spinner';

export function EditProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'KG',
    quantity: '',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prod, catList, imgList] = await Promise.all([
        productService.getProductById(productId),
        categoryService.getAllCategories(),
        productService.getProductImages(productId).catch(() => []),
      ]);

      setProduct(prod);
      setCategories(catList || []);
      setImages(imgList || []);
      setFormData({
        categoryId: prod.categoryId || prod.category_id || (catList?.[0]?.id || ''),
        name: prod.name || '',
        description: prod.description || '',
        price: prod.price?.toString() || '',
        unit: prod.unit || 'KG',
        quantity: prod.quantity?.toString() || '',
        location: prod.location || '',
      });
    } catch (err) {
      toast.error('Failed to load product for editing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) loadData();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await productService.updateProduct(productId, {
        categoryId: formData.categoryId || product?.categoryId || product?.category_id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        unit: formData.unit,
        quantity: parseFloat(formData.quantity),
        location: formData.location.trim(),
      });
      toast.success('Produce details updated successfully.');
      navigate('/dashboard/selling');
    } catch (err) {
      toast.error(err.message || 'Failed to update product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadNewImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      await productService.uploadProductImage(productId, file);
      toast.success('Image uploaded successfully.');
      const updatedImages = await productService.getProductImages(productId);
      setImages(updatedImages || []);
    } catch (err) {
      toast.error(err.message || 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      await productService.setPrimaryImage(productId, imageId);
      toast.success('Primary image updated.');
      const updatedImages = await productService.getProductImages(productId);
      setImages(updatedImages || []);
    } catch (err) {
      toast.error(err.message || 'Failed to update primary image.');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this photo?')) return;

    try {
      await productService.deleteProductImage(productId, imageId);
      toast.success('Image deleted.');
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete image.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner text="Loading produce details for editing..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'My Listed Products', to: '/dashboard/selling' },
          { label: `Edit: ${product?.name || 'Produce'}` },
        ]}
      />

      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Harvest Produce</h1>
          <p className="text-xs text-slate-500 mt-0.5">Update prices, stock, descriptions, and uploaded photos.</p>
        </div>
        <Link to="/dashboard/selling">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Cancel
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-soft-sm space-y-8">
        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Crop / Produce Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Unit Price (₹)"
              type="number"
              min="0.1"
              step="any"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />

            <Select
              label="Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              options={[
                { id: 'KG', name: 'Kilograms (KG)' },
                { id: 'QUINTAL', name: 'Quintal' },
                { id: 'TON', name: 'Ton' },
                { id: 'BAG', name: 'Bag' },
                { id: 'LITER', name: 'Liter' },
                { id: 'PIECE', name: 'Piece' },
              ]}
            />

            <Input
              label="Stock Available"
              type="number"
              min="0"
              step="any"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <Input
            label="Farm Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Produce Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 transition-all"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" isLoading={isSaving} icon={Check}>
              Save Produce Changes
            </Button>
          </div>
        </form>

        {/* Manage Images Section */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Crop Photos ({images.length})</h3>
            <label
              htmlFor="add-image"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingImage ? 'Uploading...' : 'Upload New Photo'}</span>
            </label>
            <input
              id="add-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadNewImage}
              disabled={isUploadingImage}
            />
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-soft-sm group">
                  <img src={img.imageUrl} alt="Crop" className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    {!img.primary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(img.id)}
                        className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-amber-500 transition-colors text-[10px] font-bold flex items-center gap-1"
                        title="Set Primary"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-rose-600 transition-colors"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {img.primary && (
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase bg-brand-600 text-white px-2 py-0.5 rounded-md shadow-soft-sm">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No images uploaded for this crop listing yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

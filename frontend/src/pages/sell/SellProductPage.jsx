import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  PlusCircle,
  X,
  MapPin,
  Map,
  Navigation,
  Bookmark,
  Check,
  Loader2,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { productService } from '@/services/product/productService';
import { categoryService } from '@/services/category/categoryService';
import { addressService } from '@/services/address/addressService';
import { userService } from '@/services/user/userService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Modal } from '@/components/common/Modal';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import {
  LocationMapModal,
  getCurrentLocationAddress,
} from '@/components/location/LocationMapModal';

export function SellProductPage() {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);

  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    unit: 'KG',
    quantity: '',
    location: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Strictly 3 Location Selection Modals & GPS State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isSavedAddressesModalOpen, setIsSavedAddressesModalOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Phone Verification Modal State
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phoneNumber || '');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Synchronize phone input with authenticated user profile
  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneInput(user.phoneNumber);
    }
  }, [user?.phoneNumber]);

  // Load Categories & Saved Profile Addresses
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      setIsCategoriesLoading(true);
      try {
        const [catList, addrs] = await Promise.allSettled([
          categoryService.getAllCategories(),
          addressService.getUserAddresses(),
        ]);

        if (isMounted) {
          if (catList.status === 'fulfilled' && Array.isArray(catList.value)) {
            setCategories(catList.value);
            if (catList.value.length > 0) {
              setFormData((prev) => ({
                ...prev,
                categoryId: prev.categoryId || catList.value[0].id,
              }));
            }
          }

          if (addrs.status === 'fulfilled' && Array.isArray(addrs.value) && addrs.value.length > 0) {
            setSavedAddresses(addrs.value);

            // Auto-prefill farm location from profile default address
            const defaultAddr = addrs.value.find((a) => a.defaultAddress) || addrs.value[0];
            if (defaultAddr) {
              const parts = [
                defaultAddr.village,
                defaultAddr.city || defaultAddr.district,
                defaultAddr.state || 'Karnataka',
              ].filter(Boolean);
              const formattedLoc = (parts.length > 0 ? parts.join(', ') : defaultAddr.addressLine1 || '').slice(0, 100);

              setFormData((prev) => {
                if (!prev.location && formattedLoc) {
                  return { ...prev, location: formattedLoc };
                }
                return prev;
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load initial selling data:', err);
      } finally {
        if (isMounted) setIsCategoriesLoading(false);
      }
    }

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update field and clear error
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Crop photo selection (mandatory minimum 1, max 5)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      toast.warning('Maximum 5 photos allowed.');
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
    if (errors.images) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.images;
        return next;
      });
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Location Option 1: Saved Address
  const handleApplyProfileAddress = (addr) => {
    if (!addr) return;
    const parts = [
      addr.village,
      addr.city || addr.district,
      addr.state || 'Karnataka',
    ].filter(Boolean);
    const locStr = (parts.length > 0 ? parts.join(', ') : addr.addressLine1 || 'Karnataka, India').slice(0, 100);
    handleFieldChange('location', locStr);
    setIsSavedAddressesModalOpen(false);
    toast.success(`Location set: ${locStr}`);
  };

  // Location Option 2: Map Pin Drop
  const handleSelectMapLocation = (details) => {
    if (!details) return;
    const parts = [
      details.village,
      details.city || details.district,
      details.state || 'Karnataka',
    ].filter(Boolean);
    const locStr = (parts.length > 0 ? parts.join(', ') : details.addressLine1 || 'Karnataka, India').slice(0, 100);
    handleFieldChange('location', locStr);
    setIsMapModalOpen(false);
    toast.success(`Location pinned: ${locStr}`);
  };

  // Location Option 3: Current Location (GPS)
  const handleUseCurrentLocation = async () => {
    setIsDetectingGps(true);
    try {
      const loc = await getCurrentLocationAddress();
      const parts = [
        loc.village,
        loc.city || loc.district,
        loc.state || 'Karnataka',
      ].filter(Boolean);
      const locStr = (parts.length > 0 ? parts.join(', ') : loc.addressLine1 || 'Karnataka, India').slice(0, 100);
      handleFieldChange('location', locStr);
      toast.success(`GPS location detected: ${locStr}`);
    } catch (err) {
      toast.error('Could not detect GPS location. Please choose on the map or select a saved address.');
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Phone OTP dispatch
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanPhone = phoneInput.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.warning('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSendingOtp(true);
    try {
      await userService.sendPhoneOtp(cleanPhone);
      setOtpSent(true);
      toast.success(`OTP sent to +91 ${cleanPhone}`);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Phone OTP verification
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      toast.warning('Please enter the OTP received.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await userService.verifyPhoneOtp({
        phoneNumber: phoneInput.trim(),
        otp: cleanOtp,
      });
      toast.success('Phone verified successfully!');
      setOtpSent(false);
      setOtpCode('');
      setIsPhoneModalOpen(false);
      await refreshProfile();
    } catch (err) {
      toast.error(err.message || 'Invalid or expired OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Form Validation matching backend rules & mandatory photo
  const validateForm = () => {
    const newErrors = {};

    // Name (2 - 150 chars)
    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) {
      newErrors.name = 'Crop name is required';
    } else if (nameTrimmed.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (nameTrimmed.length > 150) {
      newErrors.name = 'Name cannot exceed 150 characters';
    }

    // Category
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    // Price (whole number only, min 1, no decimals)
    const numPrice = Number(formData.price);
    if (!formData.price || isNaN(numPrice)) {
      newErrors.price = 'Price is required';
    } else if (numPrice < 1) {
      newErrors.price = 'Price must be at least ₹1';
    } else if (!Number.isInteger(numPrice) || formData.price.toString().includes('.')) {
      newErrors.price = 'Price must be a whole number (no decimals)';
    }

    // Unit
    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }

    // Quantity (min 0.01)
    const numQty = parseFloat(formData.quantity);
    if (!formData.quantity || isNaN(numQty)) {
      newErrors.quantity = 'Quantity is required';
    } else if (numQty < 0.01) {
      newErrors.quantity = 'Quantity must be at least 0.01';
    }

    // Location (max 100 chars)
    const locTrimmed = formData.location.trim();
    if (!locTrimmed) {
      newErrors.location = 'Farm location is required';
    } else if (locTrimmed.length > 100) {
      newErrors.location = 'Location cannot exceed 100 characters';
    }

    // Description (10 - 2000 chars)
    const descTrimmed = formData.description.trim();
    if (!descTrimmed) {
      newErrors.description = 'Description is required';
    } else if (descTrimmed.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (descTrimmed.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }

    // Mandatory Image
    if (selectedFiles.length === 0) {
      newErrors.images = 'At least 1 crop photo is required to publish.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Listing
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mandatory phone verification check
    if (!user?.phoneVerified) {
      toast.warning('Please verify your phone number before publishing.');
      setIsPhoneModalOpen(true);
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting.');
      const firstKey = Object.keys(errors)[0] || 'name';
      const el = document.getElementById(firstKey);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Product
      const createdProduct = await productService.createProduct({
        categoryId: formData.categoryId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price, 10),
        unit: formData.unit,
        quantity: parseFloat(formData.quantity),
        location: formData.location.trim(),
      });

      // 2. Upload Crop Photos
      if (selectedFiles.length > 0 && createdProduct?.id) {
        let uploadedCount = 0;
        for (const file of selectedFiles) {
          try {
            await productService.uploadProductImage(createdProduct.id, file);
            uploadedCount++;
          } catch (uploadErr) {
            console.warn('Image upload failed for file:', uploadErr);
          }
        }
        if (uploadedCount > 0) {
          toast.success(`Uploaded ${uploadedCount} photo(s).`);
        }
      }

      toast.success('Produce listed successfully!');
      navigate(`/products/${createdProduct.id}`);
    } catch (err) {
      console.error('Failed to create product listing:', err);

      if (err.validationErrors && typeof err.validationErrors === 'object') {
        const serverErrors = {};
        Object.entries(err.validationErrors).forEach(([field, msg]) => {
          serverErrors[field] = msg;
        });
        setErrors(serverErrors);
      }

      toast.error(err.message || 'Failed to publish listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estimated lot total value
  const totalLotValue = useMemo(() => {
    const p = parseInt(formData.price, 10);
    const q = parseFloat(formData.quantity);
    if (!isNaN(p) && !isNaN(q) && p > 0 && q > 0) {
      return (p * q).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    }
    return null;
  }, [formData.price, formData.quantity]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'My Listings', to: '/dashboard/selling' },
          { label: 'Sell Produce' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Sell Produce
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            List your harvest for buyers on the marketplace.
          </p>
        </div>

        <Link to="/dashboard/selling">
          <Button variant="outline" size="sm">
            My Listings →
          </Button>
        </Link>
      </div>

      {/* Phone Verification Alert Banner (If unverified) */}
      {!user?.phoneVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">Phone Verification Required</h4>
              <p className="text-xs text-amber-700">Please verify your phone number before listing produce.</p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="earth"
            onClick={() => setIsPhoneModalOpen(true)}
            className="flex-shrink-0"
          >
            Verify Phone
          </Button>
        </div>
      )}

      {/* Main Material Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-soft-sm">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Crop Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="name"
              label="Crop Name"
              placeholder="e.g. Wheat, Tomato, Onion"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={errors.name}
              required
            />

            <Select
              id="categoryId"
              label="Category"
              value={formData.categoryId}
              onChange={(e) => handleFieldChange('categoryId', e.target.value)}
              options={categories.map((c) => ({ id: c.id, name: c.name }))}
              error={errors.categoryId}
              required
              disabled={isCategoriesLoading}
            />
          </div>

          {/* Section 2: Pricing & Stock */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between pb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Pricing &amp; Stock
              </span>
              {totalLotValue && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Est. Total: ₹{totalLotValue}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                id="price"
                label="Price per Unit (₹)"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 45"
                value={formData.price}
                onChange={(e) => {
                  const intOnly = e.target.value.replace(/[^0-9]/g, '');
                  handleFieldChange('price', intOnly);
                }}
                error={errors.price}
                required
              />

              <Select
                id="unit"
                label="Unit"
                value={formData.unit}
                onChange={(e) => handleFieldChange('unit', e.target.value)}
                options={[
                  { id: 'KG', name: 'Kilograms (KG)' },
                  { id: 'QUINTAL', name: 'Quintal' },
                  { id: 'TON', name: 'Ton' },
                  { id: 'BAG', name: 'Bag' },
                  { id: 'LITER', name: 'Liter' },
                  { id: 'PIECE', name: 'Piece' },
                ]}
                error={errors.unit}
                required
              />

              <Input
                id="quantity"
                label="Available Quantity"
                type="number"
                min="0.01"
                step="any"
                placeholder="e.g. 100"
                value={formData.quantity}
                onChange={(e) => handleFieldChange('quantity', e.target.value)}
                error={errors.quantity}
                required
              />
            </div>
          </div>

          {/* Section 3: Farm Location (Strictly 3 Options: Current Location, Map, Saved Addresses) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1.5">
              <label htmlFor="location" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Farm Location <span className="text-rose-500">*</span>
              </label>

              {/* 3 Location Action Options */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isDetectingGps}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  {isDetectingGps ? (
                    <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>Current Location</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 text-xs font-semibold text-slate-700 hover:text-brand-700 transition-colors cursor-pointer"
                >
                  <Map className="w-3.5 h-3.5 text-brand-600" />
                  <span>Select on Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (savedAddresses.length === 0) {
                      toast.info('No saved addresses found. Please use Current Location or Map.');
                    } else if (savedAddresses.length === 1) {
                      handleApplyProfileAddress(savedAddresses[0]);
                    } else {
                      setIsSavedAddressesModalOpen(true);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                  <span>Saved Addresses {savedAddresses.length > 0 ? `(${savedAddresses.length})` : ''}</span>
                </button>
              </div>
            </div>

            <Input
              id="location"
              placeholder="e.g. Nimbal, Vijayapura, Karnataka"
              icon={MapPin}
              value={formData.location}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              error={errors.location}
              required
            />
          </div>

          {/* Section 4: Produce Description */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Description <span className="text-rose-500">*</span>
              </label>
              <span className={`text-xs font-medium ${
                formData.description.trim().length >= 10 ? 'text-slate-400' : 'text-amber-600'
              }`}>
                {formData.description.trim().length} / 2000 (min 10)
              </span>
            </div>

            <textarea
              id="description"
              rows={3}
              placeholder="e.g. Grade A, freshly harvested, packed in bags"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className={`w-full rounded-xl border p-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-100'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-500 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Section 5: Photos (Mandatory minimum 1) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Crop Photos <span className="text-rose-500">*</span>
              </label>
              <span className={`text-xs font-medium ${
                selectedFiles.length >= 1 ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {selectedFiles.length} / 5 uploaded {selectedFiles.length >= 1 && '✓'}
              </span>
            </div>

            {/* Drag & Drop Zone */}
            <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
              errors.images
                ? 'border-rose-300 bg-rose-50/30'
                : 'border-slate-200 hover:border-brand-400 bg-slate-50/50'
            }`}>
              <Upload className={`w-7 h-7 mx-auto mb-1.5 ${errors.images ? 'text-rose-400' : 'text-slate-400'}`} />
              <p className="text-sm font-semibold text-slate-800">
                Drag & drop photos here, or click to browse
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                At least 1 photo required (JPG, PNG, WEBP)
              </p>
              <label
                htmlFor="file-upload"
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 cursor-pointer transition-colors"
              >
                <span>Select Photos</span>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {errors.images && (
              <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.images}</span>
              </p>
            )}

            {/* Previews */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-soft-xs group"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Crop photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-slate-900/80 text-[9px] font-bold text-white rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link to="/dashboard/selling">
              <Button variant="ghost" size="md" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="md"
              variant="earth"
              isLoading={isSubmitting}
              icon={PlusCircle}
            >
              Publish Product
            </Button>
          </div>
        </form>
      </div>

      {/* MODAL 1: Interactive Map Modal (Leaflet Pin Drop) */}
      <LocationMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectLocation={handleSelectMapLocation}
        initialAddress={formData.location || 'Karnataka, India'}
      />

      {/* MODAL 2: Saved Profile Addresses Modal (Using clean Modal component) */}
      <Modal
        isOpen={isSavedAddressesModalOpen}
        onClose={() => setIsSavedAddressesModalOpen(false)}
        title="Select Saved Address"
        description="Choose from your profile addresses."
        maxWidth="max-w-md"
      >
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {savedAddresses.map((addr) => {
            const parts = [addr.village, addr.city || addr.district, addr.state || 'Karnataka'].filter(Boolean);
            const fullText = parts.join(', ');
            const isSelected = formData.location === fullText;

            return (
              <button
                key={addr.id}
                type="button"
                onClick={() => handleApplyProfileAddress(addr)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-brand-50 border-brand-500 shadow-soft-xs'
                    : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>{addr.addressLine1 || fullText}</span>
                    {addr.defaultAddress && (
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded-md">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {fullText} {addr.pincode ? `(${addr.pincode})` : ''}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-brand-600 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </Modal>

      {/* MODAL 3: Mobile Phone & OTP Verification Modal (Using clean Modal component) */}
      <Modal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        title="Verify Mobile Phone"
        description={!otpSent ? "Enter your phone number to receive an SMS OTP." : `Enter the 6-digit code sent to +91 ${phoneInput}.`}
        maxWidth="max-w-md"
      >
        {!otpSent ? (
          // Step 1: Phone Number Input
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-slate-500">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength="10"
                  placeholder="9876543210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 font-semibold"
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="earth"
              size="md"
              isLoading={isSendingOtp}
              className="w-full"
            >
              Send OTP
            </Button>
          </form>
        ) : (
          // Step 2: OTP Verification
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
                >
                  Change number
                </button>
              </div>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center tracking-widest text-lg font-bold py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              variant="earth"
              size="md"
              isLoading={isVerifyingOtp}
              className="w-full"
            >
              Verify & Continue
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="text-xs font-semibold text-slate-500 hover:text-brand-600 cursor-pointer"
              >
                Didn't receive code? Resend OTP
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

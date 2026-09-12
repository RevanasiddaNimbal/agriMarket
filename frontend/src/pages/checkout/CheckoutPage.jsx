import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Truck,
  CreditCard,
  ShoppingBag,
  Check,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  Map,
  Plus,
  ShieldCheck,
  Edit3,
  Loader2,
  Smartphone,
  Banknote,
} from 'lucide-react';
import { productService } from '@/services/product/productService';
import { addressService } from '@/services/address/addressService';
import { checkoutService } from '@/services/checkout/checkoutService';
import { orderService } from '@/services/order/orderService';
import { paymentService } from '@/services/payment/paymentService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency, formatQuantity } from '@/utils/formatters';
import {
  LocationMapModal,
  getCurrentLocationAddress,
} from '@/components/location/LocationMapModal';

// 4 Delivery Methods
const DELIVERY_OPTIONS = [
  {
    id: 'STANDARD',
    title: 'Standard Delivery',
    subtitle: '3–5 business days',
    price: 50,
    priceLabel: '₹50',
  },
  {
    id: 'EXPRESS',
    title: 'Express Delivery',
    subtitle: '1–2 business days',
    price: 100,
    priceLabel: '₹100',
  },
  {
    id: 'FARM_PICKUP',
    title: 'Farm Pickup',
    subtitle: 'Pick up directly from farm',
    price: 0,
    priceLabel: 'FREE',
  },
];

// 3 Payment Methods (UPI, Cash on Delivery, Credit / Debit Card)
const PAYMENT_OPTIONS = [
  {
    id: 'UPI',
    backendMethod: 'UPI',
    title: 'UPI',
    subtitle: 'GPay, PhonePe, Paytm, BHIM',
    icon: Smartphone,
  },
  {
    id: 'COD',
    backendMethod: 'MOCK',
    title: 'Cash on Delivery',
    subtitle: 'Pay cash when produce is delivered',
    icon: Banknote,
  },
  {
    id: 'CARD',
    backendMethod: 'CARD',
    title: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, RuPay',
    icon: CreditCard,
  },
];

export function CheckoutPage() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const initialQty = parseInt(searchParams.get('qty') || '1', 10);

  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Wizard Step (1: Address, 2: Delivery, 3: Payment, 4: Review)
  const [currentStep, setCurrentStep] = useState(1);

  // Data States
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(initialQty > 0 ? initialQty : 1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNewAddressForm, setUseNewAddressForm] = useState(false);

  // New Address Form State
  const [addressForm, setAddressForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phoneNumber || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    state: 'Karnataka',
    pincode: '',
    village: '',
    latitude: null,
    longitude: null,
    locationType: 'MANUAL',
    addressType: 'HOME',
  });

  // Delivery & Payment selections
  const [selectedDeliveryId, setSelectedDeliveryId] = useState('STANDARD');
  const [selectedPaymentId, setSelectedPaymentId] = useState('UPI');

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Sync user details into address form when user loads
  useEffect(() => {
    if (user) {
      setAddressForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phoneNumber || '',
      }));
    }
  }, [user]);

  // Load product and user addresses
  useEffect(() => {
    async function loadCheckoutData() {
      setIsLoading(true);
      try {
        const [prod, addrList] = await Promise.all([
          productService.getProductById(productId),
          addressService.getUserAddresses(),
        ]);

        setProduct(prod);
        const list = addrList || [];
        setAddresses(list);

        if (list.length > 0) {
          const defaultAddr = list.find((a) => a.defaultAddress) || list[0];
          setSelectedAddressId(defaultAddr.id);
          setUseNewAddressForm(false);
        } else {
          setUseNewAddressForm(true);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load checkout details.');
      } finally {
        setIsLoading(false);
      }
    }

    if (productId) loadCheckoutData();
  }, [productId, toast]);

  // Helper to match an existing saved address
  const findMatchingAddress = (loc) => {
    if (!loc || !Array.isArray(addresses) || addresses.length === 0) return null;

    return addresses.find((addr) => {
      // 1. Proximity match by coordinates (within ~500m / 0.005 deg)
      if (
        addr.latitude != null &&
        addr.longitude != null &&
        loc.latitude != null &&
        loc.longitude != null
      ) {
        const latDiff = Math.abs(Number(addr.latitude) - Number(loc.latitude));
        const lngDiff = Math.abs(Number(addr.longitude) - Number(loc.longitude));
        if (latDiff < 0.005 && lngDiff < 0.005) {
          return true;
        }
      }

      // 2. Match on pincode and city
      const addrPin = (addr.pincode || '').replace(/[^0-9]/g, '');
      const locPin = (loc.pincode || '').replace(/[^0-9]/g, '');
      const addrCity = (addr.city || '').trim().toLowerCase();
      const locCity = (loc.city || '').trim().toLowerCase();

      if (addrPin && locPin && addrPin === locPin && addrCity && locCity && addrCity === locCity) {
        return true;
      }

      return false;
    });
  };

  // Process location from Map or GPS: select if already exists, else create new and select
  const handleLocationSelected = async (locationDetails) => {
    if (!locationDetails) return;

    // Check if an existing address matches this location
    const existing = findMatchingAddress(locationDetails);

    if (existing) {
      // Address already exists -> Select it and do NOT create a new one
      setSelectedAddressId(existing.id);
      setUseNewAddressForm(false);
      setAddressForm((prev) => ({
        ...prev,
        addressLine1: existing.addressLine1 || prev.addressLine1,
        addressLine2: existing.addressLine2 || '',
        village: existing.village || '',
        city: existing.city || prev.city,
        district: existing.district || prev.district,
        state: existing.state || prev.state,
        pincode: existing.pincode || prev.pincode,
        latitude: existing.latitude,
        longitude: existing.longitude,
        locationType: existing.locationType || 'MAP',
        addressType: existing.addressType || 'HOME',
      }));
      toast.info(`Selected existing saved address: ${existing.addressLine1 || existing.city}`);
      return;
    }

    // New address -> Create and store in the user's address list
    const cleanPincode =
      locationDetails.pincode && /^[1-9][0-9]{5}$/.test(locationDetails.pincode)
        ? locationDetails.pincode
        : addressForm.pincode && /^[1-9][0-9]{5}$/.test(addressForm.pincode)
        ? addressForm.pincode
        : '586101';

    const newAddressPayload = {
      addressLine1: (locationDetails.addressLine1 || locationDetails.formattedAddress || 'Farm Delivery Address').slice(0, 200),
      addressLine2: locationDetails.village ? locationDetails.village.slice(0, 200) : undefined,
      village: locationDetails.village ? locationDetails.village.slice(0, 100) : undefined,
      city: (locationDetails.city || locationDetails.district || 'Vijayapura').slice(0, 100),
      district: (locationDetails.district || locationDetails.city || 'Vijayapura').slice(0, 100),
      state: (locationDetails.state || 'Karnataka').slice(0, 100),
      pincode: cleanPincode,
      country: 'India',
      locationType: 'MAP',
      latitude: locationDetails.latitude != null ? locationDetails.latitude : undefined,
      longitude: locationDetails.longitude != null ? locationDetails.longitude : undefined,
      addressType: addressForm.addressType || 'HOME',
      defaultAddress: addresses.length === 0,
    };

    setIsProcessing(true);
    try {
      const created = await addressService.createAddress(newAddressPayload);
      setAddresses((prev) => [created, ...prev]);
      setSelectedAddressId(created.id);
      setUseNewAddressForm(false);
      setAddressForm((prev) => ({
        ...prev,
        ...created,
        locationType: 'MAP',
      }));
      toast.success('New location created and saved in your addresses!');
    } catch (err) {
      console.warn('Auto address save failed, falling back to manual confirm:', err);
      setAddressForm((prev) => ({
        ...prev,
        ...newAddressPayload,
        locationType: 'MAP',
      }));
      setUseNewAddressForm(true);
      toast.warning('Please review and save your new delivery address.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle "Use Current Location" (GPS detection)
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const info = await getCurrentLocationAddress();
      await handleLocationSelected(info);
    } catch (err) {
      toast.error('Unable to fetch GPS location. Please select on the map or type manually.');
    } finally {
      setIsLocating(false);
    }
  };

  // Handle Location picked from Map Modal
  const handleMapLocationSelected = async (locationDetails) => {
    await handleLocationSelected(locationDetails);
  };

  // Step 1 Validation & Proceed
  const handleProceedFromAddress = async (e) => {
    if (e) e.preventDefault();

    // If using new address form, validate and save it first
    if (useNewAddressForm || !selectedAddressId) {
      if (!addressForm.addressLine1.trim()) {
        toast.warning('Please provide your street or farm address.');
        return;
      }
      if (!addressForm.city.trim()) {
        toast.warning('Please provide your city or town.');
        return;
      }
      if (!addressForm.pincode.trim() || !/^[1-9][0-9]{5}$/.test(addressForm.pincode.trim())) {
        toast.warning('Please enter a valid 6-digit Indian PIN code.');
        return;
      }

      setIsProcessing(true);
      try {
        const created = await addressService.createAddress({
          addressLine1: addressForm.addressLine1.trim(),
          addressLine2: addressForm.addressLine2.trim() || undefined,
          village: addressForm.village.trim() || undefined,
          city: addressForm.city.trim(),
          district: addressForm.district.trim() || addressForm.city.trim(),
          state: addressForm.state.trim() || 'Karnataka',
          pincode: addressForm.pincode.trim(),
          country: 'India',
          locationType: addressForm.locationType || 'MANUAL',
          latitude: addressForm.latitude || undefined,
          longitude: addressForm.longitude || undefined,
          addressType: addressForm.addressType || 'HOME',
          defaultAddress: addresses.length === 0,
        });

        setAddresses((prev) => [...prev, created]);
        setSelectedAddressId(created.id);
        setUseNewAddressForm(false);
        setCurrentStep(2);
      } catch (err) {
        toast.error(err.message || 'Failed to save delivery address.');
        return;
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Saved address selected
      setCurrentStep(2);
    }
  };

  // Step 4 Final Place Order & Process Payment
  const handleFinalPlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.warning('Please select or specify a delivery address.');
      setCurrentStep(1);
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Validate Checkout
      await checkoutService.validateCheckout({
        productId,
        quantity,
        addressId: selectedAddressId,
      });

      // 2. Place Order
      const order = await orderService.placeOrder({
        productId,
        quantity,
        addressId: selectedAddressId,
      });

      // 3. Process Payment
      const chosenPayment = PAYMENT_OPTIONS.find((p) => p.id === selectedPaymentId);
      const backendMethod = chosenPayment?.backendMethod || 'MOCK';

      await paymentService.processPayment(order.id, backendMethod);

      toast.success('Order placed and payment confirmed successfully!');
      navigate(`/orders/${order.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" text="Preparing secure checkout flow..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <Link to="/marketplace" className="text-brand-600 text-sm mt-2 inline-block">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const unitPrice = product.price || 0;
  const subtotal = unitPrice * quantity;
  const chosenDelivery = DELIVERY_OPTIONS.find((d) => d.id === selectedDeliveryId) || DELIVERY_OPTIONS[0];
  const deliveryFee = chosenDelivery.price;
  const grandTotal = subtotal + deliveryFee;

  // Selected address object for review
  const activeAddress = addresses.find((a) => a.id === selectedAddressId) || null;
  const chosenPayment = PAYMENT_OPTIONS.find((p) => p.id === selectedPaymentId) || PAYMENT_OPTIONS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <Breadcrumb
        items={[
          { label: 'Marketplace', to: '/marketplace' },
          { label: product.name, to: `/products/${product.id}` },
          { label: 'Direct Checkout' },
        ]}
      />

      {/* STEP PROGRESS HEADER (Matching User Wireframe) */}
      <div className="max-w-3xl mx-auto pt-2 pb-6">
        <div className="relative flex items-center justify-between">
          {/* Step 1: Address */}
          <div className="flex flex-col items-center relative z-10">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-all ${
                currentStep > 1
                  ? 'bg-brand-600 text-white shadow-soft-sm'
                  : currentStep === 1
                  ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-soft-sm'
                  : 'bg-white border-2 border-slate-300 text-slate-400'
              }`}
            >
              {currentStep > 1 ? <Check className="w-5 h-5 stroke-[3]" /> : '1'}
            </button>
            <span
              className={`text-xs mt-2 font-bold ${
                currentStep >= 1 ? 'text-brand-700' : 'text-slate-400'
              }`}
            >
              Address
            </span>
          </div>

          {/* Line 1 -> 2 */}
          <div
            className={`flex-1 h-0.5 mx-2 -mt-5 transition-colors ${
              currentStep > 1 ? 'bg-brand-600' : 'bg-slate-200'
            }`}
          />

          {/* Step 2: Delivery */}
          <div className="flex flex-col items-center relative z-10">
            <button
              type="button"
              onClick={() => currentStep > 2 && setCurrentStep(2)}
              disabled={currentStep < 2}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-all ${
                currentStep > 2
                  ? 'bg-brand-600 text-white shadow-soft-sm'
                  : currentStep === 2
                  ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-soft-sm'
                  : 'bg-white border-2 border-slate-300 text-slate-400'
              }`}
            >
              {currentStep > 2 ? <Check className="w-5 h-5 stroke-[3]" /> : '2'}
            </button>
            <span
              className={`text-xs mt-2 font-bold ${
                currentStep >= 2 ? 'text-brand-700' : 'text-slate-400'
              }`}
            >
              Delivery
            </span>
          </div>

          {/* Line 2 -> 3 */}
          <div
            className={`flex-1 h-0.5 mx-2 -mt-5 transition-colors ${
              currentStep > 2 ? 'bg-brand-600' : 'bg-slate-200'
            }`}
          />

          {/* Step 3: Payment */}
          <div className="flex flex-col items-center relative z-10">
            <button
              type="button"
              onClick={() => currentStep > 3 && setCurrentStep(3)}
              disabled={currentStep < 3}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-all ${
                currentStep > 3
                  ? 'bg-brand-600 text-white shadow-soft-sm'
                  : currentStep === 3
                  ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-soft-sm'
                  : 'bg-white border-2 border-slate-300 text-slate-400'
              }`}
            >
              {currentStep > 3 ? <Check className="w-5 h-5 stroke-[3]" /> : '3'}
            </button>
            <span
              className={`text-xs mt-2 font-bold ${
                currentStep >= 3 ? 'text-brand-700' : 'text-slate-400'
              }`}
            >
              Payment
            </span>
          </div>

          {/* Line 3 -> 4 */}
          <div
            className={`flex-1 h-0.5 mx-2 -mt-5 transition-colors ${
              currentStep > 3 ? 'bg-brand-600' : 'bg-slate-200'
            }`}
          />

          {/* Step 4: Review */}
          <div className="flex flex-col items-center relative z-10">
            <button
              type="button"
              disabled={currentStep < 4}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-all ${
                currentStep === 4
                  ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-soft-sm'
                  : 'bg-white border-2 border-slate-300 text-slate-400'
              }`}
            >
              4
            </button>
            <span
              className={`text-xs mt-2 font-bold ${
                currentStep === 4 ? 'text-brand-700' : 'text-slate-400'
              }`}
            >
              Review
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CHECKOUT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive Step Section */}
        <div className="lg:col-span-7 space-y-6">
          {/* ========================================================
              STEP 1: ADDRESS
          ======================================================== */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-sm space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-brand-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      Delivery Address
                    </h2>
                    <p className="text-xs text-slate-500">
                      Where should we deliver your agricultural produce?
                    </p>
                  </div>
                </div>

                {/* Location Quick Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={handleUseCurrentLocation}
                    isLoading={isLocating}
                    className="flex items-center gap-1 text-xs text-brand-700 font-bold border-brand-200 hover:bg-brand-50"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-brand-600" />
                    <span>Current GPS</span>
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => setIsMapModalOpen(true)}
                    className="flex items-center gap-1 text-xs text-brand-700 font-bold border-brand-200 hover:bg-brand-50"
                  >
                    <Map className="w-3.5 h-3.5 text-brand-600" />
                    <span>Select on Map</span>
                  </Button>
                </div>
              </div>

              {/* Saved Addresses List (if user has any) */}
              {addresses.length > 0 && !useNewAddressForm && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Choose Saved Address
                    </span>
                    <button
                      type="button"
                      onClick={() => setUseNewAddressForm(true)}
                      className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Enter New Address
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 shadow-soft-sm'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                {addr.addressType || 'HOME'}
                              </span>
                              {addr.defaultAddress && (
                                <span className="text-[10px] uppercase font-bold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-800">
                              {addr.addressLine1} {addr.addressLine2 || ''}
                            </p>
                            <p className="text-xs text-slate-500">
                              {addr.village ? `${addr.village}, ` : ''}
                              {addr.city}, {addr.district}, {addr.state} — {addr.pincode}
                            </p>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-1 ${
                              isSelected
                                ? 'border-brand-600 bg-brand-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Enter Address Form (Matching Image 2 fields) */}
              {(useNewAddressForm || addresses.length === 0) && (
                <form onSubmit={handleProceedFromAddress} className="space-y-4">
                  {addresses.length > 0 && (
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Enter Address Details
                      </span>
                      <button
                        type="button"
                        onClick={() => setUseNewAddressForm(false)}
                        className="text-xs font-bold text-brand-600 hover:text-brand-800"
                      >
                        Use Saved Address
                      </button>
                    </div>
                  )}

                  {/* Row 1: Full Name, Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Input
                      label="Full Name"
                      placeholder="e.g. Ramesh Patil"
                      value={addressForm.fullName}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, fullName: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Phone"
                      placeholder="e.g. 9876543210"
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, phone: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Row 2: Address (House no, Street, Area) */}
                  <Input
                    label="Address"
                    placeholder="House no, Street, Area / Farm Landmark"
                    value={addressForm.addressLine1}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, addressLine1: e.target.value })
                    }
                    required
                  />

                  {/* Row 3: City, State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Input
                      label="City"
                      placeholder="City / Town"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="State"
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, state: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Row 4: Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Input
                      label="Pincode"
                      placeholder="6 digits (e.g. 586101)"
                      value={addressForm.pincode}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, pincode: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="District (Optional)"
                      placeholder="District"
                      value={addressForm.district}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, district: e.target.value })
                      }
                    />
                  </div>
                </form>
              )}

              {/* Bottom Continue Action */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                <Button
                  size="lg"
                  type="button"
                  onClick={handleProceedFromAddress}
                  isLoading={isProcessing}
                  className="px-8 flex items-center gap-2 bg-brand-600 hover:bg-brand-700"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 2: DELIVERY METHOD (Matching Image 3)
          ======================================================== */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-brand-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Delivery Method
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select your preferred transit speed and handling options.
                  </p>
                </div>
              </div>

              {/* 3 Delivery Cards (Matching Image 3) */}
              <div className="space-y-3.5">
                {DELIVERY_OPTIONS.map((opt) => {
                  const isSelected = selectedDeliveryId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedDeliveryId(opt.id)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-100 shadow-soft-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-slate-900">{opt.title}</h3>
                        <p className="text-xs text-slate-500">{opt.subtitle}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-extrabold ${
                            opt.price === 0 ? 'text-brand-700' : 'text-slate-900'
                          }`}
                        >
                          {opt.priceLabel}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'border-brand-600 bg-brand-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Buttons: Back & Continue */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  size="md"
                  variant="ghost"
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 text-slate-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button
                  size="lg"
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-8 flex items-center gap-2 bg-brand-600 hover:bg-brand-700"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 3: PAYMENT METHOD (Matching Image 4)
          ======================================================== */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-brand-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Payment Method
                  </h2>
                  <p className="text-xs text-slate-500">
                    Choose how you want to pay for your direct farm order.
                  </p>
                </div>
              </div>

              {/* Payment Options (Matching Image 4) */}
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((opt) => {
                  const isSelected = selectedPaymentId === opt.id;
                  const IconComp = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedPaymentId(opt.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-100 shadow-soft-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-brand-100 text-brand-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {opt.title}
                          </h4>
                          <p className="text-[11px] text-slate-500">{opt.subtitle}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Your payment information is secure and encrypted.</span>
              </div>

              {/* Navigation Buttons: Back & Continue */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  size="md"
                  variant="ghost"
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 text-slate-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button
                  size="lg"
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-8 flex items-center gap-2 bg-brand-600 hover:bg-brand-700"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 4: REVIEW & CONFIRM (Matching Image 5)
          ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              {/* Product Review Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-sm space-y-4">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Review Your Order
                </h2>

                <div className="flex items-center gap-4 pt-2">
                  <img
                    src={
                      product.images?.find((img) => img.primary)?.imageUrl ||
                      product.images?.[0]?.imageUrl ||
                      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=300'
                    }
                    alt={product.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900">{product.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Qty: {formatQuantity(quantity, product.unit)} • {formatCurrency(unitPrice)}/{product.unit || 'unit'}
                    </p>
                  </div>
                  <div className="text-base font-extrabold text-slate-900">
                    {formatCurrency(subtotal)}
                  </div>
                </div>
              </div>

              {/* Order Confirmation Details (Deliver to, Delivery, Payment) */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-sm space-y-4 text-xs">
                {/* Deliver to */}
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">Deliver to:</span>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        {activeAddress ? (
                          <>
                            {activeAddress.addressLine1} {activeAddress.addressLine2 || ''}
                            {activeAddress.village ? `, ${activeAddress.village}` : ''},{' '}
                            {activeAddress.city}, {activeAddress.district},{' '}
                            {activeAddress.state} — {activeAddress.pincode}
                          </>
                        ) : (
                          `${addressForm.addressLine1}, ${addressForm.city}, ${addressForm.state} — ${addressForm.pincode}`
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-brand-600 hover:text-brand-800 font-bold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                {/* Delivery */}
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <Truck className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">Delivery:</span>
                      <p className="text-slate-600 mt-0.5">
                        {chosenDelivery.title} ({chosenDelivery.subtitle})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-brand-600 hover:text-brand-800 font-bold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                {/* Payment */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <CreditCard className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">Payment:</span>
                      <p className="text-slate-600 mt-0.5">{chosenPayment.title}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-brand-600 hover:text-brand-800 font-bold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>

              {/* Navigation Buttons: Back & Place Order */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  size="md"
                  variant="ghost"
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-1.5 text-slate-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button
                  size="lg"
                  type="button"
                  onClick={handleFinalPlaceOrder}
                  isLoading={isProcessing}
                  className="px-10 py-3.5 text-base font-extrabold bg-brand-600 hover:bg-brand-700 shadow-soft-md"
                >
                  Place Order
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Persistent Summary Column (Matching Wireframe) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <span>Summary</span>
            </h3>

            {/* Produce Item & Quantity Stepper */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Quantity:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-6 h-6 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"
                    disabled={quantity <= 1 || currentStep === 4}
                  >
                    -
                  </button>
                  <span className="font-bold text-slate-900 px-1.5">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-6 h-6 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"
                    disabled={quantity >= (product.quantity || 999) || currentStep === 4}
                  >
                    +
                  </button>
                </div>
              </div>
              <span className="text-slate-500 font-medium">{product.unit || 'unit'}</span>
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({quantity} items):</span>
                <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-semibold text-slate-800">
                  {deliveryFee === 0 ? (
                    <span className="text-brand-700 font-bold">FREE</span>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-brand-700">
                <span>Middleman Markup:</span>
                <span className="font-semibold">₹0.00 (Direct Deal)</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5% GST):</span>
                <span className="font-semibold text-slate-800">Included</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Total:</span>
                <span className="text-brand-700">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Bottom Security Note */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Safe payment gateway with OTP-verified delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map Location Modal */}
      <LocationMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectLocation={handleMapLocationSelected}
        initialCoords={
          addressForm.latitude && addressForm.longitude
            ? { lat: addressForm.latitude, lng: addressForm.longitude }
            : undefined
        }
        initialAddress={addressForm.city || addressForm.addressLine1}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Check,
  Navigation,
  Map,
  Home,
  Wheat,
  Warehouse,
  Pencil,
} from 'lucide-react';
import { addressService } from '@/services/address/addressService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/loaders/Spinner';
import { EmptyState } from '@/components/empty-states/EmptyState';
import {
  LocationMapModal,
  getCurrentLocationAddress,
} from '@/components/location/LocationMapModal';

export function LocationsPage() {
  const toast = useToast();

  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address Modal & Map States
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Form State
  const initialAddressState = {
    addressLine1: '',
    addressLine2: '',
    village: '',
    city: '',
    district: '',
    state: 'Karnataka',
    pincode: '',
    country: 'India',
    locationType: 'MANUAL', // 'MANUAL' or 'MAP'
    addressType: 'FARM',   // 'FARM', 'HOME', 'OTHER'
    latitude: null,
    longitude: null,
    defaultAddress: false,
  };

  const [newAddress, setNewAddress] = useState(initialAddressState);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await addressService.getUserAddresses();
      setAddresses(data || []);
    } catch (err) {
      toast.error('Failed to load your registered locations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setNewAddress({
      ...initialAddressState,
      defaultAddress: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddressId(addr.id);
    const hasCoords = addr.latitude != null && addr.longitude != null;
    setNewAddress({
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      village: addr.village || '',
      city: addr.city || '',
      district: addr.district || '',
      state: addr.state || 'Karnataka',
      pincode: addr.pincode || '',
      country: addr.country || 'India',
      locationType: hasCoords ? 'MAP' : 'MANUAL',
      addressType: addr.addressType || 'FARM',
      latitude: hasCoords ? parseFloat(Number(addr.latitude).toFixed(6)) : null,
      longitude: hasCoords ? parseFloat(Number(addr.longitude).toFixed(6)) : null,
      defaultAddress: Boolean(addr.defaultAddress),
    });
    setIsAddressModalOpen(true);
  };

  // Automatically create address from Map / GPS or notify if it already exists
  const handleLocationPicked = async (loc) => {
    if (!loc) return;

    // 1. Check if this location already exists in addresses
    const isDuplicate = addresses.some((existing) => {
      // Check by geographic coordinates closeness (within ~150 meters)
      if (
        existing.latitude != null &&
        existing.longitude != null &&
        loc.latitude != null &&
        loc.longitude != null
      ) {
        const latDiff = Math.abs(Number(existing.latitude) - Number(loc.latitude));
        const lngDiff = Math.abs(Number(existing.longitude) - Number(loc.longitude));
        if (latDiff < 0.0015 && lngDiff < 0.0015) {
          return true;
        }
      }

      // Or check text similarity (PIN + City/Village/Street)
      const samePin =
        loc.pincode &&
        existing.pincode &&
        String(existing.pincode).trim() === String(loc.pincode).trim();
      const sameCity =
        (existing.city || '').trim().toLowerCase() === (loc.city || '').trim().toLowerCase();
      const sameVillage =
        loc.village &&
        (existing.village || '').trim().toLowerCase() === String(loc.village).trim().toLowerCase();
      const sameStreet =
        loc.addressLine1 &&
        (existing.addressLine1 || '').trim().toLowerCase() === String(loc.addressLine1).trim().toLowerCase();

      if (samePin && (sameVillage || (sameCity && sameStreet))) {
        return true;
      }
      return false;
    });

    if (isDuplicate) {
      toast.warning('This address already exists in your saved locations.');
      return;
    }

    // 2. Automatically create new address without showing the form fill modal
    setIsSubmitting(true);
    try {
      const line1 = (
        loc.addressLine1 ||
        (loc.village ? `${loc.village}, ${loc.city || loc.district || 'Farm Land'}` : (loc.city || loc.district || 'Farm Field Plot'))
      ).trim();

      const city = (loc.city || loc.district || 'Vijayapura').trim();
      const district = (loc.district || loc.city || 'Vijayapura').trim();
      const state = (loc.state || 'Karnataka').trim();
      const pincode = (loc.pincode && /^[1-9][0-9]{5}$/.test(String(loc.pincode).trim()))
        ? String(loc.pincode).trim()
        : '586101';

      const payload = {
        addressLine1: line1,
        addressLine2: loc.addressLine2?.trim() || null,
        village: loc.village?.trim() || null,
        city: city,
        district: district,
        state: state,
        pincode: pincode,
        country: 'India',
        addressType: 'FARM',
        defaultAddress: addresses.length === 0,
        locationType: 'MAP',
        latitude: parseFloat(Number(loc.latitude).toFixed(6)),
        longitude: parseFloat(Number(loc.longitude).toFixed(6)),
      };

      await addressService.createAddress(payload);
      toast.success('New delivery address added successfully from map!');
      await loadAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to save address from map.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // GPS Location Detection
  const handleUseCurrentLocation = async () => {
    setIsDetectingGps(true);
    try {
      const loc = await getCurrentLocationAddress();
      await handleLocationPicked(loc);
    } catch (err) {
      toast.error('Could not detect GPS location. Please select on the map or enter details manually.');
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Save Address (Create or Update)
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (!newAddress.addressLine1.trim()) {
      toast.warning('Address line 1 (Survey No./Street) is required.');
      return;
    }
    if (!newAddress.city.trim() || !newAddress.district.trim()) {
      toast.warning('City/Taluk and District are required.');
      return;
    }
    if (!newAddress.pincode.trim() || !/^[1-9][0-9]{5}$/.test(newAddress.pincode.trim())) {
      toast.warning('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        addressLine1: newAddress.addressLine1.trim(),
        addressLine2: newAddress.addressLine2?.trim() || null,
        village: newAddress.village?.trim() || null,
        city: newAddress.city.trim(),
        district: newAddress.district.trim(),
        state: newAddress.state.trim() || 'Karnataka',
        pincode: newAddress.pincode.trim(),
        country: 'India',
        addressType: newAddress.addressType || 'FARM',
        defaultAddress: addresses.length === 0 ? true : Boolean(newAddress.defaultAddress),
      };

      if (newAddress.latitude != null && newAddress.longitude != null) {
        payload.locationType = 'MAP';
        payload.latitude = parseFloat(Number(newAddress.latitude).toFixed(6));
        payload.longitude = parseFloat(Number(newAddress.longitude).toFixed(6));
      } else {
        payload.locationType = 'MANUAL';
      }

      if (editingAddressId) {
        await addressService.updateAddress(editingAddressId, payload);
        toast.success('Location updated successfully!');
      } else {
        await addressService.createAddress(payload);
        toast.success('Location saved successfully!');
      }

      setIsAddressModalOpen(false);
      setEditingAddressId(null);
      setNewAddress(initialAddressState);
      await loadAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to save address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set Default Address
  const handleSetDefault = async (addrId) => {
    try {
      await addressService.setDefaultAddress(addrId);
      toast.success('Default location updated.');
      await loadAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to update default address.');
    }
  };

  // Delete Address
  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to remove this location?')) return;
    try {
      await addressService.deleteAddress(addrId);
      toast.success('Location removed.');
      await loadAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to remove location.');
    }
  };

  // Helper for address type icons
  const getTypeIcon = (type) => {
    switch (type) {
      case 'FARM':
        return <Wheat className="w-4 h-4 text-emerald-600" />;
      case 'HOME':
        return <Home className="w-4 h-4 text-brand-600" />;
      case 'OTHER':
      case 'WAREHOUSE':
      case 'WORK':
      default:
        return <Warehouse className="w-4 h-4 text-amber-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Spinner text="Loading your farm locations..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Farm & Delivery Locations</span>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md">
              {addresses.length} {addresses.length === 1 ? 'Location' : 'Locations'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your agricultural land, storage warehouses, and registered collection points.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            icon={Navigation}
            isLoading={isDetectingGps}
            onClick={handleUseCurrentLocation}
            className="text-xs text-slate-700 hover:text-emerald-700 hover:border-emerald-300"
          >
            Current GPS
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={Map}
            onClick={() => setIsMapModalOpen(true)}
            className="text-xs text-slate-700 hover:text-brand-700 hover:border-brand-300"
          >
            Select on Map
          </Button>

          <Button
            size="sm"
            variant="earth"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            Add Delivery Address
          </Button>
        </div>
      </div>

      {/* Addresses Grid */}
      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((addr) => {
            return (
              <div
                key={addr.id}
                className={`p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between gap-4 shadow-soft-xs ${
                  addr.defaultAddress
                    ? 'border-brand-500 ring-2 ring-brand-100/70 bg-gradient-to-b from-brand-50/20 via-white to-white'
                    : 'border-slate-200/90 hover:border-brand-300 hover:shadow-soft-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {addr.addressType === 'FARM' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                          <Wheat className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Farm / Land</span>
                        </span>
                      ) : addr.addressType === 'HOME' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80">
                          <Home className="w-3.5 h-3.5 text-sky-600" />
                          <span>Home</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
                          <Warehouse className="w-3.5 h-3.5 text-amber-600" />
                          <span>Warehouse / Other</span>
                        </span>
                      )}
                    </div>

                    {addr.defaultAddress && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" /> Default
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900 line-clamp-1">
                      {addr.village ? `${addr.village}, ${addr.city}` : addr.city}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                    </p>
                    <div className="mt-2.5 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span>{addr.district}, {addr.state || 'Karnataka'}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        PIN {addr.pincode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {!addr.defaultAddress ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors cursor-pointer"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Primary Location
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(addr)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                      title="Edit Address"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title="No delivery addresses added yet"
          description="Register your farm fields, home, or storage warehouses for seamless ordering, product listings, and logistics."
          actionLabel="Add First Address"
          onAction={handleOpenAddModal}
        />
      )}

      {/* Interactive Map Modal (Leaflet Pin Drop) */}
      <LocationMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectLocation={handleLocationPicked}
        initialCoords={
          newAddress.latitude && newAddress.longitude
            ? { lat: Number(newAddress.latitude), lng: Number(newAddress.longitude) }
            : undefined
        }
        initialAddress={newAddress.city || newAddress.district || 'Karnataka, India'}
      />

      {/* Add / Edit Delivery Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddressId(null);
        }}
        title={editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
        maxWidth="max-w-xl"
        className="max-h-[92vh] flex flex-col p-5 sm:p-6"
      >
        <form onSubmit={handleSaveAddress} className="flex flex-col min-h-0 flex-1">
          {/* Scrollable Form Body */}
          <div className="overflow-y-auto max-h-[calc(88vh-11rem)] sm:max-h-[calc(84vh-10rem)] pr-1.5 -mr-1 space-y-3.5">
            <Input
              label="Address Line 1"
              placeholder="House, Street, Farm number"
              value={newAddress.addressLine1}
              onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
              required
            />

            <Input
              label="Address Line 2 (Optional)"
              placeholder="Landmark, Area, Gate No."
              value={newAddress.addressLine2}
              onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Village (Optional)"
                placeholder="e.g. Nimbal"
                value={newAddress.village}
                onChange={(e) => setNewAddress({ ...newAddress, village: e.target.value })}
              />
              <Input
                label="City / Town"
                placeholder="e.g. Indi / Vijayapura"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="District"
                placeholder="e.g. Vijayapura"
                value={newAddress.district}
                onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                required
              />
              <Input
                label="State"
                placeholder="e.g. Karnataka"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                required
              />
              <Input
                label="Pincode"
                placeholder="e.g. 586101"
                maxLength="6"
                value={newAddress.pincode}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    pincode: e.target.value.replace(/[^0-9]/g, ''),
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Address Type"
                value={newAddress.addressType}
                onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                options={[
                  { id: 'HOME', name: 'Home' },
                  { id: 'FARM', name: 'Farm / Land' },
                  { id: 'OTHER', name: 'Warehouse / Other' },
                ]}
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="defaultAddress"
                checked={newAddress.defaultAddress}
                onChange={(e) => setNewAddress({ ...newAddress, defaultAddress: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="defaultAddress" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Set as default location for selling & deliveries
              </label>
            </div>
          </div>

          {/* Sticky / Pinned Modal Footer */}
          <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-white flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                setIsAddressModalOpen(false);
                setEditingAddressId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
            >
              {editingAddressId ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

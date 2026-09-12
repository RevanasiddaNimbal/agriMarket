import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, Search, Filter, Sprout, ArrowRight } from 'lucide-react';
import { orderService } from '@/services/order/orderService';
import { productService } from '@/services/product/productService';
import { OrderCard } from '@/components/order/OrderCard';
import { EmptyState } from '@/components/empty-states/EmptyState';
import { Spinner } from '@/components/loaders/Spinner';
import { SearchBar } from '@/components/common/SearchBar';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'customer' ? 'customer' : 'purchases';
  const initialStatus = searchParams.get('status') || '';

  const [allOrders, setAllOrders] = useState([]);
  const [myProductIds, setMyProductIds] = useState(new Set());
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Search states: searchInput is raw user typing; appliedSearch only updates on Enter or button click
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state when URL search query changes
  useEffect(() => {
    const urlStatus = searchParams.get('status') || '';
    setStatusFilter(urlStatus);
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    const params = { tab: newTab };
    if (statusFilter) {
      params.status = statusFilter;
    }
    setSearchParams(params);
  };

  // Safe data loading using verified existing endpoints
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [ordersRes, myProductsRes] = await Promise.allSettled([
          orderService.getMyOrders(),
          productService.getMyProducts(),
        ]);

        const fetchedOrders =
          ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)
            ? ordersRes.value
            : [];
        const fetchedProducts =
          myProductsRes.status === 'fulfilled' && Array.isArray(myProductsRes.value)
            ? myProductsRes.value
            : [];

        const productIds = new Set(fetchedProducts.map((p) => p.id));

        setAllOrders(fetchedOrders);
        setMyProductIds(productIds);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter orders based on active tab, status, and applied search (triggered on Enter)
  useEffect(() => {
    let result = [...allOrders];

    // Segment orders by tab
    if (activeTab === 'customer') {
      result = result.filter((order) =>
        order.items?.some((item) =>
          myProductIds.has(item.product_id || item.productId)
        )
      );
    } else {
      // My Purchases: show orders
      result = result.filter(
        (order) =>
          !order.items?.some((item) =>
            myProductIds.has(item.product_id || item.productId)
          ) || myProductIds.size === 0
      );
    }

    // Filter by applied search term (only triggered on Enter or Search button click)
    if (appliedSearch.trim()) {
      const term = appliedSearch.toLowerCase().trim();
      result = result.filter((o) => {
        const matchesId = o.id?.toLowerCase().includes(term);
        const matchesCrop = o.items?.some((item) => {
          const cropName = (
            item.product_name ||
            item.productName ||
            item.name ||
            ''
          ).toLowerCase();
          return cropName.includes(term);
        });
        const matchesCustomer = (
          o.customer_name ||
          o.customerName ||
          o.user?.fullName ||
          o.user?.full_name ||
          ''
        )
          .toLowerCase()
          .includes(term);

        return matchesId || matchesCrop || matchesCustomer;
      });
    }

    // Filter by status
    if (statusFilter) {
      if (statusFilter === 'ACTIVE' || statusFilter === 'IN_TRANSIT') {
        result = result.filter((o) =>
          ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)
        );
      } else {
        result = result.filter((o) => o.status === statusFilter);
      }
    }

    setFilteredOrders(result);
  }, [allOrders, myProductIds, activeTab, appliedSearch, statusFilter]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner text="Loading orders & produce telemetry..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Switcher Tabs: My Purchases vs Customer Orders */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-soft-xs">
          <button
            type="button"
            onClick={() => handleTabChange('purchases')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'purchases'
                ? 'bg-white text-brand-700 shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Purchases</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('customer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'customer'
                ? 'bg-white text-purple-700 shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Customer Orders on My Crops</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          {activeTab === 'customer'
            ? 'Orders placed on your crops for fulfillment and dispatch tracking'
            : 'Purchases placed by you across the agricultural marketplace'}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search input with Enter button trigger */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 w-full sm:max-w-md"
        >
          <div className="relative flex-1">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={handleSearchSubmit}
              onClear={handleClearSearch}
              placeholder="Search by crop name or order ID (Press Enter)..."
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            size="md"
            icon={Search}
            className="flex-shrink-0"
          >
            Search
          </Button>
        </form>

        <div className="w-full sm:w-56">
          <Select
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(e) => {
              const val = e.target.value;
              setStatusFilter(val);
              const params = { tab: activeTab };
              if (val) params.status = val;
              setSearchParams(params);
            }}
            options={[
              { id: 'PENDING_PAYMENT', name: 'Pending Payment' },
              { id: 'CONFIRMED', name: 'Confirmed' },
              { id: 'PROCESSING', name: 'Processing' },
              { id: 'SHIPPED', name: 'Shipped' },
              { id: 'OUT_FOR_DELIVERY', name: 'Out for Delivery' },
              { id: 'DELIVERED', name: 'Delivered' },
              { id: 'CANCELLED', name: 'Cancelled' },
            ]}
          />
        </div>
      </div>

      {/* Active Search indicator */}
      {appliedSearch && (
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl w-fit">
          <span>
            Showing results matching crop or order: <strong>"{appliedSearch}"</strong>
          </span>
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-brand-600 hover:text-brand-800 font-bold ml-1"
          >
            Clear
          </button>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isSellerView={activeTab === 'customer'}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={activeTab === 'customer' ? Sprout : ShoppingBag}
          title={
            appliedSearch || statusFilter
              ? 'No matching orders found'
              : activeTab === 'customer'
              ? 'No customer orders received yet'
              : 'No orders found'
          }
          description={
            appliedSearch || statusFilter
              ? `No orders match "${appliedSearch || statusFilter}". Press Enter or Clear to reset.`
              : activeTab === 'customer'
              ? 'When buyers order crops or produce from your farm listings, their orders will appear here for fulfilment.'
              : 'You have not placed any direct harvest orders yet.'
          }
          actionLabel={
            appliedSearch || statusFilter
              ? 'Clear Filters'
              : activeTab === 'customer'
              ? 'View My Listed Crops'
              : 'Explore Marketplace'
          }
          onAction={() => {
            if (appliedSearch || statusFilter) {
              handleClearSearch();
              setStatusFilter('');
            } else if (activeTab === 'customer') {
              window.location.href = '/dashboard/selling';
            } else {
              window.location.href = '/marketplace';
            }
          }}
        />
      )}
    </div>
  );
}

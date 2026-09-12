import React from 'react';
import { ProductCard } from './ProductCard';
import { SkeletonCard } from '@/components/loaders/SkeletonCard';
import { EmptyState } from '@/components/empty-states/EmptyState';
import { Sprout } from 'lucide-react';

export function ProductGrid({
  products = [],
  isLoading = false,
  emptyTitle = 'No products found',
  emptyDescription = 'No agricultural products match the selected criteria.',
  onResetFilters,
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6',
}) {
  if (isLoading) {
    return <SkeletonCard count={6} />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={Sprout}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onResetFilters ? 'Clear All Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className={`grid ${columns}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

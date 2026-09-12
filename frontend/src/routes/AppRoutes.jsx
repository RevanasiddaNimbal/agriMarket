import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { Layout } from '@/components/layout/Layout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Public & Information Pages
import { HomePage } from '@/pages/public/HomePage';
import { AboutPage } from '@/pages/public/AboutPage';
import { SupportPage } from '@/pages/public/SupportPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { OAuth2RedirectHandler } from '@/pages/auth/OAuth2RedirectHandler';

// Marketplace & Direct Checkout Pages
import { MarketplacePage } from '@/pages/marketplace/MarketplacePage';
import { ProductDetailPage } from '@/pages/marketplace/ProductDetailPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';

// Selling / Crop Management Pages
import { SellProductPage } from '@/pages/sell/SellProductPage';
import { EditProductPage } from '@/pages/sell/EditProductPage';

// Advisory & Knowledge Pages
import { WeatherPage } from '@/pages/weather/WeatherPage';
import { MarketPricesPage } from '@/pages/market-prices/MarketPricesPage';
import { MarketPriceDetailPage } from '@/pages/market-prices/MarketPriceDetailPage';
import { CropListPage } from '@/pages/crops/CropListPage';
import { CropDetailPage } from '@/pages/crops/CropDetailPage';

// Dashboard User Pages
import { UserDashboardPage } from '@/pages/dashboard/UserDashboardPage';
import { OrdersPage } from '@/pages/dashboard/OrdersPage';
import { OrderDetailPage } from '@/pages/dashboard/OrderDetailPage';
import { OrderTrackingPage } from '@/pages/dashboard/OrderTrackingPage';
import { SellingPage } from '@/pages/dashboard/SellingPage';
import { InventoryPage } from '@/pages/dashboard/InventoryPage';
import { TransactionsPage } from '@/pages/dashboard/TransactionsPage';
import { LocationsPage } from '@/pages/dashboard/LocationsPage';
import { ProfilePage } from '@/pages/dashboard/ProfilePage';

// Admin Console Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from '@/pages/admin/AdminUserDetailPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminProductDetailPage } from '@/pages/admin/AdminProductDetailPage';
import { AdminInventoryPage } from '@/pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from '@/pages/admin/AdminOrderDetailPage';
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage';
import { AdminPaymentDetailPage } from '@/pages/admin/AdminPaymentDetailPage';
import { AdminTransactionsPage } from '@/pages/admin/AdminTransactionsPage';
import { AdminTransactionDetailPage } from '@/pages/admin/AdminTransactionDetailPage';
import { AdminDeliveriesPage } from '@/pages/admin/AdminDeliveriesPage';
import { AdminDeliveryDetailPage } from '@/pages/admin/AdminDeliveryDetailPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* OAuth2 Callback & Success Exchange Endpoints (Handles backend FRONTEND_OAUTH2_SUCCESS_URL redirects) */}
      <Route path="/oauth2/success" element={<OAuth2RedirectHandler />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
      <Route path="/oauth2/callback" element={<OAuth2RedirectHandler />} />
      <Route path="/login/oauth2/code/*" element={<OAuth2RedirectHandler />} />

      {/* Main Public & Customer Navigation Shell */}
      <Route element={<Layout />}>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        {/* Marketplace (Public catalog browsing) */}
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />

        {/* Direct Checkout (Protected - Requires Auth) */}
        <Route
          path="/checkout/:productId"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        {/* Farmer Selling (Protected - Requires Auth) */}
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <SellProductPage />
            </ProtectedRoute>
          }
        />

        {/* Advisory Services (Public general information) */}
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/market-prices" element={<MarketPricesPage />} />
        <Route path="/market-prices/trend" element={<MarketPriceDetailPage />} />
        <Route path="/crops" element={<CropListPage />} />
        <Route path="/crops/:cropId" element={<CropDetailPage />} />

        {/* Order Details & Tracking (Direct routes within Layout) */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OrdersPage />} />
        </Route>

        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:orderId/track"
          element={
            <ProtectedRoute>
              <OrderTrackingPage />
            </ProtectedRoute>
          }
        />

        {/* User Dashboard Nested Shell */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboardPage />} />
          <Route path="selling" element={<SellingPage />} />
          <Route path="selling/edit/:productId" element={<EditProductPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="wishlist" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Profile (Tabbed inside DashboardLayout) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfilePage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Portal (Isolated Admin Layout) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:userId" element={<AdminUserDetailPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/:productId" element={<AdminProductDetailPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="payments/:paymentId" element={<AdminPaymentDetailPage />} />
        <Route path="transactions" element={<AdminTransactionsPage />} />
        <Route path="transactions/:transactionId" element={<AdminTransactionDetailPage />} />
        <Route path="deliveries" element={<AdminDeliveriesPage />} />
        <Route path="deliveries/:deliveryId" element={<AdminDeliveryDetailPage />} />
      </Route>
    </Routes>
  );
}

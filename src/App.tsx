import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MarketProvider } from './store/MarketStore';
import { ClientLayout } from './layouts/ClientLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ShopPage } from './pages/client/ShopPage';
import { ProductDetailPage } from './pages/client/ProductDetailPage';
import { CartPage } from './pages/client/CartPage';
import { CheckoutPage } from './pages/client/CheckoutPage';
import { DownloadAppPage } from './pages/client/DownloadAppPage';
import { OrdersPage } from './pages/client/OrdersPage';
import { OrderDetailPage } from './pages/client/OrderDetailPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminRevenuePage } from './pages/admin/AdminRevenuePage';
import { AdminDisbursementsPage } from './pages/admin/AdminDisbursementsPage';

export default function App() {
  return (
    <MarketProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ClientLayout />}>
            <Route index element={<ShopPage />} />
            <Route path="shop" element={<Navigate to="/" replace />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="download-app" element={<DownloadAppPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="revenue" element={<AdminRevenuePage />} />
            <Route path="disbursements" element={<AdminDisbursementsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </MarketProvider>
  );
}

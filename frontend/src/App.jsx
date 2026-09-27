import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore';
import useAdminStore from './stores/adminStore';

// Lazy load pages for performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// Admin pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));

// Loading fallback
const PageLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: 'var(--color-bg)'
  }}>
    <div className="spinner" style={{ width: 40, height: 40 }} />
  </div>
);

// Protected route
const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

// Admin protected route
const AdminRoute = ({ children }) => {
  const { token } = useAdminStore();
  return token ? children : <Navigate to="/admin/login" replace />;
};

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { initAuth } = useAuthStore();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('starbyte-theme') || 'dark';
  });

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('starbyte-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Customer routes */}
          <Route path="/" element={<HomePage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/products" element={<ProductsPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/product/:slug" element={<ProductDetailPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/cart" element={<CartPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/checkout" element={<CheckoutPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/order-success" element={<OrderSuccessPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/order/:id" element={<OrderTrackingPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/login" element={<LoginPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/register" element={<RegisterPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/account" element={
            <ProtectedRoute><AccountPage theme={theme} toggleTheme={toggleTheme} /></ProtectedRoute>
          } />
          <Route path="/faq" element={<FAQPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/contact" element={<ContactPage theme={theme} toggleTheme={toggleTheme} />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(13, 18, 37, 0.95)',
            color: '#f0f2ff',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            backdropFilter: 'blur(16px)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
            borderRadius: '12px',
            padding: '14px 18px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#f0f2ff' }
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#f0f2ff' }
          }
        }}
      />
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { OrderFlowProvider } from './context/OrderFlowContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { AppChrome, AppFooter, AppMain, AppShell } from './components/layout/AppChrome'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { AnimatedPageLayout } from './components/layout/AnimatedPageLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminRoute } from './components/auth/AdminRoute'
import { AdminLayout } from './components/admin/AdminLayout'
import { LandingPage } from './pages/LandingPage'
import { HomePage } from './pages/HomePage'
import { ShopPage } from './pages/ShopPage'
import { CartPage } from './pages/CartPage'
import { OrderPage } from './pages/OrderPage'
import { PoliciesPage } from './pages/PoliciesPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { AccountPage } from './pages/AccountPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminProductEditPage } from './pages/admin/AdminProductEditPage'
import { AdminLandingCarouselPage } from './pages/admin/AdminLandingCarouselPage'
import { MyOrdersPage } from './pages/MyOrdersPage'

function LegacyOrderRedirect() {
  const { orderId } = useParams()
  if (!orderId) return <Navigate to="/orders" replace />
  return <Navigate to={`/orders?order=${encodeURIComponent(orderId)}`} replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CartProvider>
          <NotificationsProvider>
          <OrderFlowProvider>
          <ScrollToTop />
          <AppShell>
            <AppChrome />
            <AppMain>
              <Routes>
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminOverviewPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="products/new" element={<AdminProductEditPage />} />
                  <Route path="products/:productId" element={<AdminProductEditPage />} />
                  <Route path="landing-carousel" element={<AdminLandingCarouselPage />} />
                  <Route path="hero-carousel" element={<Navigate to="/admin/landing-carousel" replace />} />
                </Route>
                <Route element={<AnimatedPageLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/policies" element={<PoliciesPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route
                    path="/order"
                    element={
                      <ProtectedRoute>
                        <OrderPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <AccountPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:orderId"
                    element={
                      <ProtectedRoute>
                        <LegacyOrderRedirect />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <MyOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
            </AppMain>
            <AppFooter />
          </AppShell>
        </OrderFlowProvider>
          </NotificationsProvider>
        </CartProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

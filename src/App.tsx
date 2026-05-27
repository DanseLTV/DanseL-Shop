import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { OrderFlowProvider } from './context/OrderFlowContext'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminRoute } from './components/auth/AdminRoute'
import { HomePage } from './pages/HomePage'
import { ShopPage } from './pages/ShopPage'
import { OrderPage } from './pages/OrderPage'
import { PoliciesPage } from './pages/PoliciesPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { AccountPage } from './pages/AccountPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { MyOrdersPage } from './pages/MyOrdersPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <OrderFlowProvider>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
              <Route path="/" element={<ShopPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/policies" element={<PoliciesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
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
                path="/orders"
                element={
                  <ProtectedRoute>
                    <MyOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <MyOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              </Routes>
            </main>
            <Footer />
          </div>
        </OrderFlowProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

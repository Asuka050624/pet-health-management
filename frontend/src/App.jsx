import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/common/Toast'
import { UserRoute, AdminRoute, GuestRoute } from './components/common/ProtectedRoute'
import AuthLayout from './components/layout/AuthLayout'
import MobileLayout from './components/layout/MobileLayout'
import AdminLayout from './components/layout/AdminLayout'

import LoginPage from './pages/mobile/LoginPage'
import RegisterPage from './pages/mobile/RegisterPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import HomePage from './pages/mobile/HomePage'
import ShopPage from './pages/mobile/ShopPage'
import ReservationPage from './pages/mobile/ReservationPage'
import NewsPage from './pages/mobile/NewsPage'
import NewsDetailPage from './pages/mobile/NewsDetailPage'
import FeedbackPage from './pages/mobile/FeedbackPage'
import UserCenterPage from './pages/mobile/UserCenterPage'
import PetsManagementPage from './pages/mobile/PetsManagementPage'
import OrdersPage from './pages/mobile/OrdersPage'
import MessagesPage from './pages/mobile/MessagesPage'
import PersonalInfoPage from './pages/mobile/PersonalInfoPage'
import NotFoundPage from './pages/mobile/NotFoundPage'

import AdminDashboardPage from './pages/admin/DashboardPage'
import AdminUsersPage from './pages/admin/UsersPage'
import AdminPetsPage from './pages/admin/PetsPage'
import AdminProductsPage from './pages/admin/ProductsPage'
import AdminOrdersPage from './pages/admin/OrdersPage'
import AdminReservationsPage from './pages/admin/ReservationsPage'
import AdminNewsPage from './pages/admin/NewsPage'
import AdminFeedbackPage from './pages/admin/FeedbackPage'
import AdminSettingsPage from './pages/admin/SettingsPage'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Guest routes */}
        <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/admin/login" element={<AdminLoginPage />} />
        </Route>

        {/* Mobile user routes */}
        <Route element={<UserRoute><MobileLayout /></UserRoute>}>
          <Route path="/mobile/home" element={<HomePage />} />
          <Route path="/mobile/shop" element={<ShopPage />} />
          <Route path="/mobile/reservation" element={<ReservationPage />} />
          <Route path="/mobile/news" element={<NewsPage />} />
          <Route path="/mobile/news/:id" element={<NewsDetailPage />} />
          <Route path="/mobile/feedback" element={<FeedbackPage />} />
          <Route path="/mobile/user" element={<UserCenterPage />} />
          <Route path="/mobile/user/pets" element={<PetsManagementPage />} />
          <Route path="/mobile/user/orders" element={<OrdersPage />} />
          <Route path="/mobile/user/messages" element={<MessagesPage />} />
          <Route path="/mobile/user/profile" element={<PersonalInfoPage />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/pets" element={<AdminPetsPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/reservations" element={<AdminReservationsPage />} />
          <Route path="/admin/news" element={<AdminNewsPage />} />
          <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/mobile/home" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ToastProvider>
  )
}

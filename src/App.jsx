// src/App.jsx

import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './hooks/useAuth';

import FullScreenLoader from './components/ui/FullScreenLoader';

const MainLayout = lazy(() => import('./components/layouts/MainLayout'));
const AccountLayout = lazy(() => import('./components/layouts/AccountLayout'));
const OrganizerLayout = lazy(
  () => import('./components/layouts/OrganizerLayout')
);
const EventLayout = lazy(() => import('./components/layouts/EventLayout'));
const AdminLayout = lazy(() => import('./components/layouts/AdminLayout'));

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));

// Public/User Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const EventDetailPage = lazy(() => import('./pages/user/EventDetailPage'));
const SearchPage = lazy(() => import('./pages/user/SearchPage'));
const SelectTicketsPage = lazy(() => import('./pages/user/SelectTicketsPage'));
const PaymentPage = lazy(() => import('./pages/user/PaymentPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const MyOrderPage = lazy(() => import('./pages/user/MyOrdersPage'));
const MyTicketsPage = lazy(() => import('./pages/user/MyTicketsPage'));

// Organizer Pages
const CreateEventPage = lazy(() => import('./pages/organizer/CreateEventPage'));
const MyEventsPage = lazy(() => import('./pages/organizer/MyEventsPage'));
const CheckinAccountsPage = lazy(
  () => import('./pages/organizer/CheckinAccountsPage')
);
const OrgDashboardPage = lazy(
  () => import('./pages/organizer/OrgDashboardPage')
);
const OrgOrdersPage = lazy(() => import('./pages/organizer/OrgOrdersPage'));
const OrgCheckInPage = lazy(() => import('./pages/organizer/OrgCheckInPage'));
const OrgEventDetail = lazy(() => import('./pages/organizer/OrgEventDetail'));

// Admin Pages
const AdminHomePage = lazy(() => import('./pages/admin/AdminHomePage'));

// Protected Routes
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));

const UserPublicWrapper = () => {
  const { role } = useAuth();
  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      {/* Bọc toàn bộ Routes trong Suspense */}
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          {/* Các route giữ nguyên cấu trúc */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<MainLayout />}>
            <Route element={<UserPublicWrapper />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/event-detail/:id" element={<EventDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
            </Route>
            <Route
              element={<ProtectedRoute allowedRoles={['user', 'staff']} />}
            >
              <Route
                path="/select-tickets/:id"
                element={<SelectTicketsPage />}
              />
              <Route path="/payment/:id" element={<PaymentPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['user', 'staff']} />}>
            <Route path="/user" element={<AccountLayout />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders" element={<MyOrderPage />} />
              <Route path="tickets" element={<MyTicketsPage />} />
            </Route>
            <Route path="/organizer" element={<OrganizerLayout />}>
              <Route index element={<Navigate to="my-events" replace />} />
              <Route path="create-event" element={<CreateEventPage />} />
              <Route path="my-events" element={<MyEventsPage />} />
              <Route
                path="checkin-accounts"
                element={<CheckinAccountsPage />}
              />
            </Route>
            <Route path="/manage/:id" element={<EventLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<OrgDashboardPage />} />
              <Route path="orders" element={<OrgOrdersPage />} />
              <Route path="checkin" element={<OrgCheckInPage />} />
              <Route path="detail" element={<OrgEventDetail />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminHomePage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      <ToastContainer autoClose={2000} />
    </BrowserRouter>
  );
}
export default App;

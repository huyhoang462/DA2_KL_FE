import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layouts/MainLayout';
import HomePage from './pages/HomePage';
import AccountLayout from './components/layouts/AccountLayout';
import ProfilePage from './pages/user/ProfilePage';
import EventDetailPage from './pages/user/EventDetailPage';
import MyOrderPage from './pages/user/MyOrdersPage';
import MyTicketsPage from './pages/user/MyTicketsPage';
import PaymentPage from './pages/user/PaymentPage';
import SearchPage from './pages/user/SearchPage';
import SelectTicketsPage from './pages/user/SelectTicketsPage';
import MyEventsPage from './pages/organizer/MyEventsPage';
import SignupPage from './pages/auth/SignupPage';
import { ToastContainer } from 'react-toastify';
import OrganizerLayout from './components/layouts/OrganizerLayout';
import CheckinAccountsPage from './pages/organizer/CheckinAccountsPage';
import CreateEventPage from './pages/organizer/CreateEventPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}></Route>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/event-detail/:id" element={<EventDetailPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/select-tickets/:id" element={<SelectTicketsPage />} />
        </Route>
        <Route path="/user" element={<AccountLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="orders" element={<MyOrderPage />} />
          <Route path="tickets" element={<MyTicketsPage />} />
        </Route>
        <Route path="/organizer" element={<OrganizerLayout />}>
          <Route path="create-event" element={<CreateEventPage />} />
          <Route path="my-events" element={<MyEventsPage />} />
          <Route path="checkin-accounts" element={<CheckinAccountsPage />} />
        </Route>
      </Routes>
      <ToastContainer autoClose={2000} />
    </BrowserRouter>
  );
}
export default App;

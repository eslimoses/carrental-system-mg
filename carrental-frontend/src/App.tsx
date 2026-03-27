import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import Home from '@/components/Home/Home';
import CustomerDashboard from '@/components/Customer/CustomerDashboard';
import BookingForm from '@/components/Customer/BookingForm';
import PaymentPage from '@/components/Payment/PaymentPage';
import Payment from '@/components/Payment/Payment';
import CarListing from '@/components/Cars/CarListing';
import CarDetail from '@/components/Cars/CarDetail';
import BookingCheckout from '@/components/Customer/BookingCheckout';
import SuperAdminDashboard from '@/components/Admin/SuperAdminDashboard';
import Subscription from '@/components/Subscription/Subscription';
import Offers from '@/components/Offers/Offers';
import Login from '@/components/Auth/Login';
import Register from '@/components/Auth/Register';

const queryClient = new QueryClient();

// Layout wrapper that conditionally shows header/footer
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  // No header/footer for admin and dashboard routes (they have their own layout)
  if (isAdminRoute || isDashboardRoute) {
    return <>{children}</>;
  }

  const hideFooterRoutes = ['/', '/cars', '/subscription', '/offers', '/login', '/register'];
  const showFooter = !hideFooterRoutes.some(route =>
    location.pathname === route || (route !== '/' && location.pathname.startsWith(`${route}/`))
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cars" element={<CarListing />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/dashboard/*" element={<CustomerDashboard />} />
            <Route path="/booking/:vehicleId" element={<BookingForm />} />
            <Route path="/checkout/:vehicleId" element={<BookingCheckout />} />
            <Route path="/payment/:bookingId" element={<PaymentPage />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/admin" element={<SuperAdminDashboard />} />
            <Route path="/admin/*" element={<SuperAdminDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AppLayout>
      </Router>
    </QueryClientProvider>
  );
};

export default App;

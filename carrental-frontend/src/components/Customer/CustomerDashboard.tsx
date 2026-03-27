import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiCreditCard, FiHeart, FiEdit, FiTrash2, FiMapPin, FiUser, FiFileText, FiLogOut, FiXCircle } from 'react-icons/fi';
import { useAuth, useBookings, usePayments, useFavorites } from '../../hooks';
import Profile from './Profile';
import CarListing from '../Cars/CarListing';
import { CAR_IMAGES } from '../../constants';
import { FaCarSide } from 'react-icons/fa';

const getVehicleImage = (v: any): string => {
  if (!v) return 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800';
  
  // 1. Database fields
  if (v.vehicleImage && !v.vehicleImage.includes('unsplash.com')) return v.vehicleImage;
  if (v.photos && v.photos.length > 0) return v.photos[0].photoUrl;

  // 2. Hardcoded fallback
  const fullName = v.fullName || (v.make && v.model ? `${v.make} ${v.model}` : null) || v.name;
  if (fullName && CAR_IMAGES[fullName]) return CAR_IMAGES[fullName];
  if (v.make && v.model && CAR_IMAGES[`${v.make} ${v.model}`]) return CAR_IMAGES[`${v.make} ${v.model}`];
  if (v.model && CAR_IMAGES[v.model]) return CAR_IMAGES[v.model];
  
  return v.vehicleImage || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800';
};

const carAnimationStyle = `
  @keyframes moveCar {
    0% { transform: translateX(-100px); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateX(calc(100vw - 200px)); opacity: 0; }
  }
  .animate-car {
    animation: moveCar 10s linear infinite;
  }
`;

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  
  const { bookings, isLoading: bookingsLoading, cancelBooking, deleteBooking } = useBookings(user?.id);
  const { payments, isLoading: paymentsLoading } = usePayments(user?.id);
  const { favorites: userFavorites, isLoading: favoritesLoading, addFavorite, removeFavorite } = useFavorites(user?.id || null);
  
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loading = bookingsLoading || paymentsLoading || favoritesLoading;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleCancel = async (bookingId: number) => {
    setCancellingId(bookingId);
  };

  const confirmCancel = async () => {
    if (!cancellingId) return;
    const bookingId = cancellingId;
    setCancellingId(null);
    
    cancelBooking.mutate(bookingId, {
      onSuccess: () => {
        alert('Booking cancelled successfully! Mail and message have been sent.');
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || err.response?.data || 'Error cancelling booking');
      }
    });
  };

  const handleDelete = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    deleteBooking.mutate(bookingId);
  };

  const handleRemoveFavorite = async (vehicleId: number) => {
    removeFavorite.mutate(vehicleId);
  };

  const isFavorite = (vehicleId: any) => {
    if (!vehicleId || !userFavorites) return false;
    const vId = Number(vehicleId);
    return (userFavorites as any[]).some((v: any) => Number(v.id) === vId);
  };

  const toggleFavorite = (vehicleId: any) => {
    if (!vehicleId) return;
    const vId = Number(vehicleId);
    if (isFavorite(vId)) {
        removeFavorite.mutate(vId, {
          onError: (err: any) => alert('Failed to remove from favorites: ' + (err.response?.data?.message || 'Unknown error'))
        });
    } else {
        addFavorite.mutate(vId, {
          onError: (err: any) => alert('Failed to add to favorites: ' + (err.response?.data?.message || 'Unknown error'))
        });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800', CONFIRMED: 'bg-green-100 text-green-800',
      ACTIVE: 'bg-blue-100 text-blue-800', COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f1629] text-[#d4a574]"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#d4a574]"></div></div>;

  return (
    <div className="min-h-screen bg-[#0f1629] py-8 text-gray-300">
      <style>{carAnimationStyle}</style>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-[#d4a574] rounded-3xl p-8 mb-8 text-[#1a1c2e] relative overflow-hidden shadow-2xl border-b-4 border-[#b8860b]">
          <div className="absolute bottom-4 left-0 w-full overflow-hidden pointer-events-none opacity-20">
             <div className="animate-car flex items-center">
                <FaCarSide size={100} />
             </div>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"><FiUser className="text-3xl" /></div>
            <div>
              <h1 className="text-3xl font-bold">Welcome, {user?.firstName || 'Customer'} 👋</h1>
              <p className="text-yellow-100 font-medium">{user?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/10"
            >
              <FiLogOut /> Logout
            </button>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-8 relative z-10">
            <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20"><p className="text-3xl font-black">{bookings.length}</p><p className="text-sm font-bold opacity-80 uppercase tracking-widest">Total Bookings</p></div>
            <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20"><p className="text-3xl font-black">{bookings.filter((b: any) => b.status === 'ACTIVE' || b.status === 'CONFIRMED').length}</p><p className="text-sm font-bold opacity-80 uppercase tracking-widest">Active</p></div>
            <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20"><p className="text-3xl font-black">{userFavorites.length}</p><p className="text-sm font-bold opacity-80 uppercase tracking-widest">Favorites</p></div>
          </div>
        </div>

        {/* Profile Completion Warning */}
        {(!user?.phoneNumber || !user?.licensePhotoFront || !user?.licensePhotoBack) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full"><FiEdit className="text-yellow-600 text-xl" /></div>
              <div>
                <p className="text-yellow-800 font-bold text-lg">Complete Your Profile! 📝</p>
                <p className="text-yellow-700">Please update your phone number and upload your driving license to start booking cars.</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('profile')}
              className="bg-yellow-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-yellow-700 transition shadow-md"
            >
              Update Now
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            {key: 'browse', icon: FiMapPin, label: 'Browse Cars'},
            {key: 'bookings', icon: FiCalendar, label: 'My Bookings'},
            {key: 'payments', icon: FiCreditCard, label: 'Payment History'},
            {key: 'favorites', icon: FiHeart, label: 'Favorites'},
            {key: 'profile', icon: FiUser, label: 'My Profile'}
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${activeTab === tab.key ? 'bg-[#d4a574] text-[#1a1c2e] shadow-xl scale-105 shadow-amber-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-[#d4a574] border border-white/10 shadow-sm'}`}>
              <tab.icon /> {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white/5 rounded-3xl p-16 text-center shadow-xl border border-white/10">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                   <FiCalendar className="text-5xl text-[#d4a574]" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">No bookings yet</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">Your next journey awaits! Start by exploring our fleet of luxury and economy cars.</p>
                <button onClick={() => navigate('/cars')} className="bg-[#d4a574] text-[#1a1c2e] px-8 py-3 rounded-2xl font-black hover:bg-amber-500 transition shadow-lg shadow-amber-500/20 uppercase tracking-widest">Browse Cars</button>
              </div>
            ) : (
              bookings.map((b: any) => (
                <div key={b.id} className="bg-white/5 rounded-2xl shadow-lg p-6 hover:shadow-xl transition border border-white/5 border-b-white/10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img src={getVehicleImage({ fullName: b.vehicleName, vehicleImage: b.vehicleImage })} alt={b.vehicleName || 'Vehicle'} className="w-28 h-20 object-cover rounded-xl" />
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold">{b.vehicleName || `Booking #${b.id}`}</h3>
                          {getStatusBadge(b.status)}
                        </div>
                        <p className="text-sm text-gray-500">Booking #{b.bookingNumber || b.id}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1"><FiCalendar /> {b.pickupDate} → {b.returnDate}</span>
                          {b.cityName && <span className="flex items-center gap-1"><FiMapPin /> {b.cityName}</span>}
                          {b.vehicleId && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(b.vehicleId); }} 
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${isFavorite(b.vehicleId) ? 'bg-red-500/10 text-red-500 font-black shadow-lg shadow-red-500/10 border border-red-500/20' : 'bg-white/5 text-gray-400 hover:text-red-400 border border-white/5'}`}
                            >
                                <FiHeart size={14} fill={isFavorite(b.vehicleId) ? '#ef4444' : 'none'} className={isFavorite(b.vehicleId) ? 'animate-pulse' : ''} />
                                <span className="text-[10px] uppercase tracking-widest">{isFavorite(b.vehicleId) ? 'Favorited' : 'Favorite'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#d4a574]">₹{b.totalCost?.toLocaleString() || b.totalAmount?.toLocaleString()}</p>
                        <p className={`text-[10px] font-black tracking-widest px-2 py-1 rounded border ${b.advancePaid ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {b.advancePaid ? 'TOTAL PAID' : 'PAYMENT PENDING'}
                        </p>
                        {b.amountReturned > 0 && (
                          <p className="text-[10px] font-black tracking-widest px-2 py-1 rounded border bg-blue-500/10 text-blue-400 border-blue-500/20 mt-1">
                            RETURNED: ₹{b.amountReturned}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {b.advancePaid && (
                          <button 
                            onClick={() => { setSelectedBooking(b); setShowInvoice(true); }} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" 
                            title="View Invoice"
                          >
                            <FiFileText />
                          </button>
                        )}
                        {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCancel(b.id); }} 
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all border border-transparent hover:border-red-200 flex items-center justify-center transform hover:scale-110" 
                            title="Cancel Booking"
                          >
                             <FiXCircle className="text-xl" />
                          </button>
                        )}
                        {/* User requested to remove delete icon for cancelled bookings */}
                        {b.status === 'COMPLETED' && (
                          <button onClick={() => handleDelete(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete Booking"><FiTrash2 /></button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white/5 rounded-2xl shadow-lg border border-white/10 overflow-hidden">
            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <FiCreditCard className="text-6xl text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-500">No payment history</h3>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10"><tr>{['Date', 'Booking', 'Type', 'Method', 'Amount', 'Status', 'Invoice'].map(h => <th key={h} className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-widest">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-white/5">
                  {payments.filter((p: any) => p.status === 'SUCCESS' || p.paymentType === 'REFUND').map((p: any) => (
                    <tr key={p.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-sm font-medium">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#d4a574]">#{p.bookingId || p.booking?.id}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${p.paymentType === 'REFUND' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'opacity-60'}`}>
                          {p.paymentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm opacity-60 font-mono text-[10px] uppercase tracking-tighter">{p.paymentMethod?.replace('_', ' ')}</td>
                      <td className={`px-6 py-4 text-sm font-black ${p.paymentType === 'REFUND' ? 'text-orange-400' : 'text-green-500'}`}>
                        {p.paymentType === 'REFUND' ? '-' : ''}₹{p.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter border ${p.paymentType === 'REFUND' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                          {p.paymentType === 'REFUND' ? 'PROCESSED' : 'SUCCESS'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => { 
                            const booking = bookings.find((b: any) => b.id === (p.bookingId || p.booking?.id));
                            if (booking) { setSelectedBooking(booking); setShowInvoice(true); }
                          }} 
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          <FiFileText />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Logic for showing pending remaining amounts */}
                  {bookings.filter((b: any) => b.advancePaid && b.status !== 'COMPLETED' && b.status !== 'CANCELLED').map((b: any) => (
                    <tr key={`pending-${b.id}`} className="hover:bg-white/5 transition bg-yellow-500/5">
                      <td className="px-6 py-4 text-sm font-medium italic opacity-40">Expected</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#d4a574]">#{b.id}</td>
                      <td className="px-6 py-4 text-sm opacity-60 italic text-yellow-500">REMAINING BALANCE</td>
                      <td className="px-6 py-4 text-sm opacity-10 font-mono text-[10px] tracking-tighter text-center">-</td>
                      <td className="px-6 py-4 text-sm font-black text-yellow-500">₹{(b.totalAmount - (b.advanceAmount || b.totalAmount / 3)).toLocaleString()}</td>
                      <td className="px-6 py-4"><span className="px-2 py-0.5 rounded text-[10px] font-black tracking-tighter border bg-yellow-500/10 text-yellow-500 border-yellow-500/20 uppercase">Pending</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userFavorites.length === 0 ? (
              <div className="col-span-full bg-white/5 rounded-3xl p-16 text-center shadow-xl border border-white/10">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                   <FiHeart className="text-5xl text-[#d4a574]" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">No favorites yet</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">Keep track of cars you love by clicking the heart icon while browsing.</p>
                <button onClick={() => navigate('/cars')} className="bg-[#d4a574] text-[#1a1c2e] px-8 py-3 rounded-2xl font-black hover:bg-amber-500 transition shadow-lg shadow-amber-500/20 uppercase tracking-widest">Explore Fleet</button>
              </div>
            ) : (
              userFavorites.map((v: any) => (
                <div key={v.id} className="bg-white/5 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-white/5 border-b-white/10 group">
                  <div className="relative overflow-hidden h-52">
                    <img src={getVehicleImage(v)} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute top-4 right-4 bg-amber-500 px-3 py-1 rounded-full text-[10px] font-black text-[#1a1c2e] shadow-sm uppercase tracking-widest">
                      {v.type}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white">{v.make} {v.model}</h3>
                    <p className="text-gray-500 text-sm mb-4">{v.year} • {v.transmission} • {v.fuelType}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-black text-[#d4a574]">₹{v.dailyRate}<span className="text-sm text-gray-500 font-medium">/day</span></p>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => navigate(`/booking/${v.id}`)} className="flex-1 bg-[#d4a574] text-[#1a1c2e] py-3 rounded-2xl font-black hover:bg-amber-500 transition shadow-lg shadow-amber-500/20 text-xs uppercase tracking-widest">Book Journey</button>
                      <button onClick={() => handleRemoveFavorite(v.id)} className="p-3 border-2 border-red-500/10 rounded-2xl text-red-500 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500 transition" title="Remove from favorites"><FiHeart size={20} fill="#ef4444" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Browse Cars Tab */}
        {activeTab === 'browse' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <CarListing />
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Profile />
        )}
      </div>

      {/* Invoice Modal (Same as PaymentPage) */}
      {showInvoice && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-blue-600 italic">CARRENTAL</h2>
                  <p className="text-gray-500 text-sm">Premium Car Rental Service</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-gray-800">INVOICE</h3>
                  <p className="text-gray-500">#{selectedBooking.bookingNumber || `BK-${selectedBooking.id}`}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Billed To</p>
                  <p className="font-bold text-gray-800">{user?.firstName} {user?.lastName}</p>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Details</p>
                  <p className="text-gray-500 text-sm">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-gray-500 text-sm">Status: {selectedBooking.status}</p>
                </div>
              </div>

              <div className="mb-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-100 text-gray-400 uppercase text-xs">
                      <th className="text-left pb-4">Description</th>
                      <th className="text-center pb-4">Quantity</th>
                      <th className="text-right pb-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr>
                      <td className="py-4 pr-10">
                        <p className="font-bold text-gray-800">{selectedBooking.vehicleName || 'Vehicle Rental'}</p>
                        <p className="text-gray-400 text-xs">{selectedBooking.pickupDate} to {selectedBooking.returnDate}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider italic bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                             {selectedBooking.days >= 30 ? 'Monthly Plan' : selectedBooking.days >= 7 ? 'Weekly Plan' : 'Daily Plan'}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-4">{selectedBooking.days || 1} Days</td>
                      <td className="text-right py-4 font-semibold">₹{(selectedBooking.rentalCost || 0).toLocaleString()}</td>
                    </tr>
                    {selectedBooking.deliveryFee > 0 && (
                      <tr className="bg-gray-50/50">
                        <td className="py-4 text-gray-600 pl-2">Home Delivery ({selectedBooking.deliveryDistance || 0} km)</td>
                        <td className="text-center py-4">1</td>
                        <td className="text-right py-4 font-semibold">₹{selectedBooking.deliveryFee.toLocaleString()}</td>
                      </tr>
                    )}
                    {selectedBooking.includeInsurance && (
                      <tr>
                        <td className="py-2 text-gray-500 pl-4 italic text-xs">• Premium Insurance Cover</td>
                        <td className="text-center py-2 text-xs">{selectedBooking.days || 1} Days</td>
                        <td className="text-right py-2 text-xs">₹{(150 * (selectedBooking.days || 1)).toLocaleString()}</td>
                      </tr>
                    )}
                    {selectedBooking.includeGps && (
                      <tr>
                        <td className="py-2 text-gray-500 pl-4 italic text-xs">• GPS Navigation System</td>
                        <td className="text-center py-2 text-xs">{selectedBooking.days || 1} Days</td>
                        <td className="text-right py-2 text-xs">₹{(50 * (selectedBooking.days || 1)).toLocaleString()}</td>
                      </tr>
                    )}
                    {selectedBooking.includeChildSeat && (
                      <tr>
                        <td className="py-2 text-gray-500 pl-4 italic text-xs">• Child Safety Seat</td>
                        <td className="text-center py-2 text-xs">{selectedBooking.days || 1} Days</td>
                        <td className="text-right py-2 text-xs">₹{(75 * (selectedBooking.days || 1)).toLocaleString()}</td>
                      </tr>
                    )}
                    {selectedBooking.additionalDrivers > 0 && (
                      <tr>
                        <td className="py-2 text-gray-500 pl-4 italic text-xs">• Additional Drivers ({selectedBooking.additionalDrivers})</td>
                        <td className="text-center py-2 text-xs">{selectedBooking.days || 1} Days</td>
                        <td className="text-right py-2 text-xs">₹{(100 * selectedBooking.additionalDrivers * (selectedBooking.days || 1)).toLocaleString()}</td>
                      </tr>
                    )}
                    {selectedBooking.extraCharges > 0 && !selectedBooking.includeInsurance && !selectedBooking.includeGps && !selectedBooking.includeChildSeat && selectedBooking.additionalDrivers === 0 && (
                      <tr>
                        <td className="py-4 text-gray-600">Other Extra Charges</td>
                        <td className="text-center py-4">1</td>
                        <td className="text-right py-4 font-semibold">₹{selectedBooking.extraCharges.toLocaleString()}</td>
                      </tr>
                    )}
                    {selectedBooking.discountAmount > 0 && (
                      <tr>
                        <td className="py-4 text-green-600 font-semibold">Discount</td>
                        <td className="text-center py-4">- </td>
                        <td className="text-right py-4 font-semibold text-green-600">-₹{selectedBooking.discountAmount.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-8 pt-8 border-t-2 border-gray-100">
                <div className="w-1/2 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold">₹{(selectedBooking.totalAmount || selectedBooking.totalCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg">
                    <span>Amount Paid</span>
                    <span>₹{(selectedBooking.advanceAmount || (selectedBooking.totalAmount || selectedBooking.totalCost || 0) / 3).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl flex items-center justify-between">
                <p className="text-xs text-gray-400 max-w-[70%]">
                  This is a computer generated invoice.
                  For support contact support@carrental.com
                </p>
                <button 
                  onClick={() => setShowInvoice(false)}
                  className="bg-gray-800 text-white px-6 py-2 rounded-xl font-bold text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Cancellation Confirmation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-[#1a1c2e] border border-gray-700 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-in-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <FiTrash2 className="text-3xl text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 italic uppercase">Cancel Booking?</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">Are you sure you want to cancel this booking? This will restore vehicle availability and notify the admin. This action is permanent.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setCancellingId(null)} 
                className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-black hover:bg-white/10 transition border border-white/10 uppercase tracking-widest text-xs"
              >
                Go Back
              </button>
              <button 
                onClick={confirmCancel} 
                className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black hover:bg-red-700 transition shadow-xl shadow-red-500/20 uppercase tracking-widest text-xs"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;


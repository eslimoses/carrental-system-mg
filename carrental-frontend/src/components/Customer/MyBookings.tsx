import React from 'react';
import { useBookings } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiFileText, FiChevronRight } from 'react-icons/fi';

interface MyBookingsProps {
  customerId: number;
}

const MyBookings: React.FC<MyBookingsProps> = ({ customerId }) => {
  const { bookings, isLoading, error } = useBookings(customerId);
  const navigate = useNavigate();

  if (isLoading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
      Error loading bookings. Please try again later.
    </div>
  );
  
  // Filter only confirmed/active/completed bookings
  const confirmedBookings = bookings?.filter(b => 
    b.status === 'CONFIRMED' || b.status === 'COMPLETED' || b.status === 'ACTIVE'
  ) || [];
  
  if (confirmedBookings.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-12 text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCalendar className="text-4xl text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Bookings Found</h3>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
          You haven't made any bookings yet. Explore our fleet and start your journey!
        </p>
        <button 
          onClick={() => navigate('/cars')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
        >
          Browse Cars
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {confirmedBookings.map(booking => (
        <div 
          key={booking.id} 
          className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all group"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                <FiCalendar className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-lg font-bold text-white">Booking #{booking.bookingNumber || booking.id}</h4>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    booking.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' :
                    booking.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><FiCalendar className="w-3.5 h-3.5" /> {booking.pickupDate}</span>
                  <span className="flex items-center gap-1.5"><FiMapPin className="w-3.5 h-3.5" /> {booking.city?.name || 'Main City'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
              <div className="text-right">
                <p className="text-2xl font-black text-white">₹{booking.totalAmount?.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Amount</p>
              </div>
              <button 
                onClick={() => navigate(`/payment/${booking.id}`)}
                className="w-12 h-12 bg-slate-800 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-blue-600/20"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBookings;

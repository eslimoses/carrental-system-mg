import React from 'react';
import { useBooking } from '@/hooks';
import { useNavigate } from 'react-router-dom';

interface MyBookingsProps {
  customerId: number;
}

const MyBookings: React.FC<MyBookingsProps> = ({ customerId }) => {
  const { getCustomerBookings } = useBooking();
  const { data: bookings, isLoading, error } = getCustomerBookings(customerId);
  const navigate = useNavigate();

  if (isLoading) return <div className="text-center py-8">Loading bookings...</div>;
  if (error) return <div className="text-red-600 py-8">Error loading bookings</div>;
  
  // Filter only confirmed bookings (after payment)
  const confirmedBookings = bookings?.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED' || b.status === 'ONGOING') || [];
  
  if (!confirmedBookings || confirmedBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📅</div>
        <p className="text-gray-600 text-lg">No bookings yet</p>
        <p className="text-gray-500 text-sm mt-2">Your confirmed bookings will appear here after payment</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-3 text-left">Booking ID</th>
            <th className="px-6 py-3 text-left">Start Date</th>
            <th className="px-6 py-3 text-left">End Date</th>
            <th className="px-6 py-3 text-left">Total Cost</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {confirmedBookings.map(booking => (
            <tr key={booking.id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4">#{booking.id}</td>
              <td className="px-6 py-4">{new Date(booking.rentalStartDate).toLocaleDateString()}</td>
              <td className="px-6 py-4">{new Date(booking.rentalEndDate).toLocaleDateString()}</td>
              <td className="px-6 py-4">₹{booking.totalCost}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded text-white text-sm ${
                  booking.status === 'CONFIRMED' ? 'bg-green-500' :
                  booking.status === 'PENDING' ? 'bg-yellow-500' :
                  booking.status === 'COMPLETED' ? 'bg-blue-500' :
                  'bg-red-500'
                }`}>
                  {booking.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => navigate(`/booking/${booking.id}`)}
                  className="text-blue-600 hover:underline"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyBookings;

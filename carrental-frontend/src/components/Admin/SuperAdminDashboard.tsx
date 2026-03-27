import React, { useState } from 'react';
import { FiUsers, FiTruck, FiCalendar, FiMapPin, FiPlus, FiEdit, FiTrash2, FiX, FiBarChart, FiDollarSign, FiTag, FiActivity, FiLogOut, FiFileText, FiEye, FiMail, FiDownload, FiAlertCircle, FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAdminStats, useAdminVehicles, useAdminBookings, useAdminUsers, useAdminActions, useVehicleManagement, useCityManagement, useCities, useCategories, useAdminOffers, useOfferManagement, useCustomerActivities, useCategoryManagement, useAuth, useAdminPayments } from '../../hooks';

const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [modal, setModal] = useState<{ type: string; data?: any } | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState<any>(null);
  const [showUserViewModal, setShowUserViewModal] = useState(false);
  const [selectedVehicleForMaintenance, setSelectedVehicleForMaintenance] = useState<any>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  // Offer notification state
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyOffer, setNotifyOffer] = useState<any>(null);
  const [notifyTarget, setNotifyTarget] = useState<'all' | 'specific'>('all');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySending, setNotifySending] = useState(false);
  const navigate = useNavigate();

  const { logout } = useAuth();

  const { data: stats } = useAdminStats();
  const { data: vehiclesData = [] } = useAdminVehicles();
  const vehicles = Array.isArray(vehiclesData) ? vehiclesData : [];
  
  const { data: bookingsData = [] } = useAdminBookings();
  const bookings = Array.isArray(bookingsData) ? bookingsData : [];
  
  const { data: usersData = [] } = useAdminUsers();
  const users = Array.isArray(usersData) ? usersData : [];
  
  const { data: paymentsData = [] } = useAdminPayments();
  const payments = Array.isArray(paymentsData) ? paymentsData : [];
  
  const { data: offersData = [] } = useAdminOffers();
  const offers = Array.isArray(offersData) ? offersData : [];
  
  const { data: acts = [] } = useCustomerActivities();
  const activities = Array.isArray(acts) ? acts : [];
  
  const { cities: citiesList = [] } = useCities();
  const cities = Array.isArray(citiesList) ? citiesList : [];
  
  const { data: categoriesData = [] } = useCategories() as any;
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  
  const { updateUserStatus, updateBookingStatus } = useAdminActions();
  const { createVehicle, updateVehicle, deleteVehicle } = useVehicleManagement();
  const { createCity, updateCity, deleteCity } = useCityManagement();
  const { createCategory, updateCategory } = useCategoryManagement();
  const { createOffer, updateOffer, deleteOffer } = useOfferManagement();

  const handleAddVehicle = () => {
    setFormData({ make: '', model: '', year: 2024, registrationNumber: '', color: '', fuelType: 'Petrol', transmission: 'Automatic', seatingCapacity: 5, dailyRate: 1000, weeklyRate: 6000, monthlyRate: 20000, cityId: cities[0]?.id, categoryId: categories[0]?.id, status: 'AVAILABLE', imageUrl: '' });
    setModal({ type: 'addVehicle' });
  };
  const handleEditVehicle = (v: any) => { setFormData({ ...v, cityId: v.city?.id, categoryId: v.category?.id }); setModal({ type: 'editVehicle', data: v }); };
  const handleDeleteVehicle = async (id: number) => { if (window.confirm('Delete this vehicle?')) deleteVehicle.mutate(id); };
  const saveChanges = async () => {
    if (modal?.type === 'addVehicle') createVehicle.mutate(formData, { onSuccess: () => setModal(null) });
    else if (modal?.type === 'editVehicle') updateVehicle.mutate({ id: modal!.data.id, data: formData }, { onSuccess: () => { setModal(null); window.location.reload(); } });
    else if (modal?.type === 'addCity') createCity.mutate({ ...formData, state: formData.state || 'N/A', deliveryFeePerKm: formData.deliveryFeePerKm || 15.0 }, { onSuccess: () => { setModal(null); window.location.reload(); } });
    else if (modal?.type === 'editCity') updateCity.mutate({ id: modal!.data.id, data: formData }, { onSuccess: () => { setModal(null); window.location.reload(); } });
    else if (modal?.type === 'addCategory') createCategory.mutate(formData, { onSuccess: () => setModal(null) });
    else if (modal?.type === 'editCategory') updateCategory.mutate({ id: modal!.data.id, data: formData }, { onSuccess: () => setModal(null) });
    else if (modal?.type === 'addOffer') createOffer.mutate({ ...formData, isActive: true, usedCount: 0, validFrom: formData.validFrom || new Date().toISOString(), validUntil: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }, { onSuccess: () => { setModal(null); window.location.reload(); } });
    else if (modal?.type === 'editOffer') updateOffer.mutate({ id: modal!.data.id, data: formData }, { onSuccess: () => { setModal(null); window.location.reload(); } });
  };

  const handleUpdateBookingStatus = (id: number, status: string) => {
    updateBookingStatus.mutate({ id, status });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { key: 'overview', icon: FiBarChart, label: 'Overview' },
    { key: 'vehicles', icon: FiTruck, label: `Vehicles` },
    { key: 'bookings', icon: FiCalendar, label: `Bookings` },
    { key: 'payments', icon: FiDollarSign, label: `Payments` },
    { key: 'users', icon: FiUsers, label: `Users` },
    { key: 'cities', icon: FiMapPin, label: `Cities` },
    { key: 'offers', icon: FiTag, label: `Promo Offers` },
    { key: 'activity', icon: FiActivity, label: `Recent Activity` },
    { key: 'compliance', icon: FiBarChart, label: `Compliance` },
  ];

  return (
    <div className="min-h-screen bg-[#0a0c14] flex text-gray-200 font-sans">
      <aside className="w-68 min-h-screen bg-[#111420] border-r border-[#1e2336] p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-10 px-2">
           <img src="https://st3.depositphotos.com/22052918/32067/v/450/depositphotos_320674452-stock-illustration-letter-mg-slice-colorful-logo.jpg" alt="MotoGlide Logo" className="w-10 h-10 rounded-lg object-cover" />
           <h2 className="text-xl font-black text-white tracking-tighter italic uppercase">Moto<span className="text-blue-500">Glide</span></h2>
        </div>
        <nav className="space-y-1">
          {tabs.map(t => (
            <button 
              key={t.key} 
              onClick={() => setActiveTab(t.key)} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === t.key ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]' : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'}`}
            >
              <t.icon className={`${activeTab === t.key ? 'text-blue-500' : ''}`} /> {t.label}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto pt-8 border-t border-[#1e2336]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all duration-300"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {activeTab === 'overview' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               {[
                { label: 'Total Users', value: stats?.totalUsers || users.length, color: 'from-blue-600 to-blue-800' },
                { label: 'Total Vehicles', value: stats?.totalVehicles || vehicles.length, color: 'from-green-600 to-green-800' },
                { label: 'Total Bookings', value: stats?.totalBookings || bookings.length, color: 'from-purple-600 to-purple-800' },
                { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'from-orange-600 to-orange-800' },
              ].map(s => (
                <div key={s.label} className={`bg-gradient-to-r ${s.color} rounded-2xl p-6 text-white text-center shadow-lg transform transition hover:scale-105`}>
                  <p className="text-xs opacity-80 uppercase font-black tracking-widest">{s.label}</p>
                  <p className="text-4xl font-black mt-2">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
               <div className="bg-gradient-to-r from-red-600 to-red-900 rounded-2xl p-6 text-white text-center shadow-xl shadow-red-500/20 md:col-span-1">
                  <p className="text-xs opacity-80 uppercase font-black tracking-widest">Maintenance Due</p>
                  <p className="text-5xl font-black mt-2">{stats?.maintenanceDueCount || 0}</p>
               </div>
               <div className="md:col-span-3"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 flex justify-between items-center backdrop-blur-sm">
                <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Advance Received</span>
                <span className="text-white font-black">₹{stats?.advanceRevenue?.toLocaleString() || 0}</span>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 flex justify-between items-center backdrop-blur-sm">
                <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Rent Received</span>
                <span className="text-white font-black">₹{stats?.rentalRevenue?.toLocaleString() || 0}</span>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 flex justify-between items-center backdrop-blur-sm">
                <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Extra Charges</span>
                <span className="text-white font-black">₹{stats?.extraChargesRevenue?.toLocaleString() || 0}</span>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-xl border border-red-500/20 flex justify-between items-center backdrop-blur-sm">
                <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Amount Returned</span>
                <span className="text-red-400 font-black">₹{stats?.returnedRevenue?.toLocaleString() || 0}</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8 items-stretch">
               <div className="flex-1 flex bg-[#111420] rounded-2xl border border-[#1e2336] overflow-hidden focus-within:border-blue-500 transition-all shadow-xl group">
                  <div className="flex items-center px-4 text-gray-500 group-focus-within:text-blue-500"><FiMail size={18}/></div>
                  <input 
                    type="email" 
                    id="admin-report-email"
                    placeholder="Enter Admin Email..." 
                    defaultValue="eslimoses2005@gmail.com"
                    className="flex-1 bg-transparent border-none outline-none text-white font-bold py-4 text-sm"
                  />
                  <button 
                    onClick={() => {
                       const emailInput = document.getElementById('admin-report-email') as HTMLInputElement;
                       const email = emailInput?.value;
                       if(email) {
                          fetch(`https://carrental-system-mg-production.up.railway.app/api/admin/reports/financial/email?email=${encodeURIComponent(email)}`, {
                             method: 'POST',
                             headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                          })
                            .then(res => res.ok ? alert(`Report successfully mailed to ${email}!`) : alert("Failed to send report."))
                            .catch(() => alert("Error contacting server."));
                       } else {
                          alert("Please provide an email.");
                       }
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Send Report
                  </button>
               </div>
               <button 
                onClick={() => {
                   window.open(`https://carrental-system-mg-production.up.railway.app/api/admin/reports/financial/download`, '_blank');
                }}
                className="md:w-64 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 border-b-4 border-emerald-800 active:border-b-0 transition-all uppercase tracking-widest text-sm"
              >
                  <FiDownload size={20} /> Download PDF Report
              </button>
            </div>
            <div className="bg-[#111420] rounded-3xl p-8 shadow-2xl border border-[#1e2336] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-600/10 transition-all duration-500"></div>
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                    <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-600/20"><FiActivity className="text-blue-500" /></div>
                    Recent Activity
                 </h2>
                 <button onClick={() => setActiveTab('activity')} className="text-xs font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition flex items-center gap-1">View All <FiPlus size={10} /></button>
              </div>
              <div className="space-y-4">
                {activities.slice(0, 5).map((a: any) => (
                  <div key={a.id} className="p-5 bg-[#161a29]/50 rounded-2xl border border-[#1e2336] hover:border-blue-500/30 hover:bg-[#161a29] transition group/item">
                     <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 shadow-lg ${
                             a.status === 'CANCELLED' 
                               ? 'bg-red-500/10 text-red-500 border border-red-500/20 group-hover/item:bg-red-500 group-hover/item:text-white' 
                               : 'bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover/item:bg-blue-500 group-hover/item:text-white'
                           }`}>
                              {a.customer?.firstName?.[0] || 'U'}
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-white font-bold text-lg leading-tight">{a.customer?.firstName} {a.customer?.lastName}</p>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${
                                  a.status === 'CANCELLED' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                                }`}>
                                  {a.status}
                                </span>
                              </div>
                              <p className="text-gray-400 font-medium text-xs mt-1">
                                {a.status === 'CANCELLED' ? 'Cancelled' : 'Booked'} <span className="text-blue-400 font-black">{a.vehicle?.make || a.vehicleName} {a.vehicle?.model}</span> in <span className="text-gray-500 font-bold uppercase">{a.cityName || a.city?.name}</span>
                              </p>
                              <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-500 font-bold opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                                 <span className="flex items-center gap-1"><FiMapPin size={8} className="text-blue-500" /> {a.deliveryType}</span>
                                 <span className="flex items-center gap-1"><FiDollarSign size={8} className="text-blue-500" /> ₹{(a.totalAmount || a.totalCost || 0).toLocaleString()}</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-600 font-black uppercase tracking-tighter italic">{a.bookingNumber}</p>
                          <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase opacity-60">Today</p>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">Vehicles</h1>
              <button onClick={handleAddVehicle} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-lg"><FiPlus /> Add Vehicle</button>
            </div>
            <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
              <table className="w-full">
                <thead><tr className="border-b border-gray-700 bg-gray-900/50">{['Vehicle', 'Registration', 'Expiries', 'Condition', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-700">
                  {vehicles.map((v: any) => {
                    const isInsNear = v.insuranceValidTill && new Date(v.insuranceValidTill).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000;
                    const isRegNear = v.registrationValidTill && new Date(v.registrationValidTill).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000;
                    
                    return (
                      <tr key={v.id} className="hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4 text-white font-semibold">
                          <div className="flex flex-col">
                            <span>{v.make} {v.model} ({v.year})</span>
                            <span className="text-green-400 text-[10px] font-black">₹{v.dailyRate}/day</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 font-mono text-xs">{v.registrationNumber}</td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isInsNear ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-gray-900 text-gray-500'}`}>INS: {v.insuranceValidTill || 'N/A'}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isRegNear ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-gray-900 text-gray-500'}`}>REG: {v.registrationValidTill || 'N/A'}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`text-[10px] font-black px-2 py-1 rounded-md border ${
                             v.vehicleCondition === 'EXCELLENT' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                             v.vehicleCondition === 'GOOD' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                             v.vehicleCondition === 'FAIR' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                             'bg-red-500/10 text-red-400 border-red-500/20'
                           }`}>
                             {v.vehicleCondition || 'UNKNOWN'}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                            v.status === 'AVAILABLE' ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 
                            v.status === 'MAINTENANCE' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex gap-1">
                              <button onClick={() => handleEditVehicle(v)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg" title="Edit Vehicle"><FiEdit /></button>
                              <button onClick={() => { setSelectedVehicleForMaintenance(v); setShowMaintenanceModal(true); }} className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg" title="Maintenance Log"><FiActivity /></button>
                              <button onClick={() => handleDeleteVehicle(v.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg" title="Delete Vehicle"><FiTrash2 /></button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
           <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">All Bookings</h2>
              </div>
              <table className="w-full">
                <thead><tr className="border-b border-gray-700">{['Booking #', 'Customer', 'Vehicle', 'Period', 'Amount', 'Status', 'Action', 'Invoice'].map(h => <th key={h} className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-700">
                  {bookings.map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 text-white font-mono">{b.bookingNumber || `#${b.id}`}</td>
                      <td className="px-6 py-4 text-gray-300">{b.customer?.firstName} {b.customer?.lastName}</td>
                      <td className="px-6 py-4 text-gray-300">{b.vehicle?.make} {b.vehicle?.model}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{b.pickupDate} → {b.returnDate}</td>
                      <td className="px-6 py-4 text-green-400 font-bold">₹{b.totalAmount?.toLocaleString() || b.totalCost?.toLocaleString()}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-[10px] font-bold bg-gray-900 border border-gray-700">{b.status}</span></td>
                      <td className="px-6 py-4">
                        <select onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)} value={b.status} className="bg-gray-900 text-white px-2 py-1 rounded-lg border border-gray-700 text-xs">
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="ACTIVE">Active</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => { setSelectedBookingForInvoice(b); setShowInvoiceModal(true); }} className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg transition border border-blue-500/20">
                          <FiFileText className="text-sm" /> Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
           <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
               <div className="p-6 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Payment Transactions</h2>
               </div>
              <table className="w-full">
                <thead><tr className="border-b border-gray-700 bg-gray-900/50">{['Txn ID', 'Booking', 'Customer', 'Type', 'Method', 'Amount', 'Status', 'Date', 'Action'].map(h => <th key={h} className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-700">
                  {payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 text-white font-mono text-sm">{p.transactionId}</td>
                      <td className="px-6 py-4 text-blue-400 font-mono text-sm">{p.booking?.bookingNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="text-white font-bold text-sm">{p.booking?.customer?.firstName} {p.booking?.customer?.lastName}</span>
                           <span className="text-gray-500 text-[10px]">{p.booking?.customer?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider 
                          ${p.paymentType === 'ADVANCE' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 
                            p.paymentType === 'RENTAL' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                            p.paymentType === 'REFUND' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                          {p.paymentType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 uppercase tracking-tighter">{p.paymentMethod || 'UPI'}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-white">₹{p.amount?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                          ${p.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => {
                            setSelectedBookingForInvoice(p.booking);
                            setShowInvoiceModal(true);
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded-lg transition"
                        >
                          <FiFileText className="text-sm" /> Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-6">User Management</h1>
            <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
              <table className="w-full text-left">
                <thead className="bg-gray-900/50"><tr>{['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((u: any) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 text-white font-semibold">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </div>
                          {u.firstName} {u.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{u.email}</td>
                      <td className="px-6 py-4"><span className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded-lg">{u.role}</span></td>
                      <td className="px-6 py-4"><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${u.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{u.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedUserForView(u);
                              setShowUserViewModal(true);
                            }}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg flex items-center gap-1"
                          >
                            <FiEye /> <span className="text-[10px] font-bold">Details</span>
                          </button>
                          <button onClick={() => updateUserStatus.mutate({ id: u.id, isActive: !u.active })} className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-tighter ${u.active ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{u.active ? 'Suspend' : 'Resume'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cities Tab */}
        {activeTab === 'cities' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">Cities & Service Locations</h1>
              <button 
                onClick={() => { setFormData({ name: '', state: '', deliveryFeePerKm: 15.0 }); setModal({ type: 'addCity' }); }}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
              >
                <FiPlus /> Add City
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city: any) => (
                <div key={city.id} className="bg-[#111420] p-6 rounded-2xl border border-[#1e2336] flex justify-between items-start hover:bg-[#161a29] transition group shadow-xl hover:shadow-blue-500/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-blue-600/20 p-2 rounded-lg">
                        <FiBarChart className="text-blue-500 text-sm" />
                      </div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate">
                        {city.name}, <span className="text-blue-500">{city.state}</span>
                      </h3>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-4 ml-1">
                       <div className="flex items-center gap-2">
                          <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">
                            ₹{city.deliveryFeePerKm}/km Delivery
                          </span>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="bg-green-500/10 text-green-500 text-[10px] font-black px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-widest">
                            Active Node
                          </span>
                       </div>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => { setFormData(city); setModal({ type: 'editCity', data: city }); }} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-300"><FiEdit size={18}/></button>
                    <button onClick={() => { if(window.confirm('Delete this service location?')) deleteCity.mutate(city.id); }} className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300"><FiTrash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-black text-white italic">PROMOTIONAL OFFERS</h1>
              <button onClick={() => { setFormData({ code: '', discountPercentage: 10, maxDiscountAmount: 500, description: '', validFrom: new Date().toISOString().split('T')[0] + 'T00:00:00', validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00' }); setModal({ type: 'addOffer' }); }} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 flex items-center gap-2">
                <FiPlus /> CREATE OFFER
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((o: any) => (
                <div key={o.id} className="bg-[#111420] border border-[#1e2336] p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-2 opacity-70 group-hover:opacity-100 transition flex gap-1 z-10">
                     <button onClick={() => { setFormData({...o}); setModal({ type: 'editOffer', data: o }); }} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg bg-[#1a1c2e]/50 backdrop-blur-sm" title="Edit Offer"><FiEdit /></button>
                     <button onClick={() => { if(window.confirm('Delete offer?')) deleteOffer.mutate(o.id); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg bg-[#1a1c2e]/50 backdrop-blur-sm" title="Delete Offer"><FiTrash2 /></button>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                     {o.imageUrl ? <img src={o.imageUrl} alt={o.code} className="w-12 h-12 object-cover rounded-xl" /> : <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500 font-bold text-xl"><FiTag /></div>}
                     <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-black text-white tracking-widest uppercase truncate">{o.code}</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{o.discountPercentage}% OFF</p>
                     </div>
                  </div>
                  <div className="space-y-2">
                    {o.description && <p className="text-xs text-gray-400 line-clamp-2">{o.description}</p>}
                    <div className="flex items-center justify-between mt-4">
                       <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-1">Max Discount: ₹{o.maxDiscountAmount}</p>
                       <span className="text-[10px] text-green-500 font-black border border-green-500/30 px-2 py-0.5 rounded uppercase tracking-tighter">{o.category || 'ALL'}</span>
                    </div>
                    {/* Send Notification Button */}
                    <button
                      onClick={() => {
                        setNotifyOffer(o);
                        setNotifyTarget('all');
                        setNotifyEmail('');
                        setShowNotifyModal(true);
                      }}
                      className="w-full mt-3 flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-500 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300"
                    >
                      <FiBell size={14} /> Send Offer Notification
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div>
            <h1 className="text-3xl font-black text-white italic mb-8 uppercase">Recent Activity Stream</h1>
            <div className="bg-[#111420] border border-[#1e2336] rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-[#1e2336] flex justify-between items-center bg-[#161a29]">
                 <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Global Activity Feed</p>
                 <FiActivity className="text-blue-500" />
              </div>
              <div className="divide-y divide-[#1e2336]">
                {activities.map((a: any) => {
                  const formatDate = (dateArr: any) => {
                    if (!dateArr) return 'N/A';
                    if (typeof dateArr === 'string') return new Date(dateArr).toLocaleDateString();
                    if (Array.isArray(dateArr)) {
                      const [year, month, day] = dateArr;
                      return `${day}/${month}/${year}`;
                    }
                    return 'Invalid Date';
                  };

                  return (
                    <div key={a.id} className="p-6 hover:bg-[#161a29] transition group">
                       <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 shadow-lg ${
                               a.status === 'CANCELLED' 
                                 ? 'bg-red-500/10 text-red-500 border border-red-500/20 group-hover:bg-red-500 group-hover:text-white' 
                                 : 'bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white'
                             }`}>
                                {a.customer?.firstName?.[0] || 'U'}
                             </div>
                             <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-white font-bold text-lg">{a.customer?.firstName} {a.customer?.lastName}</p>
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                                    a.status === 'CANCELLED' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                                  }`}>
                                    {a.status}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-0.5 mt-1">
                                  <p className="text-gray-400 font-medium text-sm">
                                    {a.status === 'CANCELLED' ? 'Cancelled booking for' : 'Booked a'} <span className="text-blue-400 font-black">{a.vehicle?.make || a.vehicleName} {a.vehicle?.model}</span>
                                    <span className="text-gray-500 text-xs ml-2 font-bold uppercase">({a.cityName || a.city?.name})</span>
                                  </p>
                                  <div className="flex items-center gap-3 text-[11px] text-gray-500 font-bold mt-1">
                                     <span className="flex items-center gap-1"><FiActivity size={10} className="text-blue-500" /> #{a.bookingNumber}</span>
                                     <span className="flex items-center gap-1 uppercase"><FiMapPin size={10} className="text-blue-500" /> {a.deliveryType}</span>
                                  </div>
                                  <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-4 bg-[#1e2336]/30 p-2 rounded-lg border border-[#1e2336]/50 w-fit">
                                     <div className="flex items-center gap-1.5 border-r border-[#1e2336] pr-4">
                                        <div className="bg-blue-500/10 p-1 rounded-md text-blue-500"><FiActivity size={12} /></div>
                                        <span>{a.customer?.email || 'No Email'}</span>
                                     </div>
                                     <div className="flex items-center gap-1.5">
                                        <div className="bg-emerald-500/10 p-1 rounded-md text-emerald-500"><FiActivity size={12} /></div>
                                        <span>{a.customer?.phoneNumber || 'No Phone'}</span>
                                     </div>
                                  </div>
                                </div>
                                
                                <div className="mt-4 flex flex-col gap-3">
                                  <div className="flex items-center gap-4 text-xs font-bold">
                                     <div className="flex items-center gap-1.5 text-gray-400 bg-gray-900/40 px-3 py-1.5 rounded-xl border border-gray-800">
                                        <FiCalendar className="text-blue-500" />
                                        <span>Rental: {a.pickupDate} to {a.returnDate}</span>
                                     </div>
                                  </div>

                                  <div className="flex flex-wrap gap-3">
                                    <div className="bg-[#1e2336] px-3 py-1.5 rounded-xl border border-[#2d344b] flex items-center gap-2">
                                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Revenue</span>
                                      <span className={`font-bold ${a.status === 'CANCELLED' ? 'text-red-400 line-through' : 'text-green-400'}`}>
                                        ₹{a.totalAmount?.toLocaleString() || a.totalCost?.toLocaleString()}
                                      </span>
                                    </div>
  
                                    {a.couponCode && (
                                      <div className="bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-2">
                                        <FiTag className="text-amber-500 text-xs" />
                                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Coupon</span>
                                        <span className="font-bold text-amber-500">{a.couponCode}</span>
                                        <span className="text-[10px] font-medium bg-amber-500 text-white px-1.5 rounded-md">-₹{a.couponDiscount}</span>
                                      </div>
                                    )}
  
                                    {a.status === 'CANCELLED' && (
                                      <div className="bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 flex items-center gap-2">
                                        <FiDollarSign className="text-red-500 text-xs" />
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Refund Issued</span>
                                        <span className="font-bold text-red-500">Full</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-tighter italic">{a.bookingNumber}</p>
                            <p className="text-[10px] text-gray-500 font-bold mt-1">{formatDate(a.createdAt)}</p>
                          </div>
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'compliance' && (() => {
           const now = new Date();
           const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
           const maintenanceVehicles = vehicles.filter((v: any) => {
             if (v.status === 'MAINTENANCE' || v.maintenanceWorkRequired) return true;
             if (v.insuranceValidTill) {
               const insDate = new Date(v.insuranceValidTill);
               if (insDate.getTime() - now.getTime() < thirtyDaysMs) return true;
             }
             if (v.registrationValidTill) {
               const regDate = new Date(v.registrationValidTill);
               if (regDate.getTime() - now.getTime() < thirtyDaysMs) return true;
             }
             return false;
           });
           return (
           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Compliance & Maintenance</h1>
                 <div className="bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 flex items-center gap-2">
                    <FiActivity size={16} className="text-red-500" />
                    <span className="text-red-500 font-black text-sm">{stats?.maintenanceDueCount || maintenanceVehicles.length} VEHICLES DUE</span>
                 </div>
              </div>
              
              <div className="bg-[#111420] rounded-3xl border border-[#1e2336] overflow-hidden shadow-2xl">
                 <div className="p-6 border-b border-[#1e2336] bg-[#161a29]/50">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Maintenance Required Fleet</p>
                 </div>
                 <div className="divide-y divide-[#1e2336]">
                    {maintenanceVehicles.map((v:any) => {
                       const isInsNear = v.insuranceValidTill && new Date(v.insuranceValidTill).getTime() - now.getTime() < thirtyDaysMs;
                       const isInsExpired = v.insuranceValidTill && new Date(v.insuranceValidTill).getTime() < now.getTime();
                       const isRegNear = v.registrationValidTill && new Date(v.registrationValidTill).getTime() - now.getTime() < thirtyDaysMs;
                       const isRegExpired = v.registrationValidTill && new Date(v.registrationValidTill).getTime() < now.getTime();
                       return (
                       <div key={v.id} className="p-6 hover:bg-[#161a29] transition group">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${v.status === 'MAINTENANCE' ? 'bg-red-500/20 border-red-500/20 text-red-500' : 'bg-amber-500/20 border-amber-500/20 text-amber-500'}`}>
                                    <FiActivity size={24} />
                                 </div>
                                 <div>
                                    <h3 className="text-white font-bold text-lg">{v.make} {v.model}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                       <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{v.registrationNumber}</span>
                                       <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                       <span className="text-blue-400 text-[10px] font-black uppercase tracking-tighter">{v.city?.name || v.cityName}</span>
                                       {v.status === 'MAINTENANCE' ? (
                                         <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase ml-2 tracking-widest">Grounded</span>
                                       ) : (
                                         <span className="bg-amber-500/20 text-amber-500 border border-amber-500/20 text-[9px] font-black px-1.5 py-0.5 rounded uppercase ml-2 tracking-widest">Needs Attention</span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400">Current Odometer</p>
                                    <p className="text-white font-black">{v.mileage?.toLocaleString()} KM</p>
                                 </div>
                                 <button 
                                   onClick={() => { setSelectedVehicleForMaintenance(v); setShowMaintenanceModal(true); }}
                                   className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest"
                                 >
                                    UPDATE CARE
                                 </button>
                                 {v.status === 'MAINTENANCE' && (
                                   <button 
                                     onClick={() => {
                                       if(window.confirm('Mark this vehicle as available? This will clear maintenance status.')) {
                                         fetch(`https://carrental-system-mg-production.up.railway.app/api/vehicles/${v.id}`, {
                                           method: 'PUT',
                                           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                           body: JSON.stringify({ ...v, cityId: v.city?.id || v.cityId, categoryId: v.category?.id || v.categoryId, status: 'AVAILABLE', maintenanceWorkRequired: '' })
                                         }).then(() => { alert('Vehicle marked as Available!'); window.location.reload(); });
                                       }
                                     }}
                                     className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg shadow-green-500/20 uppercase tracking-widest"
                                   >
                                      MAKE AVAILABLE
                                   </button>
                                 )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                               {v.maintenanceWorkRequired && (
                                 <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                                    <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1"><FiAlertCircle size={10}/> Pending Issues</p>
                                    <p className="text-xs text-gray-400 font-medium italic">"{v.maintenanceWorkRequired}"</p>
                                 </div>
                               )}
                               {v.maintenanceSchedule && (
                                 <div className="bg-green-500/5 border border-green-500/10 p-3 rounded-xl">
                                    <p className="text-[9px] font-black text-green-500/50 uppercase tracking-widest mb-1 flex items-center gap-1"><FiActivity size={10}/> Periodic Regimen</p>
                                    <p className="text-xs text-gray-400 font-medium italic">"{v.maintenanceSchedule}"</p>
                                 </div>
                               )}
                               {(isInsNear || isRegNear) && (
                                 <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
                                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1"><FiAlertCircle size={10}/> Expiring Documents</p>
                                    {isInsNear && <p className="text-xs text-gray-400 font-medium">Insurance: <span className={`font-bold ${isInsExpired ? 'text-red-500' : 'text-amber-400'}`}>{v.insuranceValidTill} {isInsExpired ? '(EXPIRED)' : '(Expiring Soon)'}</span></p>}
                                    {isRegNear && <p className="text-xs text-gray-400 font-medium">Registration: <span className={`font-bold ${isRegExpired ? 'text-red-500' : 'text-amber-400'}`}>{v.registrationValidTill} {isRegExpired ? '(EXPIRED)' : '(Expiring Soon)'}</span></p>}
                                 </div>
                               )}
                            </div>
                          </div>
                       </div>
                       );
                    })}
                    {maintenanceVehicles.length === 0 && (
                       <div className="p-20 text-center">
                          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                             <FiActivity size={32} className="text-green-500" />
                          </div>
                          <h3 className="text-white font-bold text-xl">System Clear</h3>
                          <p className="text-gray-500 text-sm mt-1">All vehicles are currently operational or cleared for service.</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
           );
        })()}
      </main>

      {/* Admin Invoice Modal Overlay */}
      {showInvoiceModal && selectedBookingForInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] transform animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-blue-600 italic tracking-tighter uppercase">Moto<span className="text-gray-900">Glide</span></h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Invoice Statement</p>
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-black text-gray-800">INVOICE</h3>
                  <p className="text-blue-600 font-mono font-bold">{selectedBookingForInvoice.bookingNumber || `BK-${selectedBookingForInvoice.id}`}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Billed To</p>
                  <p className="font-bold text-gray-900 text-lg">{selectedBookingForInvoice.customer?.firstName} {selectedBookingForInvoice.customer?.lastName}</p>
                  <p className="text-gray-500 text-sm font-medium">{selectedBookingForInvoice.customer?.email}</p>
                  <p className="text-gray-400 text-xs mt-1">{selectedBookingForInvoice.customer?.phoneNumber || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Booking Details</p>
                  <p className="text-gray-600 text-sm font-bold">Generated: {new Date().toLocaleDateString()}</p>
                  <p className="text-blue-600 text-sm font-bold mt-1 uppercase">Status: {selectedBookingForInvoice.status}</p>
                </div>
              </div>

              <div className="mb-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-100 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                      <th className="text-left pb-4">Description</th>
                      <th className="text-center pb-4">Period / Qty</th>
                      <th className="text-right pb-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr>
                      <td className="py-5">
                        <p className="font-bold text-gray-900">{selectedBookingForInvoice.vehicle?.make} {selectedBookingForInvoice.vehicle?.model}</p>
                        <p className="text-gray-500 text-xs mt-1 font-medium italic">
                          {new Date(selectedBookingForInvoice.pickupDate).toLocaleDateString()} to {new Date(selectedBookingForInvoice.returnDate).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="text-center py-5 font-bold text-gray-600">
                        {Math.ceil(Math.abs(new Date(selectedBookingForInvoice.returnDate).getTime() - new Date(selectedBookingForInvoice.pickupDate).getTime()) / (1000 * 60 * 60 * 24)) || 1} Days
                      </td>
                      <td className="text-right py-5 font-black text-gray-900">₹{selectedBookingForInvoice.rentalCost?.toLocaleString() || (selectedBookingForInvoice.totalAmount - (selectedBookingForInvoice.extraCharges || 0)).toLocaleString()}</td>
                    </tr>
                    
                    {selectedBookingForInvoice.extraCharges > 0 && (
                      <tr>
                        <td className="py-4 text-gray-600 font-medium">Add-ons & Extras (Insurance, GPS, etc.)</td>
                        <td className="text-center py-4 font-bold text-gray-600">Package</td>
                        <td className="text-right py-4 font-black text-gray-900">₹{selectedBookingForInvoice.extraCharges.toLocaleString()}</td>
                      </tr>
                    )}
                    
                    {selectedBookingForInvoice.discountAmount > 0 && (
                      <tr className="bg-green-50/30">
                        <td className="py-4 text-green-600 font-bold">Discount Applied</td>
                        <td className="text-center py-4 text-green-600 font-bold">-</td>
                        <td className="text-right py-4 font-black text-green-600">-₹{selectedBookingForInvoice.discountAmount.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-8 pt-8 border-t-2 border-gray-100">
                <div className="w-full md:w-1/2 space-y-4">
                  <div className="flex justify-between text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                    <span>Final Amount</span>
                    <span className="text-gray-900 text-base">₹{selectedBookingForInvoice.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-blue-600 font-black bg-blue-50/50 p-4 rounded-2xl border border-blue-100 shadow-sm">
                    <span className="uppercase text-xs tracking-tighter">Total Tax Incl. Revenue</span>
                    <span className="text-xl font-black">₹{selectedBookingForInvoice.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-100">
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 italic">Notice</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed max-w-sm">
                    This is an official MotoGlide billing statement generated for administrative purposes. 
                    Customer copy sent to {selectedBookingForInvoice.customer?.email}.
                  </p>
                </div>
                <button 
                  onClick={() => setShowInvoiceModal(false)}
                  className="w-full md:w-auto bg-gray-900 text-white px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-black text-white">
                {modal.type === 'addVehicle' && 'ADD VEHICLE'}
                {modal.type === 'editVehicle' && 'EDIT VEHICLE'}
                {modal.type === 'addCity' && 'ADD CITY'}
                {modal.type === 'editCity' && 'EDIT CITY'}
                {modal.type === 'addCategory' && 'ADD CATEGORY'}
                {modal.type === 'editCategory' && 'EDIT CATEGORY'}
                {modal.type === 'addOffer' && 'ADD OFFER'}
                {modal.type === 'editOffer' && 'EDIT OFFER'}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FiX className="text-xl" /></button>
            </div>
            
            <div className="space-y-4">
                {(modal.type.includes('Vehicle')) && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Make</label><input type="text" value={formData.make || ''} onChange={e => setFormData({...formData, make: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Model</label><input type="text" value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Daily Rate</label><input type="number" value={formData.dailyRate || ''} onChange={e => setFormData({...formData, dailyRate: parseFloat(e.target.value)})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">City</label><select value={formData.cityId || ''} onChange={e => setFormData({...formData, cityId: parseInt(e.target.value)})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none">{cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Registration No.</label><input type="text" value={formData.registrationNumber || ''} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Color</label><input type="text" value={formData.color || ''} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Status</label>
                        <select value={formData.status || 'AVAILABLE'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none">
                          <option value="AVAILABLE">Available</option>
                          <option value="RENTED">Rented</option>
                          <option value="MAINTENANCE">Maintenance</option>
                        </select>
                      </div>
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Condition</label>
                        <select value={formData.vehicleCondition || 'EXCELLENT'} onChange={e => setFormData({...formData, vehicleCondition: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none">
                          <option value="EXCELLENT">Excellent (Premium)</option>
                          <option value="GOOD">Good (Operational)</option>
                          <option value="FAIR">Fair (Needs Polish)</option>
                          <option value="POOR">Poor (Urgent Repair)</option>
                          <option value="NEEDS_REPAIR">Immediate Maintenance</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Insurance Valid Till</label><input type="date" value={formData.insuranceValidTill || ''} onChange={e => setFormData({...formData, insuranceValidTill: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Reg. Valid Till</label><input type="date" value={formData.registrationValidTill || ''} onChange={e => setFormData({...formData, registrationValidTill: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Current Mileage (KM)</label><input type="number" value={formData.mileage || 0} onChange={e => setFormData({...formData, mileage: parseInt(e.target.value)})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                       <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Image URL</label><input type="text" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" placeholder="Paste path here" /></div>
                    </div>
                    <div>
                      <label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Vehicle Description</label>
                      <textarea 
                        value={formData.description || ''} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none h-20 resize-none" 
                        placeholder="Detailed description of the car..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="text-gray-400 font-black uppercase text-[9px] mb-1 block tracking-widest">Repair Work Required</label>
                        <textarea 
                          value={formData.maintenanceWorkRequired || ''} 
                          onChange={e => setFormData({...formData, maintenanceWorkRequired: e.target.value})} 
                          className="w-full bg-gray-950 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-amber-500 outline-none h-16 resize-none" 
                          placeholder="What needs fixing?"
                        />
                      </div>
                      <div>
                        <label className="text-green-500/50 font-black uppercase text-[9px] mb-1 block tracking-widest">Routine Care / Schedule</label>
                        <textarea 
                          value={formData.maintenanceSchedule || ''} 
                          onChange={e => setFormData({...formData, maintenanceSchedule: e.target.value})} 
                          className="w-full bg-gray-950 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-green-500 outline-none h-16 resize-none" 
                          placeholder="E.g. Oil change every 5000km"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {(modal.type === 'addOffer' || modal.type === 'editOffer') && (
                   <>
                      <div className="grid grid-cols-2 gap-4">
                         <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Code</label><input type="text" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" placeholder="E.G. NEW50" /></div>
                         <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Discount %</label><input type="number" value={formData.discountPercentage || ''} onChange={e => setFormData({...formData, discountPercentage: parseFloat(e.target.value)})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Max Discount Amount (₹)</label><input type="number" value={formData.maxDiscountAmount || ''} onChange={e => setFormData({...formData, maxDiscountAmount: parseFloat(e.target.value)})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                         <div>
                            <label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Category</label>
                            <select value={formData.category || 'all'} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none">
                               <option value="all">All Offers</option>
                               <option value="new-user">New User</option>
                               <option value="weekend">Weekend</option>
                               <option value="subscription">Subscription</option>
                               <option value="luxury">Luxury</option>
                               <option value="electric">Electric</option>
                            </select>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Valid From</label><input type="datetime-local" value={formData.validFrom?.substring(0, 16) || ''} onChange={e => setFormData({...formData, validFrom: e.target.value + ':00'})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                         <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Valid Until</label><input type="datetime-local" value={formData.validUntil?.substring(0, 16) || ''} onChange={e => setFormData({...formData, validUntil: e.target.value + ':00'})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                      </div>
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Image URL</label><input type="text" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" placeholder="Paste image URL here" /></div>
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Description</label><textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none h-24 resize-none" placeholder="Describe the offer..."></textarea></div>
                   </>
                )}
                
                {(modal.type.includes('City')) && (
                   <div className="space-y-4">
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">City Name</label><input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" placeholder="e.g. Mumbai" /></div>
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">State</label><input type="text" value={formData.state || ''} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" placeholder="e.g. Maharashtra" /></div>
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Delivery Fee (per KM)</label><input type="number" value={formData.deliveryFeePerKm || ''} onChange={e => setFormData({...formData, deliveryFeePerKm: parseFloat(e.target.value)})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                   </div>
                )}
                {(modal.type.includes('Category')) && (
                  <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Name</label><input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none" /></div>
                )}
                <button 
                  onClick={saveChanges} 
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 shadow-xl mt-4"
                >
                  Save Changes
                </button>
            </div>
          </div>
        </div>
      )}

      {/* User View Modal Overlay */}
      {showUserViewModal && selectedUserForView && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#111420] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#1e2336] transform animate-in fade-in zoom-in duration-300">
             <div className="p-8">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-[#1e2336]">
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-blue-600/20 flex items-center justify-center text-blue-500 text-2xl font-black">
                         {selectedUserForView.firstName?.[0]}{selectedUserForView.lastName?.[0]}
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-white italic uppercase">{selectedUserForView.firstName} {selectedUserForView.lastName}</h2>
                         <p className="text-gray-500 font-bold text-xs tracking-widest uppercase mt-0.5">{selectedUserForView.role || 'Customer'}</p>
                      </div>
                   </div>
                   <button onClick={() => setShowUserViewModal(false)} className="bg-gray-800 text-white p-2 rounded-xl hover:bg-gray-700 transition">
                      <FiX className="text-xl" />
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                   <div className="space-y-6">
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 shadow-sm">Contact Info</p>
                         <div className="bg-[#161a29] p-4 rounded-2xl border border-[#1e2336] space-y-3">
                            <div>
                               <p className="text-xs text-gray-500">Email Address</p>
                               <p className="text-white font-bold">{selectedUserForView.email}</p>
                            </div>
                            <div>
                               <p className="text-xs text-gray-500">Phone Number</p>
                               <p className="text-white font-bold">{selectedUserForView.phoneNumber || 'Not Provided'}</p>
                            </div>
                         </div>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Status</p>
                         <div className="bg-[#161a29] p-4 rounded-2xl border border-[#1e2336]">
                            <div className="flex items-center justify-between">
                               <p className="text-xs text-gray-500">Subscription status</p>
                               <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${selectedUserForView.active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                  {selectedUserForView.active ? 'ACTIVE USER' : 'ACCOUNT SUSPENDED'}
                               </span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 shadow-sm">Identity & Verification</p>
                         <div className="bg-[#161a29] p-4 rounded-2xl border border-[#1e2336] space-y-3 font-medium">
                            <div>
                               <p className="text-xs text-gray-500">Address Location</p>
                               <p className="text-white font-bold">{selectedUserForView.city || 'N/A'}</p>
                               <p className="text-gray-400 text-xs mt-1">{selectedUserForView.address || 'Incomplete Profile'}</p>
                            </div>
                            <div>
                               <p className="text-xs text-gray-500">License Verification</p>
                               <p className="text-blue-500 font-bold text-xs uppercase tracking-tighter border-b border-blue-500/20 inline-block">ID DOCUMENT VERIFIED ✓</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="mb-8">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">DRIVING LICENSE DOCUMENTS</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#161a29] p-2 rounded-2xl border border-[#1e2336] aspect-video flex flex-col items-center justify-center overflow-hidden">
                         {selectedUserForView.licensePhotoFront ? (
                            <img src={selectedUserForView.licensePhotoFront} alt="License Front" className="w-full h-full object-cover rounded-xl" />
                         ) : (
                            <div className="flex flex-col items-center text-gray-600">
                               <FiFileText className="text-3xl mb-2" />
                               <p className="text-[10px] font-bold">FRONT SIDE NOT UPLOADED</p>
                            </div>
                         )}
                      </div>
                      <div className="bg-[#161a29] p-2 rounded-2xl border border-[#1e2336] aspect-video flex flex-col items-center justify-center overflow-hidden">
                         {selectedUserForView.licensePhotoBack ? (
                            <img src={selectedUserForView.licensePhotoBack} alt="License Back" className="w-full h-full object-cover rounded-xl" />
                         ) : (
                            <div className="flex flex-col items-center text-gray-600">
                               <FiFileText className="text-3xl mb-2" />
                               <p className="text-[10px] font-bold">BACK SIDE NOT UPLOADED</p>
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                 <div className="bg-blue-600/5 p-6 rounded-3xl border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
                   <div className="text-center md:text-left">
                      <p className="text-[10px] text-blue-500/80 font-black uppercase tracking-widest mb-1 italic">Administrative Note</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                         User activity and billing history are automatically synced with this profile. 
                         Ensure periodic verification of identity documents for long-term rentals.
                      </p>
                   </div>
                   <div className="flex gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => {
                          updateUserStatus.mutate({ id: selectedUserForView.id, isActive: !selectedUserForView.active });
                          setShowUserViewModal(false);
                        }}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          selectedUserForView.active 
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' 
                            : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white'
                        }`}
                      >
                         {selectedUserForView.active ? 'Suspend Account' : 'Activate Account'}
                      </button>
                      <button 
                         onClick={() => setShowUserViewModal(false)}
                         className="flex-1 md:flex-none bg-white text-gray-900 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-white hover:bg-transparent hover:text-white transition-all duration-300"
                      >
                         Close View
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Maintenance Management Modal */}
      {showMaintenanceModal && selectedVehicleForMaintenance && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-[#111420] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#1e2336] transform animate-in fade-in zoom-in duration-300">
             <div className="p-8">
                <div className="flex justify-between items-center mb-8 border-b border-[#1e2336] pb-6">
                   <div className="flex items-center gap-4">
                      <div className="bg-amber-500/10 p-4 rounded-2xl text-amber-500">
                         <FiActivity size={24} />
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-white italic uppercase">{selectedVehicleForMaintenance.make} {selectedVehicleForMaintenance.model}</h2>
                         <p className="text-gray-500 font-bold text-xs tracking-widest uppercase">Maintenance & Service Lifecycle</p>
                      </div>
                   </div>
                   <button onClick={() => setShowMaintenanceModal(false)} className="bg-gray-800 text-white p-2 rounded-xl hover:bg-gray-700 transition">
                      <FiX size={20} />
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                   <div className="bg-[#161a29] p-4 rounded-2xl border border-[#1e2336]">
                      <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Current Condition</p>
                      <p className="text-white font-bold">{selectedVehicleForMaintenance.vehicleCondition || 'EXCELLENT'}</p>
                   </div>
                   <div className="bg-[#161a29] p-4 rounded-2xl border border-[#1e2336]">
                      <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Insurance Valid Till</p>
                      <p className="text-white font-bold">{selectedVehicleForMaintenance.insuranceValidTill || 'Not Set'}</p>
                   </div>
                   <div className="bg-[#161a29] p-4 rounded-2xl border border-[#1e2336]">
                      <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Current Mileage</p>
                      <p className="text-white font-bold">{selectedVehicleForMaintenance.mileage?.toLocaleString()} KM</p>
                   </div>
                </div>

                <div className="mb-10 bg-[#161a29] p-6 rounded-3xl border border-[#1e2336]">
                   <h3 className="text-lg font-black text-white uppercase italic mb-4">Service & Compliance Update</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Insurance Expiry</label><input id="v-insurance" type="date" defaultValue={selectedVehicleForMaintenance.insuranceValidTill || ''} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 outline-none" /></div>
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Reg. Valid Till</label><input id="v-registration" type="date" defaultValue={selectedVehicleForMaintenance.registrationValidTill || ''} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 outline-none" /></div>
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Current Mileage (KM)</label><input id="v-mileage" type="number" defaultValue={selectedVehicleForMaintenance.mileage || 0} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 outline-none" /></div>
                      <div><label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Service Date</label><input id="m-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 outline-none" /></div>
                      
                      <div>
                        <label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Service Type</label>
                         <select id="m-type" className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 outline-none">
                            <option value="ROUTINE_CHECK">Routine Check</option>
                            <option value="OIL_CHANGE">Oil Change</option>
                            <option value="ENGINE_REPAIR">Engine Repair</option>
                            <option value="TIRE_REPLACEMENT">Tire Replacement</option>
                            <option value="BRAKE_SERVICE">Brake Service</option>
                         </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-gray-500 text-[10px] font-bold uppercase mb-1 block">Work Required / Description</label>
                        <textarea id="m-desc" defaultValue={selectedVehicleForMaintenance.maintenanceWorkRequired || ''} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 outline-none h-20 resize-none font-medium italic" placeholder="Describe the mechanical issues or work to be done..."></textarea>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-green-500 font-black uppercase text-[9px] mb-1 block tracking-widest">Routine Care Change / Regimen</label>
                        <textarea id="m-routine" defaultValue={selectedVehicleForMaintenance.maintenanceSchedule || ''} className="w-full bg-gray-950 text-white px-4 py-3 rounded-xl border border-gray-800 outline-none h-20 resize-none font-medium italic border-green-500/10" placeholder="E.g. Brake pad change every 10k km, Oil change due every 5000km..."></textarea>
                      </div>
                   </div>
                   <button 
                     onClick={() => {
                        const type = (document.getElementById('m-type') as HTMLSelectElement).value;
                        const date = (document.getElementById('m-date') as HTMLInputElement).value;
                        const desc = (document.getElementById('m-desc') as HTMLTextAreaElement).value;
                        
                        const insDate = (document.getElementById('v-insurance') as HTMLInputElement).value;
                        const regDate = (document.getElementById('v-registration') as HTMLInputElement).value;
                        const mileage = (document.getElementById('v-mileage') as HTMLInputElement).value;
                        
                        if(!date) return alert('Please select a date');
                        
                        // 1. Update Vehicle Compliance first
                        fetch(`https://carrental-system-mg-production.up.railway.app/api/admin/vehicles/${selectedVehicleForMaintenance.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...selectedVehicleForMaintenance,
                                cityId: selectedVehicleForMaintenance.city?.id,
                                categoryId: selectedVehicleForMaintenance.category?.id,
                                insuranceValidTill: insDate,
                                registrationValidTill: regDate,
                                mileage: parseInt(mileage),
                                maintenanceWorkRequired: desc,
                                maintenanceSchedule: (document.getElementById('m-routine') as HTMLTextAreaElement).value
                            })
                        }).then(() => {
                           // 2. Schedule Maintenance Record
                           return fetch('https://carrental-system-mg-production.up.railway.app/api/admin/maintenance', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                 vehicle: { id: selectedVehicleForMaintenance.id },
                                 type: type,
                                 serviceDate: date,
                                 description: desc,
                                 status: 'SCHEDULED'
                              })
                           });
                        }).then(() => {
                           alert('Maintenance scheduled and vehicle compliance updated!');
                           setShowMaintenanceModal(false);
                           window.location.reload();
                        });
                     }}
                     className="mt-4 w-full bg-amber-500 text-[#111420] py-4 rounded-xl font-black uppercase tracking-widest hover:bg-amber-400 transition shadow-xl"
                   >
                      Update & Schedule Maintenance
                   </button>
                </div>

                <div className="bg-blue-600/5 p-6 rounded-3xl border border-blue-500/10 text-center">
                   <p className="text-[10px] text-blue-500/80 font-black uppercase tracking-widest mb-1 italic">Administrative Access</p>
                   <p className="text-[10px] text-gray-500 leading-relaxed max-w-xl mx-auto">
                      Scheduling maintenance will automatically mark the vehicle as "MAINTENANCE" status when work begins.
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Offer Notification Modal */}
      {showNotifyModal && notifyOffer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-[#111420] rounded-3xl max-w-lg w-full shadow-2xl border border-[#1e2336]">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-[#1e2336]">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-500/10 p-3 rounded-2xl">
                    <FiBell size={22} className="text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase italic">Send Offer Notification</h2>
                    <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-0.5">
                      Code: <span className="text-amber-400">{notifyOffer.code}</span> — {notifyOffer.discountPercentage}% OFF
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowNotifyModal(false)} className="bg-gray-800 text-white p-2 rounded-xl hover:bg-gray-700 transition">
                  <FiX size={18} />
                </button>
              </div>

              {/* Target Selection */}
              <div className="mb-6">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Send To</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setNotifyTarget('all')}
                    className={`py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest border transition-all ${
                      notifyTarget === 'all'
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500/50'
                        : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    👥 All Customers
                  </button>
                  <button
                    onClick={() => setNotifyTarget('specific')}
                    className={`py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest border transition-all ${
                      notifyTarget === 'specific'
                        ? 'bg-amber-600/20 text-amber-400 border-amber-500/50'
                        : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    👤 Specific Customer
                  </button>
                </div>
              </div>

              {/* Specific Email Input */}
              {notifyTarget === 'specific' && (
                <div className="mb-6">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Customer Email</label>
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={e => setNotifyEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full bg-[#161a29] text-white px-4 py-3 rounded-xl border border-[#1e2336] focus:border-amber-500 outline-none font-medium"
                  />
                </div>
              )}

              {/* Info Box */}
              <div className="bg-[#161a29] rounded-2xl p-4 border border-[#1e2336] mb-6">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                  📨 What will be sent:
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>✉️ A beautiful HTML email with offer details</li>
                  <li>📱 A WhatsApp message with the promo code</li>
                  {notifyTarget === 'all'
                    ? <li className="text-blue-400 font-bold">→ Sent to ALL active customers</li>
                    : <li className="text-amber-400 font-bold">→ Sent only to: {notifyEmail || '...'}</li>
                  }
                </ul>
              </div>

              {/* Send Button */}
              <button
                disabled={notifySending || (notifyTarget === 'specific' && !notifyEmail)}
                onClick={async () => {
                  setNotifySending(true);
                  try {
                    const body = notifyTarget === 'specific' && notifyEmail
                      ? JSON.stringify({ email: notifyEmail })
                      : '{}';
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/promo-codes/${notifyOffer.id}/notify`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body
                    });
                    const data = await res.json();
                    if (res.ok) {
                      alert(`✅ ${data.message}`);
                      setShowNotifyModal(false);
                    } else {
                      alert(`❌ Failed: ${data.error || 'Unknown error'}`);
                    }
                  } catch (e) {
                    alert('❌ Network error. Please try again.');
                  } finally {
                    setNotifySending(false);
                  }
                }}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${
                  notifySending || (notifyTarget === 'specific' && !notifyEmail)
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20'
                }`}
              >
                <FiBell size={16} />
                {notifySending ? 'Sending...' : `Send ${notifyTarget === 'all' ? 'to All Customers' : 'to Customer'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;


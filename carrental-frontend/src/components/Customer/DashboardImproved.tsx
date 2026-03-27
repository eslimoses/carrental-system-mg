import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { FiMapPin, FiCalendar, FiClock, FiFilter, FiChevronDown, FiArrowRight } from 'react-icons/fi';
import { BsCarFrontFill, BsShieldCheck, BsLightningCharge } from 'react-icons/bs';
import { MdLocalOffer } from 'react-icons/md';
import api from '../../api/api';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  type: string;
  transmission: string;
  fuelType: string;
  seatingCapacity: number;
  pricePerDay: number;
  imageUrl: string;
  available: boolean;
}

interface SearchParams {
  city: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  category: string;
}

const DashboardImproved: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'search' | 'bookings'>('search');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'low-to-high' | 'high-to-low'>('low-to-high');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    city: 'Chennai',
    pickupDate: '',
    dropoffDate: '',
    pickupTime: '10:00',
    dropoffTime: '10:00',
    category: 'all'
  });

  const categories = ['Mini', 'SUV', 'Luxury', 'Hatchback', 'Sedan', 'Electric'];
  const cities = ['Chennai', 'Madurai', 'Trichy', 'Kanyakumari', 'Trivandrum'];

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Filter and sort vehicles when search params or sort changes
  useEffect(() => {
    filterAndSortVehicles();
  }, [vehicles, sortBy, selectedCategory]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVehicles = () => {
    let filtered = [...vehicles];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(v => v.type.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by availability
    filtered = filtered.filter(v => v.available);

    // Sort by price
    filtered.sort((a, b) => {
      if (sortBy === 'low-to-high') {
        return a.pricePerDay - b.pricePerDay;
      } else {
        return b.pricePerDay - a.pricePerDay;
      }
    });

    setFilteredVehicles(filtered);
  };

  const calculateDays = () => {
    if (!searchParams.pickupDate || !searchParams.dropoffDate) return 0;
    const pickup = new Date(searchParams.pickupDate);
    const dropoff = new Date(searchParams.dropoffDate);
    return Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleBooking = (vehicleId: number) => {
    // Navigate to booking page with vehicle and search params
    window.location.href = `/booking?vehicleId=${vehicleId}&city=${searchParams.city}&pickupDate=${searchParams.pickupDate}&dropoffDate=${searchParams.dropoffDate}&pickupTime=${searchParams.pickupTime}&dropoffTime=${searchParams.dropoffTime}`;
  };

  const days = calculateDays();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
          <p className="text-gray-600 mt-1">Find and book your perfect car</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'border-yellow-500 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Search Vehicles
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'bookings'
                  ? 'border-yellow-500 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              My Bookings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'search' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Search & Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Search Details</h2>

                {/* City Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiMapPin className="inline mr-2" />City
                  </label>
                  <select
                    value={searchParams.city}
                    onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Pickup Date */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiCalendar className="inline mr-2" />Pickup Date
                  </label>
                  <input
                    type="date"
                    value={searchParams.pickupDate}
                    onChange={(e) => setSearchParams({ ...searchParams, pickupDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Pickup Time */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiClock className="inline mr-2" />Pickup Time
                  </label>
                  <input
                    type="time"
                    value={searchParams.pickupTime}
                    onChange={(e) => setSearchParams({ ...searchParams, pickupTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Dropoff Date */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiCalendar className="inline mr-2" />Dropoff Date
                  </label>
                  <input
                    type="date"
                    value={searchParams.dropoffDate}
                    onChange={(e) => setSearchParams({ ...searchParams, dropoffDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Dropoff Time */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiClock className="inline mr-2" />Dropoff Time
                  </label>
                  <input
                    type="time"
                    value={searchParams.dropoffTime}
                    onChange={(e) => setSearchParams({ ...searchParams, dropoffTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Trip Duration */}
                {days > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-lg text-yellow-600">{days}</span>
                      <span className="text-gray-600"> Days 0 Hour 0 Min</span>
                    </p>
                  </div>
                )}

                {/* Category Filter */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                    <FiFilter className="mr-2" />Vehicle Type
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value="all"
                        checked={selectedCategory === 'all'}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4 text-yellow-500"
                      />
                      <span className="ml-3 text-gray-700">All Types</span>
                    </label>
                    {categories.map(cat => (
                      <label key={cat} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={cat.toLowerCase()}
                          checked={selectedCategory === cat.toLowerCase()}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-4 h-4 text-yellow-500"
                        />
                        <span className="ml-3 text-gray-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Car Listings */}
            <div className="lg:col-span-3">
              {/* Sort Options */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Cars {filteredVehicles.length > 0 && `(${filteredVehicles.length})`}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy('low-to-high')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      sortBy === 'low-to-high'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => setSortBy('high-to-low')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      sortBy === 'high-to-low'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Price: High to Low
                  </button>
                </div>
              </div>

              {/* Car Cards */}
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading vehicles...</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <BsCarFrontFill className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No vehicles available for your search</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredVehicles.map(vehicle => {
                    const totalPrice = vehicle.pricePerDay * Math.max(days, 1);
                    return (
                      <div key={vehicle.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
                          {/* Car Image */}
                          <div className="md:col-span-1">
                            <img
                              src={vehicle.imageUrl}
                              alt={`${vehicle.make} ${vehicle.model}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>

                          {/* Car Details */}
                          <div className="md:col-span-2">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {vehicle.make} {vehicle.model}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                              {vehicle.year} • {vehicle.type} • {vehicle.seatingCapacity} Seater
                            </p>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center text-sm text-gray-700">
                                <BsShieldCheck className="mr-2 text-green-600" />
                                {vehicle.transmission}
                              </div>
                              <div className="flex items-center text-sm text-gray-700">
                                <BsLightningCharge className="mr-2 text-blue-600" />
                                {vehicle.fuelType}
                              </div>
                            </div>

                            {/* Rewards */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
                              <MdLocalOffer className="text-green-600 mr-2" />
                              <span className="text-sm text-green-700 font-semibold">
                                Earn upto {Math.floor(totalPrice * 0.05)} Go Cash on this booking
                              </span>
                            </div>
                          </div>

                          {/* Pricing & Booking */}
                          <div className="md:col-span-1 flex flex-col justify-between">
                            <div>
                              <p className="text-gray-600 text-sm mb-1">Price per day</p>
                              <p className="text-3xl font-bold text-gray-900 mb-2">₹{vehicle.pricePerDay}</p>
                              {days > 0 && (
                                <>
                                  <p className="text-gray-600 text-sm mb-1">for {days} days</p>
                                  <p className="text-lg font-bold text-gray-900 mb-4">₹{totalPrice}</p>
                                </>
                              )}
                              <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                            </div>
                            <button
                              onClick={() => handleBooking(vehicle.id)}
                              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              Book now
                              <FiArrowRight />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">My Bookings feature coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardImproved;

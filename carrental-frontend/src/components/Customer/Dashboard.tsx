import React, { useState } from 'react';
import { useAuth } from '@/hooks';
import VehicleList from './VehicleList';
import MyBookings from './MyBookings';
import '../../styles/HomePageNew.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'search' | 'bookings'>('search');
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const cities = [
    { id: 1, name: 'Chennai' },
    { id: 2, name: 'Madurai' },
    { id: 3, name: 'Trichy' },
    { id: 4, name: 'Kanyakumari' },
    { id: 5, name: 'Trivandrum' },
  ];

  const categories = [
    { id: 1, name: 'Mini' },
    { id: 2, name: 'SUV' },
    { id: 3, name: 'Luxury' },
    { id: 4, name: 'Hatchback' },
    { id: 5, name: 'Sedan' },
    { id: 6, name: 'Electric' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Welcome, {user?.firstName}!</h1>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-2 rounded font-bold ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Search Vehicles
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2 rounded font-bold ${
              activeTab === 'bookings'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            My Bookings
          </button>
        </div>

        {activeTab === 'search' && (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Find Your Perfect Car</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Select City</label>
                <select
                  value={selectedCity || ''}
                  onChange={(e) => setSelectedCity(Number(e.target.value) || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose a city</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">Select Category</label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(Number(e.target.value) || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {selectedCity && selectedCategory && (
              <VehicleList cityId={selectedCity} categoryId={selectedCategory} />
            )}
          </div>
        )}

        {activeTab === 'bookings' && user && (
          <MyBookings customerId={user.id} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

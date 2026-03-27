import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiFilter, FiSearch, FiHeart } from 'react-icons/fi';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  dailyRate: number;
  transmission: string;
  fuelType: string;
  seatingCapacity: number;
  color: string;
  category?: { id: number; name: string };
  city?: { id: number; name: string };
  cityId?: number;
  cityName?: string;
  photos?: Array<{ photoUrl: string }>;
}

import { useCars, useCities, useFavorites, useAuth, useCategories } from '../../hooks';
import { CAR_IMAGES } from '../../constants';

const CarListing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const searchParamsFromState = location.state || {};

  const [selectedCategory, setSelectedCategory] = useState(searchParamsFromState.category || 'All');
  const [selectedCity, setSelectedCity] = useState(searchParamsFromState.city || 'All');
  const [transmission, setTransmission] = useState(searchParamsFromState.transmission || 'All');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [searchQuery, setSearchQuery] = useState('');

  // Use custom hooks for data fetching
  const { cities } = useCities();
  const { data: categories = [] } = useCategories();
  const { cars: vehicles, isLoading: loading } = useCars({
    city: selectedCity === 'All' ? undefined : selectedCity,
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    transmission: transmission === 'All' ? undefined : transmission,
    minPrice: priceRange[0],
    maxPrice: priceRange[1]
  });
  
  const { favorites, addFavorite, removeFavorite } = useFavorites(user?.id || null);

  const isVehicleFavorite = (vehicleId: any) => {
    if (!vehicleId || !favorites) return false;
    return favorites.some((v: any) => Number(v.id) === Number(vehicleId));
  };

  const toggleFavorite = async (e: React.MouseEvent, vehicleId: any) => {
    e.stopPropagation();
    if (!user) {
       navigate('/login');
       return;
    }
    
    const vId = Number(vehicleId);
    if (isVehicleFavorite(vId)) {
        removeFavorite.mutate(vId, {
          onError: (err: any) => alert('Failed to remove from favorites: ' + (err.response?.data?.message || 'Unknown error'))
        });
    } else {
        addFavorite.mutate(vId, {
          onError: (err: any) => alert('Failed to add to favorites: ' + (err.response?.data?.message || 'Unknown error'))
        });
    }
  };

  const transmissionsList = ['All', 'Automatic', 'Manual'];

  const filteredVehicles = (vehicles as any[]).filter((vehicle: any) => {
    const matchesSearch = 
      `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleBookNow = (vehicle: Vehicle) => {
    const subscriptionPlanId = (location.state as any)?.subscriptionPlan;
    if (!user) {
      navigate('/login', { state: { from: `/cars/${vehicle.id}`, subscriptionPlan: subscriptionPlanId } });
      return;
    }
    navigate(`/cars/${vehicle.id}`, { 
      state: { 
        subscriptionPlan: subscriptionPlanId,
        pickupLocation: vehicle.cityName || vehicle.city?.name 
      } 
    });
  };

  const getVehicleImage = (vehicle: Vehicle): string => {
    // 1. Prioritize Database Image URL (Updated via Admin)
    if ((vehicle as any).imageUrl && !(vehicle as any).imageUrl.includes('unsplash.com')) {
      return (vehicle as any).imageUrl;
    }
    
    // 2. Photos Array
    if (vehicle.photos && vehicle.photos.length > 0) {
      return vehicle.photos[0].photoUrl;
    }

    // 3. Fallback to Hardcoded (for demo vehicles not updated)
    const fullName = `${vehicle.make} ${vehicle.model}`;
    if (CAR_IMAGES[fullName]) return CAR_IMAGES[fullName];
    if (CAR_IMAGES[vehicle.model]) return CAR_IMAGES[vehicle.model];
    
    return (vehicle as any).imageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800';
  };

  const getVehicleName = (vehicle: Vehicle): string => {
    return `${vehicle.make} ${vehicle.model}`;
  };

  const vehicleTypeOptions = ['All', ...new Set(categories.map((c: any) => c.name))];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1629', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Subscription Info Banner */}
        {searchParamsFromState.subscriptionPlan && (
          <div style={{ 
            backgroundColor: 'rgba(212, 165, 116, 0.2)', 
            border: '2px solid #d4a574', 
            borderRadius: '16px', 
            padding: '20px', 
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#d4a574', margin: 0 }}>
              🌟 Selecting a car for your <strong>{searchParamsFromState.subscriptionPlan.replace('months', ' Months').replace('1month', '1 Month')}</strong> subscription
            </h2>
            <p style={{ color: '#ffffff', marginTop: '10px' }}>
              Your special subscription pricing will be applied at checkout.
            </p>
          </div>
        )}
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#d4a574', fontSize: '42px', fontWeight: 'bold', marginBottom: '10px' }}>
            Our Fleet
          </h1>
          <p style={{ color: '#b0b8c8', fontSize: '18px' }}>
            Choose from our wide selection of premium vehicles
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto 30px',
          position: 'relative'
        }}>
          <FiSearch style={{ 
            position: 'absolute', 
            left: '20px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#666',
            fontSize: '20px'
          }} />
          <input
            type="text"
            placeholder="Search by car name or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px 16px 55px',
              borderRadius: '30px',
              border: '2px solid #d4a574',
              backgroundColor: '#1a1f3a',
              color: '#ffffff',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filters Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 mb-10 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-amber-500/20 p-2 rounded-xl">
              <FiFilter className="text-amber-500 text-2xl" />
            </div>
            <h3 className="text-white text-2xl font-black italic tracking-tight">PREFERENCE FILTERS</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
            {/* Vehicle Type Filter */}
            <div>
              <label className="block text-white/60 text-xs font-black uppercase tracking-widest mb-4 ml-1">Vehicle Category</label>
              <div className="flex flex-wrap gap-2">
                {vehicleTypeOptions.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedCategory(type)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border ${selectedCategory === type ? 'bg-amber-500 border-amber-500 text-gray-900 shadow-lg shadow-amber-500/20' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-xs font-black uppercase tracking-widest mb-4 ml-1">Service City</label>
              <div className="flex flex-wrap gap-2">
                {['All', ...cities.filter((c: any) => c.name !== 'All').map((c: any) => c.name)].map((cityName: string) => (
                  <button
                    key={cityName}
                    onClick={() => setSelectedCity(cityName)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border ${selectedCity === cityName ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                  >
                    {cityName}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-xs font-black uppercase tracking-widest mb-4 ml-1">Transmission</label>
              <div className="flex flex-wrap gap-2">
                {transmissionsList.map(trans => (
                  <button
                    key={trans}
                    onClick={() => setTransmission(trans)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border ${transmission === trans ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                  >
                    {trans}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label style={{ display: 'block', color: '#ffffff', marginBottom: '12px', fontWeight: '600', fontSize: '16px' }}>
                Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}/day
              </label>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                style={{
                  width: '100%',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div style={{ marginBottom: '20px', color: '#b0b8c8', fontSize: '16px' }}>
          Showing {filteredVehicles.length} of {vehicles.length} vehicles
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#d4a574', fontSize: '18px' }}>
            Loading vehicles...
          </div>
        )}

        {/* No Results */}
        {!loading && filteredVehicles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#d4a574', fontSize: '18px' }}>
            No vehicles found matching your criteria
          </div>
        )}

        {/* Cars Grid */}
        {!loading && filteredVehicles.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '30px'
          }}>
            {filteredVehicles.map(vehicle => (
              <div
                key={vehicle.id}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e: React.MouseEvent) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-10px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px rgba(212, 165, 116, 0.3)';
                }}
                onMouseLeave={(e: React.MouseEvent) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Car Image */}
                <div style={{ 
                  height: '250px', 
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img
                    src={getVehicleImage(vehicle)}
                    alt={getVehicleName(vehicle)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    backgroundColor: '#d4a574',
                    color: '#1a1f3a',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}>
                    {vehicle.category?.name || 'Vehicle'}
                  </div>
                                    <button 
                    onClick={(e: React.MouseEvent) => toggleFavorite(e, vehicle.id)}
                    style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      padding: '12px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 100,
                      backgroundColor: isVehicleFavorite(vehicle.id) ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                      backdropFilter: 'blur(8px)',
                      border: isVehicleFavorite(vehicle.id) ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      boxShadow: isVehicleFavorite(vehicle.id) ? '0 8px 20px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.backgroundColor = isVehicleFavorite(vehicle.id) ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0, 0, 0, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.backgroundColor = isVehicleFavorite(vehicle.id) ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    <FiHeart 
                      size={20} 
                      fill={isVehicleFavorite(vehicle.id) ? '#ef4444' : 'none'} 
                      style={{ 
                        color: isVehicleFavorite(vehicle.id) ? '#ef4444' : '#ffffff',
                        transition: 'all 0.3s ease',
                        filter: isVehicleFavorite(vehicle.id) ? 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.5))' : 'none'
                      }}
                      className={isVehicleFavorite(vehicle.id) ? 'animate-pulse' : ''}
                    />
                  </button>
                </div>

                {/* Car Details */}
                <div style={{ padding: '20px' }}>
                  <h3 style={{ 
                    color: '#ffffff', 
                    fontSize: '20px', 
                    marginBottom: '10px',
                    fontWeight: 'bold'
                  }}>
                    {getVehicleName(vehicle)}
                  </h3>

                  {/* Specs */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '10px',
                    marginBottom: '15px',
                    fontSize: '13px',
                    color: '#b0b8c8'
                  }}>
                    <div>
                      <span style={{ color: '#d4a574', fontWeight: '600' }}>Transmission:</span> {vehicle.transmission}
                    </div>
                    <div>
                      <span style={{ color: '#d4a574', fontWeight: '600' }}>Fuel:</span> {vehicle.fuelType}
                    </div>
                    <div>
                      <span style={{ color: '#d4a574', fontWeight: '600' }}>Seats:</span> {vehicle.seatingCapacity}
                    </div>
                    <div>
                      <span style={{ color: '#d4a574', fontWeight: '600' }}>Color:</span> {vehicle.color}
                    </div>
                  </div>

                  {/* Price and Button */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginTop: '15px',
                    paddingTop: '15px',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div>
                      <span style={{ color: '#d4a574', fontSize: '24px', fontWeight: 'bold' }}>
                        ₹{vehicle.dailyRate}
                      </span>
                      <span style={{ color: '#b0b8c8', fontSize: '13px', marginLeft: '5px' }}>/day</span>
                    </div>
                    <button
                      onClick={() => handleBookNow(vehicle)}
                      disabled={vehicle.status === 'RENTED'}
                      style={{
                        backgroundColor: vehicle.status === 'RENTED' ? '#3a3f5a' : '#d4a574',
                        color: vehicle.status === 'RENTED' ? '#71788e' : '#1a1f3a',
                        border: 'none',
                        padding: '10px 25px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: vehicle.status === 'RENTED' ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {vehicle.status === 'RENTED' ? 'Not Available' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarListing;

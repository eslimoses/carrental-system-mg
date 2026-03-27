export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  cityId?: number;
  active: boolean;
  dateOfBirth?: string;
  profilePhoto?: string | null;
  licensePhotoFront?: string | null;
  licensePhotoBack?: string | null;
  address?: string;
  city?: string;
}

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface VehicleCategory {
  id: number;
  name: string;
  description: string;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  licensePlate: string;
  color: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  seatingCapacity: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  cityId: number;
  categoryId: number;
  city?: City;
  category?: VehicleCategory;
  imageUrl?: string;
  photos?: { id: number; photoUrl: string; primary: boolean }[];
  description?: string;
  maintenanceWorkRequired?: string;
  maintenanceSchedule?: string;
}

export interface Favorite {
  id: number;
  userId: number;
  vehicleId: number;
  vehicle?: Vehicle;
  addedAt: string;
}

export interface Booking {
  id: number;
  customerId: number;
  vehicleId: number;
  rentalStartDate: string;
  rentalEndDate: string;
  pickupTime: string;
  returnTime: string;
  deliveryType: 'PICKUP' | 'HOME_DELIVERY';
  deliveryAddress?: string;
  deliveryFee: number;
  rentalCost: number;
  advanceFee: number;
  totalCost: number;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  advancePaid: boolean;
}

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  paymentType: 'ADVANCE' | 'RENTAL' | 'EXTRA_CHARGES';
  paymentMethod: string;
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentDate: string;
}

export interface Bill {
  id: number;
  bookingId: number;
  customerId: number;
  vehicleId: number;
  rentalCost: number;
  deliveryFee: number;
  extraCharges: number;
  advancePaid: number;
  totalAmount: number;
  amountDue: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  billDate: string;
}

-- Cleanup old data
DELETE FROM vehicles;
DELETE FROM vehicle_categories;
DELETE FROM cities;
DELETE FROM users WHERE role = 'ADMIN';

-- Initialize Cities (5 cities for home page + All)
INSERT INTO cities (name, state, latitude, longitude, delivery_fee_per_km, created_at) VALUES
('All', 'All', 0, 0, 0, NOW()),
('Chennai', 'Tamil Nadu', 13.0827, 80.2707, 15.0, NOW()),
('Madurai', 'Tamil Nadu', 9.9252, 78.1198, 15.0, NOW()),
('Trichy', 'Tamil Nadu', 10.7905, 78.7047, 15.0, NOW()),
('Kanyakumari', 'Tamil Nadu', 8.0883, 77.5385, 15.0, NOW()),
('Trivandrum', 'Kerala', 8.5241, 76.9366, 15.0, NOW());

-- Initialize Vehicle Categories
INSERT INTO vehicle_categories (name, description, created_at) VALUES
('Sedan', 'Comfortable sedan cars for daily commute', NOW()),
('SUV', 'Spacious SUVs for family trips', NOW()),
('Hatchback', 'Compact hatchback cars', NOW()),
('Luxury', 'Premium luxury vehicles', NOW()),
('Electric', 'Eco-friendly electric vehicles', NOW()),
('Mini', 'Small and economical cars', NOW());

-- Initialize Users (Admin user for vehicle management)
INSERT INTO users (email, password, first_name, last_name, phone_number, role, created_at) VALUES
('admin@carrental.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DfH0Ph3lqBn.FS9qS2RUyy5.5m7T7e', 'Admin', 'User', '9876543210', 'ADMIN', NOW());

-- Initialize 12 Vehicles (distributed across cities)
INSERT INTO vehicles (registration_number, make, model, year, category_id, city_id, admin_id, status, daily_rate, weekly_rate, monthly_rate, color, fuel_type, transmission, seating_capacity, mileage, insurance_valid_till, registration_valid_till, created_at) VALUES
('TN01AA0001', 'Toyota', 'Camry', 2023, 1, 2, 1, 'AVAILABLE', 2500.00, 17500.00, 70000.00, 'White', 'Petrol', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0002', 'Honda', 'City', 2023, 1, 2, 1, 'AVAILABLE', 2000.00, 14000.00, 56000.00, 'Silver', 'Petrol', 'Manual', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0003', 'Hyundai', 'Creta', 2023, 2, 3, 1, 'AVAILABLE', 3000.00, 21000.00, 84000.00, 'Red', 'Diesel', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0004', 'Maruti', 'Swift', 2023, 3, 3, 1, 'AVAILABLE', 1500.00, 10500.00, 42000.00, 'Blue', 'Petrol', 'Manual', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0005', 'Mercedes', 'E-Class', 2023, 4, 4, 1, 'AVAILABLE', 8000.00, 56000.00, 224000.00, 'Black', 'Petrol', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0006', 'Tesla', 'Model 3', 2023, 5, 4, 1, 'AVAILABLE', 5000.00, 35000.00, 140000.00, 'White', 'Electric', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0007', 'BMW', '5 Series', 2023, 4, 5, 1, 'AVAILABLE', 7500.00, 52500.00, 210000.00, 'Blue', 'Petrol', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0008', 'Tata', 'Nexon EV', 2023, 5, 5, 1, 'AVAILABLE', 2800.00, 19600.00, 78400.00, 'Green', 'Electric', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0009', 'Maruti', 'Alto', 2023, 6, 6, 1, 'AVAILABLE', 1000.00, 7000.00, 28000.00, 'White', 'Petrol', 'Manual', 4, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0010', 'Hyundai', 'i20', 2023, 3, 2, 1, 'AVAILABLE', 1800.00, 12600.00, 50400.00, 'Red', 'Petrol', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0011', 'Toyota', 'Fortuner', 2023, 2, 6, 1, 'AVAILABLE', 5500.00, 38500.00, 154000.00, 'White', 'Diesel', 'Automatic', 7, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0012', 'Audi', 'A6', 2023, 4, 3, 1, 'AVAILABLE', 9000.00, 63000.00, 252000.00, 'Black', 'Petrol', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW());

-- Fix Cities and Vehicles Data
-- This script clears old data and reinitializes with correct city-vehicle relationships

-- Step 1: Delete old data
DELETE FROM vehicle_photos;
DELETE FROM vehicles;
DELETE FROM vehicle_categories;
DELETE FROM cities;
DELETE FROM users WHERE email IN ('eslimoses2005@gmail.com', 'divyadharshini508205@gmail.com');

-- Step 2: Reset auto-increment counters
ALTER TABLE cities AUTO_INCREMENT = 1;
ALTER TABLE vehicle_categories AUTO_INCREMENT = 1;
ALTER TABLE vehicles AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- Step 3: Insert Cities (5 cities only)
INSERT INTO cities (id, name, state, latitude, longitude, delivery_fee_per_km, created_at) VALUES
(1, 'All', 'All', 0, 0, 0, NOW()),
(2, 'Chennai', 'Tamil Nadu', 13.0827, 80.2707, 15.0, NOW()),
(3, 'Madurai', 'Tamil Nadu', 9.9252, 78.1198, 15.0, NOW()),
(4, 'Tirichy', 'Tamil Nadu', 10.7905, 78.7047, 15.0, NOW()),
(5, 'Kanyakumari', 'Tamil Nadu', 8.0883, 77.5385, 15.0, NOW()),
(6, 'Trivandrum', 'Kerala', 8.5241, 76.9366, 15.0, NOW());

-- Step 4: Insert Vehicle Categories
INSERT INTO vehicle_categories (id, name, description, created_at) VALUES
(1, 'Sedan', 'Comfortable sedan cars for daily commute', NOW()),
(2, 'SUV', 'Spacious SUVs for family trips', NOW()),
(3, 'Hatchback', 'Compact hatchback cars', NOW()),
(4, 'Luxury', 'Premium luxury vehicles', NOW()),
(5, 'Electric', 'Eco-friendly electric vehicles', NOW()),
(6, 'Mini', 'Small and economical cars', NOW());

-- Step 5: Insert Admin and Customer Users
INSERT INTO users (id, email, password, first_name, last_name, phone_number, role, created_at) VALUES
(1, 'eslimoses2005@gmail.com', '$2a$10$lZduj.W0zAHrzh191GXqqOgGGHLAkHP9vMa/t6SHQjDt8bM0HBxDe', 'Eslimoses', 'Admin', '9876543210', 'ADMIN', NOW()),
(2, 'divyadharshini508205@gmail.com', '$2a$10$MNEANiVJOKkQVyvSM7TnZewKFZqa1f/t8oI1g0VroQEq23UHVRh8a', 'Divya', 'Dharshini', '9876543211', 'CUSTOMER', NOW());

-- Step 6: Insert 12 Vehicles (distributed across 5 cities)
-- Chennai (city_id=2): 3 vehicles
INSERT INTO vehicles (registration_number, make, model, year, category_id, city_id, admin_id, status, daily_rate, weekly_rate, monthly_rate, color, fuel_type, transmission, seating_capacity, mileage, insurance_valid_till, registration_valid_till, created_at) VALUES
('TN01AA0001', 'Toyota', 'Camry', 2023, 1, 2, 1, 'AVAILABLE', 2500.00, 17500.00, 70000.00, 'White', 'Petrol', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0002', 'Honda', 'City', 2023, 1, 2, 1, 'AVAILABLE', 2000.00, 14000.00, 56000.00, 'Silver', 'Petrol', 'Manual', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0010', 'Hyundai', 'i20', 2023, 3, 2, 1, 'AVAILABLE', 1800.00, 12600.00, 50400.00, 'Red', 'Petrol', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),

-- Madurai (city_id=3): 3 vehicles
('TN01AA0003', 'Hyundai', 'Creta', 2023, 2, 3, 1, 'AVAILABLE', 3000.00, 21000.00, 84000.00, 'Red', 'Diesel', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0004', 'Maruti', 'Swift', 2023, 3, 3, 1, 'AVAILABLE', 1500.00, 10500.00, 42000.00, 'Blue', 'Petrol', 'Manual', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0012', 'Audi', 'A6', 2023, 4, 3, 1, 'AVAILABLE', 9000.00, 63000.00, 252000.00, 'Black', 'Petrol', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),

-- Trichy (city_id=4): 2 vehicles
('TN01AA0005', 'Mercedes', 'E-Class', 2023, 4, 4, 1, 'AVAILABLE', 8000.00, 56000.00, 224000.00, 'Black', 'Petrol', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0006', 'Tesla', 'Model 3', 2023, 5, 4, 1, 'AVAILABLE', 5000.00, 35000.00, 140000.00, 'White', 'Electric', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),

-- Kanyakumari (city_id=5): 2 vehicles
('TN01AA0007', 'BMW', '5 Series', 2023, 4, 5, 1, 'AVAILABLE', 7500.00, 52500.00, 210000.00, 'Blue', 'Petrol', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0008', 'Tata', 'Nexon EV', 2023, 5, 5, 1, 'AVAILABLE', 2800.00, 19600.00, 78400.00, 'Green', 'Electric', 'Automatic', 5, 0, '2025-12-31', '2025-12-31', NOW()),

-- Trivandrum (city_id=6): 2 vehicles
('TN01AA0009', 'Maruti', 'Alto', 2023, 6, 6, 1, 'AVAILABLE', 1000.00, 7000.00, 28000.00, 'White', 'Petrol', 'Manual', 4, 0, '2025-12-31', '2025-12-31', NOW()),
('TN01AA0011', 'Toyota', 'Fortuner', 2023, 2, 6, 1, 'AVAILABLE', 5500.00, 38500.00, 154000.00, 'White', 'Diesel', 'Automatic', 7, 0, '2025-12-31', '2025-12-31', NOW());

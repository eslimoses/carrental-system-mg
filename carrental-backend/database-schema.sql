-- Car Rental System Database Schema

CREATE DATABASE IF NOT EXISTS car_rental_db;
USE car_rental_db;

-- Users Table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    role ENUM('CUSTOMER', 'ADMIN', 'SUPER_ADMIN') DEFAULT 'CUSTOMER',
    city VARCHAR(100),
    address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cities Table
CREATE TABLE cities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle Categories Table
CREATE TABLE vehicle_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE vehicles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    year INT,
    category_id BIGINT NOT NULL,
    city_id BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,
    status ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE') DEFAULT 'AVAILABLE',
    daily_rate DECIMAL(10, 2),
    weekly_rate DECIMAL(10, 2),
    monthly_rate DECIMAL(10, 2),
    color VARCHAR(50),
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    seating_capacity INT,
    mileage INT DEFAULT 0,
    insurance_valid_till DATE,
    registration_valid_till DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES vehicle_categories(id),
    FOREIGN KEY (city_id) REFERENCES cities(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Vehicle Photos Table
CREATE TABLE vehicle_photos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id BIGINT NOT NULL,
    photo_url VARCHAR(500),
    photo_type ENUM('EXTERIOR', 'INTERIOR', 'OTHER'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Bookings Table
CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    city_id BIGINT NOT NULL,
    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    return_time TIME NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    delivery_type ENUM('PICKUP', 'HOME_DELIVERY') DEFAULT 'PICKUP',
    delivery_location VARCHAR(500),
    delivery_distance_km DECIMAL(10, 2),
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    advance_amount DECIMAL(10, 2),
    rental_amount DECIMAL(10, 2),
    extra_km_charge DECIMAL(10, 2) DEFAULT 0,
    extra_days_charge DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2),
    advance_paid BOOLEAN DEFAULT FALSE,
    advance_paid_date DATETIME,
    rental_paid BOOLEAN DEFAULT FALSE,
    rental_paid_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (city_id) REFERENCES cities(id)
);

-- Rental Photos Table (Photos taken during pickup/return)
CREATE TABLE rental_photos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    photo_url VARCHAR(500),
    photo_type ENUM('PICKUP_EXTERIOR', 'PICKUP_INTERIOR', 'RETURN_EXTERIOR', 'RETURN_INTERIOR', 'OTHER'),
    uploaded_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Payments Table
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    payment_type ENUM('ADVANCE', 'RENTAL', 'EXTRA_CHARGES') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'CASH') NOT NULL,
    transaction_id VARCHAR(100),
    status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
    payment_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Bills Table
CREATE TABLE bills (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL UNIQUE,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    rental_days INT,
    daily_rate DECIMAL(10, 2),
    rental_amount DECIMAL(10, 2),
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    extra_km INT DEFAULT 0,
    extra_km_rate DECIMAL(10, 2),
    extra_km_charge DECIMAL(10, 2) DEFAULT 0,
    extra_days INT DEFAULT 0,
    extra_days_rate DECIMAL(10, 2),
    extra_days_charge DECIMAL(10, 2) DEFAULT 0,
    advance_amount DECIMAL(10, 2),
    advance_paid DECIMAL(10, 2) DEFAULT 0,
    balance_amount DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    bill_date DATETIME,
    status ENUM('DRAFT', 'SENT', 'PAID', 'PARTIAL_PAID') DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Notifications Table
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    booking_id BIGINT,
    notification_type ENUM('BOOKING_CONFIRMATION', 'PAYMENT_REMINDER', 'PICKUP_REMINDER', 'RETURN_REMINDER', 'BILL_GENERATED', 'PAYMENT_RECEIVED') NOT NULL,
    message VARCHAR(500),
    email_sent BOOLEAN DEFAULT FALSE,
    whatsapp_sent BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Promo Codes Table
CREATE TABLE promo_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    max_usage INT,
    current_usage INT DEFAULT 0,
    valid_from DATE,
    valid_till DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking Promo Codes (Junction Table)
CREATE TABLE booking_promo_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    promo_code_id BIGINT NOT NULL,
    discount_amount DECIMAL(10, 2),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id)
);

-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_vehicles_city ON vehicles(city_id);
CREATE INDEX idx_vehicles_category ON vehicles(category_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(pickup_date, return_date);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_bills_booking ON bills(booking_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Insert sample cities
INSERT INTO cities (name, latitude, longitude) VALUES
('Chennai', 13.0827, 80.2707),
('Madurai', 9.9252, 78.1198),
('Trichy', 10.7905, 78.7047),
('Kanyakumari', 8.0883, 77.5385),
('Trivandrum', 8.5241, 76.9366);

-- Insert vehicle categories
INSERT INTO vehicle_categories (name, description) VALUES
('Mini', 'Small compact cars'),
('SUV', 'Sport Utility Vehicles'),
('Luxury', 'Premium luxury vehicles'),
('Hatchback', 'Hatchback cars'),
('Sedan', 'Sedan cars'),
('Electric', 'Electric vehicles');

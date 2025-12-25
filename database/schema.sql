-- Create Database
CREATE DATABASE IF NOT EXISTS google_ads_transparency;
USE google_ads_transparency;

-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uid VARCHAR(6) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  firebase_uid VARCHAR(255) UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  first_name VARCHAR(100),
  middle_name VARCHAR(100),
  last_name VARCHAR(100),
  address TEXT,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  profile_completed BOOLEAN DEFAULT FALSE,
  kyc_status ENUM('pending', 'submitted', 'verified', 'declined') DEFAULT 'pending',
  kyc_decline_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_uid (uid),
  INDEX idx_email (email),
  INDEX idx_firebase_uid (firebase_uid)
);

-- KYC Verifications Table
CREATE TABLE kyc_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  document_type ENUM('nic', 'passport', 'driving_license') NOT NULL,
  document_front_image VARCHAR(255) NOT NULL,
  document_back_image VARCHAR(255),
  status ENUM('pending', 'approved', 'declined') DEFAULT 'pending',
  decline_reason TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- Pricing Plans Table
CREATE TABLE pricing_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  duration_months INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  features JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_duration (duration_months)
);

-- Discount Codes Table
CREATE TABLE discount_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percentage DECIMAL(5, 2) NOT NULL,
  max_uses INT NOT NULL,
  current_uses INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  INDEX idx_code (code)
);

-- Payments Table
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  payment_method ENUM('online', 'bank_transfer') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  discount_code_id INT,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  payment_proof VARCHAR(255),
  status ENUM('pending', 'success', 'failed', 'declined') DEFAULT 'pending',
  decline_reason TEXT,
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES pricing_plans(id),
  FOREIGN KEY (discount_code_id) REFERENCES discount_codes(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- Licenses Table
CREATE TABLE licenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  payment_id INT NOT NULL,
  license_key VARCHAR(16) UNIQUE NOT NULL,
  plan_id INT NOT NULL,
  status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
  activated_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payments(id),
  FOREIGN KEY (plan_id) REFERENCES pricing_plans(id),
  INDEX idx_license_key (license_key),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at)
);


-- Admin Users Table
CREATE TABLE admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

-- Notifications Table
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('kyc_submitted', 'payment_received', 'license_expiring') NOT NULL,
  user_id INT,
  reference_id INT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read)
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT,
  action VARCHAR(100) NOT NULL,
  target_table VARCHAR(50),
  target_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id),
  INDEX idx_admin_id (admin_id),
  INDEX idx_created_at (created_at)
);

-- Insert Default Pricing Plans
INSERT INTO pricing_plans (duration_months, price, description, features) VALUES
(1, 29.99, 'Monthly Plan', '["Access to all features", "Email support", "Regular updates"]'),
(3, 79.99, 'Quarterly Plan', '["Access to all features", "Priority email support", "Regular updates", "10% savings"]'),
(12, 299.99, 'Annual Plan', '["Access to all features", "24/7 priority support", "Regular updates", "Early access to new features", "16% savings"]');

-- Insert Default Admin User (password: admin123 - hashed)
INSERT INTO admin_users (username, email, password_hash, role) VALUES
('admin', 'admin@googleadstransparency.com', '$2b$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uX1234567890abcdefghijklmnopqrs', 'super_admin');
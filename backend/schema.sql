-- ============================================
-- SmartBiz Database Schema
-- MySQL 8.0+
-- ============================================

-- Drop existing database and create new one
DROP DATABASE IF EXISTS smartbiz;
CREATE DATABASE smartbiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartbiz;

-- ============================================
-- Table: users
-- Description: Stores user information with UUID primary key
-- ============================================
CREATE TABLE users (
    id BINARY(16) PRIMARY KEY COMMENT 'UUID stored as binary',
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(100) UNIQUE COMMENT 'Phone number, optional but unique if provided',
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt hashed password',
    full_name VARCHAR(100),
    role ENUM('ADMIN', 'BUSINESS_OWNER', 'STAFF', 'CASHIER') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User accounts';

-- ============================================
-- Table: stores
-- Description: Business stores owned by users
-- ============================================
CREATE TABLE stores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BINARY(16) NOT NULL COMMENT 'UUID of owner',
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Business stores';

-- ============================================
-- Table: staff_store
-- Description: Many-to-many relationship between staff and stores
-- ============================================
CREATE TABLE staff_store (
    store_id BIGINT NOT NULL,
    user_id BINARY(16) NOT NULL COMMENT 'UUID of staff member',
    PRIMARY KEY (store_id, user_id),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Staff-Store relationship';

-- ============================================
-- Table: tables
-- Description: Tables in a store
-- ============================================
CREATE TABLE tables (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    status ENUM('EMPTY', 'SERVING', 'WAITING_PAYMENT', 'PAID') NOT NULL DEFAULT 'EMPTY',
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    INDEX idx_store (store_id),
    INDEX idx_status (status),
    UNIQUE KEY uk_store_table (store_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Restaurant tables';

-- ============================================
-- Table: menu_categories
-- Description: Menu categories for each store
-- ============================================
CREATE TABLE menu_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    INDEX idx_store (store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Menu categories';

-- ============================================
-- Table: menu_items
-- Description: Menu items in categories
-- ============================================
CREATE TABLE menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE = available, FALSE = unavailable',
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Menu items';

-- ============================================
-- Table: staff_shifts
-- Description: Staff work shifts
-- ============================================
CREATE TABLE staff_shifts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BINARY(16) NOT NULL COMMENT 'UUID of staff',
    store_id BIGINT NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_store (store_id),
    INDEX idx_date (shift_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Staff work shifts';

-- ============================================
-- Table: orders
-- Description: Customer orders
-- ============================================
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_id BIGINT NOT NULL,
    staff_id BINARY(16) NOT NULL COMMENT 'UUID of staff',
    shift_id BIGINT NOT NULL,
    status ENUM('NEW', 'PROCESSING', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'NEW',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES staff_shifts(id) ON DELETE CASCADE,
    INDEX idx_table (table_id),
    INDEX idx_staff (staff_id),
    INDEX idx_shift (shift_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Customer orders';

-- ============================================
-- Table: order_items
-- Description: Items in an order
-- ============================================
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL COMMENT 'Price at time of order',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_menu_item (menu_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Order line items';

-- ============================================
-- Table: invoices
-- Description: Payment invoices for orders
-- ============================================
CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CASH', 'TRANSFER') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_payment_method (payment_method),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payment invoices';

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample users (passwords are BCrypt hashed "password123")
INSERT INTO users (id, email, password, full_name, role, status, created_at) VALUES
(UNHEX(REPLACE('550e8400-e29b-41d4-a716-446655440000', '-', '')), 
 'admin@smartbiz.com', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
 'System Admin', 
 'ADMIN', 
 'ACTIVE', 
 '2024-01-01 08:00:00');

INSERT INTO users (id, email, phone, password, full_name, role, status, created_at) VALUES
(UNHEX(REPLACE('660e8400-e29b-41d4-a716-446655440001', '-', '')),
 'owner@smartbiz.com',
 '+84902345678',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
 'John Doe', 
 'BUSINESS_OWNER', 
 'ACTIVE', 
 '2024-01-02 09:00:00');

INSERT INTO users (id, email, password, full_name, role, status, created_at) VALUES
(UNHEX(REPLACE('770e8400-e29b-41d4-a716-446655440002', '-', '')), 
 'staff@smartbiz.com', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
 'Jane Smith', 
 'STAFF', 
 'ACTIVE', 
 '2024-01-03 10:00:00');

INSERT INTO users (id, email, password, full_name, role, status, created_at) VALUES
(UNHEX(REPLACE('880e8400-e29b-41d4-a716-446655440003', '-', '')), 
 'cashier@smartbiz.com', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
 'Bob Johnson', 
 'CASHIER', 
 'ACTIVE', 
 '2024-01-04 11:00:00');

-- Insert sample store
INSERT INTO stores (id, owner_id, name, address, created_at) VALUES
(1, 
 UNHEX(REPLACE('660e8400-e29b-41d4-a716-446655440001', '-', '')), 
 'SmartBiz Cafe', 
 '123 Main Street, Ho Chi Minh City', 
 '2024-01-05 08:00:00');

-- Insert staff-store relationship
INSERT INTO staff_store (store_id, user_id) VALUES
(1, UNHEX(REPLACE('770e8400-e29b-41d4-a716-446655440002', '-', ''))),
(1, UNHEX(REPLACE('880e8400-e29b-41d4-a716-446655440003', '-', '')));

-- Insert sample tables
INSERT INTO tables (id, store_id, name, status) VALUES
(1, 1, 'Table 1', 'EMPTY'),
(2, 1, 'Table 2', 'EMPTY'),
(3, 1, 'Table 3', 'SERVING');

-- Insert sample menu categories
INSERT INTO menu_categories (id, store_id, name) VALUES
(1, 1, 'Beverages'),
(2, 1, 'Main Dishes'),
(3, 1, 'Desserts');

-- Insert sample menu items
INSERT INTO menu_items (id, category_id, name, price, status) VALUES
(1, 1, 'Vietnamese Coffee', 25000.00, TRUE),
(2, 1, 'Iced Tea', 15000.00, TRUE),
(3, 2, 'Pho Bo', 50000.00, TRUE),
(4, 2, 'Banh Mi', 30000.00, TRUE),
(5, 3, 'Che Ba Mau', 20000.00, TRUE);

-- Insert sample staff shift
INSERT INTO staff_shifts (id, user_id, store_id, shift_date, start_time, end_time) VALUES
(1, 
 UNHEX(REPLACE('770e8400-e29b-41d4-a716-446655440002', '-', '')), 
 1, 
 '2024-01-15', 
 '08:00:00', 
 '16:00:00');

-- Insert sample order
INSERT INTO orders (id, table_id, staff_id, shift_id, status, created_at) VALUES
(1, 
 3, 
 UNHEX(REPLACE('770e8400-e29b-41d4-a716-446655440002', '-', '')), 
 1, 
 'PROCESSING', 
 '2024-01-15 10:30:00');

-- Insert sample order items
INSERT INTO order_items (id, order_id, menu_item_id, quantity, price) VALUES
(1, 1, 1, 2, 25000.00),
(2, 1, 3, 1, 50000.00);

-- Insert sample invoice
INSERT INTO invoices (id, order_id, total_amount, payment_method, created_at) VALUES
(1, 1, 100000.00, 'CASH', '2024-01-15 11:00:00');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify data
SELECT 'Users' AS table_name, COUNT(*) AS record_count FROM users
UNION ALL
SELECT 'Stores', COUNT(*) FROM stores
UNION ALL
SELECT 'Staff-Store', COUNT(*) FROM staff_store
UNION ALL
SELECT 'Tables', COUNT(*) FROM tables
UNION ALL
SELECT 'Menu Categories', COUNT(*) FROM menu_categories
UNION ALL
SELECT 'Menu Items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'Staff Shifts', COUNT(*) FROM staff_shifts
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items
UNION ALL
SELECT 'Invoices', COUNT(*) FROM invoices;

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Get all users with their roles
-- SELECT HEX(id) as uuid, email, full_name, role, status FROM users;

-- Get stores with owner information
-- SELECT s.id, s.name, s.address, HEX(u.id) as owner_uuid, u.full_name as owner_name
-- FROM stores s
-- JOIN users u ON s.owner_id = u.id;

-- Get order details with items
-- SELECT o.id as order_id, t.name as table_name, 
--        HEX(u.id) as staff_uuid, u.full_name as staff_name,
--        oi.quantity, mi.name as item_name, oi.price
-- FROM orders o
-- JOIN tables t ON o.table_id = t.id
-- JOIN users u ON o.staff_id = u.id
-- JOIN order_items oi ON o.id = oi.order_id
-- JOIN menu_items mi ON oi.menu_item_id = mi.id;

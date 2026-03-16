
USE smartbiz;

-- Disable foreign key checks to avoid issues during insertion
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- 1. Insert Users
-- ==========================================
-- Store Owner
INSERT INTO `users` (`id`, `email`, `phone`, `password`, `full_name`, `role`, `status`, `created_at`) VALUES
('b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'owner@smartbiz.com', '0901234567', '$2a$10$wY1z.E/y.W.sV.fA.t.R/O.P.w.k.m.l.j.h.g.f.e.d.c.b.a', 'Trần Văn Chủ', 'BUSINESS_OWNER', 'ACTIVE', NOW()),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'admin@smartbiz.com', '0987654321', '$2a$10$wY1z.E/y.W.sV.fA.t.R/O.P.w.k.m.l.j.h.g.f.e.d.c.b.a', 'Nguyễn Quản Trị', 'ADMIN', 'ACTIVE', NOW());

-- Staff & Cashier
INSERT INTO `users` (`id`, `email`, `phone`, `password`, `full_name`, `role`, `status`, `salary_type`, `salary_amount`, `created_at`) VALUES
('c1d2e3f4-g5h6-7i8j-9k0l-1m2n3o4p5q6r', 'cashier1@smartbiz.com', '0911223344', '$2a$10$wY1z.E/y.W.sV.fA.t.R/O.P.w.k.m.l.j.h.g.f.e.d.c.b.a', 'Lê Thu Ngân', 'CASHIER', 'ACTIVE', 'MONTHLY', 8000000, NOW()),
('d1e2f3g4-h5i6-7j8k-9l0m-1n2o3p4q5r6s', 'staff1@smartbiz.com', '0922334455', '$2a$10$wY1z.E/y.W.sV.fA.t.R/O.P.w.k.m.l.j.h.g.f.e.d.c.b.a', 'Phạm Phục Vụ', 'STAFF', 'ACTIVE', 'HOURLY', 25000, NOW()),
('e1f2g3h4-i5j6-7k8l-9m0n-1o2p3q4r5s6t', 'kitchen1@smartbiz.com', '0933445566', '$2a$10$wY1z.E/y.W.sV.fA.t.R/O.P.w.k.m.l.j.h.g.f.e.d.c.b.a', 'Vũ Đầu Bếp', 'KITCHEN', 'ACTIVE', 'MONTHLY', 10000000, NOW());

-- ==========================================
-- 2. Insert Store
-- ==========================================
INSERT INTO `stores` (`id`, `owner_id`, `name`, `address`, `status`, `created_at`, `opening_time`, `closing_time`, `tax_rate`, `phone`) VALUES
(1, 'b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'SmartBiz Restaurant Quận 1', '123 Nguyễn Huệ, Quận 1, TP.HCM', 'ACTIVE', NOW(), '08:00:00', '22:00:00', 8.00, '0281234567'),
(2, 'b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'SmartBiz Cafe Quận 3', '456 Lê Văn Sỹ, Quận 3, TP.HCM', 'ACTIVE', NOW(), '07:00:00', '23:00:00', 8.00, '0289876543');

-- ==========================================
-- 3. Link Staff to Store (staff_store)
-- ==========================================
INSERT INTO `staff_store` (`store_id`, `user_id`) VALUES
(1, 'c1d2e3f4-g5h6-7i8j-9k0l-1m2n3o4p5q6r'), -- Cashier at Store 1
(1, 'd1e2f3g4-h5i6-7j8k-9l0m-1n2o3p4q5r6s'), -- Staff at Store 1
(1, 'e1f2g3h4-i5j6-7k8l-9m0n-1o2p3q4r5s6t'); -- Kitchen at Store 1

-- ==========================================
-- 4. Insert Tables
-- ==========================================
INSERT INTO `tables` (`id`, `store_id`, `name`, `status`) VALUES
(1, 1, 'Bàn 1', 'EMPTY'),
(2, 1, 'Bàn 2', 'OCCUPIED'),
(3, 1, 'Bàn 3', 'RESERVED'),
(4, 1, 'Bàn 4', 'EMPTY'),
(5, 2, 'Bàn VIP 1', 'EMPTY');

-- ==========================================
-- 5. Insert Menu Categories
-- ==========================================
INSERT INTO `menu_categories` (`id`, `store_id`, `name`) VALUES
(1, 1, 'Món Chính'),
(2, 1, 'Đồ Uống'),
(3, 1, 'Tráng Miệng'),
(4, 2, 'Cà Phê'),
(5, 2, 'Bánh Ngọt');

-- ==========================================
-- 6. Insert Menu Items
-- ==========================================
INSERT INTO `menu_items` (`id`, `category_id`, `name`, `price`, `status`) VALUES
(1, 1, 'Phở Bò', 65000, 1),
(2, 1, 'Cơm Tấm Sườn Bì', 55000, 1),
(3, 2, 'Trà Đá', 5000, 1),
(4, 2, 'Sinh Tố Bơ', 45000, 1),
(5, 3, 'Chè Bưởi', 25000, 1),
(6, 4, 'Cà Phê Sữa Đá', 35000, 1),
(7, 4, 'Bạc Xỉu', 40000, 1),
(8, 5, 'Tiramisu', 50000, 1);

-- ==========================================
-- 7. Insert Work Shifts (Templates)
-- ==========================================
INSERT INTO `work_shifts` (`id`, `store_id`, `name`, `start_time`, `end_time`) VALUES
(1, 1, 'Ca Sáng', '07:00:00', '15:00:00'),
(2, 1, 'Ca Chiều', '15:00:00', '23:00:00'),
(3, 2, 'Ca Hành Chính', '08:00:00', '17:00:00');

-- ==========================================
-- 8. Insert Staff Shifts (Actual assigned shifts)
-- ==========================================
INSERT INTO `staff_shifts` (`id`, `user_id`, `store_id`, `work_shift_id`, `shift_date`, `start_time`, `end_time`) VALUES
(1, 'c1d2e3f4-g5h6-7i8j-9k0l-1m2n3o4p5q6r', 1, 1, CURDATE(), '07:00:00', '15:00:00'),
(2, 'd1e2f3g4-h5i6-7j8k-9l0m-1n2o3p4q5r6s', 1, 1, CURDATE(), '07:00:00', '15:00:00');

-- ==========================================
-- 9. Insert Orders
-- ==========================================
INSERT INTO `orders` (`id`, `table_id`, `staff_id`, `shift_id`, `status`, `created_at`) VALUES
(1, 2, 'd1e2f3g4-h5i6-7j8k-9l0m-1n2o3p4q5r6s', 1, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 3, 'd1e2f3g4-h5i6-7j8k-9l0m-1n2o3p4q5r6s', 2, 'PROCESSING', NOW());

-- ==========================================
-- 10. Insert Order Items
-- ==========================================
INSERT INTO `order_items` (`id`, `order_id`, `menu_item_id`, `quantity`, `price`) VALUES
(1, 1, 1, 2, 65000), -- 2 Phở Bò
(2, 1, 3, 2, 5000),  -- 2 Trà Đá
(3, 2, 2, 1, 55000), -- 1 Cơm Tấm
(4, 2, 4, 1, 45000); -- 1 Sinh Tố Bơ

-- ==========================================
-- 11. Insert Invoices
-- ==========================================
INSERT INTO `invoices` (`id`, `order_id`, `total_amount`, `payment_method`, `created_at`) VALUES
(1, 1, 140000, 'ZALOPAY', DATE_SUB(NOW(), INTERVAL 1 HOUR)); -- 2*65k + 2*5k

-- ==========================================
-- 12. Insert Payment Transactions
-- ==========================================
INSERT INTO `payment_transactions` (`id`, `invoice_id`, `transaction_code`, `amount`, `payment_method`, `payment_status`, `payment_date`, `created_at`) VALUES
(1, 1, 'TXN987654321', 140000, 'ZALOPAY', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
```

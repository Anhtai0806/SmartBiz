# 📘 SMARTBIZ – SOFTWARE REQUIREMENT SPECIFICATION (SRS)

## 1. Giới thiệu

### 1.1 Mục đích tài liệu
Tài liệu này mô tả **đầy đủ yêu cầu nghiệp vụ, chức năng, dữ liệu và kỹ thuật** cho dự án **SmartBiz** – hệ thống quản lý vận hành quán ăn/café đa cửa hàng. Tài liệu dùng cho **Developer, Tester, BA** triển khai dự án đúng nghiệp vụ thực tế.

### 1.2 Phạm vi hệ thống
SmartBiz là hệ thống web cho phép:
- 1 chủ kinh doanh quản lý **nhiều cửa hàng**
- Nhân viên thao tác order, bàn, thanh toán
- Quản lý menu, ca làm, hóa đơn
- Hỗ trợ mở rộng AI phân tích dữ liệu

---

## 2. Đối tượng sử dụng & phân quyền

### 2.1 Role hệ thống

| Role | Quyền hạn |
|-----|----------|
| ADMIN | Quản trị toàn hệ thống, không thuộc cửa hàng |
| BUSINESS_OWNER | Toàn quyền trên cửa hàng thuộc sở hữu |
| STAFF | Tạo order, quản lý bàn |
| CASHIER | Xử lý order, thanh toán, in hóa đơn |

> ADMIN **không tham gia nghiệp vụ bán hàng**, chỉ quản trị hệ thống.

-----|----------|
| BUSINESS_OWNER | Toàn quyền trên cửa hàng thuộc sở hữu |
| STAFF | Tạo order, quản lý bàn |
| CASHIER | Xử lý order, thanh toán, in hóa đơn |

> Nhân viên **không được tự đăng ký**, chỉ BUSINESS_OWNER tạo.

---

## 3. Nghiệp vụ tổng thể (Business Flow)

1. BUSINESS_OWNER đăng ký tài khoản
2. Tạo cửa hàng
3. Tạo menu, bàn, nhân viên
4. Phân ca làm
5. STAFF nhận order tại bàn
6. CASHIER xử lý order
7. Khách thanh toán → tạo hóa đơn

---

## 4. Yêu cầu chức năng (Functional Requirements)

### 4.1 Authentication & Authorization
- Đăng nhập / đăng xuất
- JWT-based authentication
- Phân quyền theo role
- ADMIN truy cập toàn bộ hệ thống
- BUSINESS_OWNER chỉ truy cập dữ liệu cửa hàng của mình

### 4.2 Quản lý cửa hàng
- 1 owner → N stores
- CRUD cửa hàng
- Mỗi store có cấu hình riêng (giờ mở cửa, thuế)

### 4.3 Quản lý nhân viên
- Tạo tài khoản STAFF / CASHIER
- Gán vào 1 hoặc nhiều cửa hàng
- Trạng thái: ACTIVE / INACTIVE

### 4.4 Quản lý ca làm
- Tạo ca theo ngày
- Nhân viên chỉ xem ca của mình
- Order phải gắn với ca làm

### 4.5 Quản lý menu
- Menu theo cửa hàng
- Danh mục món
- Giá, hình ảnh, trạng thái bán

### 4.6 Quản lý bàn
- Tạo bàn theo cửa hàng
- Trạng thái:
  - EMPTY
  - SERVING
  - WAITING_PAYMENT
  - PAID

### 4.7 Order & Thanh toán
- STAFF tạo order tại bàn
- Order gồm nhiều item
- CASHIER cập nhật trạng thái order
- Thanh toán: CASH / TRANSFER
- Tự động tạo hóa đơn

---

## 5. Yêu cầu phi chức năng

- Bảo mật JWT
- Phân tách dữ liệu theo store (multi-tenant)
- Response < 500ms
- Có khả năng mở rộng AI service

---

## 6. DATABASE DESIGN (MySQL)

### 6.0 admins (logical role)
> ADMIN được quản lý trong bảng `users` thông qua role = 'ADMIN'

ADMIN có các quyền:
- Quản lý toàn bộ user
- Khóa / mở tài khoản BUSINESS_OWNER
- Quản lý danh sách cửa hàng toàn hệ thống
- Xem báo cáo tổng


### 6.1 users
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('ADMIN','BUSINESS_OWNER','STAFF','CASHIER'),
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  created_at DATETIME
);
```


### 6.2 stores
```sql
CREATE TABLE stores (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  owner_id BIGINT,
  name VARCHAR(100),
  address VARCHAR(255),
  created_at DATETIME,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### 6.3 staff_store
```sql
CREATE TABLE staff_store (
  user_id BIGINT,
  store_id BIGINT,
  PRIMARY KEY (user_id, store_id)
);
```

### 6.4 menu_categories
```sql
CREATE TABLE menu_categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT,
  name VARCHAR(100)
);
```

### 6.5 menu_items
```sql
CREATE TABLE menu_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT,
  name VARCHAR(100),
  price DECIMAL(10,2),
  status BOOLEAN DEFAULT TRUE
);
```

### 6.6 tables
```sql
CREATE TABLE tables (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT,
  name VARCHAR(50),
  status ENUM('EMPTY','SERVING','WAITING_PAYMENT','PAID')
);
```

### 6.7 staff_shifts
```sql
CREATE TABLE staff_shifts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  store_id BIGINT,
  shift_date DATE,
  start_time TIME,
  end_time TIME
);
```

### 6.8 orders
```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  table_id BIGINT,
  staff_id BIGINT,
  shift_id BIGINT,
  status ENUM('NEW','PROCESSING','DONE','CANCELLED'),
  created_at DATETIME
);
```

### 6.9 order_items
```sql
CREATE TABLE order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT,
  menu_item_id BIGINT,
  quantity INT,
  price DECIMAL(10,2)
);
```

### 6.10 invoices
```sql
CREATE TABLE invoices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT,
  total_amount DECIMAL(10,2),
  payment_method ENUM('CASH','TRANSFER'),
  created_at DATETIME
);
```

---

## 7. Mở rộng AI (Optional)

- Phân tích doanh thu theo ngày/tháng
- Top món bán chạy
- Gợi ý lịch làm
- Chat AI hỏi dữ liệu

---

## 8. Công nghệ đề xuất

- Backend: Spring Boot
- Frontend: React / Thymeleaf
- DB: MySQL
- Auth: JWT
- AI: Python + LLM (optional)

---

## 9. Kết luận

Tài liệu này đủ chi tiết để **dev backend + frontend** triển khai độc lập, đúng nghiệp vụ quán ăn/café thực tế và dễ mở rộng trong tương lai.


# 📘 SMARTBIZ – SOFTWARE REQUIREMENT SPECIFICATION (SRS)

## 1. Giới thiệu

### 1.1 Mục đích tài liệu

Tài liệu này mô tả **đầy đủ yêu cầu nghiệp vụ, chức năng, dữ liệu và kỹ thuật** cho dự án **SmartBiz** – hệ thống quản lý vận hành quán ăn/café đa cửa hàng. Tài liệu dùng cho **Developer, Tester, BA** triển khai dự án đúng nghiệp vụ thực tế.

### 1.2 Phạm vi hệ thống

SmartBiz là hệ thống web cho phép:

* 1 chủ kinh doanh quản lý **nhiều cửa hàng**
* Nhân viên thao tác order, bàn, thanh toán
* Quản lý menu, ca làm, hóa đơn
* Hỗ trợ mở rộng AI phân tích dữ liệu

---

## 2. Đối tượng sử dụng & phân quyền

### 2.1 Role hệ thống

| Role           | Quyền hạn                                    |
| -------------- | -------------------------------------------- |
| ADMIN          | Quản trị toàn hệ thống, không thuộc cửa hàng |
| BUSINESS_OWNER | Toàn quyền trên cửa hàng thuộc sở hữu        |
| STAFF          | Tạo order, quản lý bàn                       |
| CASHIER        | Xử lý order, thanh toán, in hóa đơn          |

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

* Đăng nhập / đăng xuất
* JWT-based authentication
* Phân quyền theo role
* ADMIN truy cập toàn bộ hệ thống
* BUSINESS_OWNER chỉ truy cập dữ liệu cửa hàng của mình

### 4.2 Quản lý cửa hàng

* 1 owner → N stores
* CRUD cửa hàng
* Mỗi store có cấu hình riêng (giờ mở cửa, thuế)

### 4.3 Quản lý nhân viên

* Tạo tài khoản STAFF / CASHIER
* Gán vào 1 hoặc nhiều cửa hàng
* Trạng thái: ACTIVE / INACTIVE

### 4.4 Quản lý ca làm

* Tạo ca theo ngày
* Nhân viên chỉ xem ca của mình
* Order phải gắn với ca làm

### 4.5 Quản lý menu

* Menu theo cửa hàng
* Danh mục món
* Giá, hình ảnh, trạng thái bán

### 4.6 Quản lý bàn

* Tạo bàn theo cửa hàng
* Trạng thái: EMPTY / SERVING / WAITING_PAYMENT / PAID

### 4.7 Order & Thanh toán

* STAFF tạo order tại bàn
* Order gồm nhiều item
* CASHIER cập nhật trạng thái order
* Thanh toán: CASH / TRANSFER
* Tự động tạo hóa đơn

---

## 5. Yêu cầu phi chức năng

* Bảo mật JWT
* Phân tách dữ liệu theo store (multi-tenant)
* Response < 500ms
* Có khả năng mở rộng AI service

---

## 6. Database Design (MySQL)

### 6.1 users

### 6.2 stores

### 6.3 staff_store

### 6.4 menu_categories

### 6.5 menu_items

### 6.6 tables

### 6.7 staff_shifts

### 6.8 orders

### 6.9 order_items

### 6.10 invoices

---

## 7. Mở rộng AI (Optional)

* Phân tích doanh thu
* Top món bán chạy
* Gợi ý lịch làm

---

## 8. Công nghệ đề xuất

* Backend: Spring Boot
* Frontend: React
* DB: MySQL
* Auth: JWT

---

## 9. Kết luận

Tài liệu này đủ chi tiết để dev triển khai hệ thống SmartBiz.

---

## 10. Các yêu cầu còn thiếu & bổ sung theo góc nhìn chủ chuỗi

### 10.1 Phân quyền chi tiết theo vai trò (RBAC mở rộng)

Bổ sung các role nghiệp vụ chi tiết hơn:

| Role          | Mô tả                     |
| ------------- | ------------------------- |
| STORE_MANAGER | Quản lý 1 cửa hàng cụ thể |
| BARISTA       | Pha chế, chỉ xem order    |
| WAITER        | Phục vụ, tạo order        |
| GUARD         | Xem trạng thái bàn        |
| INVENTORY     | Quản lý kho               |

Yêu cầu:

* Mỗi role có permission-level cụ thể (VIEW / CREATE / UPDATE / APPROVE)
* Không hard-code quyền trong code

---

### 10.2 Nhật ký hệ thống & chống gian lận (Audit Log)

Hệ thống phải ghi log cho các hành động nhạy cảm:

* Hủy order
* Sửa giá
* Mở / đóng ca
* Đăng nhập thất bại

```sql
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  store_id BIGINT,
  action VARCHAR(100),
  entity VARCHAR(50),
  entity_id BIGINT,
  created_at DATETIME
);
```

---

### 10.3 Quản lý kho & nguyên vật liệu

Chức năng:

* Quản lý nguyên liệu
* Định mức nguyên liệu theo món
* Tự động trừ kho khi bán
* Cảnh báo tồn kho thấp

```sql
CREATE TABLE ingredients (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT,
  name VARCHAR(100),
  unit VARCHAR(20),
  quantity DECIMAL(10,2)
);

CREATE TABLE recipe_items (
  menu_item_id BIGINT,
  ingredient_id BIGINT,
  amount DECIMAL(10,2)
);
```

---

### 10.4 Báo cáo & Dashboard cho chủ

* Doanh thu theo ngày / tháng
* So sánh giữa các cửa hàng
* Top sản phẩm bán chạy
* Hiệu suất nhân viên

---

### 10.5 Quản lý khách hàng & tích điểm

```sql
CREATE TABLE customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20),
  name VARCHAR(100)
);
```

---

### 10.6 Chính sách multi-tenant nâng cao

* Mỗi store là logical tenant
* Bắt buộc filter store_id trong mọi truy vấn

---

### 10.7 Lộ trình phát triển

Phase 1: POS, Order, Thanh toán
Phase 2: Kho, Báo cáo
Phase 3: AI, Mobile app

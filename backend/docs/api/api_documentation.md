# Backend API Documentation

This document provides a comprehensive overview of the Spring Boot backend APIs for the SmartBiz application.

## 1. Authentication (`/auth`)
*All endpoints here (except Login and register OTP flow) require the `Authorization: Bearer <token>` header.*

### 1.1. Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "email@example.com or phone_number",
    "password": "password123"
  }
  ```
- **Response Body**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "type": "Bearer",
    "id": "uuid-string",
    "email": "email@example.com",
    "phone": "0123456789",
    "fullName": "John Doe",
    "role": "BUSINESS_OWNER",
    "status": "ACTIVE",
    "storeId": 1
  }
  ```
- **Error Response**: `403 Forbidden` for bad credentials.

### 1.2. Register
- **URL**: `/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "email@example.com",
    "phone": "0123456789",
    "password": "password123",
    "fullName": "John Doe"
  }
  ```
- **Response Body**:
  ```json
  {
    "message": "OTP has been sent to your email. Please verify to complete registration.",
    "email": "email@example.com",
    "expiresAt": "2026-03-18T14:35:21",
    "expiresInSeconds": 30
  }
  ```
- **Notes**:
  - Hệ thống tạo tài khoản ở trạng thái `INACTIVE`.
  - OTP là mã 6 chữ số và chỉ có hiệu lực trong 30 giây.

### 1.3. Verify Register OTP
- **URL**: `/auth/register/verify`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "email@example.com",
    "otpCode": "123456"
  }
  ```
- **Response Body**: Trả về `LoginResponse` (có JWT token) sau khi xác thực OTP thành công.
- **Error Response**:
  - `400 Bad Request`: OTP sai/hết hạn/đã xác thực.
  - `404 Not Found`: Không tìm thấy đăng ký đang chờ xác thực.

### 1.4. Resend Register OTP
- **URL**: `/auth/register/resend`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "email@example.com"
  }
  ```
- **Response Body**:
  ```json
  {
    "message": "A new OTP has been sent to your email",
    "email": "email@example.com",
    "expiresAt": "2026-03-18T14:36:08",
    "expiresInSeconds": 30
  }
  ```
- **Notes**: OTP cũ chưa dùng sẽ bị vô hiệu hóa ngay khi gửi lại mã mới.

### 1.5. Get Current User Profille
- **URL**: `/auth/me`
- **Method**: `GET`
- **Response Body**:
  ```json
  {
    "id": "uuid-string",
    "email": "email@example.com",
    "fullName": "John Doe",
    "role": "STAFF",
    "status": "ACTIVE",
    "createdAt": "2023-11-20T10:00:00"
  }
  ```

### 1.6. Update Profile
- **URL**: `/auth/profile`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "phone": "0987654321"
  }
  ```
- **Response Body**: Updated user details.

### 1.7. Change Password
- **URL**: `/auth/change-password`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
  }
  ```
- **Response**: `200 OK`

---

## 2. Business Owner (`/business`)
*Requires `Authorization: Bearer <token>` and `BUSINESS_OWNER` role.*

### 2.1. Get My Stores
- **URL**: `/business/stores`
- **Method**: `GET`
- **Response Body**: List of `StoreResponse` objects.

### 2.2. Create Store
- **URL**: `/business/stores`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "Store Name",
    "address": "123 Street",
    "phone": "0123456789"
  }
  ```
- **Response Body**: Created `StoreResponse`.

### 2.3. Dashboard Stats
- **URL**: `/business/dashboard`
- **Method**: `GET`
- **Response Body**: Aggregated sales, orders, and revenue stats.

### 2.4. Manage Staff
- **Create Staff**: `POST /business/staff` (Body: `CreateStaffRequest`)
- **Assign Staff**: `POST /business/staff/assign` (Body: `AssignStaffRequest`)
- **Update Status**: `PUT /business/staff/{staffId}/status` (Body: `UpdateUserStatusRequest`)

### 2.5. Manage Categories & Menu Items
- **Get Categories**: `GET /business/categories`
- **Create Category**: `POST /business/categories`
- **Create Menu Item**: `POST /business/stores/{storeId}/menu-items`

---

## 3. Order Management (`/api/orders`)
*Requires `Authorization: Bearer <token>` and appropriate roles (STAFF, CASHIER, BUSINESS_OWNER).*

### 3.1. Get Order by Table
- **URL**: `/api/orders/table/{tableId}`
- **Method**: `GET`
- **Response**: `OrderResponse` containing items, total amount, status.

### 3.2. Create Order
- **URL**: `/api/orders`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "tableId": 1,
    "storeId": 1,
    "customerCount": 2,
    "items": [
      {
        "menuItemId": 5,
        "quantity": 2,
        "notes": "No spicy"
      }
    ]
  }
  ```

### 3.3. Add Item to Order
- **URL**: `/api/orders/{orderId}/items`
- **Method**: `POST`
- **Request Body**: `OrderItemRequest`

### 3.4. Update Order Status
- **URL**: `/api/orders/{orderId}/status`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "status": "COMPLETED" // PENDING, PROCESSING, COMPLETED, CANCELLED
  }
  ```

---

## 4. Admin Management (`/admin`)
*Requires `Authorization: Bearer <token>` and `ADMIN` role.*

### 4.1. Get All Users
- **URL**: `/admin/users`
- **Method**: `GET`
- **Response**: List of all users in the system.

### 4.2. Update User Status (Lock/Unlock)
- **URL**: `/admin/users/{userId}/status`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "status": "INACTIVE" // ACTIVE or INACTIVE
  }
  ```

### 4.3. Get All Stores
- **URL**: `/admin/stores`
- **Method**: `GET`
- **Response**: List of all registered stores across the platform.

---

## General Standard Responses
### Header Required
All authenticated endpoints require:
```
Authorization: Bearer <your_jwt_token_here>
Content-Type: application/json
```

### Common Error Responses
- **401 Unauthorized**: Token is missing, invalid, or expired.
- **403 Forbidden**: User does not have the required role to access the endpoint.
- **400 Bad Request**: Validation failed for the request body parameters.
- **404 Not Found**: The requested resource (User, Store, Order) was not found.
- **500 Internal Server Error**: An unexpected error occurred on the server.

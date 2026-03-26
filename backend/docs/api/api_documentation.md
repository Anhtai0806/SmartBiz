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
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid-string",
    "email": "email@example.com",
    "phone": "0987654321",
    "fullName": "John Doe",
    "role": "STAFF",
    "status": "ACTIVE",
    "createdAt": "2023-11-20T10:00:00"
  }
  ```

### 1.6. Update Profile
- **URL**: `/auth/profile`
- **Method**: `PUT`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "phone": "0987654321"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid-string",
    "email": "email@example.com",
    "phone": "0987654321",
    "fullName": "Jane Doe",
    "role": "BUSINESS_OWNER",
    "status": "ACTIVE",
    "createdAt": "2023-11-20T10:00:00"
  }
  ```
- **Notes**:
  - `phone` must be unique across users.
  - Users created through Google OAuth2 may initially have `phone = null`; updating profile with a new phone number is supported.

### 1.7. Change Password
- **URL**: `/auth/change-password`
- **Method**: `PUT`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
  }
  ```
- **Response Body**:
  ```json
  {
    "message": "Password changed successfully",
    "timestamp": "2026-03-22T10:45:00"
  }
  ```

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
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "name": "Store Name",
    "address": "123 Street",
    "phone": "0123456789",
    "taxRate": 0.08,
    "openingTime": "08:00:00",
    "closingTime": "22:00:00"
  }
  ```
- **Response Body**: Created `StoreResponse`.

### 2.3. Update Store
- **URL**: `/business/stores/{storeId}`
- **Method**: `PUT`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Path Variable**:
  - `storeId`: ID of the store to update
- **Request Body**:
  ```json
  {
    "name": "Updated Store Name",
    "address": "456 New Street",
    "phone": "0987654321",
    "taxRate": 0.1,
    "openingTime": "07:30:00",
    "closingTime": "23:00:00"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": 1,
    "name": "Updated Store Name",
    "address": "456 New Street",
    "phone": "0987654321",
    "taxRate": 0.1,
    "openingTime": "07:30:00",
    "closingTime": "23:00:00",
    "ownerId": "uuid-string",
    "ownerName": "John Doe",
    "ownerEmail": "owner@example.com",
    "status": "ACTIVE",
    "staffCount": 5,
    "tableCount": 12,
    "createdAt": "2026-03-22T10:00:00"
  }
  ```

### 2.4. Get Store Details
- **URL**: `/business/stores/{storeId}`
- **Method**: `GET`
- **Path Variable**:
  - `storeId`: ID of the store
- **Response Body**: `StoreDetailResponse`

### 2.5. Activate Or Deactivate Store
- **URL**: `/business/stores/{storeId}`
- **Method**: `PUT`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Description**: There is currently no separate `active store` endpoint in the backend. Store activation/deactivation is handled by the same update endpoint via the `status` field.
- **Path Variable**:
  - `storeId`: ID of the store to activate/deactivate
- **Request Body**:
  ```json
  {
    "name": "Updated Store Name",
    "address": "456 New Street",
    "phone": "0987654321",
    "taxRate": 0.1,
    "openingTime": "07:30:00",
    "closingTime": "23:00:00",
    "status": "INACTIVE"
  }
  ```
- **Allowed `status` values**:
  - `ACTIVE`
  - `INACTIVE`
- **Response Body**: Returns the updated `StoreResponse` with the new `status`.

### 2.6. Dashboard Stats
- **URL**: `/business/dashboard`
- **Method**: `GET`
- **Response Body**: Aggregated sales, orders, and revenue stats.

### 2.7. Create Staff
- **URL**: `/business/staff`
- **Method**: `POST`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "staff1@smartbiz.com",
    "password": "password123",
    "fullName": "Nguyen Van B",
    "role": "STAFF",
    "salaryType": "MONTHLY",
    "salaryAmount": 8000000
  }
  ```
- **Allowed `role` values**:
  - `STAFF`
  - `CASHIER`
  - `KITCHEN`
- **Notes**:
  - API này chỉ tạo tài khoản nhân viên, chưa gán nhân viên vào quán nào.
  - Sau khi tạo xong, cần gọi `POST /business/staff/assign` để gán nhân viên vào một cửa hàng cụ thể.
- **Response Body**: Created `UserResponse`.

### 2.8. Assign Staff To Store
- **URL**: `/business/staff/assign`
- **Method**: `POST`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "userId": "uuid-of-staff-or-cashier",
    "storeId": 1
  }
  ```
- **Response Body**: Updated `StoreResponse`.

### 2.9. Update Staff Status
- **URL**: `/business/staff/{staffId}/status`
- **Method**: `PUT`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Path Variable**:
  - `staffId`: UUID of staff/cashier account
- **Request Body**:
  ```json
  {
    "status": "INACTIVE"
  }
  ```
- **Allowed `status` values**:
  - `ACTIVE`
  - `INACTIVE`
- **Response Body**: Updated `UserResponse`.

### 2.10. Update Staff
- **URL**: `/business/staff/{staffId}`
- **Method**: `PUT`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Path Variable**:
  - `staffId`: UUID of staff/cashier account
- **Request Body**:
  ```json
  {
    "fullName": "Nguyen Van C",
    "email": "staff.updated@smartbiz.com",
    "password": "newPassword123",
    "phone": "0901234567",
    "address": "123 Nguyen Trai, District 1",
    "salaryType": "HOURLY",
    "salaryAmount": 35000
  }
  ```
- **Notes**:
  - All fields in `UpdateStaffRequest` are optional.
  - Only provided fields are updated.
- **Response Body**: Updated `UserResponse`.

### 2.11. Get Staff Of A Store
- **URL**: `/business/stores/{storeId}/staff`
- **Method**: `GET`
- **Path Variable**:
  - `storeId`: ID of the store
- **Response Body**: List of `UserResponse` objects.

### 2.12. Remove Staff From Store
- **URL**: `/business/stores/{storeId}/staff/{staffId}`
- **Method**: `DELETE`
- **Path Variables**:
  - `storeId`: ID of the store
  - `staffId`: UUID of the staff/cashier account
- **Response Body**: `204 No Content`

### 2.13. Get All Categories
- **URL**: `/business/categories`
- **Method**: `GET`
- **Response Body**: List of `MenuCategoryResponse` objects across all stores owned by the current business owner.

### 2.14. Create Category
- **URL**: `/business/categories`
- **Method**: `POST`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "storeId": 1,
    "name": "Coffee"
  }
  ```
- **Response Body**: Created `MenuCategoryResponse`.

### 2.15. Update Category
- **URL**: `/business/categories/{categoryId}`
- **Method**: `PUT`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Path Variable**:
  - `categoryId`: ID of the category
- **Request Body**:
  ```json
  {
    "storeId": 1,
    "name": "Signature Coffee"
  }
  ```
- **Response Body**: Updated `MenuCategoryResponse`.

### 2.16. Delete Category
- **URL**: `/business/categories/{categoryId}`
- **Method**: `DELETE`
- **Path Variable**:
  - `categoryId`: ID of the category
- **Response Body**: `204 No Content`
- **Notes**:
  - Deleting a category also deletes all menu items in that category.

### 2.17. Get Categories Of A Store
- **URL**: `/business/stores/{storeId}/categories`
- **Method**: `GET`
- **Path Variable**:
  - `storeId`: ID of the store
- **Response Body**: List of `MenuCategoryResponse` objects.

### 2.18. Create Menu Item
- **URL**: `/business/stores/{storeId}/menu-items`
- **Method**: `POST`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Path Variable**:
  - `storeId`: ID of the store
- **Request Body**:
  ```json
  {
    "categoryId": 10,
    "name": "Latte",
    "price": 45000,
    "status": true
  }
  ```
- **Notes**:
  - `status = true` means the item is available for sale.
- **Response Body**: Created `MenuItemResponse`.

### 2.19. Update Menu Item
- **URL**: `/business/menu-items/{itemId}`
- **Method**: `PUT`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Path Variable**:
  - `itemId`: ID of the menu item
- **Request Body**:
  ```json
  {
    "categoryId": 10,
    "name": "Latte Large",
    "price": 55000,
    "status": false
  }
  ```
- **Response Body**: Updated `MenuItemResponse`.

### 2.20. Delete Menu Item
- **URL**: `/business/menu-items/{itemId}`
- **Method**: `DELETE`
- **Path Variable**:
  - `itemId`: ID of the menu item
- **Response Body**: `204 No Content`

### 2.21. Get Shift Templates
- **URL**: `/business/stores/{storeId}/shift-templates`
- **Method**: `GET`
- **Path Variable**:
  - `storeId`: ID of the store
- **Response Body**: List of `WorkShiftResponse` objects.

### 2.22. Create Shift Template
- **URL**: `/business/stores/{storeId}/shift-templates`
- **Method**: `POST`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Path Variable**:
  - `storeId`: ID of the store
- **Request Body**:
  ```json
  {
    "storeId": 1,
    "name": "Morning Shift",
    "startTime": "08:00",
    "endTime": "12:00"
  }
  ```
- **Notes**:
  - `storeId` in body is currently required by backend validation.
  - The controller will overwrite `storeId` in body with the `storeId` from the URL path before saving.
- **Response Body**: Created `WorkShiftResponse`.

### 2.23. Update Shift Template
- **URL**: `/business/shift-templates/{shiftId}`
- **Method**: `PUT`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Path Variable**:
  - `shiftId`: ID of the shift template
- **Request Body**:
  ```json
  {
    "storeId": 1,
    "name": "Afternoon Shift",
    "startTime": "13:00",
    "endTime": "17:00"
  }
  ```
- **Response Body**: Updated `WorkShiftResponse`.

### 2.24. Delete Shift Template
- **URL**: `/business/shift-templates/{shiftId}`
- **Method**: `DELETE`
- **Path Variable**:
  - `shiftId`: ID of the shift template
- **Response Body**: `204 No Content`

### 2.25. Get QR Payment Code
- **URL**: `/business/qr-payment`
- **Method**: `GET`
- **Response Body**: `QRPaymentResponse` or `204 No Content` if the business owner has not uploaded any QR code yet.

### 2.26. Create QR Payment Code
- **URL**: `/business/qr-payment`
- **Method**: `POST`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "imageName": "vietqr-owner.png",
    "imageType": "image/png"
  }
  ```
- **Response Body**: Created `QRPaymentResponse`.

### 2.27. Update QR Payment Code
- **URL**: `/business/qr-payment`
- **Method**: `PUT`
- **Headers Required**:
  ```http
  Authorization: Bearer <your_jwt_token_here>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "imageName": "vietqr-owner-updated.png",
    "imageType": "image/png"
  }
  ```
- **Response Body**: Updated `QRPaymentResponse`.

### 2.28. Delete QR Payment Code
- **URL**: `/business/qr-payment`
- **Method**: `DELETE`
- **Response Body**: `204 No Content`

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
- **Response**: List of `UserResponse` objects.
- **Sample Response**:
  ```json
  [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "email": "owner@smartbiz.com",
      "phone": "0987654321",
      "fullName": "Nguyen Van A",
      "role": "BUSINESS_OWNER",
      "status": "ACTIVE",
      "salaryType": null,
      "salaryAmount": null,
      "createdAt": "2026-03-20T09:15:00"
    }
  ]
  ```

### 4.2. Update User Status (Lock/Unlock)
- **URL**: `/admin/users/{userId}/status`
- **Method**: `PUT`
- **Path Variable**:
  - `userId`: UUID of the user to update
- **Request Body**:
  ```json
  {
    "status": "INACTIVE"
  }
  ```
- **Allowed `status` values**:
  - `ACTIVE`
  - `INACTIVE`
- **Important Rules**:
  - Only users with role `BUSINESS_OWNER` can be locked/unlocked by this endpoint.
  - If the target user is not a `BUSINESS_OWNER`, the API returns an error.
- **Response**: Updated `UserResponse`.

### 4.3. Get All Stores
- **URL**: `/admin/stores`
- **Method**: `GET`
- **Response**: List of `StoreResponse` objects for all registered stores across the platform.
- **Sample Response**:
  ```json
  [
    {
      "id": 1,
      "name": "SmartBiz Coffee",
      "address": "123 Nguyen Trai, District 1",
      "phone": "0901234567",
      "taxRate": 0.08,
      "openingTime": "08:00:00",
      "closingTime": "22:00:00",
      "ownerId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "ownerName": "Nguyen Van A",
      "ownerEmail": "owner@smartbiz.com",
      "status": "ACTIVE",
      "staffCount": 5,
      "tableCount": 12,
      "createdAt": "2026-03-20T09:15:00"
    }
  ]
  ```

### 4.4. Get Admin Dashboard Welcome Message
- **URL**: `/admin/dashboard`
- **Method**: `GET`
- **Response Body**:
  ```text
  Welcome to Admin Dashboard
  ```

### 4.5. Get Dashboard Statistics
- **URL**: `/admin/dashboard/stats`
- **Method**: `GET`
- **Response**: `DashboardStatsResponse`
- **Sample Response**:
  ```json
  {
    "totalUsers": 25,
    "totalStores": 8,
    "activeUsers": 22,
    "inactiveUsers": 3,
    "newBusinessOwnersThisMonth": 2,
    "businessOwnerTrend": [
      {
        "month": "Oct 2025",
        "count": 1
      },
      {
        "month": "Nov 2025",
        "count": 0
      },
      {
        "month": "Dec 2025",
        "count": 2
      },
      {
        "month": "Jan 2026",
        "count": 1
      },
      {
        "month": "Feb 2026",
        "count": 3
      },
      {
        "month": "Mar 2026",
        "count": 2
      }
    ]
  }
  ```
- **Description**:
  - `totalUsers`: Total number of users in the system
  - `totalStores`: Total number of stores
  - `activeUsers`: Number of users with status `ACTIVE`
  - `inactiveUsers`: Number of users with status `INACTIVE`
  - `newBusinessOwnersThisMonth`: Number of newly registered `BUSINESS_OWNER` users in the current month
  - `businessOwnerTrend`: Monthly `BUSINESS_OWNER` registration data for the last 6 months

### 4.6. Get Store By ID
- **URL**: `/admin/stores/{storeId}`
- **Method**: `GET`
- **Path Variable**:
  - `storeId`: ID of the store
- **Response**: A single `StoreResponse` object.

### 4.7. Delete User
- **URL**: `/admin/users/{userId}`
- **Method**: `DELETE`
- **Path Variable**:
  - `userId`: UUID of the user to delete
- **Response Body**:
  ```text
  User deleted successfully
  ```
- **Important Rules**:
  - `ADMIN` users cannot be deleted.
  - Deleting a user may cascade and remove related data depending on entity relationships.

### 4.8. Get Stores By Business Owner
- **URL**: `/admin/users/{userId}/stores`
- **Method**: `GET`
- **Path Variable**:
  - `userId`: UUID of the business owner
- **Response**: List of `StoreResponse` objects owned by the specified business owner.
- **Important Rules**:
  - The target user must exist.
  - The target user must have role `BUSINESS_OWNER`; otherwise the API returns an error.

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

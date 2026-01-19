# SmartBiz Backend - Authentication API Documentation

## 🔐 Authentication System

SmartBiz sử dụng JWT (JSON Web Token) để authentication và role-based access control (RBAC) để authorization.

---

## 📋 Table of Contents

- [Authentication Flow](#authentication-flow)
- [Roles & Permissions](#roles--permissions)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Testing](#testing)

---

## 🔄 Authentication Flow

1. **Login**: Client gửi email và password đến `/auth/login`
2. **Receive Token**: Server trả về JWT token chứa userId, role, và email
3. **Use Token**: Client gửi token trong header `Authorization: Bearer <token>` cho các requests tiếp theo
4. **Logout**: Client gọi `/auth/logout` và xóa token khỏi storage

---

## 👥 Roles & Permissions

### Role Hierarchy

| Role | Level | Description |
|------|-------|-------------|
| **ADMIN** | 4 | Quản trị viên hệ thống - Full access |
| **BUSINESS_OWNER** | 3 | Chủ cửa hàng - Quản lý cửa hàng và nhân viên |
| **STAFF** | 2 | Nhân viên - Xem ca làm việc và thực hiện công việc |
| **CASHIER** | 1 | Thu ngân - Xử lý đơn hàng và thanh toán |

### Access Control Matrix

| Endpoint Pattern | ADMIN | BUSINESS_OWNER | STAFF | CASHIER |
|-----------------|-------|----------------|-------|---------|
| `/auth/login` | ✅ | ✅ | ✅ | ✅ |
| `/auth/logout` | ✅ | ✅ | ✅ | ✅ |
| `/auth/me` | ✅ | ✅ | ✅ | ✅ |
| `/admin/**` | ✅ | ❌ | ❌ | ❌ |
| `/business/**` | ✅ | ✅ | ❌ | ❌ |
| `/staff/**` | ✅ | ✅ | ✅ | ✅ |

---

## 📡 API Endpoints

### Authentication Endpoints

#### 1. Login

**POST** `/auth/login`

Đăng nhập và nhận JWT token.

**Request Body**:
```json
{
  "email": "admin@smartbiz.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "admin@smartbiz.com",
  "fullName": "Admin User",
  "role": "ADMIN",
  "status": "ACTIVE"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid email or password
- `400 Bad Request`: Validation errors

---

#### 2. Logout

**POST** `/auth/logout`

Đăng xuất (stateless - client phải xóa token).

**Headers**:
```
Authorization: Bearer <your_jwt_token>
```

**Response** (200 OK):
```json
{
  "message": "Logout successful. Please remove the token from client storage.",
  "timestamp": "2026-01-16T09:15:00"
}
```

---

#### 3. Get Current User

**GET** `/auth/me`

Lấy thông tin user hiện tại.

**Headers**:
```
Authorization: Bearer <your_jwt_token>
```

**Response** (200 OK):
```json
{
  "id": 1,
  "email": "admin@smartbiz.com",
  "fullName": "Admin User",
  "role": "ADMIN",
  "status": "ACTIVE",
  "createdAt": "2026-01-15T10:30:00"
}
```

---

### Admin Endpoints (ADMIN only)

#### 1. Get All Users

**GET** `/admin/users`

Lấy danh sách tất cả users trong hệ thống.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "email": "admin@smartbiz.com",
    "fullName": "Admin User",
    "role": "ADMIN",
    "status": "ACTIVE",
    "createdAt": "2026-01-15T10:30:00"
  },
  {
    "id": 2,
    "email": "owner@smartbiz.com",
    "fullName": "Business Owner",
    "role": "BUSINESS_OWNER",
    "status": "ACTIVE",
    "createdAt": "2026-01-15T11:00:00"
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User is not ADMIN

---

#### 2. Admin Dashboard

**GET** `/admin/dashboard`

Admin dashboard endpoint.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Response** (200 OK):
```
Welcome to Admin Dashboard
```

---

### Business Endpoints (ADMIN, BUSINESS_OWNER)

#### 1. Get My Stores

**GET** `/business/stores`

Lấy danh sách stores (ADMIN xem tất cả, BUSINESS_OWNER xem stores của mình).

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "userId": 2,
  "role": "BUSINESS_OWNER",
  "storeCount": 2,
  "stores": [
    {
      "id": 1,
      "name": "SmartBiz Store 1",
      "address": "123 Main St",
      "phone": "0123456789"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User is STAFF or CASHIER

---

#### 2. Business Dashboard

**GET** `/business/dashboard`

Business dashboard endpoint.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```
Welcome to Business Dashboard
```

---

### Staff Endpoints (All authenticated users)

#### 1. Get My Shifts

**GET** `/staff/shifts`

Lấy danh sách ca làm việc của user hiện tại.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "userId": 3,
  "role": "STAFF",
  "shiftCount": 5,
  "shifts": [
    {
      "id": 1,
      "startTime": "2026-01-16T08:00:00",
      "endTime": "2026-01-16T16:00:00",
      "status": "SCHEDULED"
    }
  ]
}
```

---

#### 2. Staff Dashboard

**GET** `/staff/dashboard`

Staff dashboard endpoint.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```
Welcome to Staff Dashboard, STAFF
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "timestamp": "2026-01-16T09:15:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid JWT token",
  "path": "/admin/users"
}
```

### Common Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Validation errors, invalid request format |
| 401 | Unauthorized | Invalid credentials, expired token, missing token |
| 403 | Forbidden | Insufficient permissions for the requested resource |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

### Authentication Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| Invalid email or password | Wrong credentials | Check email and password |
| JWT token has expired | Token expired (>24h) | Login again to get new token |
| Invalid JWT token | Malformed or tampered token | Use valid token or login again |
| You don't have permission to access this resource | Insufficient role | Contact admin for role upgrade |

---

## 🧪 Testing

### Using cURL

#### 1. Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartbiz.com",
    "password": "password123"
  }'
```

#### 2. Get Current User
```bash
curl -X GET http://localhost:8080/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Access Admin Endpoint
```bash
curl -X GET http://localhost:8080/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. Logout
```bash
curl -X POST http://localhost:8080/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. **Import Collection**: Create a new collection "SmartBiz API"
2. **Set Environment Variable**: 
   - Variable: `jwt_token`
   - Initial Value: (empty)
3. **Login Request**:
   - Save token from response to `jwt_token` variable
   - Script: `pm.environment.set("jwt_token", pm.response.json().token);`
4. **Other Requests**:
   - Add header: `Authorization: Bearer {{jwt_token}}`

---

## 🔒 Security Features

- ✅ **BCrypt Password Encoding**: Passwords are hashed with BCrypt (strength 10)
- ✅ **JWT Token**: Stateless authentication with 24-hour expiration
- ✅ **Role-based Access Control**: Fine-grained permissions based on user roles
- ✅ **CSRF Protection**: Disabled for REST API (stateless)
- ✅ **Global Exception Handling**: Consistent error responses
- ✅ **Method-level Security**: `@PreAuthorize` annotations on sensitive endpoints

---

## 📝 JWT Token Structure

### Token Claims

```json
{
  "sub": "admin@smartbiz.com",
  "userId": 1,
  "role": "ADMIN",
  "iat": 1737001200,
  "exp": 1737087600
}
```

### Token Expiration

- **Default**: 24 hours (86400000 milliseconds)
- **Configurable**: Set `jwt.expiration` in `application.properties`

---

## 🚀 Quick Start

1. **Start Application**:
   ```bash
   mvn spring-boot:run
   ```

2. **Create Test Users** (via database):
   ```sql
   INSERT INTO users (email, password, full_name, role, status, created_at) VALUES
   ('admin@smartbiz.com', '$2a$10$...', 'Admin User', 'ADMIN', 'ACTIVE', NOW()),
   ('owner@smartbiz.com', '$2a$10$...', 'Business Owner', 'BUSINESS_OWNER', 'ACTIVE', NOW()),
   ('staff@smartbiz.com', '$2a$10$...', 'Staff User', 'STAFF', 'ACTIVE', NOW()),
   ('cashier@smartbiz.com', '$2a$10$...', 'Cashier User', 'CASHIER', 'ACTIVE', NOW());
   ```

3. **Test Login**:
   ```bash
   curl -X POST http://localhost:8080/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@smartbiz.com", "password": "password123"}'
   ```

---

## 📞 Support

For questions or issues, please contact the development team.

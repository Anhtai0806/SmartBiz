# 🚀 SmartBiz Backend - Complete Guide

## 🎯 Overview

A modern **Java Spring Boot 3.5.x** REST API serving as the administrative and operational core of the **SmartBiz** ecosystem. The project provides robust authentication, role-based access control, restaurant/store management, shift scheduling, order processing, and comprehensive sales reporting.

### Key Features
- **Monolithic Architecture**: Robust and easy to maintain approach structured by feature modules.
- **Spring Data JPA**: Efficient database operations using Hibernate as the JPA provider.
- **Role-Based Access Control (RBAC)**: Secure access mapped to `ADMIN`, `BUSINESS_OWNER`, `STAFF`, `CASHIER`, and `KITCHEN` roles.
- **Stateless Authentication**: JWT-based secure user sessions and API access.
- **Database Agnostic Base**: Configured with MySQL dialect, utilizing `spring.jpa.hibernate.ddl-auto=update` for smooth schema iterations.
- **Comprehensive Error Handling**: Global exception handler with structured error responses mapping.
- **Mail Integration**: Built-in Gmail SMTP support for sending emails (e.g., OTP notifications).

---

## 📋 Requirements

### System Requirements
- **Java 17+** - [Download](https://openjdk.java.net/download/)
- **Maven 3.8+** - [Download](https://maven.apache.org/download.cgi)
- **Git** - [Download](https://git-scm.com/)

### Database Requirements
- **MySQL 8.0+** - [Download](https://www.mysql.com/downloads/)

### IDE (Optional)
- **IntelliJ IDEA** - [Download](https://www.jetbrains.com/idea/)
- **VS Code** - [Download](https://code.visualstudio.com/)
- **Eclipse** - [Download](https://www.eclipse.org/)

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/Anhtai0806/SmartBiz.git
cd SmartBiz/backend
```

### 2. Setup Database (MySQL)
Run the following commands in your MySQL console:
```sql
-- Create database
CREATE DATABASE smartbiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Note: The application uses root user by default in application.properties. 
-- Ensure your root password is set to '0806' or update application.properties accordingly.
```

### 3. Update Database Configuration
Edit `src/main/resources/application.properties` if your credentials differ:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smartbiz?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

---

## 🏗️ Project Structure

```
backend/
├── pom.xml                              # Maven configuration with Spring Boot 3.5.9
├── README.md                            # This file
│
├── src/main/
│   ├── java/com/smartbiz/backend/
│   │   ├── config/                      # Global configurations (Security, CORS, Mail)
│   │   ├── controller/                  # REST Controllers mapped by role/feature
│   │   ├── dto/                         # Data Transfer Objects for API requests/responses
│   │   ├── entity/                      # JPA Entities (User, Store, Order, Invoice, etc.)
│   │   ├── exception/                   # Custom exceptions and GlobalExceptionHandler
│   │   ├── repository/                  # Spring Data JPA Repositories
│   │   ├── service/                     # Business logic layer
│   │   ├── util/                        # Helper classes (e.g., JwtUtil)
│   │   └── BackendApplication.java      # Spring Boot Entry Point
│   │
│   └── resources/
│       └── application.properties       # Application configuration (Database, JWT, Mail)
│
└── target/                              # Build Output (after `mvn package`)
```

---

## 🗄️ Database Schema Synopsis

The database leverages 20 complex JPA entities seamlessly woven together. Key domains include:
- **Identity & Access Management:** `users`, `otp_codes`, `audit_logs`
- **Store Operations:** `stores`, `tables`, `staff_store` (junction table)
- **Product & Menus:** `menu_categories`, `menu_items`
- **Ordering & Fulfillment:** `orders`, `order_items`
- **Shift Management:** `work_shifts`, `staff_shifts`
- **Finance & Billing:** `invoices`, `payment_transactions`, `qr_payment_codes`

*Note: The system leverages Spring Boot's `spring.jpa.hibernate.ddl-auto=update` to automatically create/update tables matching these entities.*

---

## 🔌 API Summary

APIs are protected using JWT token-based authentication and segmented by user role controller maps:

| Module | Core Endpoints | Required Roles | Description |
|--------|----------------|----------------|-------------|
| **Auth** | `/auth/login`, `/auth/me`, `/auth/register` | `PUBLIC`, `ALL` | Identity, login, profile updates. |
| **Admin** | `/admin/users`, `/admin/stores` | `ADMIN` | Superuser management functions. |
| **Business** | `/business/stores`, `/business/dashboard` | `BUSINESS_OWNER` | Owner-level stores/staff management. |
| **Cashier**| `/api/cashier/invoices`, `/api/cashier/orders/today` | `CASHIER`, `BUSINESS_OWNER`| Payment and bill settlement processing. |
| **Staff** | `/api/shifts/my`, `/api/tables` | `STAFF`, Multi-role | Waitstaff operation views and shift data. |
| **Kitchen**| `/api/kitchen/orders/pending` | `KITCHEN`, `BUSINESS_OWNER`| Kitchen order tickets viewing and fulfill. |

*See `api_documentation.md` artifact (if generated via AI) or Swagger/Postman for full request/response payloads.*

### Example Authenticated Request
```bash
curl -X GET http://localhost:8080/auth/me \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Accept: application/json"
```

---

## 🛠️ Build & Run Commands

### Development Mode
```bash
# Clean and run standard Spring Boot app
mvn clean spring-boot:run

# Or compile and package skipping tests for a fast local build
mvn clean package -DskipTests
```

### Production Mode (JAR)
```bash
# Build JAR first
mvn clean package -DskipTests

# Run JAR
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

---

## 🔐 Security Configuration

### JWT Details
The system utilizes the `jjwt` library (`0.12.3`).
- **Secret Key Configured**: `smartbiz-secret-key-for-jwt-token-generation-and-validation-2024`
- **Session Duration**: 24 Hours (`86400000` ms)

### Authentication Mechanism
1. Client requests authentication on `/auth/login`.
2. Controller uses `AuthenticationManager` to validate credentials against the database (`findByEmail` or `findByPhone`).
3. Payload returns a standard `Bearer` token including encoded rules & `User` identifiers.
4. Downstream endpoints use `@PreAuthorize("hasRole('...')")` and `SecurityContextHolder` validation via a custom Jwt filter.

---

## ✉️ Mail Configuration

SmartBiz integrates Gmail SMTP to handle outgoing emails (e.g., verification OTPs).
Current configuration hooks up to:
- **Host**: `smtp.gmail.com`
- **Port**: `587`
- TLS protocol enabled.

*Credentials located down in `application.properties`.*

---

## 🧪 Testing

```bash
# Run all Unit Tests provided by Spring Security Test and Spring Boot Starter Test
mvn test

# Run specific testing phases and build output
mvn verify
```

---

## 👥 Contributors

**Version**: 0.0.1-SNAPSHOT | **Last Updated**: March 2026

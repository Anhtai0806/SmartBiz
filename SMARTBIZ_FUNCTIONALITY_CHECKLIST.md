# 📋 SMARTBIZ - CHECKLIST CÁC CHỨC NĂNG CẦN HOÀN THIỆN

## ✅ ĐÃ HOÀN THÀNH

### 1. Authentication & Authorization
- [x] Đăng nhập / đăng xuất
- [x] JWT-based authentication
- [x] Phân quyền theo role cơ bản (ADMIN, BUSINESS_OWNER, STAFF, CASHIER)
- [x] Two-Factor Authentication (entity fields đã có)
- [x] Account locking sau nhiều lần đăng nhập thất bại

### 2. Quản lý cửa hàng
- [x] CRUD cửa hàng
- [x] 1 owner → N stores
- [x] Multi-tenant cơ bản

### 3. Quản lý nhân viên
- [x] Tạo tài khoản STAFF / CASHIER
- [x] Gán nhân viên vào 1 hoặc nhiều cửa hàng
- [x] Trạng thái: ACTIVE / INACTIVE
- [x] Cập nhật trạng thái nhân viên

### 4. Quản lý ca làm
- [x] Tạo ca theo ngày (StaffShift)
- [x] Shift templates (WorkShift)
- [x] Order gắn với ca làm

### 5. Quản lý menu
- [x] Menu theo cửa hàng
- [x] Danh mục món (MenuCategory)
- [x] CRUD menu items
- [x] Giá, trạng thái bán

### 6. Quản lý bàn
- [x] Tạo bàn theo cửa hàng
- [x] Trạng thái: EMPTY / SERVING / WAITING_PAYMENT / PAID

### 7. Order & Thanh toán
- [x] STAFF tạo order tại bàn
- [x] Order gồm nhiều item
- [x] CASHIER xử lý order
- [x] Thanh toán: CASH / TRANSFER
- [x] Tự động tạo hóa đơn
- [x] Payment transactions tracking

### 8. Audit Log
- [x] Entity AuditLog đã có
- [x] Database table đã có

---

## ❌ CHƯA HOÀN THÀNH - CẦN LÀM

### 🔴 PHASE 1: CÁC CHỨC NĂNG CƠ BẢN CÒN THIẾU

#### 1. Cấu hình cửa hàng (Store Configuration)
**Mô tả:** Mỗi store cần có cấu hình riêng (giờ mở cửa, thuế)

**Backend:**
- [x] Thêm fields vào Store entity:
  - `openingTime` (LocalTime)
  - `closingTime` (LocalTime)
  - `taxRate` (BigDecimal) - % thuế VAT
  - `phone` (String) - số điện thoại cửa hàng
- [x] Tạo migration SQL để thêm các columns
- [x] Cập nhật `CreateStoreRequest` và `UpdateStoreRequest` DTOs
- [x] Cập nhật `StoreResponse` DTO
- [x] Cập nhật `BusinessOwnerService` để xử lý các fields mới

**Frontend:**
- [x] Thêm form fields trong `OwnerStores.jsx` để nhập:
  - Giờ mở cửa / đóng cửa
  - % thuế VAT
  - Số điện thoại cửa hàng
- [x] Hiển thị thông tin cấu hình trong `StoreDetail.jsx`

**Priority:** HIGH

---

#### 2. Hình ảnh cho Menu Items
**Mô tả:** Menu items cần có hình ảnh (theo SRS section 4.5)

**Backend:**
- [ ] Thêm field `imageUrl` (String) vào `MenuItem` entity
- [ ] Tạo migration SQL
- [ ] Cập nhật `MenuItemRequest` và `MenuItemResponse` DTOs
- [ ] Tạo `FileUploadController` để upload ảnh
- [ ] Tích hợp với cloud storage (AWS S3, Cloudinary) hoặc local storage
- [ ] Validation: chỉ chấp nhận file ảnh (jpg, png, webp)

**Frontend:**
- [ ] Thêm input upload ảnh trong form tạo/sửa menu item
- [ ] Hiển thị preview ảnh
- [ ] Hiển thị ảnh trong danh sách menu items

**Priority:** MEDIUM

---

#### 3. Audit Log Service & Controller
**Mô tả:** Entity đã có nhưng chưa có service và controller để sử dụng

**Backend:**
- [ ] Tạo `AuditLogRepository`
- [ ] Tạo `AuditLogService` với các methods:
  - `logAction()` - ghi log hành động
  - `getLogsByUser()` - lấy logs theo user
  - `getLogsByStore()` - lấy logs theo store
  - `getLogsByAction()` - lấy logs theo action type
- [ ] Tạo `AuditLogController` với endpoints:
  - `GET /api/business/audit-logs` - Owner xem logs của stores mình
  - `GET /api/audit-logs?action=ORDER_CANCELLED` - Filter theo action
- [ ] Tích hợp audit logging vào các actions nhạy cảm:
  - Hủy order (`OrderService.cancelOrder()`)
  - Sửa giá menu item (`MenuItemService.updatePrice()`)
  - Mở/đóng ca (`ShiftService`)
  - Đăng nhập thất bại (`AuthService`)
- [ ] Tạo `@Aspect` hoặc interceptor để tự động log các actions

**Frontend:**
- [ ] Tạo page `OwnerAuditLogs.jsx` để owner xem logs của stores
- [ ] Filter theo: user, store, action, date range
- [ ] Export logs ra CSV/Excel

**Priority:** HIGH

---

#### 4. Báo cáo & Dashboard APIs (Backend)
**Mô tả:** Frontend đã có UI nhưng chưa có backend APIs

**Backend:**
- [x] Tạo `ReportService` với các methods:
  - `getRevenueReport()` - Doanh thu theo ngày/tháng/năm
  - `getTopProducts()` - Top sản phẩm bán chạy
  - `getStoreComparison()` - So sánh giữa các cửa hàng
  - `getStaffPerformance()` - Hiệu suất nhân viên
- [x] Tạo `ReportController` với endpoints:
  - `GET /api/business/reports/revenue?startDate=&endDate=&storeId=`
  - `GET /api/business/reports/top-products?storeId=&limit=10&startDate=&endDate=`
  - `GET /api/business/reports/store-comparison?startDate=&endDate=`
  - `GET /api/business/reports/staff-performance?storeId=&startDate=&endDate=`
- [x] Tạo các DTOs:
  - `RevenueReportResponse`
  - `TopProductResponse`
  - `StoreComparisonResponse`
  - `StaffPerformanceResponse`

**Frontend:**
- [x] Kết nối `OwnerReports.jsx` với backend APIs
- [x] Thay thế mock data bằng real data
- [x] Tích hợp Chart.js hoặc Recharts để vẽ biểu đồ
- [x] Implement export PDF/Excel (sử dụng jsPDF, xlsx)

**Priority:** HIGH

---

### 🟡 PHASE 2: QUẢN LÝ KHO & NGUYÊN VẬT LIỆU

#### 5. Quản lý nguyên vật liệu (Ingredients)
**Mô tả:** Quản lý kho nguyên liệu, định mức theo món, tự động trừ kho

**Backend:**
- [ ] Tạo entity `Ingredient`:
  ```java
  - id (Long)
  - storeId (Long)
  - name (String)
  - unit (String) - đơn vị: kg, lít, cái, ...
  - quantity (BigDecimal) - số lượng hiện tại
  - minQuantity (BigDecimal) - tồn kho tối thiểu
  - status (ACTIVE/INACTIVE)
  ```
- [ ] Tạo entity `RecipeItem` (many-to-many):
  ```java
  - menuItemId (Long)
  - ingredientId (Long)
  - amount (BigDecimal) - số lượng nguyên liệu cần cho 1 món
  ```
- [ ] Tạo migration SQL:
  ```sql
  CREATE TABLE ingredients (...)
  CREATE TABLE recipe_items (...)
  ```
- [ ] Tạo `IngredientRepository`
- [ ] Tạo `RecipeItemRepository`
- [ ] Tạo `IngredientService` với CRUD operations
- [ ] Tạo `IngredientController`:
  - `GET /api/business/stores/{storeId}/ingredients`
  - `POST /api/business/stores/{storeId}/ingredients`
  - `PUT /api/business/ingredients/{id}`
  - `DELETE /api/business/ingredients/{id}`
- [ ] Tạo `RecipeService` để quản lý công thức:
  - `addRecipeItem()` - thêm nguyên liệu vào món
  - `getRecipeByMenuItem()` - lấy công thức của món
  - `updateRecipeItem()` - cập nhật định mức
- [ ] Tự động trừ kho khi order được thanh toán:
  - Trong `InvoiceService.createInvoice()`, sau khi tạo invoice thành công
  - Tính toán số lượng nguyên liệu cần trừ dựa trên order items
  - Trừ kho và ghi log
  - Cảnh báo nếu tồn kho < minQuantity

**Frontend:**
- [ ] Kết nối `OwnerInventory.jsx` với backend APIs
- [ ] Tạo page `OwnerIngredients.jsx` để quản lý nguyên liệu
- [ ] Tạo page `OwnerRecipes.jsx` để quản lý công thức món
- [ ] Hiển thị cảnh báo tồn kho thấp
- [ ] Thêm notification khi tồn kho < minQuantity

**Priority:** HIGH

---

#### 6. Cảnh báo tồn kho thấp
**Mô tả:** Hệ thống tự động cảnh báo khi tồn kho < minQuantity

**Backend:**
- [ ] Tạo scheduled job (Spring @Scheduled) để check tồn kho mỗi giờ
- [ ] Tạo `InventoryAlertService`:
  - `checkLowStock()` - kiểm tra tồn kho thấp
  - `getLowStockItems()` - lấy danh sách items sắp hết
- [ ] Tạo endpoint:
  - `GET /api/business/stores/{storeId}/inventory/alerts`
- [ ] Tích hợp với notification system (email, push notification)

**Frontend:**
- [ ] Hiển thị badge số lượng cảnh báo trong dashboard
- [ ] Tạo notification panel để hiển thị alerts
- [ ] Auto-refresh alerts mỗi 5 phút

**Priority:** MEDIUM

---

### 🟢 PHASE 3: QUẢN LÝ KHÁCH HÀNG & TÍCH ĐIỂM

#### 7. Quản lý khách hàng
**Mô tả:** Lưu thông tin khách hàng, tích điểm

**Backend:**
- [ ] Tạo entity `Customer`:
  ```java
  - id (Long)
  - phone (String) - unique
  - name (String)
  - email (String) - optional
  - address (String) - optional
  - points (Integer) - điểm tích lũy
  - totalSpent (BigDecimal) - tổng chi tiêu
  - createdAt (LocalDateTime)
  ```
- [ ] Tạo migration SQL
- [ ] Tạo `CustomerRepository`
- [ ] Tạo `CustomerService` với CRUD
- [ ] Tạo `CustomerController`:
  - `GET /api/business/customers?phone=&name=`
  - `POST /api/business/customers`
  - `PUT /api/business/customers/{id}`
  - `GET /api/business/customers/{id}/history` - lịch sử mua hàng
- [ ] Tích hợp vào Order:
  - Thêm field `customerId` (nullable) vào `Order` entity
  - Khi tạo invoice, nếu có customer thì:
    - Cộng điểm (ví dụ: 1 điểm = 1000 VNĐ)
    - Cập nhật totalSpent
- [ ] Tạo `LoyaltyProgramService`:
  - Cấu hình tỷ lệ tích điểm (configurable)
  - Tính điểm thưởng
  - Đổi điểm thành voucher/giảm giá

**Frontend:**
- [ ] Tạo page `OwnerCustomers.jsx` để quản lý khách hàng
- [ ] Tìm kiếm khách hàng theo phone/name
- [ ] Hiển thị lịch sử mua hàng của khách
- [ ] Hiển thị điểm tích lũy
- [ ] Thêm field chọn khách hàng khi tạo order (optional)

**Priority:** MEDIUM

---

### 🔵 PHASE 4: PHÂN QUYỀN NÂNG CAO (RBAC)

#### 8. RBAC mở rộng - Thêm các role mới
**Mô tả:** Thêm các role: STORE_MANAGER, BARISTA, WAITER, GUARD, INVENTORY

**Backend:**
- [ ] Cập nhật `Role` enum:
  ```java
  ADMIN, BUSINESS_OWNER, STORE_MANAGER, STAFF, CASHIER, 
  BARISTA, WAITER, GUARD, INVENTORY
  ```
- [ ] Tạo migration SQL để update ENUM
- [ ] Cập nhật `SecurityConfig` để xử lý các role mới
- [ ] Tạo `Permission` enum:
  ```java
  VIEW, CREATE, UPDATE, DELETE, APPROVE, EXPORT
  ```
- [ ] Tạo entity `RolePermission` (many-to-many):
  ```java
  - role (Role)
  - permission (Permission)
  - resource (String) - ORDER, MENU, INVENTORY, ...
  ```
- [ ] Tạo `PermissionService` để check quyền
- [ ] Tạo custom `@PreAuthorize` expressions:
  - `@HasPermission("ORDER", "CREATE")`
  - `@HasPermission("MENU", "UPDATE")`
- [ ] Cập nhật các controllers để sử dụng permission-based authorization

**Frontend:**
- [ ] Cập nhật role selection trong form tạo nhân viên
- [ ] Hiển thị/ẩn các chức năng dựa trên permission
- [ ] Tạo permission matrix UI cho admin

**Priority:** MEDIUM

---

#### 9. Permission System (Không hard-code quyền)
**Mô tả:** Hệ thống permission động, có thể cấu hình

**Backend:**
- [ ] Tạo table `permissions`:
  ```sql
  CREATE TABLE permissions (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50),
    resource VARCHAR(50),
    action VARCHAR(50)
  );
  ```
- [ ] Tạo table `role_permissions`:
  ```sql
  CREATE TABLE role_permissions (
    role VARCHAR(50),
    permission_id BIGINT,
    PRIMARY KEY (role, permission_id)
  );
  ```
- [ ] Tạo entities và repositories
- [ ] Tạo `PermissionService` để load permissions từ DB
- [ ] Cache permissions để tăng performance
- [ ] Tạo admin endpoints để quản lý permissions:
  - `GET /api/admin/permissions`
  - `POST /api/admin/roles/{role}/permissions`
  - `DELETE /api/admin/roles/{role}/permissions/{permissionId}`

**Frontend:**
- [ ] Tạo page `AdminPermissions.jsx` để cấu hình permissions
- [ ] Drag & drop interface để assign permissions cho roles

**Priority:** LOW (có thể làm sau)

---

### 🟣 PHASE 5: MULTI-TENANT NÂNG CAO

#### 10. Multi-tenant filtering enforcement
**Mô tả:** Đảm bảo mọi query đều filter theo store_id

**Backend:**
- [ ] Tạo `@TenantFilter` annotation
- [ ] Tạo `TenantFilterInterceptor` để tự động thêm `WHERE store_id = ?` vào mọi query
- [ ] Kiểm tra tất cả repositories:
  - Đảm bảo mọi method đều có `storeId` parameter hoặc filter
  - Test để đảm bảo user không thể truy cập dữ liệu của store khác
- [ ] Tạo unit tests cho multi-tenant security
- [ ] Document multi-tenant best practices

**Priority:** HIGH (Security critical)

---

### 🟠 PHASE 6: AI & ANALYTICS (Optional)

#### 11. AI Phân tích dữ liệu
**Mô tả:** Phân tích doanh thu, top món, gợi ý lịch làm

**Backend:**
- [ ] Tạo `AnalyticsService`:
  - `predictRevenue()` - dự đoán doanh thu
  - `recommendMenuItems()` - gợi ý món nên bán
  - `optimizeStaffSchedule()` - gợi ý lịch làm tối ưu
- [ ] Tích hợp với AI service (OpenAI API, TensorFlow, hoặc custom ML model)
- [ ] Tạo endpoints:
  - `GET /api/business/analytics/revenue-forecast`
  - `GET /api/business/analytics/menu-recommendations`
  - `GET /api/business/analytics/schedule-optimization`

**Frontend:**
- [ ] Tạo page `OwnerAnalytics.jsx` với AI insights
- [ ] Hiển thị predictions và recommendations
- [ ] Interactive charts với AI annotations

**Priority:** LOW (Optional, Phase 3 theo SRS)

---

### 🔧 CẢI THIỆN & TỐI ƯU

#### 12. Export Reports (PDF/Excel)
**Mô tả:** Xuất báo cáo ra file

**Backend:**
- [ ] Tích hợp Apache POI để export Excel
- [ ] Tích hợp iText hoặc Apache PDFBox để export PDF
- [ ] Tạo `ExportService`:
  - `exportRevenueReportToExcel()`
  - `exportRevenueReportToPDF()`
  - `exportTopProductsToExcel()`
- [ ] Endpoints:
  - `GET /api/business/reports/export/excel?type=revenue&startDate=&endDate=`
  - `GET /api/business/reports/export/pdf?type=revenue&startDate=&endDate=`

**Frontend:**
- [ ] Implement download buttons trong `OwnerReports.jsx`
- [ ] Show loading state khi export
- [ ] Handle file download

**Priority:** MEDIUM

---

#### 13. Real-time Updates (WebSocket)
**Mô tả:** Cập nhật real-time cho orders, tables

**Backend:**
- [ ] Tích hợp WebSocket (Spring WebSocket)
- [ ] Tạo `OrderUpdateController` để broadcast order updates
- [ ] Tạo `TableUpdateController` để broadcast table status changes
- [ ] Tích hợp với frontend để auto-refresh

**Frontend:**
- [ ] Kết nối WebSocket
- [ ] Auto-refresh order list khi có order mới
- [ ] Auto-update table status

**Priority:** LOW

---

#### 14. Image Upload & Storage
**Mô tả:** Upload và lưu trữ ảnh menu items

**Backend:**
- [ ] Tích hợp AWS S3 hoặc Cloudinary
- [ ] Tạo `FileStorageService`:
  - `uploadImage()` - upload ảnh
  - `deleteImage()` - xóa ảnh
  - `getImageUrl()` - lấy URL ảnh
- [ ] Validation: file size, file type
- [ ] Image optimization (resize, compress)

**Frontend:**
- [ ] Drag & drop image upload
- [ ] Image preview
- [ ] Progress bar khi upload

**Priority:** MEDIUM (liên quan đến feature #2)

---

## 📊 TỔNG KẾT

### Theo Priority:

**HIGH Priority (Cần làm ngay):**
1. ✅ Cấu hình cửa hàng (giờ mở cửa, thuế)
2. ✅ Audit Log Service & Controller
3. ✅ Báo cáo & Dashboard APIs
4. ✅ Quản lý nguyên vật liệu (Ingredients)
5. ✅ Multi-tenant filtering enforcement

**MEDIUM Priority:**
6. ✅ Hình ảnh cho Menu Items
7. ✅ Cảnh báo tồn kho thấp
8. ✅ Quản lý khách hàng
9. ✅ Export Reports (PDF/Excel)
10. ✅ Image Upload & Storage

**LOW Priority (Có thể làm sau):**
11. ✅ RBAC mở rộng
12. ✅ Permission System động
13. ✅ Real-time Updates
14. ✅ AI & Analytics

---

## 📝 NOTES

- **Database Migrations:** Tất cả thay đổi database cần tạo migration files trong `backend/src/main/resources/db/migration/`
- **Testing:** Mỗi feature mới cần có unit tests và integration tests
- **Documentation:** Cập nhật API documentation (Swagger/OpenAPI) cho mỗi endpoint mới
- **Security:** Đảm bảo tất cả endpoints đều có proper authorization checks
- **Performance:** Cân nhắc caching cho các queries thường xuyên (reports, dashboard stats)

---

**Last Updated:** 2026-01-22
**Status:** In Progress


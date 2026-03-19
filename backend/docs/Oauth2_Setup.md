# 🔐 OAuth2 Login (Google) - Frontend Guide

## 📌 Overview

OAuth2 login **KHÔNG phải REST API thuần**.  
Frontend sẽ sử dụng **redirect flow** thay vì gọi API bằng `fetch/axios`.

👉 Flow tổng quát:

1. Redirect user → Backend  
2. Backend → Google login  
3. Google → Backend callback  
4. Backend → Redirect về Frontend (kèm token)  
5. Frontend xử lý token  

---

## 🚀 Full Flow

### 🔹 Step 1: Redirect user đến backend

Frontend chỉ cần redirect:

```js
window.location.href = "http://localhost:8080/oauth2/authorization/google";
```

👉 Không dùng `axios` hay `fetch`

---

### 🔹 Step 2: User login với Google

- Backend tự động redirect sang Google  
- Người dùng đăng nhập  
- Frontend không cần xử lý gì  

---

### 🔹 Step 3: Backend redirect về frontend

#### ✅ Success

http://localhost:3000/owner/dashboard?token=...&role=...&email=...&userId=...&fullName=...&storeId=1

#### ❌ Failure

http://localhost:3000/owner/dashboard?error=OAuth2%20login%20failed

---

## 📦 Query Parameters

| Param     | Description |
|----------|------------|
| token    | JWT token |
| role     | User role |
| email    | User email |
| userId   | User UUID |
| fullName | Display name |
| storeId  | Store ID (có thể null) |
| error    | Error message (nếu login fail) |

---

## 🧠 Frontend Handling (QUAN TRỌNG)

Frontend cần:

1. Lấy query params từ URL  
2. Lưu token  
3. Redirect user  

---

### ✅ Example (React)

```js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function OAuth2Handler() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const role = params.get("role");
    const error = params.get("error");

    if (token) {
      localStorage.setItem("token", token);

      if (role === "BUSINESS_OWNER") {
        navigate("/owner/dashboard");
      } else {
        navigate("/");
      }
    } else if (error) {
      console.error("OAuth2 Error:", error);
      navigate("/login");
    }
  }, []);

  return <div>Logging in...</div>;
}

export default OAuth2Handler;
```

---

## 🔐 Sau khi login

Frontend cần thêm header cho các API protected:

Authorization: Bearer <token>

---

## ⚠️ Lưu ý quan trọng

- OAuth2 **không dùng REST API trực tiếp**  
- Luôn dùng `window.location.href`  
- Token nằm trong URL → cần xử lý ngay  
- Nên:
  - Xoá query params sau khi xử lý (optional)  
  - Hoặc redirect sang URL sạch  

---

## ✨ Best Practice (Khuyến nghị nâng cấp)

Hiện tại flow:

Backend → redirect → token nằm trên URL  

👉 Cách tốt hơn:

1. Backend redirect về:

/oauth2/callback?code=abc123  

2. Frontend gọi API:

POST /auth/oauth2/exchange  

3. Backend trả token JSON  

👉 Ưu điểm:
- An toàn hơn  
- Chuẩn OAuth2 hơn  
- Dễ mở rộng  

---

## 🎯 Kết luận

Frontend chỉ cần nhớ:

- Redirect đi  
- Nhận token từ URL  
- Lưu token  
- Redirect user  

👉 Done ✅

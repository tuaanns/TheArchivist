# GOM API - API Documentation

## Base URL

```
Dev: http://localhost:8000/api
Prod: https://api.gom.vn/api
```

## Authentication

Laravel Sanctum với Bearer Token.

Headers:
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

Get token: Login hoặc Register

## Response Format

Success:
```json
{
  "success": true,
  "message": "OK",
  "data": {...}
}
```

Error:
```json
{
  "success": false,
  "message": "Error message",
  "error_code": "ERROR_CODE",
  "data": null
}
```

## Public Endpoints

### GET /api/health

Health check.

Response:
```json
{
  "success": true,
  "message": "OK",
  "data": {"status": "healthy"}
}
```

### POST /api/register

Đăng ký tài khoản.

Request:
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

Validation:
- name: required, string, max:255
- email: required, email, unique
- password: required, min:8, confirmed

Response:
```json
{
  "user": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "token_balance": 0,
    "free_predictions_used": 0
  },
  "token": "1|abc123..."
}
```

### POST /api/login

Đăng nhập.

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "token_balance": 10.5,
    "free_predictions_used": 5
  },
  "token": "2|xyz789..."
}
```

Error (401):
```json
{
  "success": false,
  "message": "Sai tài khoản hoặc mật khẩu",
  "error_code": "UNAUTHORIZED"
}
```

### POST /api/login/social

Google OAuth.

Request:
```json
{
  "provider": "google",
  "credential": "eyJhbGciOiJSUzI1NiIs...",
  "clientId": "xxxxx.apps.googleusercontent.com"
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "token_balance": 0,
    "free_predictions_used": 0,
    "avatar": "https://lh3.googleusercontent.com/..."
  },
  "token": "3|google123..."
}
```

### GET /api/ceramic-lines

Danh sách dòng gốm.

Query params:
- country (optional)
- is_featured (optional): true/false
- per_page (optional): default 15

Response:
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Gốm Celadon",
        "origin": "Thanh Hóa",
        "country": "Việt Nam",
        "era": "Thế kỷ 11-16",
        "description": "Gốm men ngọc...",
        "image_url": "https://...",
        "style": "Men ngọc",
        "is_featured": true
      }
    ],
    "total": 10
  }
}
```

### GET /api/ceramic-lines/{id}

Chi tiết dòng gốm.

### GET /api/stats

Thống kê.

Response:
```json
{
  "success": true,
  "data": {
    "total_analyzed": 1234,
    "accuracy": 99.2
  }
}
```

### POST /api/contact

Form liên hệ.

Request:
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "subject": "Câu hỏi",
  "message": "Tôi muốn hỏi..."
}
```

## Authenticated Endpoints

Cần Bearer Token trong header.

### GET /api/user

Thông tin user hiện tại.

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "token_balance": 10.5,
    "free_predictions_used": 5,
    "avatar": "https://...",
    "phone": "0123456789"
  }
}
```

### POST /api/logout

Đăng xuất.

### POST /api/profile/update

Cập nhật profile.

Request: multipart/form-data
- name
- phone
- avatar (file)

### POST /api/profile/password

Đổi mật khẩu.

Request:
```json
{
  "current_password": "oldpass",
  "password": "newpass",
  "password_confirmation": "newpass"
}
```

### POST /api/predict

Phân tích gốm sứ.

Request: multipart/form-data
- image (file)

Cost: 1 token (hoặc 1 lượt free nếu còn)

Response:
```json
{
  "success": true,
  "data": {
    "prediction_id": 123,
    "image": "https://...",
    "final_prediction": "Gốm Celadon Việt Nam",
    "country": "Việt Nam",
    "era": "Thế kỷ 15-16",
    "confidence": 0.88,
    "result_json": {...}
  }
}
```

Error (402):
```json
{
  "success": false,
  "message": "Bạn đã hết 5 lượt miễn phí. Vui lòng nạp thêm.",
  "error_code": "PAYMENT_REQUIRED",
  "data": {
    "free_used": 5,
    "token_balance": 0
  }
}
```

### POST /api/ai/chat

Chat với AI.

Request:
```json
{
  "question": "Gốm Celadon có đặc điểm gì?"
}
```

Cost: 0.1 token

Response:
```json
{
  "success": true,
  "data": {
    "answer": "Gốm Celadon là loại gốm có men màu xanh ngọc...",
    "sources": ["Kiến thức chuyên gia AI", "Wikipedia"]
  }
}
```

### GET /api/history

Lịch sử phân tích.

Query params:
- page (optional)
- per_page (optional): default 10

Response:
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 123,
        "image": "https://...",
        "final_prediction": "Gốm Celadon Việt Nam",
        "country": "Việt Nam",
        "era": "Thế kỷ 15-16",
        "created_at": "2026-04-27T10:30:00Z"
      }
    ],
    "total": 50
  }
}
```

### GET /api/history/{id}

Chi tiết 1 phân tích.

### GET /api/payment/status

Trạng thái token.

Response:
```json
{
  "success": true,
  "data": {
    "token_balance": 10.5,
    "free_predictions_used": 5,
    "free_predictions_remaining": 0
  }
}
```

### GET /api/payment/packages

Danh sách gói.

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Gói Basic",
      "price": 50000,
      "credits": 10,
      "description": "10 lượt phân tích"
    },
    {
      "id": 2,
      "name": "Gói Pro",
      "price": 100000,
      "credits": 25
    },
    {
      "id": 3,
      "name": "Gói Premium",
      "price": 200000,
      "credits": 60
    }
  ]
}
```

### POST /api/payment/create

Tạo thanh toán.

Request:
```json
{
  "package_id": 1
}
```

Response:
```json
{
  "success": true,
  "data": {
    "payment_id": 456,
    "hex_id": "A1B2C3",
    "package_name": "Gói Basic",
    "amount_vnd": 50000,
    "credit_amount": 10,
    "status": "pending",
    "expired_at": "2026-04-27T10:45:00Z",
    "bank_info": {
      "bank_code": "MB",
      "account_number": "1234567890",
      "account_name": "NGUYEN VAN A",
      "transfer_content": "A1B2C3"
    }
  }
}
```

### GET /api/payment/check/{paymentId}

Kiểm tra trạng thái thanh toán.

Response:
```json
{
  "success": true,
  "data": {
    "payment_id": 456,
    "status": "completed",
    "credit_amount": 10,
    "completed_at": "2026-04-27T10:35:00Z"
  }
}
```

### GET /api/payment/history

Lịch sử thanh toán.

## Admin Endpoints

Yêu cầu admin role.

### GET /api/admin/dashboard

Dashboard stats.

### GET /api/admin/users

Danh sách users.

### PUT /api/admin/users/{id}

Cập nhật user.

### DELETE /api/admin/users/{id}

Xóa user.

### GET /api/admin/ceramic-lines

Quản lý ceramic lines.

### POST /api/admin/ceramic-lines

Tạo ceramic line.

### PUT /api/admin/ceramic-lines/{id}

Cập nhật ceramic line.

### DELETE /api/admin/ceramic-lines/{id}

Xóa ceramic line.

### GET /api/admin/payments

Danh sách payments.

### GET /api/admin/predictions

Danh sách predictions.

## Azure Blob Storage

### POST /api/v1/storage/azure-blob/upload/single

Upload 1 file.

Request: multipart/form-data
- file
- folder (optional)

Response:
```json
{
  "success": true,
  "data": {
    "url": "https://storage.azure.com/gom-uploads/predictions/file123.jpg"
  }
}
```

### POST /api/v1/storage/azure-blob/upload/multiple

Upload nhiều files.

### DELETE /api/v1/storage/azure-blob/delete/single

Xóa 1 file.

## Error Codes

| Code | Description |
|------|-------------|
| UNAUTHORIZED | Sai email/password hoặc token không hợp lệ |
| PAYMENT_REQUIRED | Hết lượt free và không đủ token |
| VALIDATION_ERROR | Dữ liệu đầu vào không hợp lệ |
| NOT_FOUND | Resource không tồn tại |
| SERVER_ERROR | Lỗi server |
| AI_SERVICE_ERROR | Lỗi từ AI service |

## Rate Limiting

- Public: 60 requests/minute
- Authenticated: 120 requests/minute
- Admin: 200 requests/minute

## Testing

```bash
# Register
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123","password_confirmation":"password123"}'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Get user
curl http://localhost:8000/api/user \
  -H "Authorization: Bearer YOUR_TOKEN"

# Predict
curl -X POST http://localhost:8000/api/predict \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@pottery.jpg"
```

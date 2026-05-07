# GOM API - Laravel Backend

Backend API cho hệ thống giám định gốm sứ GOM. Laravel 12 + Sanctum token authentication + Aiven MySQL.

## Tính năng

- **Authentication**: Email/Password, Google OAuth (One-Tap), forgot/reset password
- **AI Predict**: Gọi Python AI service (`gom-ai`) để phân tích ảnh gốm sứ
- **AI Chat**: Chat với AI chuyên gia gốm sứ
- **Token System**: 5 lượt free, sau đó mua credits qua SePay
- **Payment**: Tích hợp SePay QR payment gateway
- **Ceramic Lines**: Quản lý catalog dòng gốm sứ (CRUD)
- **Admin Dashboard**: Thống kê, quản lý users/ceramics/payments/predictions/token history
- **Azure Blob Storage**: Upload/delete/move files
- **Contact Form**: Gửi email qua SMTP

## Tech Stack

- **Laravel 12** (PHP 8.2+)
- **Sanctum** (Bearer token authentication)
- **MySQL 8.0+** (Aiven cloud hoặc local)
- **Azure Blob Storage** (lưu trữ file)
- **SePay** (payment gateway)
- **Gom AI** (Python FastAPI — gọi qua HTTP)

## Yêu cầu

- PHP 8.2+
- Composer 2.x
- MySQL 8.0+ (hoặc SQLite cho dev nhanh)

## Cài đặt

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
```

Seed dữ liệu mẫu (tùy chọn):
```bash
php artisan db:seed                              # Chỉ seed users
php artisan db:seed --class=CeramicLineSeeder    # Seed catalog gốm
php artisan db:seed --class=PredictionSeeder      # Seed predictions (cần AI server)
```

## Cấu hình

File `.env`:

```env
APP_NAME="GOM API"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=your-host
DB_PORT=3306
DB_DATABASE=gom
DB_USERNAME=your-user
DB_PASSWORD=your-password

FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000

PYTHON_AI_URL=http://localhost:8001

AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=xxx;AccountKey=xxx
AZURE_STORAGE_CONTAINER=gom-uploads

GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

SEPAY_API_KEY=xxxxx
SEPAY_ACCOUNT_NUMBER=1234567890
SEPAY_ACCOUNT_NAME=NGUYEN VAN A
SEPAY_BANK_CODE=MB

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

## Chạy server

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Server: http://localhost:8000

## API Endpoints

### Public (không cần auth)

```
GET   /api/health                     # Health check
GET   /api/ceramic-lines              # Danh sách dòng gốm
GET   /api/ceramic-lines/{id}         # Chi tiết dòng gốm
GET   /api/stats                      # Thống kê công khai
POST  /api/contact                    # Gửi form liên hệ
POST  /api/register                   # Đăng ký tài khoản
POST  /api/login                      # Đăng nhập
POST  /api/login/social               # Đăng nhập Google OAuth
POST  /api/forgot-password            # Quên mật khẩu
POST  /api/reset-password             # Đặt lại mật khẩu
GET   /api/img/{path}                 # Proxy đọc ảnh từ storage
```

### Authenticated (cần Bearer token)

```
GET   /api/user                       # Thông tin user hiện tại
POST  /api/logout                     # Đăng xuất
POST  /api/profile/update             # Cập nhật profile
POST  /api/profile/password           # Đổi mật khẩu

POST  /api/predict                    # Phân tích gốm sứ (1 token)
POST  /api/ai/debate                  # Alias cho /predict
POST  /api/ai/chat                    # Chat với AI (0.1 token)
GET   /api/history                    # Lịch sử phân tích
GET   /api/history/{id}               # Chi tiết một prediction

GET   /api/payment/status             # Số dư token hiện tại
GET   /api/payment/packages           # Danh sách gói nạp
GET   /api/payment/history            # Lịch sử giao dịch
POST  /api/payment/create             # Tạo thanh toán mới
GET   /api/payment/check/{id}         # Kiểm tra trạng thái thanh toán

POST  /api/v1/storage/azure-blob/upload/single
POST  /api/v1/storage/azure-blob/upload/multiple
DELETE /api/v1/storage/azure-blob/delete/single
DELETE /api/v1/storage/azure-blob/delete/multiple
PUT   /api/v1/storage/azure-blob/move/single
PUT   /api/v1/storage/azure-blob/move/multiple
```

### Admin (cần Bearer token + role admin)

```
GET    /api/admin/dashboard            # Thống kê tổng quan
GET    /api/admin/users                # Danh sách users (search, filter)
GET    /api/admin/users/{id}           # Chi tiết user
PUT    /api/admin/users/{id}           # Cập nhật user (role, status)
DELETE /api/admin/users/{id}           # Xóa user

GET    /api/admin/ceramic-lines        # Danh sách dòng gốm (search, filter)
GET    /api/admin/ceramic-lines/{id}   # Chi tiết dòng gốm
POST   /api/admin/ceramic-lines        # Thêm dòng gốm
PUT    /api/admin/ceramic-lines/{id}   # Cập nhật dòng gốm
DELETE /api/admin/ceramic-lines/{id}   # Xóa dòng gốm

GET    /api/admin/payments             # Danh sách thanh toán (filter)
GET    /api/admin/payments/{id}        # Chi tiết thanh toán

GET    /api/admin/predictions          # Danh sách predictions (filter)
GET    /api/admin/predictions/{id}     # Chi tiết prediction + AI debate data

GET    /api/admin/token-history        # Lịch sử token (filter by user, type, date)
```

### Dev-only (APP_ENV=local/testing)

```
POST  /api/payment/test-complete/{id}  # Test hoàn thành thanh toán
```

## Database

| Table | Mô tả |
|---|---|
| `users` | name, email, password, role, token_balance, free_predictions_used, avatar, phone |
| `predictions` | user_id, image, final_prediction, country, era, result_json (full AI debate) |
| `payments` | user_id, package_id, amount_vnd, credit_amount, hex_id, status, sepay_tx_id |
| `token_history` | user_id, type (predict/chat/purchase/bonus), amount, description |
| `ceramic_lines` | name, origin, country, era, description, image_url, style, is_featured |
| `potteries` | Legacy table (giữ lại cho backward compat) |
| `personal_access_tokens` | Sanctum token storage |

Chi tiết: `docs/database.md`

## Token System

| Hành động | Chi phí |
|---|---|
| Predict (phân tích ảnh) | 1 token |
| Chat (hỏi AI) | 0.1 token |
| Free cho user mới | 5 lượt predict |

Gói nạp token qua SePay:

| Gói | Giá | Tokens |
|---|---|---|
| Basic | 50,000 VNĐ | 10 tokens |
| Pro | 100,000 VNĐ | 25 tokens |
| Premium | 200,000 VNĐ | 60 tokens |

## Troubleshooting

| Vấn đề | Giải pháp |
|---|---|
| Class not found | `composer dump-autoload` |
| Permission denied | `chmod -R 775 storage bootstrap/cache` |
| CORS error | Kiểm tra `FRONTEND_URL` trong `.env` |
| 500 trên contact | Cấu hình SMTP trong `.env` |
| Token không trừ | Kiểm tra `token_balance` trong DB |

## Deployment

```bash
APP_ENV=production
APP_DEBUG=false

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
php artisan migrate --force
```

## Tài liệu bổ sung

- `docs/database.md` — Schema chi tiết
- `docs/api.md` — API documentation đầy đủ

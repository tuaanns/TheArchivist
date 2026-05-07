# GOM API - Database Schema

## Overview

SQLite (dev) hoặc MySQL (prod). Laravel Eloquent ORM.

## ERD

```
users
├─ predictions
├─ payments
└─ token_history

ceramic_lines (standalone)
potteries (legacy)
personal_access_tokens (Sanctum)
```

## Tables

### users

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255),
    token_balance DECIMAL(10,1) DEFAULT 0,
    free_predictions_used INT DEFAULT 0,
    avatar VARCHAR(255) NULL,
    phone VARCHAR(255) NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

Columns:
- id: Primary key
- name: Tên người dùng
- email: Email (unique)
- password: Hashed với bcrypt
- token_balance: Số token còn lại (1 token = 1 prediction)
- free_predictions_used: Số lượt miễn phí đã dùng (max 5)
- avatar: URL avatar (Azure Blob)
- phone: Số điện thoại

Relationships:
- hasMany predictions
- hasMany payments
- hasMany token_history

Business rules:
- 5 lượt miễn phí (free_predictions_used < 5)
- Sau đó phải mua token (token_balance > 0)
- 1 prediction = 1 token
- 1 chat = 0.1 token

### predictions

```sql
CREATE TABLE predictions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    image VARCHAR(255),
    final_prediction VARCHAR(255) NULL,
    country VARCHAR(255) NULL,
    era VARCHAR(255) NULL,
    result_json JSON NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Columns:
- user_id: Foreign key → users.id
- image: URL ảnh gốm sứ (Azure Blob)
- final_prediction: Kết luận (VD: "Gốm Celadon Việt Nam")
- country: Quốc gia
- era: Niên đại (VD: "Thế kỷ 15-16")
- result_json: Kết quả đầy đủ từ AI

result_json structure:
```json
{
  "visual_features": {...},
  "agent_predictions": [...],
  "final_report": {...}
}
```

### payments

```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    package_id INT,
    package_name VARCHAR(255),
    amount_vnd DECIMAL(12,0),
    credit_amount INT,
    hex_id VARCHAR(20) UNIQUE,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    sepay_tx_id VARCHAR(255) NULL,
    expired_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Columns:
- package_id: ID gói (1=Basic, 2=Pro, 3=Premium)
- package_name: Tên gói
- amount_vnd: Số tiền VNĐ
- credit_amount: Số token nhận được
- hex_id: Mã thanh toán unique (6 ký tự hex)
- status: pending, completed, failed
- sepay_tx_id: Transaction ID từ SePay
- expired_at: Hết hạn sau 15 phút

Payment packages:
```php
[
    ['id' => 1, 'name' => 'Gói Basic', 'price' => 50000, 'credits' => 10],
    ['id' => 2, 'name' => 'Gói Pro', 'price' => 100000, 'credits' => 25],
    ['id' => 3, 'name' => 'Gói Premium', 'price' => 200000, 'credits' => 60],
]
```

Payment flow:
1. User chọn gói → Create payment (status=pending, hex_id=random)
2. User chuyển khoản với nội dung = hex_id
3. SePay webhook → Update payment (status=completed)
4. Add tokens to user.token_balance
5. Create token_history record

### token_history

```sql
CREATE TABLE token_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    type ENUM('in', 'out'),
    amount DECIMAL(10,1),
    description VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Columns:
- type: 'in' (nạp), 'out' (tiêu)
- amount: Số lượng token
- description: Mô tả (VD: "Mua gói Basic", "Phân tích gốm sứ")

Sample records:
```
| type | amount | description              |
|------|--------|--------------------------|
| in   | 10.0   | Mua gói Basic            |
| out  | 1.0    | Phân tích gốm sứ         |
| out  | 0.1    | Chat với AI              |
```

### ceramic_lines

```sql
CREATE TABLE ceramic_lines (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    origin VARCHAR(255),
    country VARCHAR(255),
    era VARCHAR(255) NULL,
    description TEXT NULL,
    image_url VARCHAR(255) NULL,
    style VARCHAR(255) NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

Columns:
- name: Tên dòng gốm (VD: "Gốm Celadon")
- origin: Địa phương (VD: "Thanh Hóa")
- country: Quốc gia
- era: Niên đại (VD: "Thế kỷ 11-16")
- description: Mô tả chi tiết
- image_url: URL ảnh (Azure Blob)
- style: Phong cách (VD: "Men ngọc", "Hoa lam")
- is_featured: Hiển thị trang chủ

Sample data:
```
| name           | origin      | country   | era           | style      |
|----------------|-------------|-----------|---------------|------------|
| Gốm Celadon    | Thanh Hóa   | Việt Nam  | Thế kỷ 11-16  | Men ngọc   |
| Gốm Chu Đậu    | Hải Dương   | Việt Nam  | Thế kỷ 15-16  | Hoa lam    |
| Gốm Bát Tràng | Hà Nội      | Việt Nam  | Thế kỷ 14-nay | Đa dạng    |
```

### potteries (Legacy)

```sql
CREATE TABLE potteries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NULL,
    image_path TEXT,
    predicted_label VARCHAR(255) NULL,
    country VARCHAR(255) NULL,
    era VARCHAR(255) NULL,
    confidence FLOAT NULL,
    debate_data JSON NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

Note: Bảng cũ, đang được thay thế bởi predictions. Giữ lại để không mất dữ liệu.

### personal_access_tokens

```sql
CREATE TABLE personal_access_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tokenable_type VARCHAR(255),
    tokenable_id BIGINT,
    name VARCHAR(255),
    token VARCHAR(64) UNIQUE,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX tokenable (tokenable_type, tokenable_id)
);
```

Laravel Sanctum tokens cho authentication.

## Migrations

```
database/migrations/
├── 0001_01_01_000000_create_users_table.php
├── 2026_04_03_090451_create_predictions_table.php
├── 2026_04_06_000001_add_token_system_to_users.php
├── 2026_04_06_000002_create_payments_table.php
├── 2026_04_06_000003_create_token_history_table.php
├── 2026_04_10_000001_create_ceramic_lines_table.php
└── ...
```

Run migrations:
```bash
php artisan migrate
php artisan migrate:rollback
php artisan migrate:fresh
```

## Queries

Get user with token balance:
```php
$user = User::find($id);
echo $user->token_balance;
echo $user->free_predictions_used;
```

Get prediction history:
```php
$predictions = Prediction::where('user_id', $userId)
    ->orderBy('created_at', 'desc')
    ->paginate(10);
```

Get payment history:
```php
$payments = Payment::where('user_id', $userId)
    ->where('status', 'completed')
    ->orderBy('created_at', 'desc')
    ->get();
```

Get token history:
```php
$history = TokenHistory::where('user_id', $userId)
    ->orderBy('created_at', 'desc')
    ->get();
```

Get featured ceramic lines:
```php
$featured = CeramicLine::where('is_featured', true)->get();
```

Check if user can predict:
```php
$user = User::find($id);
$freeUsed = $user->free_predictions_used ?? 0;
$balance = $user->token_balance ?? 0;

$canPredict = ($freeUsed < 5) || ($balance >= 1.0);
```

## Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_hex_id ON payments(hex_id);
CREATE INDEX idx_token_history_user_id ON token_history(user_id);
CREATE INDEX idx_ceramic_lines_country ON ceramic_lines(country);
CREATE INDEX idx_ceramic_lines_featured ON ceramic_lines(is_featured);
```

## Backup & Restore

SQLite:
```bash
cp database/database.sqlite database/backup_$(date +%Y%m%d).sqlite
cp database/backup_20260427.sqlite database/database.sqlite
```

MySQL:
```bash
mysqldump -u root -p gom_db > backup_$(date +%Y%m%d).sql
mysql -u root -p gom_db < backup_20260427.sql
```

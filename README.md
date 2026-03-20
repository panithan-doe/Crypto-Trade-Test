# Crypto Trade Test

## ER Diagram
<img width="907" height="710" alt="image" src="https://github.com/user-attachments/assets/e668a090-e83a-4067-a573-8d4b37e03da7" />

Draw.io Link: https://drive.google.com/file/d/11b49f1BYJMOuYe9xutpNmwP9_NbzmjzW/view?usp=sharing


## Installation

```bash
# 1. Clone repository
git clone https://github.com/panithan-doe/Crypto-Trade-Test.git
cd crypto-test

# 2. Install dependencies
npm install

# 3. Run migrations & seeder
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# 5. Start server
node app.js
```

Server will run on `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users | สร้างบัญชีผู้ใช้ (User) |
| POST | /api/orders | สร้าง Order ตั้งซื้อ/ขาย |
| POST | /api/trades | สร้างการ Trade order |
| POST | /api/transfers | โอนเงิน/เหรียญ (ภายในระบบ/ออกนอกระบบ) |

## API Examples

### 1. สร้าง User
```http
POST /api/users
Content-Type: application/json

{
  "username": "john",
  "email": "john@test.com",
  "password_hash": "hashed_password"
}
```

### 2. สร้าง Order (ตั้งขาย)
```http
POST /api/orders
Content-Type: application/json

{
  "user_id": 1,
  "side": "SELL",
  "crypto_currency": "BTC",
  "fiat_currency": "THB",
  "price": 2000000,
  "total_amount": 5
}
```

### 3. สร้าง Trade (ซื้อจาก Order)
```http
POST /api/trades
Content-Type: application/json

{
  "order_id": 1,
  "buyer_id": 2,
  "seller_id": 1,
  "amount": 0.5
}
```

### 4. โอนเงินภายในระบบ (Internal)
```http
POST /api/transfers
Content-Type: application/json

{
  "sender_id": 1,
  "receiver_id": 2,
  "currency": "THB",
  "amount": 100000,
  "type": "INTERNAL"
}
```

### 5. โอนเงินออกนอกระบบ (External)
```http
POST /api/transfers
Content-Type: application/json

{
  "sender_id": 1,
  "currency": "BTC",
  "amount": 1,
  "type": "EXTERNAL"
}
```

## การเช็ค Data
* VSCode: SQLite Viewer extension


## Seed Data

ระบบมี seed data สำหรับทดสอบ:

| User | Username | Wallet THB | Wallet BTC |
|------|----------|------------|------------|
| 1 | User A | 5,000,000 | 10 |
| 2 | User B | 10,000,000 | 0 |

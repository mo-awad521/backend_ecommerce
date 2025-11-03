---
🛍️ E-commerce Backend API

A fully featured E-commerce backend built with Node.js, Express.js, Prisma ORM, and MySQL, following clean MVC architecture.
Supports Authentication, Role-based Authorization, Products, Orders, Payments, Wishlist, and Admin Dashboard.
---

🚀 Features

👤 User & Authentication

User registration & login with JWT.

Role-based authorization (Customer, Admin).

Manage multiple shipping addresses per user.

Password hashing with bcrypt.

📦 Product & Category Management

Full CRUD operations for products & categories.

Automatic slug generation for SEO-friendly URLs.

Multiple product images (Multer + Cloudinary).

Filtering, searching, and pagination.

Admin-only access for managing products.

🛒 Cart & Wishlist

Personal cart for each user (add, update, remove items).

Wishlist system to save favorite products.

📑 Orders & Workflow

Create orders directly from cart.

Track order lifecycle:

PENDING → PAID → SHIPPED → DELIVERED → COMPLETED

Support for CANCELED / RETURNED.

Order history per user.

💳 Payments

Payments linked to orders.

Track payment status:

PENDING, SUCCESS, FAILED, REFUNDED, DISPUTED.

Admin can view & filter payments.

🛠️ Admin Dashboard

User Management: View users, change roles, delete users.

Product Management: Add/edit/delete products & categories.

Order Management: Update order statuses.

Payments Management: View all payments by status.

Reports Dashboard:

Total users.

Total orders + breakdown by status.

Total revenue from successful payments.

Top-selling products.

---

🛠️ Tech Stack

Node.js + Express.js

MySQL + Prisma ORM

JWT Authentication

Multer + Cloudinary (file uploads)

bcrypt (password hashing)

MVC + Services + Middleware architecture

---

📂 Project Structure

src/
├── controllers/ # Request handlers
├── services/ # Business logic
├── routes/ # API routes
├── middlewares/ # Auth, validation, error handling
├── utils/ # Custom response, helpers
├── config/ # DB connection, env config
└── prisma/ # Prisma schema & seed

---

⚡ Getting Started

1. Clone repository

git clone https://github.com/mo-awad521/backend_ecommerce_mvc
cd backend_ecommerce_mvc

2. Install dependencies

```
npm install

```

3. Setup environment

Create .env file:

DATABASE_URL="mysql://user:password@localhost:3306/ecommerce"
JWT_SECRET="your_jwt_secret"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
FRONTEND_URL= Frontend_Url
EMAIL_USER=-----
EMAIL_PASS=----

4. Migrate & Seed Database

```
npx prisma migrate dev
npx prisma db seed

```

5. Run server

```
npm run dev

```

---

📬 API Documentation

Import the Postman collection provided in /docs/postman_collection.json.

Includes examples for:

User Auth

Products

Cart

Orders

Payments

Admin Reports

---

📊 Example Dashboard Response

{
"users": { "total": 35 },
"orders": {
"total": 120,
"byStatus": [
{ "status": "PENDING", "_count": { "status": 20 } },
{ "status": "SHIPPED", "_count": { "status": 30 } },
{ "status": "DELIVERED", "_count": { "status": 70 } }
]
},
"sales": { "totalRevenue": "15500.00" },
"topProducts": [
{ "id": 1, "title": "iPhone 15", "price": "1200.00", "totalSold": 25 },
{ "id": 2, "title": "MacBook Pro", "price": "2200.00", "totalSold": 10 }
]
}

---

📌 Author

👤 Mohammad Alawad

GitHub: @mo-awad521

---

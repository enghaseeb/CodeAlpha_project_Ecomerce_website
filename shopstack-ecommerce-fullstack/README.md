# ShopStack — Full-Stack E-Commerce

## Stack

Frontend:
- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing

## Features

- Product catalog
- Search
- Category filtering
- Product details
- Register/login
- JWT authentication
- Persistent shopping cart
- Quantity updates
- Stock validation
- Checkout
- Cash on Delivery
- Order creation
- Order history
- Responsive UI

## Setup

### 1. Install Node.js and MongoDB

Make sure MongoDB is running locally.

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Copy `.env.example` to `.env` and set:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopstack
JWT_SECRET=use_a_long_random_secret_here
```

### 4. Seed products

```bash
npm run seed
```

### 5. Start

```bash
npm start
```

Open:

http://localhost:5000

## Important

This is a portfolio/learning e-commerce application. It intentionally uses Cash on Delivery instead of a real payment gateway. For production, add:
- Stripe/JazzCash/EasyPaisa integration
- Admin authentication and dashboard
- Image upload/storage
- Email verification
- Password reset
- Rate limiting
- Input validation library
- HTTPS
- Secure cookies
- Production database
- Payment webhooks
- Order management
- Inventory transactions

# PetPooja+ Smart Restaurant Management Platform

A complete restaurant POS system with React.js, Node.js/Express, MongoDB, and Socket.IO.

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017`)

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs at `http://localhost:5000`

### 2. Frontend Setup  
```bash
cd frontend
npm install
npm start
```
Frontend runs at `http://localhost:3000`

### 3. Login
Open `http://localhost:3000` and login with:
- **Admin:** admin@test.com / admin123
- **Kitchen:** kitchen@test.com / kitchen123
- **Cashier:** cashier@test.com / cashier123
- **Manager:** manager@test.com / manager123

Demo data (menu items, inventory, users) auto-seeds on first run.

## Features
| Feature | Description |
|---------|-------------|
| JWT Auth | 4 roles: Admin, Manager, Cashier, Kitchen Staff |
| Dashboard | Live sales, orders, low stock alerts, AI predictions |
| Menu CRUD | Variants, toppings, image upload, categories |
| Orders | Dine-in, takeaway, delivery with cart system |
| Kitchen Display | Realtime Socket.IO with 3 columns & sound alerts |
| Inventory | Stock tracking, auto-deduction, low stock alerts |
| QR Ordering | Scan QR → Menu → Place order → Kitchen sees it |
| Customer CRM | Loyalty points, order history, search |
| Reports | Daily sales, top items, cancelled orders charts |
| AI Prediction | 30-day demand analysis with tomorrow's forecast |

## Tech Stack
- **Frontend:** React.js, Axios, Socket.IO Client, Chart.js, React Router
- **Backend:** Node.js, Express.js, Mongoose, JWT, Socket.IO, Multer
- **Database:** MongoDB

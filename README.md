# MERN Stack Classic ERP – Inventory & Sales Management System

A production-grade, highly-modular Mini ERP application designed to manage inventory and sales workflows using the MERN stack with TypeScript. 

---

## 🔐 Credentials & Access Control

### Role Matrix & DB-Driven Permissions
The application implements **Dynamic Role & Permission Management** stored directly in MongoDB. Endpoints are authenticated via JWT and authorized dynamically based on the DB permissions of the logged-in user's role:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` | Full Access (Can create/read/update/delete products, create/read sales, read dashboard, and manage roles) |
| **Manager** | `manager@example.com` | `manager123` | `products:create`, `products:read`, `products:update`, `sales:create`, `sales:read`, `dashboard:read` |
| **Employee** | `employee@example.com` | `employee123` | `products:read`, `sales:create`, `sales:read`, `dashboard:read` |

---

## 🌟 Implemented Features

1. **Dynamic Role & Permission Console**: Admin console page (`/admin/roles`) mapping user profiles to roles, and editing permissions mapping grid dynamically in real-time.
2. **Modular Feature-Based Architecture**: Self-contained module divisions (`auth`, `products`, `sales`, `dashboard`) across both backend and frontend layers.
3. **Generic Query Builder**: Reusable database utility managing regex searches, comparison range filters, sorting, select fields, and pagination metadata.
4. **Local Static Uploads**: Statically serves files locally. Uploads saved to the local filesystem under `/uploads` folder, with host URLs computed dynamically.
5. **Real-time WebSockets (Socket.io)**: Broadcasts updates on checkout completion, refreshing data widgets and lists instantly across connected panels.
6. **Reports & Margins Dashboard**: Analytics console showing asset valuation ledger spreads and an interactive bar chart of top-selling products.
7. **Modernized UI Layouts**: Collapsible sidebar, profile dropdown cards, password hide/show eye buttons, and interactive credentials auto-fillers.

---

## 📂 Project Structure

```text
Classic_ERP/
├── backend/                  # Node.js + Express + Mongoose API
│   ├── src/
│   │   ├── config/           # Database, Sockets, and Swagger configurations
│   │   ├── middlewares/      # Authentication, File Uploads, and Global Error handlers
│   │   ├── shared/           # Cross-cutting concerns (errors, responses, queryBuilder)
│   │   └── features/         # Feature-based business domains (auth, products, sales, dashboard)
│   ├── tsconfig.json
│   ├── package.json
│   └── .env
└── frontend/                 # Vite + React + TypeScript SPA client
    ├── src/
    │   ├── components/       # Shared UI (Sidebar layout wrapper)
    │   ├── context/          # Global state contexts (AuthContext, SocketContext)
    │   ├── services/         # Axios API clients
    │   └── features/         # Feature-based pages, hooks, types, APIs
    ├── index.html
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Setup & Installation Guide

### Prerequisites
- Node.js (v18+)
- npm
- A MongoDB Connection String (Atlas or local Replica Set)

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file (see `.env` template below):
   ```env
   PORT=8000
   MONGO_URI="your-mongodb-connection-string"
   JWT_SECRET="classic_erp_jwt_secret_key_987654321"
   JWT_EXPIRES_IN="1d"
   NODE_ENV="development"
   ```

3. Seed the database with permissions, roles, users, 20 products, and 5 sales:
   ```bash
   npm run seed
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   *The API will start and bind to `http://localhost:8000`.*
   *API documentation will be available at `http://localhost:8000/api-docs`.*

---

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```
   *The client will start and be available locally at `http://localhost:3000`.*

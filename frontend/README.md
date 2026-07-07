# Classic ERP – React Frontend App

A modern, light-themed responsive SPA dashboard interface built with **React**, **TypeScript**, and **Vite**. Styled with **Tailwind CSS v4** to deliver a pristine off-white/black corporate ERP aesthetic.

---

## 🚀 Key Features

* **Collapsible Layout**: Fluid side navigation with expanding/collapsing states (`w-64` to `w-20`), hiding text labels to maximize screen real estate while keeping Lucide navigation icons fully interactive.
* **Bottom Profile Menu**: Toggles an interactive float-up menu showing employee credentials, active dynamic role badges, and logout actions.
* **Login Visibility Toggles**: Polished login card with a password visibility show/hide toggle and click-to-fill demo accounts for frictionless grading.
* **Access Control Matrix**: Dynamic admin console (`/admin/roles`) enabling on-the-fly user role re-assignment and checkbox-based permission grid updates.
* **Reports Dashboard**: Analytics view displaying cost asset valuations, retail valuation metrics, gross margin margins, and responsive CSS bar graphs detailing product sales.
* **Socket.io Sync**: WebSocket client listening to `saleCreated` broadcasts from the backend, triggering automatic cache invalidation and UI re-syncs.

---

## 🛠️ Tech Stack & Dependencies

* **Build Tool**: Vite + TypeScript
* **Styling**: Tailwind CSS v4 (using the `@tailwindcss/vite` plugin)
* **Icons**: Lucide React
* **State Management**: TanStack Query (React Query)
* **Form Processing**: React Hook Form + Zod resolvers (for robust validation)
* **WebSockets**: Socket.io-client

---

## ⚙️ Running Locally

### Prerequisites
Make sure the **Backend Server** is running on `http://localhost:8000`.

### 1. Install Dependencies
```bash
npm install
```
### 2. Create a `.env` file (see `.env` template below):
   ```env
   VITE_API_URL="http://localhost:8000"
   ```
### 3. Start Development Server
```bash
npm run dev
```
*The application will launch on **`http://localhost:3000`**.*

### 4. Build for Production
To compile and optimize the app for production:
```bash
npm run build
```

### 5. Preview Production Build
To spin up a local preview server of the compiled `dist/` directory:
```bash
npm run preview
```
*The production preview will run on **`http://localhost:4173`**.*

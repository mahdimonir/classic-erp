import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { AuthProvider } from "./context/AuthContext"
import { SocketProvider } from "./context/SocketContext"
import ProtectedLayout from "./components/ProtectedLayout"
import Login from "./features/auth/pages/Login"
import Dashboard from "./features/dashboard/pages/Dashboard"
import Products from "./features/products/pages/Products"
import Sales from "./features/sales/pages/Sales"
import Reports from "./features/dashboard/pages/Reports"
import Roles from "./features/auth/pages/Roles"


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          {}
          <Toaster position="top-right" richColors closeButton />

          <Router>
            <Routes>
              {}
              <Route path="/login" element={<Login />} />

              {}
              <Route path="/" element={<ProtectedLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="sales" element={<Sales />} />
                <Route path="reports" element={<Reports />} />
                <Route path="admin/roles" element={<Roles />} />
              </Route>

              {}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

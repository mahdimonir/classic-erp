import React, { useState } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { Menu } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import Sidebar from "./Sidebar"

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 relative">
      {}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
        />
      )}

      {}
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:hidden shrink-0">
          <span className="text-sm font-bold tracking-tight text-slate-900">
            CLASSIC<span className="font-light text-slate-500">ERP</span>
          </span>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
          >
            <Menu size={20} />
          </button>
        </header>

        {}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default ProtectedLayout

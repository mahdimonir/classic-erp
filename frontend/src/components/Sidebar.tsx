import React, { useState } from "react"
import { NavLink } from "react-router-dom"
import { LayoutDashboard, ShoppingCart, Package, LogOut, ChevronLeft, ChevronRight, Settings, BarChart3, X } from "lucide-react"
import { useAuth } from "../context/AuthContext"

interface SidebarProps {
  isMobileOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onClose }) => {
  const { user, logout, hasPermission } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      show: hasPermission("dashboard:read"),
    },
    {
      name: "Products",
      path: "/products",
      icon: Package,
      show: hasPermission("products:read"),
    },
    {
      name: "Sales",
      path: "/sales",
      icon: ShoppingCart,
      show: hasPermission("sales:read"),
    },
    {
      name: "Reports",
      path: "/reports",
      icon: BarChart3,
      show: hasPermission("dashboard:read"),
    },
    {
      name: "Access Control",
      path: "/admin/roles",
      icon: Settings,
      show: hasPermission("roles:manage"),
    },
  ]

  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <aside
      className={`bg-white border-r border-slate-200 h-screen flex flex-col justify-between transition-all duration-300 z-50
        fixed lg:static inset-y-0 left-0
        ${isMobileOpen ? "translate-x-0 w-60" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-16" : "lg:w-52"}
      `}
    >
      {}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute top-4 -right-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 w-6 h-6 rounded-full items-center justify-center cursor-pointer shadow-xs hover:shadow-sm z-10"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div>
        {}
        <div className={`h-16 flex items-center border-b border-slate-200 px-5 justify-between transition-all`}>
          <div className="flex items-center">
            {isCollapsed ? (
              <span className="text-lg font-black text-slate-900 tracking-wider">C.E</span>
            ) : (
              <span className="text-lg font-bold tracking-tight text-slate-900">
                CLASSIC<span className="font-light text-slate-500">ERP</span>
              </span>
            )}
          </div>
          {}
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {}
        <nav className="px-3 py-6 space-y-1">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.name : ""}
                  onClick={onClose} 
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                      isCollapsed ? "lg:justify-center" : ""
                    } ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span className={`${isCollapsed ? "lg:hidden" : "block"}`}>{item.name}</span>
                </NavLink>
              )
            })}
        </nav>
      </div>

      {}
      <div className="p-3 border-t border-slate-200 relative">
        {user && (
          <div>
            {}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 transition-colors text-left cursor-pointer ${
                isCollapsed ? "lg:justify-center" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(user.name)}
              </div>
              <div className={`overflow-hidden flex-1 ${isCollapsed ? "lg:hidden" : "block"}`}>
                <h4 className="text-xs font-semibold text-slate-900 truncate leading-tight">{user.name}</h4>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                  {user.role}
                </span>
              </div>
            </button>

            {}
            {isDropdownOpen && (
              <div
                className={`absolute bottom-16 bg-white border border-slate-200 rounded-md shadow-lg p-4 z-50 transition-all ${
                  isCollapsed ? "lg:left-4 lg:w-52" : "left-3 right-3"
                }`}
              >
                <div className="border-b border-slate-100 pb-3 mb-3">
                  <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{user.email}</p>
                  <span className="inline-block px-1.5 py-0.5 mt-2 text-[9px] font-bold tracking-wider bg-slate-100 text-slate-700 uppercase rounded-sm border border-slate-200">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors text-left cursor-pointer"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar

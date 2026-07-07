import React, { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Package, ShoppingCart, DollarSign, AlertTriangle, FileText, User, Calendar } from "lucide-react"
import API from "../../../services/api"
import { useSocket } from "../../../context/SocketContext"
import CollapsibleSection from "../../../components/CollapsibleSection"
import { StatsSkeleton, ListSkeleton } from "../../../components/Skeleton"

interface IProduct {
  _id: string
  name: string
  sku: string
  category: string
  stockQuantity: number
}

interface IStats {
  totalProducts: number
  totalSales: number
  totalRevenue: number
  lowStockCount: number
  lowStockProducts: IProduct[]
}

interface ISaleItem {
  product: {
    name: string
  }
  quantity: number
  price: number
}

interface ISale {
  _id: string
  products: ISaleItem[]
  grandTotal: number
  soldBy: {
    name: string
  }
  createdAt: string
}

const Dashboard: React.FC = () => {
  const queryClient = useQueryClient()
  const socket = useSocket()

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery<IStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await API.get("/dashboard/stats")
      return response.data?.data
    },
  })

  
  const {
    data: recentSales,
    isLoading: salesLoading,
    isError: salesError,
  } = useQuery<any>({
    queryKey: ["recentSalesDashboard"],
    queryFn: async () => {
      const response = await API.get("/sales", {
        params: { page: 1, limit: 5 },
      })
      return response.data?.data
    },
  })

  
  useEffect(() => {
    if (!socket) return

    const handleSaleCreated = () => {
      console.log("WebSocket saleCreated received. Refreshing Dashboard...")
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] })
      queryClient.invalidateQueries({ queryKey: ["recentSalesDashboard"] })
    }

    socket.on("saleCreated", handleSaleCreated)

    return () => {
      socket.off("saleCreated", handleSaleCreated)
    }
  }, [socket, queryClient])

  if (statsLoading || salesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time business performance indicators, inventory warnings, and cash flows</p>
        </div>
        <StatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ListSkeleton rows={3} />
          </div>
          <div className="lg:col-span-5">
            <ListSkeleton rows={3} />
          </div>
        </div>
      </div>
    )
  }

  if (statsError || salesError || !stats) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
        Failed to fetch dashboard metrics or transaction logs.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time business performance indicators, inventory warnings, and cash flows</p>
      </div>

      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-md shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Products</span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{stats.totalProducts}</h3>
          </div>
          <div className="p-2 sm:p-2.5 bg-slate-100 rounded-sm text-slate-700 shrink-0">
            <Package size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-md shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Transactions</span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{stats.totalSales}</h3>
          </div>
          <div className="p-2 sm:p-2.5 bg-slate-100 rounded-sm text-slate-700 shrink-0">
            <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-md shadow-xs flex items-center justify-between">
          <div className="min-w-0 overflow-hidden">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue</span>
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 truncate">৳{stats.totalRevenue.toFixed(0)}</h3>
          </div>
          <div className="p-2 sm:p-2.5 bg-slate-100 rounded-sm text-slate-700 shrink-0">
            <DollarSign size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>

        <div
          className={`border p-4 sm:p-6 rounded-md shadow-xs flex items-center justify-between transition-colors ${
            stats.lowStockCount > 0
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <div className="min-w-0">
            <span
              className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
                stats.lowStockCount > 0 ? "text-red-500" : "text-slate-400"
              }`}
            >
              Low Stock
            </span>
            <h3 className="text-xl sm:text-2xl font-bold mt-1">{stats.lowStockCount}</h3>
          </div>
          <div
            className={`p-2 sm:p-2.5 rounded-sm shrink-0 ${
              stats.lowStockCount > 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
            }`}
          >
            <AlertTriangle size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {}
        <CollapsibleSection
          className="lg:col-span-7 h-fit"
          title="Inventory Alerts"
          defaultOpen={true}
          badge={
            stats.lowStockCount > 0 ? (
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-red-100 text-red-800 rounded-sm border border-red-200">
                {stats.lowStockCount} Need Action
              </span>
            ) : null
          }
        >
          {stats.lowStockProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              All product inventories are healthy.
            </div>
          ) : (
            <>
              {}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Product Name</th>
                      <th className="px-6 py-3">SKU</th>
                      <th className="px-6 py-3 text-right">Available Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {stats.lowStockProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{product.name}</td>
                        <td className="px-6 py-4 text-slate-500">{product.sku}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-sm border ${
                            product.stockQuantity === 0
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}>
                            {product.stockQuantity === 0 ? "Out of Stock" : `${product.stockQuantity} Left`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {}
              <div className="block sm:hidden divide-y divide-slate-100">
                {stats.lowStockProducts.map((product) => (
                  <div key={product._id} className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">{product.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">{product.sku}</p>
                    </div>
                    <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-sm border shrink-0 ${
                      product.stockQuantity === 0
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}>
                      {product.stockQuantity === 0 ? "Out of Stock" : `${product.stockQuantity} Left`}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CollapsibleSection>

        {}
        <CollapsibleSection
          className="lg:col-span-5 h-fit"
          title={
            <span className="flex items-center gap-2">
              <FileText size={15} className="text-slate-500" />
              Recent Sales Feed
            </span>
          }
          defaultOpen={true}
        >
          {!recentSales || recentSales.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No transactions processed yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentSales.map((sale: ISale) => (
                <div key={sale._id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 font-mono">#{sale._id.slice(-8)}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        <Calendar size={10} />
                        {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-900">৳{sale.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-slate-600 border-t border-dashed border-slate-200 pt-2 space-y-1">
                    {sale.products.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="truncate max-w-[160px]">
                          {item.product?.name || "Deleted Product"}{" "}
                          <span className="text-slate-400 font-medium">x{item.quantity}</span>
                        </span>
                        <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 border-t border-slate-100 pt-2 uppercase tracking-wide">
                    <User size={9} />
                    Cashier: {sale.soldBy?.name || "System"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

      </div>
    </div>
  )
}

export default Dashboard

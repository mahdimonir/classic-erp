import React from "react"
import { useQuery } from "@tanstack/react-query"
import { TrendingUp, DollarSign, Archive } from "lucide-react"
import API from "../../../services/api"
import CollapsibleSection from "../../../components/CollapsibleSection"
import { StatsSkeleton, ListSkeleton } from "../../../components/Skeleton"

interface IProduct {
  _id: string
  name: string
  sku: string
  category: string
  purchasePrice: number
  sellingPrice: number
  stockQuantity: number
}

interface ISaleItem {
  product: IProduct
  quantity: number
  price: number
}

interface ISale {
  _id: string
  products: ISaleItem[]
  grandTotal: number
  createdAt: string
}

const Reports: React.FC = () => {
  
  const { data: products, isLoading: productsLoading } = useQuery<IProduct[]>({
    queryKey: ["reportsProducts"],
    queryFn: async () => {
      const res = await API.get("/products", { params: { limit: 100 } })
      return res.data?.data
    },
  })

  
  const { data: sales, isLoading: salesLoading } = useQuery<ISale[]>({
    queryKey: ["reportsSales"],
    queryFn: async () => {
      const res = await API.get("/sales", { params: { limit: 100 } })
      return res.data?.data
    },
  })

  if (productsLoading || salesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Reports &amp; Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Detailed breakdown of margins, stock valuations, and product velocity</p>
        </div>
        {}
        <StatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <ListSkeleton rows={3} />
          </div>
          <div className="lg:col-span-6">
            <ListSkeleton rows={3} />
          </div>
        </div>
      </div>
    )
  }

  

  
  const stockAssetValuation = products?.reduce((sum, p) => sum + p.purchasePrice * p.stockQuantity, 0) || 0
  const stockRetailValuation = products?.reduce((sum, p) => sum + p.sellingPrice * p.stockQuantity, 0) || 0

  
  const totalRevenue = sales?.reduce((sum, s) => sum + s.grandTotal, 0) || 0
  
  
  let totalCostOfGoodsSold = 0
  sales?.forEach((sale) => {
    sale.products.forEach((item) => {
      
      const purchasePrice = item.product?.purchasePrice || 0
      totalCostOfGoodsSold += purchasePrice * item.quantity
    })
  })

  const totalGrossProfit = totalRevenue - totalCostOfGoodsSold
  const profitMarginPercent = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0

  
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {}
  sales?.forEach((sale) => {
    sale.products.forEach((item) => {
      if (item.product) {
        const prodId = item.product._id
        if (!productSalesMap[prodId]) {
          productSalesMap[prodId] = {
            name: item.product.name,
            qty: 0,
            revenue: 0,
          }
        }
        productSalesMap[prodId].qty += item.quantity
        productSalesMap[prodId].revenue += item.price * item.quantity
      }
    })
  })

  const productSalesList = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 5)
  const maxQtySold = productSalesList.length > 0 ? Math.max(...productSalesList.map((p) => p.qty)) : 1

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Reports &amp; Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Detailed breakdown of margins, stock valuations, and product velocity</p>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-md shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Valuation</span>
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 truncate">৳{stockAssetValuation.toFixed(0)}</h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Cost: ৳{stockAssetValuation.toFixed(0)}<br className="sm:hidden" /> Retail: ৳{stockRetailValuation.toFixed(0)}
            </p>
          </div>
          <div className="p-2 sm:p-2.5 bg-slate-100 rounded-sm text-slate-700 shrink-0 ml-2">
            <Archive size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-md shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Profit</span>
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 truncate">৳{totalGrossProfit.toFixed(0)}</h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Margin: {profitMarginPercent.toFixed(1)}%</p>
          </div>
          <div className="p-2 sm:p-2.5 bg-emerald-50 rounded-sm text-emerald-700 border border-emerald-100 shrink-0 ml-2">
            <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-md shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 truncate">৳{totalRevenue.toFixed(0)}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Sum of all completed invoices</p>
          </div>
          <div className="p-2 sm:p-2.5 bg-slate-100 rounded-sm text-slate-700 shrink-0 ml-2">
            <DollarSign size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {}
        <CollapsibleSection
          className="lg:col-span-6"
          title="Top Selling Products"
          defaultOpen={true}
          badge={
            productSalesList.length > 0 ? (
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm">
                Top {productSalesList.length}
              </span>
            ) : null
          }
        >
          {productSalesList.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No sales logged yet. Complete sales to populate charts.
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-4">
              {productSalesList.map((item, idx) => {
                const widthPercent = (item.qty / maxQtySold) * 100
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 gap-2">
                      <span className="truncate">{item.name}</span>
                      <span className="shrink-0">
                        {item.qty} units <span className="text-slate-400 font-normal">(৳{item.revenue.toFixed(0)})</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-6 rounded-sm overflow-hidden flex">
                      <div
                        style={{ width: `${widthPercent}%` }}
                        className="bg-slate-900 h-full transition-all duration-500 ease-out"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CollapsibleSection>

        {}
        <CollapsibleSection
          className="lg:col-span-6"
          title="Product Margins Ledger"
          defaultOpen={true}
          badge={
            products && products.length > 0 ? (
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm">
                {Math.min(products.length, 10)} items
              </span>
            ) : null
          }
        >
          {!products || products.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No catalog products available.
            </div>
          ) : (
            <>
              {}
              <div className="hidden sm:block overflow-x-auto max-h-[300px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-2">Product Name</th>
                      <th className="px-4 py-2 text-right">Cost</th>
                      <th className="px-4 py-2 text-right">List Price</th>
                      <th className="px-4 py-2 text-right">Markup (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {products.slice(0, 10).map((product) => {
                      const markup = product.sellingPrice - product.purchasePrice
                      const margin = (markup / product.sellingPrice) * 100
                      return (
                        <tr key={product._id} className="hover:bg-slate-50/30">
                          <td className="px-4 py-3 font-semibold text-slate-900">{product.name}</td>
                          <td className="px-4 py-3 text-right text-slate-500">৳{product.purchasePrice.toFixed(0)}</td>
                          <td className="px-4 py-3 text-right text-slate-900 font-medium">৳{product.sellingPrice.toFixed(0)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-emerald-700 font-semibold">
                              +৳{markup.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">({margin.toFixed(0)}%)</span>
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {}
              <div className="block sm:hidden divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                {products.slice(0, 10).map((product) => {
                  const markup = product.sellingPrice - product.purchasePrice
                  const margin = (markup / product.sellingPrice) * 100
                  return (
                    <div key={product._id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-900 text-sm truncate max-w-[60%]">{product.name}</span>
                        <span className="text-emerald-700 font-bold text-xs shrink-0">+৳{markup.toFixed(0)} <span className="text-slate-400 font-normal">({margin.toFixed(0)}%)</span></span>
                      </div>
                      <div className="flex gap-4 text-[11px] text-slate-500">
                        <span>Cost: <span className="font-medium text-slate-700">৳{product.purchasePrice.toFixed(0)}</span></span>
                        <span>Retail: <span className="font-medium text-slate-700">৳{product.sellingPrice.toFixed(0)}</span></span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CollapsibleSection>

      </div>
    </div>
  )
}

export default Reports

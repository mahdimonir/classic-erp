import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  User,
} from "lucide-react"
import React, { useState } from "react"
import { toast } from "sonner"
import API from "../../../services/api"
import CollapsibleSection from "../../../components/CollapsibleSection"
import { POSFormSkeleton, ListSkeleton } from "../../../components/Skeleton"



interface IProduct {
  _id: string
  name: string
  sku: string
  category: string
  sellingPrice: number
  stockQuantity: number
}

interface ICartItem {
  product: IProduct
  quantity: number
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
  soldBy: { name: string; email: string }
  createdAt: string
}



const Sales: React.FC = () => {
  const queryClient = useQueryClient()

  const [cart, setCart] = useState<ICartItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedQty, setSelectedQty] = useState(1)
  const [isCartOpen, setIsCartOpen] = useState(true)
  const [historyPage, setHistoryPage] = useState(1)

  
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["productsListForSales"],
    queryFn: async () => {
      const res = await API.get("/products", { params: { limit: 100 } })
      return res.data?.data as IProduct[]
    },
  })

  
  const { data: salesHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ["salesHistory", historyPage],
    queryFn: async () => {
      const res = await API.get("/sales", { params: { page: historyPage, limit: 5 } })
      return res.data
    },
  })

  
  const createSaleMutation = useMutation({
    mutationFn: async (payload: { products: { product: string; quantity: number }[] }) => {
      const res = await API.post("/sales", payload)
      return res.data
    },
    onSuccess: () => {
      toast.success("Sale completed successfully!")
      setCart([])
      setIsCartOpen(false)
      queryClient.invalidateQueries({ queryKey: ["salesHistory"] })
      queryClient.invalidateQueries({ queryKey: ["productsListForSales"] })
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to process sale")
    },
  })

  
  const selectedProduct = productsData?.find((p) => p._id === selectedProductId)

  const grandTotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleAddToCart = () => {
    if (!selectedProductId || !selectedProduct) return toast.error("Please select a product")
    if (selectedQty <= 0) return toast.error("Quantity must be at least 1")
    if (selectedProduct.stockQuantity < selectedQty)
      return toast.error(`Only ${selectedProduct.stockQuantity} in stock`)

    const existingIdx = cart.findIndex((i) => i.product._id === selectedProductId)
    const newCart = [...cart]

    if (existingIdx > -1) {
      const total = newCart[existingIdx].quantity + selectedQty
      if (selectedProduct.stockQuantity < total)
        return toast.error(`Cart total (${total}) exceeds stock (${selectedProduct.stockQuantity})`)
      newCart[existingIdx].quantity = total
    } else {
      newCart.push({ product: selectedProduct, quantity: selectedQty })
    }

    setCart(newCart)
    setSelectedProductId("")
    setSelectedQty(1)
    setIsCartOpen(true)
    toast.success(`${selectedProduct.name} added to cart`)
  }

  const handleRemove = (idx: number) => {
    const newCart = [...cart]
    newCart.splice(idx, 1)
    setCart(newCart)
  }

  const handleQtyChange = (idx: number, delta: number) => {
    const newCart = [...cart]
    const item = newCart[idx]
    const next = item.quantity + delta
    if (next <= 0) return handleRemove(idx)
    if (next > item.product.stockQuantity)
      return toast.error(`Only ${item.product.stockQuantity} in stock`)
    newCart[idx] = { ...item, quantity: next }
    setCart(newCart)
  }

  const handleQtyInput = (idx: number, val: number) => {
    if (val <= 0) return handleRemove(idx)
    const newCart = [...cart]
    if (val > newCart[idx].product.stockQuantity)
      return toast.error(`Only ${newCart[idx].product.stockQuantity} in stock`)
    newCart[idx] = { ...newCart[idx], quantity: val }
    setCart(newCart)
  }

  const handleCheckout = () => {
    if (cart.length === 0) return toast.error("Cart is empty")
    createSaleMutation.mutate({
      products: cart.map((i) => ({ product: i.product._id, quantity: i.quantity })),
    })
  }

  if (loadingProducts) {
    return <POSFormSkeleton />
  }

  
  return (
    
    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-6">
      {}
      <div className="lg:col-span-12 mb-4 lg:mb-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Sales</h1>
        <p className="text-sm text-slate-500 mt-1">Process customer checkout and view transaction ledgers</p>
      </div>

      {}
      <div className="lg:col-span-7 flex flex-col gap-4">

        {}
        <div className="bg-white border border-slate-200 rounded-md shadow-xs p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <ShoppingCart size={16} className="text-slate-500" />
            Add Item to Cart
          </h2>

          {}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => { setSelectedProductId(e.target.value); setSelectedQty(1) }}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm outline-none focus:border-slate-900 bg-white"
              >
                <option value="">— Select a product —</option>
                {productsData
                  ?.filter((p) => p.stockQuantity > 0)
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} · ৳{p.sellingPrice.toFixed(0)} · {p.stockQuantity} left
                    </option>
                  ))}
              </select>
            </div>

            {}
            {selectedProduct && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs">
                <span className="font-semibold text-slate-800">{selectedProduct.name}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">৳{selectedProduct.sellingPrice.toFixed(2)} / unit</span>
                <span className="text-slate-400">·</span>
                <span className={`font-semibold ${selectedProduct.stockQuantity < 5 ? "text-red-600" : "text-emerald-600"}`}>
                  {selectedProduct.stockQuantity} in stock
                </span>
              </div>
            )}

            {}
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Quantity
                </label>
                <div className="flex border border-slate-300 rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border-r border-slate-300 transition-colors cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={selectedProduct?.stockQuantity || 999}
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(Math.max(1, Number(e.target.value) || 1))}
                    className="flex-1 text-center text-sm font-semibold outline-none bg-white py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedQty((q) => q + 1)}
                    className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border-l border-slate-300 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedProductId}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-md text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus size={15} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          {}
          <button
            type="button"
            onClick={() => setIsCartOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 hover:bg-slate-100/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart size={16} className="text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">Cart</span>
              {cart.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                  {cartItemCount}
                </span>
              )}
            </div>
            {isCartOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          {isCartOpen && (
            <>
              {cart.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-400">
                  Your cart is empty. Select a product above to begin.
                </div>
              ) : (
                <>
                  {}
                  <div className="divide-y divide-slate-100">
                    {cart.map((item, idx) => (
                      <div key={item.product._id} className="p-4 sm:p-5 flex items-start gap-3">
                        {}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-sm truncate">{item.product.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.product.sku}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            ৳{item.product.sellingPrice.toFixed(2)} / unit
                          </div>
                        </div>

                        {}
                        <div className="flex items-center border border-slate-200 rounded-md overflow-hidden shrink-0">
                          <button
                            onClick={() => handleQtyChange(idx, -1)}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border-r border-slate-200 cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={item.product.stockQuantity}
                            value={item.quantity}
                            onChange={(e) => handleQtyInput(idx, Number(e.target.value) || 1)}
                            className="w-10 text-center text-sm font-bold outline-none bg-white py-1"
                          />
                          <button
                            onClick={() => handleQtyChange(idx, 1)}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border-l border-slate-200 cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {}
                        <div className="text-right shrink-0 flex flex-col items-end gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            ৳{(item.product.sellingPrice * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleRemove(idx)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {}
                  <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grand Total</p>
                      <p className="text-2xl font-black text-slate-900">৳{grandTotal.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={createSaleMutation.isPending}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-sm rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      {createSaleMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Complete Sale
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {}
      <div className="lg:col-span-5 mt-4 lg:mt-0">
        <CollapsibleSection
          title={
            <span className="flex items-center gap-2">
              <FileText size={15} className="text-slate-500" />
              Recent Transactions
            </span>
          }
          defaultOpen={true}
          badge={
            salesHistory?.meta?.total ? (
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm">
                {salesHistory.meta.total} total
              </span>
            ) : null
          }
        >
          {loadingHistory ? (
            <div className="p-4">
              <ListSkeleton rows={3} />
            </div>
          ) : !salesHistory?.data || salesHistory.data.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">No sales recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {salesHistory.data.map((sale: ISale) => (
                <div key={sale._id} className="p-4 sm:p-5 space-y-2">
                  {}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">#{sale._id.slice(-8)}</span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <Calendar size={10} />
                        {new Date(sale.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span className="font-bold text-sm text-slate-900 shrink-0">৳{sale.grandTotal.toFixed(2)}</span>
                  </div>

                  {}
                  <div className="border-t border-dashed border-slate-200 pt-2 space-y-1">
                    {sale.products.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-slate-600">
                        <span className="truncate max-w-[60%]">
                          {item.product?.name || "Deleted Product"}
                          <span className="text-slate-400 ml-1">×{item.quantity}</span>
                        </span>
                        <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {}
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 border-t border-slate-100 pt-2 uppercase tracking-wider">
                    <User size={9} />
                    {sale.soldBy?.name || "System"}
                  </div>
                </div>
              ))}

              {}
              {salesHistory.meta && salesHistory.meta.totalPage > 1 && (
                <div className="flex justify-between items-center px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                  <button
                    disabled={historyPage === 1}
                    onClick={() => setHistoryPage((p) => p - 1)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs text-slate-500">
                    {historyPage} / {salesHistory.meta.totalPage}
                  </span>
                  <button
                    disabled={historyPage === salesHistory.meta.totalPage}
                    onClick={() => setHistoryPage((p) => p + 1)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </CollapsibleSection>
      </div>
    </div>
  )
}

export default Sales

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Search, Plus, Edit2, Trash2, X, Upload, ChevronLeft, ChevronRight, Package } from "lucide-react"
import { toast } from "sonner"
import API from "../../../services/api"
import { useAuth } from "../../../context/AuthContext"
import CollapsibleSection from "../../../components/CollapsibleSection"
import { ListSkeleton } from "../../../components/Skeleton"


interface IProduct {
  _id: string
  name: string
  sku: string
  category: string
  purchasePrice: number
  sellingPrice: number
  stockQuantity: number
  productImage: string
}


const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  purchasePrice: z.coerce.number().positive("Purchase price must be positive"),
  sellingPrice: z.coerce.number().positive("Selling price must be positive"),
  stockQuantity: z.coerce.number().int().nonnegative("Stock cannot be negative"),
})

type ProductFormInputs = z.infer<typeof productFormSchema>

const Products: React.FC = () => {
  const { hasPermission } = useAuth()
  const queryClient = useQueryClient()
  
  
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [sortBy, setSortBy] = useState("-createdAt")
  const [page, setPage] = useState(1)
  const [limit] = useState(8)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchInput])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string>("")

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInputs>({
    resolver: zodResolver(productFormSchema),
  })

  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ["products", search, page, categoryFilter, sortBy],
    queryFn: async () => {
      const response = await API.get("/products", {
        params: {
          search,
          page,
          limit,
          category: categoryFilter || undefined,
          sort: sortBy,
        },
      })
      return response.data
    },
  })

  const { data: categoriesData } = useQuery<string[]>({
    queryKey: ["productCategories"],
    queryFn: async () => {
      const response = await API.get("/products", {
        params: { limit: 100 },
      })
      const items = response.data?.data || []
      const uniqueCats = Array.from(new Set(items.map((p: any) => p.category))) as string[]
      return uniqueCats.filter(Boolean).sort()
    },
  })

  
  const createProductMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await API.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success("Product created successfully")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      closeModal()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create product")
    },
  })

  
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const response = await API.put(`/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success("Product updated successfully")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      closeModal()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update product")
    },
  })

  
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await API.delete(`/products/${id}`)
      return response.data
    },
    onSuccess: () => {
      toast.success("Product deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete product")
    },
  })

  
  const openModal = (product: IProduct | null = null) => {
    setEditingProduct(product)
    setSelectedFile(null)
    setFilePreview("")

    if (product) {
      setValue("name", product.name)
      setValue("sku", product.sku)
      setValue("category", product.category)
      setValue("purchasePrice", product.purchasePrice)
      setValue("sellingPrice", product.sellingPrice)
      setValue("stockQuantity", product.stockQuantity)
      setFilePreview(product.productImage)
    } else {
      reset({
        name: "",
        sku: "",
        category: "",
        purchasePrice: 0,
        sellingPrice: 0,
        stockQuantity: 0,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setSelectedFile(null)
    setFilePreview("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setFilePreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = (data: ProductFormInputs) => {
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("sku", data.sku)
    formData.append("category", data.category)
    formData.append("purchasePrice", String(data.purchasePrice))
    formData.append("sellingPrice", String(data.sellingPrice))
    formData.append("stockQuantity", String(data.stockQuantity))

    if (selectedFile) {
      formData.append("image", selectedFile)
    }

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct._id, formData })
    } else {
      if (!selectedFile) {
        toast.error("Product image is required")
        return
      }
      createProductMutation.mutate(formData)
    }
  }

  const handleDelete = (id: string, name: string) => {
    setProductToDelete({ id, name })
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id)
    }
    setIsConfirmOpen(false)
    setProductToDelete(null)
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage catalog details, pricing, and stock status</p>
        </div>

        {hasPermission("products:create") && (
          <button
            onClick={() => openModal(null)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} />
            Add Product
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row bg-white p-3 sm:p-4 border border-slate-200 rounded-md shadow-xs items-center gap-3">
        <div className="w-full md:flex-1 relative flex items-center">
          <Search className="absolute left-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, SKU, or category..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-slate-900 bg-white"
          >
            <option value="">All Categories</option>
            {categoriesData?.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-48">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-slate-900 bg-white"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="sellingPrice">Price: Low to High</option>
            <option value="-sellingPrice">Price: High to Low</option>
            <option value="stockQuantity">Stock: Low to High</option>
            <option value="-stockQuantity">Stock: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      {}
      <CollapsibleSection
        title={
          <span className="flex items-center gap-2">
            <Package size={15} className="text-slate-500" />
            Product Catalog
          </span>
        }
        defaultOpen={true}
        badge={
          productsData?.meta?.total ? (
            <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm">
              {productsData.meta.total} items
            </span>
          ) : null
        }
      >
        {isLoading ? (
          <div className="p-4">
            <ListSkeleton rows={4} />
          </div>
        ) : isError || !productsData?.data ? (
          <div className="p-8 text-center text-sm text-red-600">
            Failed to fetch products.
          </div>
        ) : productsData.data.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No products found matching the criteria.
          </div>
        ) : (
          <>
            {}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Image</th>
                    <th className="px-6 py-3.5">Product Details</th>
                    <th className="px-6 py-3.5">SKU</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5 text-right">Purchase Price</th>
                    <th className="px-6 py-3.5 text-right">Selling Price</th>
                    <th className="px-6 py-3.5 text-right">Stock Qty</th>
                    {(hasPermission("products:update") || hasPermission("products:delete")) && (
                      <th className="px-6 py-3.5 text-center">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {productsData.data.map((product: IProduct) => (
                    <tr key={product._id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-3.5">
                        <img
                          src={product.productImage}
                          alt={product.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/100x100/f1f5f9/0f172a?text=" + encodeURIComponent(product.name[0])
                          }}
                          className="w-10 h-10 object-cover rounded-sm border border-slate-200 bg-slate-50"
                        />
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-900">{product.name}</td>
                      <td className="px-6 py-3.5 text-slate-500">{product.sku}</td>
                      <td className="px-6 py-3.5 text-slate-500">{product.category}</td>
                      <td className="px-6 py-3.5 text-right text-slate-600">৳{product.purchasePrice.toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-right text-slate-900 font-medium">৳{product.sellingPrice.toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-right">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-sm border ${
                          product.stockQuantity < 5
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}>
                          {product.stockQuantity}
                        </span>
                      </td>
                      {(hasPermission("products:update") || hasPermission("products:delete")) && (
                        <td className="px-6 py-3.5">
                          <div className="flex justify-center gap-2">
                            {hasPermission("products:update") && (
                              <button
                                onClick={() => openModal(product)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-sm cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                            )}
                            {hasPermission("products:delete") && (
                              <button
                                onClick={() => handleDelete(product._id, product.name)}
                                className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-sm cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {}
            <div className="block sm:hidden divide-y divide-slate-100">
              {productsData.data.map((product: IProduct) => (
                <div key={product._id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.productImage}
                      alt={product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/100x100/f1f5f9/0f172a?text=" + encodeURIComponent(product.name[0])
                      }}
                      className="w-12 h-12 object-cover rounded-sm border border-slate-200 bg-slate-50 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-slate-900 truncate">{product.name}</h4>
                      <p className="text-xs text-slate-500">{product.category} • {product.sku}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="bg-slate-50 p-2 rounded-sm">
                      <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Cost</span>
                      <span className="text-xs font-medium text-slate-600">৳{product.purchasePrice.toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-sm">
                      <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Price</span>
                      <span className="text-xs font-bold text-slate-900">৳{product.sellingPrice.toFixed(2)}</span>
                    </div>
                    <div className={`p-2 rounded-sm border ${
                      product.stockQuantity < 5
                        ? "bg-red-50/50 border-red-100 text-red-700"
                        : "bg-slate-50 border-transparent text-slate-700"
                    }`}>
                      <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Stock</span>
                      <span className="text-xs font-bold">{product.stockQuantity}</span>
                    </div>
                  </div>
                  {(hasPermission("products:update") || hasPermission("products:delete")) && (
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-50">
                      {hasPermission("products:update") && (
                        <button
                          onClick={() => openModal(product)}
                          className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                      {hasPermission("products:delete") && (
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="flex-1 py-1.5 border border-red-100 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-md flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {}
            {productsData.meta && productsData.meta.totalPage > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs text-slate-500">
                  Page {page} of {productsData.meta.totalPage} ({productsData.meta.total} items)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-1.5 border border-slate-300 rounded-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={page === productsData.meta.totalPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 border border-slate-300 rounded-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </CollapsibleSection>

      {}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden max-h-[90dvh] flex flex-col">
            {}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Product Name</label>
                  <input
                    type="text"
                    {...register("name")}
                    className={`w-full px-3 py-1.5 border rounded-sm text-sm outline-none ${
                      errors.name ? "border-red-500 bg-red-50/10" : "border-slate-300 focus:border-slate-950"
                    }`}
                    placeholder="Premium Apples"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">SKU</label>
                  <input
                    type="text"
                    {...register("sku")}
                    className={`w-full px-3 py-1.5 border rounded-sm text-sm outline-none ${
                      errors.sku ? "border-red-500 bg-red-50/10" : "border-slate-300 focus:border-slate-950"
                    }`}
                    placeholder="APP-RED-001"
                  />
                  {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Category</label>
                  <input
                    type="text"
                    {...register("category")}
                    className={`w-full px-3 py-1.5 border rounded-sm text-sm outline-none ${
                      errors.category ? "border-red-500 bg-red-50/10" : "border-slate-300 focus:border-slate-950"
                    }`}
                    placeholder="Fruits"
                  />
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Purchase Price</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("purchasePrice")}
                    className={`w-full px-3 py-1.5 border rounded-sm text-sm outline-none ${
                      errors.purchasePrice ? "border-red-500 bg-red-50/10" : "border-slate-300 focus:border-slate-950"
                    }`}
                    placeholder="1.20"
                  />
                  {errors.purchasePrice && <p className="text-xs text-red-500 mt-1">{errors.purchasePrice.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("sellingPrice")}
                    className={`w-full px-3 py-1.5 border rounded-sm text-sm outline-none ${
                      errors.sellingPrice ? "border-red-500 bg-red-50/10" : "border-slate-300 focus:border-slate-950"
                    }`}
                    placeholder="2.50"
                  />
                  {errors.sellingPrice && <p className="text-xs text-red-500 mt-1">{errors.sellingPrice.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    {...register("stockQuantity")}
                    className={`w-full px-3 py-1.5 border rounded-sm text-sm outline-none ${
                      errors.stockQuantity ? "border-red-500 bg-red-50/10" : "border-slate-300 focus:border-slate-950"
                    }`}
                    placeholder="100"
                  />
                  {errors.stockQuantity && <p className="text-xs text-red-500 mt-1">{errors.stockQuantity.message}</p>}
                </div>

                {}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Product Image</label>
                  <div className="flex items-center gap-4 mt-1">
                    {filePreview && (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover border border-slate-200 bg-slate-50 rounded-sm"
                      />
                    )}
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-slate-500 py-3 rounded-sm cursor-pointer transition-colors bg-slate-50">
                      <Upload size={16} className="text-slate-400 mb-1" />
                      <span className="text-xs font-medium text-slate-600">
                        {selectedFile ? selectedFile.name : "Select Image File"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6 bg-slate-50/50 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-300 rounded-sm text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-sm text-sm font-semibold transition-colors disabled:bg-slate-300 cursor-pointer"
                >
                  {createProductMutation.isPending || updateProductMutation.isPending
                    ? "Saving..."
                    : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Confirm Deletion</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-900">"{productToDelete?.name}"</span>? This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false)
                  setProductToDelete(null)
                }}
                className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-sm font-semibold cursor-pointer transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-semibold cursor-pointer transition-colors text-center"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products

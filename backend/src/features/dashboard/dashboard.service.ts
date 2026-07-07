import { Product } from "../products/product.model"
import { Sale } from "../sales/sale.model"

export class DashboardService {
  static async getDashboardStats() {
    const [totalProducts, salesStats, lowStockProducts] = await Promise.all([
      
      Product.countDocuments(),

      
      Sale.aggregate([
        {
          $group: {
            _id: null,
            totalSalesCount: { $sum: 1 },
            totalRevenue: { $sum: "$grandTotal" },
          },
        },
      ]),

      
      Product.find({ stockQuantity: { $lt: 5 } })
        .select("name sku stockQuantity")
        .lean(),
    ])

    const totalSales = salesStats[0]?.totalSalesCount || 0
    const totalRevenue = salesStats[0]?.totalRevenue || 0

    return {
      totalProducts,
      totalSales,
      totalRevenue,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
    }
  }
}

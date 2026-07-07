import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import { Permission } from "./features/auth/permission.model"
import { Role } from "./features/auth/role.model"
import { User } from "./features/auth/user.model"
import { Product } from "./features/products/product.model"
import { Sale } from "./features/sales/sale.model"

dotenv.config()

const permissionsData = [
  { name: "Create Product", slug: "products:create" },
  { name: "Read Products", slug: "products:read" },
  { name: "Update Product", slug: "products:update" },
  { name: "Delete Product", slug: "products:delete" },
  { name: "Create Sale", slug: "sales:create" },
  { name: "Read Sales", slug: "sales:read" },
  { name: "Read Dashboard", slug: "dashboard:read" },
  { name: "Manage Roles & Permissions", slug: "roles:manage" },
]

const productsData = [
  {
    name: "Red Apples",
    sku: "FRT-APP-RED",
    category: "Fresh Fruits",
    purchasePrice: 120.0,
    sellingPrice: 180.0,
    stockQuantity: 25,
    productImage: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Cavendish Bananas",
    sku: "FRT-BAN-CAV",
    category: "Fresh Fruits",
    purchasePrice: 40.0,
    sellingPrice: 70.0,
    stockQuantity: 40,
    productImage: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Valencia Oranges",
    sku: "FRT-ORA-VAL",
    category: "Fresh Fruits",
    purchasePrice: 140.0,
    sellingPrice: 220.0,
    stockQuantity: 3, 
    productImage: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Honey Mangoes",
    sku: "FRT-MAN-HON",
    category: "Fresh Fruits",
    purchasePrice: 180.0,
    sellingPrice: 280.0,
    stockQuantity: 50,
    productImage: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Sweet Pineapples",
    sku: "FRT-PIN-SWE",
    category: "Fresh Fruits",
    purchasePrice: 60.0,
    sellingPrice: 100.0,
    stockQuantity: 2, 
    productImage: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Fresh Strawberries",
    sku: "FRT-STR-FRE",
    category: "Berries",
    purchasePrice: 350.0,
    sellingPrice: 550.0,
    stockQuantity: 15,
    productImage: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Blueberries Box",
    sku: "FRT-BLU-BOX",
    category: "Berries",
    purchasePrice: 450.0,
    sellingPrice: 750.0,
    stockQuantity: 8,
    productImage: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Seedless Grapes",
    sku: "FRT-GRA-SDL",
    category: "Fresh Fruits",
    purchasePrice: 220.0,
    sellingPrice: 320.0,
    stockQuantity: 30,
    productImage: "https://images.unsplash.com/photo-1601275868399-45bec4f4cd9d?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Ripe Papaya",
    sku: "FRT-PAP-RIP",
    category: "Fresh Fruits",
    purchasePrice: 90.0,
    sellingPrice: 150.0,
    stockQuantity: 4, 
    productImage: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Green Kiwi Fruits",
    sku: "FRT-KIW-GRN",
    category: "Fresh Fruits",
    purchasePrice: 250.0,
    sellingPrice: 400.0,
    stockQuantity: 22,
    productImage: "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Organic Lemons",
    sku: "FRT-LEM-ORG",
    category: "Citrus",
    purchasePrice: 30.0,
    sellingPrice: 60.0,
    stockQuantity: 35,
    productImage: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Hass Avocados",
    sku: "FRT-AVO-HAS",
    category: "Fresh Fruits",
    purchasePrice: 300.0,
    sellingPrice: 450.0,
    stockQuantity: 12,
    productImage: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Red Cherries Pack",
    sku: "FRT-CHE-RED",
    category: "Berries",
    purchasePrice: 450.0,
    sellingPrice: 700.0,
    stockQuantity: 18,
    productImage: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Watermelon Large",
    sku: "FRT-WAT-LRG",
    category: "Fresh Fruits",
    purchasePrice: 150.0,
    sellingPrice: 250.0,
    stockQuantity: 1, 
    productImage: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Pomegranate Premium",
    sku: "FRT-POM-PRM",
    category: "Fresh Fruits",
    purchasePrice: 280.0,
    sellingPrice: 420.0,
    stockQuantity: 14,
    productImage: "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Fresh Coconuts",
    sku: "FRT-COC-FRE",
    category: "Fresh Fruits",
    purchasePrice: 90.0,
    sellingPrice: 140.0,
    stockQuantity: 10,
    productImage: "https://images.unsplash.com/photo-1525203135335-74d272fc8d9c?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Ripe Peaches",
    sku: "FRT-PEA-RIP",
    category: "Fresh Fruits",
    purchasePrice: 220.0,
    sellingPrice: 320.0,
    stockQuantity: 19,
    productImage: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Sweet Plums",
    sku: "FRT-PLU-SWE",
    category: "Fresh Fruits",
    purchasePrice: 160.0,
    sellingPrice: 240.0,
    stockQuantity: 24,
    productImage: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Anjou Pears",
    sku: "FRT-PEA-ANJ",
    category: "Fresh Fruits",
    purchasePrice: 140.0,
    sellingPrice: 220.0,
    stockQuantity: 0, 
    productImage: "https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Sweet Apricots",
    sku: "FRT-APR-SWE",
    category: "Fresh Fruits",
    purchasePrice: 200.0,
    sellingPrice: 300.0,
    stockQuantity: 16,
    productImage: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&auto=format&fit=crop&q=60",
  },
]

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/classic_erp"
    console.log("Connecting to MongoDB at:", mongoURI)
    await mongoose.connect(mongoURI)
    console.log("Connected to MongoDB for seeding.")

    
    console.log("Clearing existing database collections...")
    await User.deleteMany({})
    await Role.deleteMany({})
    await Permission.deleteMany({})
    await Product.deleteMany({})
    await Sale.deleteMany({})

    
    console.log("Seeding permissions...")
    const seededPermissions = await Permission.insertMany(permissionsData)
    console.log(`Seeded ${seededPermissions.length} permissions.`)

    const getPermId = (slug: string) => {
      const perm = seededPermissions.find((p) => p.slug === slug)
      if (!perm) throw new Error(`Permission slug '${slug}' not found.`)
      return perm._id
    }

    
    console.log("Seeding roles...")
    const adminPermissions = seededPermissions.map((p) => p._id)

    const managerPermissions = [
      getPermId("products:create"),
      getPermId("products:read"),
      getPermId("products:update"),
      getPermId("sales:create"),
      getPermId("sales:read"),
      getPermId("dashboard:read"),
    ]

    const employeePermissions = [
      getPermId("products:read"),
      getPermId("sales:create"),
      getPermId("sales:read"),
      getPermId("dashboard:read"),
    ]

    const rolesData = [
      { name: "Admin", slug: "admin", permissions: adminPermissions },
      { name: "Manager", slug: "manager", permissions: managerPermissions },
      { name: "Employee", slug: "employee", permissions: employeePermissions },
    ]

    const seededRoles = await Role.insertMany(rolesData)
    console.log(`Seeded ${seededRoles.length} roles.`)

    const getRoleId = (slug: string) => {
      const role = seededRoles.find((r) => r.slug === slug)
      if (!role) throw new Error(`Role slug '${slug}' not found.`)
      return role._id
    }

    
    console.log("Seeding default users...")
    const adminPasswordHash = bcrypt.hashSync("admin123", 10)
    const managerPasswordHash = bcrypt.hashSync("manager123", 10)
    const employeePasswordHash = bcrypt.hashSync("employee123", 10)

    const usersData = [
      {
        name: "System Admin",
        email: "admin@example.com",
        password: adminPasswordHash,
        role: getRoleId("admin"),
      },
      {
        name: "Shop Manager",
        email: "manager@example.com",
        password: managerPasswordHash,
        role: getRoleId("manager"),
      },
      {
        name: "Shop Employee",
        email: "employee@example.com",
        password: employeePasswordHash,
        role: getRoleId("employee"),
      },
    ]

    const seededUsers = await User.insertMany(usersData)
    console.log(`Seeded ${seededUsers.length} users successfully.`)

    
    console.log("Seeding 20 products...")
    const seededProducts = await Product.insertMany(productsData)
    console.log(`Seeded ${seededProducts.length} products successfully.`)

    
    const getRandProduct = (index: number) => seededProducts[index]

    
    console.log("Seeding sales history...")
    const employeeUser = seededUsers.find((u) => u.email === "employee@example.com")!
    const managerUser = seededUsers.find((u) => u.email === "manager@example.com")!

    const salesData = [
      {
        products: [
          { product: getRandProduct(0)._id, quantity: 2, price: getRandProduct(0).sellingPrice },
          { product: getRandProduct(1)._id, quantity: 5, price: getRandProduct(1).sellingPrice },
        ],
        grandTotal: getRandProduct(0).sellingPrice * 2 + getRandProduct(1).sellingPrice * 5,
        soldBy: employeeUser._id,
        createdAt: new Date(Date.now() - 3600000 * 24 * 3), 
      },
      {
        products: [
          { product: getRandProduct(3)._id, quantity: 3, price: getRandProduct(3).sellingPrice },
          { product: getRandProduct(5)._id, quantity: 1, price: getRandProduct(5).sellingPrice },
          { product: getRandProduct(7)._id, quantity: 2, price: getRandProduct(7).sellingPrice },
        ],
        grandTotal:
          getRandProduct(3).sellingPrice * 3 +
          getRandProduct(5).sellingPrice * 1 +
          getRandProduct(7).sellingPrice * 2,
        soldBy: employeeUser._id,
        createdAt: new Date(Date.now() - 3600000 * 24 * 2), 
      },
      {
        products: [
          { product: getRandProduct(10)._id, quantity: 10, price: getRandProduct(10).sellingPrice },
          { product: getRandProduct(11)._id, quantity: 2, price: getRandProduct(11).sellingPrice },
        ],
        grandTotal: getRandProduct(10).sellingPrice * 10 + getRandProduct(11).sellingPrice * 2,
        soldBy: managerUser._id,
        createdAt: new Date(Date.now() - 3600000 * 20), 
      },
      {
        products: [
          { product: getRandProduct(12)._id, quantity: 2, price: getRandProduct(12).sellingPrice },
        ],
        grandTotal: getRandProduct(12).sellingPrice * 2,
        soldBy: employeeUser._id,
        createdAt: new Date(Date.now() - 3600000 * 5), 
      },
      {
        products: [
          { product: getRandProduct(15)._id, quantity: 4, price: getRandProduct(15).sellingPrice },
          { product: getRandProduct(17)._id, quantity: 3, price: getRandProduct(17).sellingPrice },
        ],
        grandTotal: getRandProduct(15).sellingPrice * 4 + getRandProduct(17).sellingPrice * 3,
        soldBy: employeeUser._id,
        createdAt: new Date(), 
      },
    ]

    
    for (const sale of salesData) {
      for (const item of sale.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: -item.quantity },
        })
      }
    }

    const seededSales = await Sale.insertMany(salesData)
    console.log(`Seeded ${seededSales.length} sales successfully.`)

    console.log("Database seeding completed successfully.")
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()

import http from "http"
import app from "./app"
import connectDB from "./config/db"
import { initSocket } from "./config/socket"

const port = process.env.PORT || 8000

let isDbConnected = false
app.use(async (req, res, next) => {
  if (!isDbConnected) {
    try {
      await connectDB()
      isDbConnected = true
    } catch (err) {
      console.error("Database connection failure in serverless context:", err)
    }
  }
  next()
})

if (process.env.VERCEL !== "1") {
  const startServer = async () => {
    try {
      await connectDB()
      isDbConnected = true

      const server = http.createServer(app)
      initSocket(server)

      server.listen(port, () => {
        console.log(`=============================================`)
        console.log(`  Classic ERP Server running on port ${port}  `)
        console.log(`  Environment: ${process.env.NODE_ENV || "development"}`)
        console.log(`=============================================`)
      })
    } catch (error) {
      console.error("Critical error during server startup:", error)
      process.exit(1)
    }
  }
  startServer()
}

export default app

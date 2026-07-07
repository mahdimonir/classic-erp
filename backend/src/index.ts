import http from "http"
import app from "./app"
import connectDB from "./config/db"
import { initSocket } from "./config/socket"

const port = process.env.PORT || 8000

if (process.env.VERCEL !== "1") {
  const startServer = async () => {
    try {
      await connectDB()

      const server = http.createServer(app)
      initSocket(server)

      server.listen(port, () => {
        console.log(`Server listening on port ${port} (${process.env.NODE_ENV || "development"})`)
      })
    } catch (error) {
      console.error("Critical error during server startup:", error)
      process.exit(1)
    }
  }
  startServer()
}

export default app

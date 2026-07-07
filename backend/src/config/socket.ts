import { Server as HttpServer } from "http"
import { Server } from "socket.io"

let io: Server | null = null

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  })

  io.on("connection", (socket) => {
    console.log(`Client connected via websocket: ${socket.id}`)

    socket.on("disconnect", () => {
      console.log(`Client disconnected from websocket: ${socket.id}`)
    })
  })

  return io
}

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io is not initialized!")
  }
  return io
}

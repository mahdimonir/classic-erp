import React, { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { toast } from "sonner"
import { useAuth } from "./AuthContext"

const SocketContext = createContext<Socket | null>(null)

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    const socketInstance = io("http://localhost:8000")

    socketInstance.on("connect", () => {
      console.log("WebSocket client connected to server.")
    })

    socketInstance.on("saleCreated", (data: any) => {
      
      toast.info(data.message || "A new sale has been processed!", {
        description: `Grand Total: $${data.grandTotal || "0.00"}`,
      })
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [isAuthenticated])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  return useContext(SocketContext)
}

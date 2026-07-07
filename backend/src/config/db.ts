import mongoose from "mongoose"

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/classic_erp"
    
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully.")
    })

    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`)
    })

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB connection disconnected.")
    })

    await mongoose.connect(mongoURI)
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    process.exit(1)
  }
}

export default connectDB

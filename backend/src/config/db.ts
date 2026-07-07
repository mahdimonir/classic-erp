import mongoose from "mongoose"

const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return
  }

  try {
    const mongoURI = process.env.MONGO_URI
    if (!mongoURI) {
      throw new Error("MONGO_URI environment variable is missing!")
    }

    if (mongoose.connection.readyState === 0) {
      mongoose.connection.on("connected", () => {
        console.log("MongoDB connected successfully.")
      })

      mongoose.connection.on("error", (err) => {
        console.error(`MongoDB connection error: ${err.message || err}`)
      })
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    })
  } catch (error: any) {
    console.error("Failed to connect to MongoDB:", error.message || error)
    if (process.env.VERCEL !== "1") {
      process.exit(1)
    }
    throw error
  }
}

export default connectDB

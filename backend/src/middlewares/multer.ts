import multer from "multer"
import path from "path"
import fs from "fs"
import { BadRequestError } from "../shared/errors/AppError"


const isVercel = process.env.VERCEL === "1"
const uploadDir = isVercel ? "/tmp" : path.join(process.cwd(), "uploads")

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
} catch (err) {
  console.warn("Directory creation skipped or failed in serverless context:", err)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + ext)
  },
})

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new BadRequestError("Only image files are allowed!") as any, false)
    }
  },
})

const fs = require("fs")
const path = require("path")

const srcSpec = path.join(__dirname, "src/config/swagger-spec.json")
const distSpec = path.join(__dirname, "dist/config/swagger-spec.json")

try {
  const distDir = path.dirname(distSpec)
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }
  fs.copyFileSync(srcSpec, distSpec)
  console.log("Copied swagger-spec.json to dist/config/")
} catch (err) {
  console.warn("Warning: Could not copy swagger-spec.json to dist:", err.message)
}

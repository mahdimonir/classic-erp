import swaggerJsDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { Express } from "express"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Classic ERP API Documentation",
      version: "1.0.0",
      description: "API specifications for the MERN Stack Classic ERP System",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Local development backend server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/features/**/*.ts"], 
}

const swaggerSpec = swaggerJsDoc(options)

export const setupSwagger = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  console.log("Swagger API docs initialized at http://localhost:8000/api-docs")
}

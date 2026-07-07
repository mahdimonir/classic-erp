import axios from "axios"

const apiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const API = axios.create({
  baseURL: `${apiBaseURL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
})


API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default API

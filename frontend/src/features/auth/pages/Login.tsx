import React, { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, Navigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "../../../context/AuthContext"
import API from "../../../services/api"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
})

type LoginFormInputs = z.infer<typeof loginSchema>

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  })

  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (data: LoginFormInputs) => {
    setSubmitting(true)
    try {
      const response = await API.post("/auth/login", data)
      if (response.data?.success) {
        const { token, user } = response.data.data
        login(token, user)
        toast.success("Welcome back!", {
          description: `Logged in as ${user.name}`,
        })
        navigate("/dashboard")
      } else {
        toast.error(response.data?.message || "Login failed")
      }
    } catch (error: any) {
      console.error("Login submission error:", error)
      const errorMsg = error.response?.data?.message || "Invalid credentials. Please try again."
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  
  const handleQuickFill = (email: string, pass: string) => {
    setValue("email", email)
    setValue("password", pass)
    toast.info(`Filled credentials for ${email.split("@")[0]}`)
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-md shadow-xs">
        {}
        <div className="mb-8 text-center">
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">System Gateway</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Sign in to Classic ERP</h2>
          <p className="text-sm text-slate-500 mt-1">Enter your credentials to manage inventory and sales</p>
        </div>

        {}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition-all ${
                errors.email
                  ? "border-red-500 focus:border-red-500 bg-red-50/10"
                  : "border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              }`}
              placeholder="admin@example.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full pl-3 pr-10 py-2 border rounded-md text-sm outline-none transition-all ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 bg-red-50/10"
                    : "border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-semibold transition-colors disabled:bg-slate-300 cursor-pointer disabled:cursor-not-allowed mt-2"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {}
        <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-2">Demo Accounts (Click to Quick Fill):</p>
          <div className="space-y-2">
            <button
              onClick={() => handleQuickFill("admin@example.com", "admin123")}
              className="w-full p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-sm text-left flex justify-between items-center transition-colors cursor-pointer"
            >
              <span>
                <span className="font-medium text-slate-800">Admin:</span> admin@example.com
              </span>
              <span className="text-[10px] font-bold text-slate-400">admin123</span>
            </button>
            <button
              onClick={() => handleQuickFill("manager@example.com", "manager123")}
              className="w-full p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-sm text-left flex justify-between items-center transition-colors cursor-pointer"
            >
              <span>
                <span className="font-medium text-slate-800">Manager:</span> manager@example.com
              </span>
              <span className="text-[10px] font-bold text-slate-400">manager123</span>
            </button>
            <button
              onClick={() => handleQuickFill("employee@example.com", "employee123")}
              className="w-full p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-sm text-left flex justify-between items-center transition-colors cursor-pointer"
            >
              <span>
                <span className="font-medium text-slate-800">Employee:</span> employee@example.com
              </span>
              <span className="text-[10px] font-bold text-slate-400">employee123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

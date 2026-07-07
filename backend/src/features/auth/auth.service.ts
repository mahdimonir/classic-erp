import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { BadRequestError, UnauthorizedError } from "../../shared/errors/AppError"
import { Role } from "./role.model"
import { User } from "./user.model"
import { Permission } from "./permission.model"

export class AuthService {
  static async loginUser(payload: any) {
    const { email, password } = payload

    const user = await User.findOne({ email })
      .select("+password")
      .populate({
        path: "role",
        populate: {
          path: "permissions",
        },
      })
      .lean()

    if (!user) {
      throw new UnauthorizedError("Invalid email or password")
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password!)
    if (!isPasswordMatch) {
      throw new UnauthorizedError("Invalid email or password")
    }
    const roleObj = user.role as any
    const permissions: string[] = roleObj.permissions.map((p: any) => p.slug)

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: roleObj.slug,
      permissions,
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as any,
    })

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleObj.slug,
        permissions,
      },
      token,
    }
  }

  static async registerUser(payload: any) {
    const { name, email, password, roleSlug = "employee" } = payload

    const existingUser = await User.findOne({ email }).lean()
    if (existingUser) {
      throw new BadRequestError("User with this email already exists")
    }
    const role = await Role.findOne({ slug: roleSlug }).lean()
    if (!role) {
      throw new BadRequestError(`Role with slug '${roleSlug}' does not exist`)
    }
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role._id,
    })

    return newUser
  }

  static async getMe(userId: string) {
    const user = await User.findById(userId)
      .populate({
        path: "role",
        populate: {
          path: "permissions",
        },
      })
      .lean()

    if (!user) {
      throw new BadRequestError("User not found")
    }

    const roleObj = user.role as any
    const permissions: string[] = roleObj.permissions.map((p: any) => p.slug)

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: roleObj.slug,
      permissions,
    }
  }

  static async getAllUsers() {
    
    return User.find()
      .populate("role", "name slug")
      .lean()
  }

  static async updateUserRole(userId: string, roleSlug: string) {
    const role = await Role.findOne({ slug: roleSlug }).lean()
    if (!role) {
      throw new BadRequestError(`Role '${roleSlug}' not found`)
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: role._id },
      { new: true }
    )
      .populate("role", "name slug")
      .lean()
    return updatedUser
  }

  static async getAllRoles() {
    return Role.find().populate("permissions").lean()
  }

  static async updateRolePermissions(roleId: string, permissionIds: string[]) {
    const updatedRole = await Role.findByIdAndUpdate(
      roleId,
      { permissions: permissionIds.map(id => new mongoose.Types.ObjectId(id)) },
      { new: true }
    )
      .populate("permissions")
      .lean()
    return updatedRole
  }

  static async getAllPermissions() {
    return Permission.find().lean()
  }
}

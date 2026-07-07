import { Schema, model, Types } from "mongoose"
import "./role.model"

export interface IUser {
  name: string
  email: string
  password?: string
  role: Types.ObjectId
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password
        return ret
      },
    },
  }
)

export const User = model<IUser>("User", userSchema)

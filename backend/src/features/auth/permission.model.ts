import { Schema, model } from "mongoose"

export interface IPermission {
  name: string
  slug: string
}

const permissionSchema = new Schema<IPermission>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
)

export const Permission = model<IPermission>("Permission", permissionSchema)

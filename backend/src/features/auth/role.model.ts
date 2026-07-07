import { Schema, model, Types } from "mongoose"
import "./permission.model"

export interface IRole {
  name: string
  slug: string
  permissions: Types.ObjectId[]
}

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
  },
  { timestamps: true }
)

export const Role = model<IRole>("Role", roleSchema)

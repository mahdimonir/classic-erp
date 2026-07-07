import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Shield, Users, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import API from "../../../services/api"
import CollapsibleSection from "../../../components/CollapsibleSection"
import { ListSkeleton } from "../../../components/Skeleton"

interface IPermission {
  _id: string
  name: string
  slug: string
}

interface IRole {
  _id: string
  name: string
  slug: string
  permissions: IPermission[]
}

interface IUser {
  _id: string
  name: string
  email: string
  role: IRole
}

const Roles: React.FC = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users")

  
  const { data: users, isLoading: usersLoading } = useQuery<IUser[]>({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await API.get("/auth/users")
      return res.data?.data
    },
  })

  const { data: roles, isLoading: rolesLoading } = useQuery<IRole[]>({
    queryKey: ["adminRoles"],
    queryFn: async () => {
      const res = await API.get("/auth/roles")
      return res.data?.data
    },
  })

  const { data: permissions, isLoading: permissionsLoading } = useQuery<IPermission[]>({
    queryKey: ["adminPermissions"],
    queryFn: async () => {
      const res = await API.get("/auth/permissions")
      return res.data?.data
    },
  })

  
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, roleSlug }: { userId: string; roleSlug: string }) => {
      const res = await API.put(`/auth/users/${userId}/role`, { roleSlug })
      return res.data
    },
    onSuccess: () => {
      toast.success("User role updated successfully")
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update user role")
    },
  })

  const updateRolePermissionsMutation = useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => {
      const res = await API.put(`/auth/roles/${roleId}/permissions`, { permissions: permissionIds })
      return res.data
    },
    onSuccess: () => {
      toast.success("Role permissions updated successfully")
      queryClient.invalidateQueries({ queryKey: ["adminRoles"] })
      toast.info("Permissions updated in database. Users will need to reload or re-authenticate for token-based updates.")
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update permissions")
    },
  })

  
  const handleUserRoleChange = (userId: string, roleSlug: string) => {
    updateUserRoleMutation.mutate({ userId, roleSlug })
  }

  const handlePermissionToggle = (role: IRole, permId: string, isChecked: boolean) => {
    const currentPermIds = role.permissions.map((p) => p._id)
    let newPermIds = []

    if (isChecked) {
      
      newPermIds = [...currentPermIds, permId]
    } else {
      
      newPermIds = currentPermIds.filter((id) => id !== permId)
    }

    updateRolePermissionsMutation.mutate({ roleId: role._id, permissionIds: newPermIds })
  }

  if (usersLoading || rolesLoading || permissionsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Access Control</h1>
          <p className="text-sm text-slate-500 mt-1">Manage database-driven roles, edit user profiles, and map dynamic permissions</p>
        </div>
        <ListSkeleton rows={4} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Access Control</h1>
        <p className="text-sm text-slate-500 mt-1">Manage database-driven roles, edit user profiles, and map dynamic permissions</p>
      </div>

      {}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-6">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "users"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          } flex items-center gap-2`}
        >
          <Users size={16} />
          <span className="hidden xs:inline">User Directory</span>
          <span className="xs:hidden">Users</span>
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "roles"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          } flex items-center gap-2`}
        >
          <Shield size={16} />
          <span className="hidden xs:inline">Role Permissions Matrix</span>
          <span className="xs:hidden">Roles</span>
        </button>
      </div>

      {}
      <div className="bg-slate-50 border border-slate-200 p-3 sm:p-4 rounded-md flex gap-3 text-xs text-slate-600 items-start">
        <AlertCircle className="text-slate-500 shrink-0 mt-0.5" size={16} />
        <div>
          <span className="font-semibold text-slate-800">Database-Driven Role Constraints:</span> Permissions map dynamically in real-time. Modifying the Role Permissions Matrix alters database access scopes globally.
        </div>
      </div>

      {}
      {activeTab === "users" && (
        <CollapsibleSection
          title={
            <span className="flex items-center gap-2">
              <Users size={15} className="text-slate-500" />
              User Directory
            </span>
          }
          defaultOpen={true}
          badge={
            users ? (
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm">
                {users.length} users
              </span>
            ) : null
          }
        >
          {}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">User Name</th>
                  <th className="px-6 py-3.5">Email Address</th>
                  <th className="px-6 py-3.5">Active Role</th>
                  <th className="px-6 py-3.5 text-center w-52">Assign New Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users?.map((usr) => (
                  <tr key={usr._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{usr.name}</td>
                    <td className="px-6 py-4 text-slate-500">{usr.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 uppercase rounded-sm">
                        {usr.role?.name || "None"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={usr.role?.slug || ""}
                        onChange={(e) => handleUserRoleChange(usr._id, e.target.value)}
                        className="px-2.5 py-1 border border-slate-300 rounded-sm text-xs outline-none bg-white focus:border-slate-900"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {}
          <div className="block sm:hidden divide-y divide-slate-100">
            {users?.map((usr) => (
              <div key={usr._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{usr.name}</h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{usr.email}</p>
                  </div>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700 uppercase rounded-sm shrink-0">
                    {usr.role?.name || "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-slate-50 rounded-md p-2.5">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Assign Role</label>
                  <select
                    value={usr.role?.slug || ""}
                    onChange={(e) => handleUserRoleChange(usr._id, e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded-sm text-xs outline-none bg-white focus:border-slate-900"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {}
      {activeTab === "roles" && (
        <CollapsibleSection
          title={
            <span className="flex items-center gap-2">
              <Shield size={15} className="text-slate-500" />
              Permissions Matrix
            </span>
          }
          defaultOpen={true}
          badge={
            permissions ? (
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm">
                {permissions.length} permissions
              </span>
            ) : null
          }
        >
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">Permissions Mapping Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">Toggle checkboxes below to map specific permissions to system roles.</p>
          </div>

          {}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5 w-48">System Permission</th>
                  {roles?.map((role) => (
                    <th key={role._id} className="px-6 py-3.5 text-center">
                      {role.name} Role
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {permissions?.map((perm) => (
                  <tr key={perm._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{perm.name}</div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">{perm.slug}</div>
                    </td>
                    {roles?.map((role) => {
                      const isChecked = role.permissions.some((p) => p._id === perm._id)
                      const isUnchangeableAdmin = role.slug === "admin"
                      return (
                        <td key={role._id} className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isUnchangeableAdmin}
                            onChange={(e) => handlePermissionToggle(role, perm._id, e.target.checked)}
                            className="w-4.5 h-4.5 accent-slate-900 border-slate-300 rounded-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-55"
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {}
          <div className="block sm:hidden divide-y divide-slate-100">
            {permissions?.map((perm) => (
              <div key={perm._id} className="p-4 space-y-3">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{perm.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{perm.slug}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {roles?.map((role) => {
                    const isChecked = role.permissions.some((p) => p._id === perm._id)
                    const isUnchangeableAdmin = role.slug === "admin"
                    return (
                      <label key={role._id} className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-xs ${isChecked ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-slate-200 text-slate-600"} ${isUnchangeableAdmin ? "opacity-60" : "cursor-pointer"}`}>
                        <span className="font-semibold capitalize">{role.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isUnchangeableAdmin}
                          onChange={(e) => handlePermissionToggle(role, perm._id, e.target.checked)}
                          className="accent-white"
                        />
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}

export default Roles

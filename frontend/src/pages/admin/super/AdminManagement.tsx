import { useState, useEffect, useMemo } from "react";
import { usersApi } from "@/api";
import { User } from "@/types";
import { Check, X, ShieldAlert, AlertCircle, Plus, Edit2, Search, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export function AdminManagementPage() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("PRODUCT_ADMIN");
  const [department, setDepartment] = useState("");

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getAdmins();
      setAdmins(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load admins");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    const confirmed = window.confirm(
      `⚠️ PERMANENTLY DELETE admin "${adminEmail}"?\n\nThis will:\n• Remove them from the database completely\n• Revoke all access immediately\n• Cannot be undone\n\nAre you sure?`
    );
    if (!confirmed) return;
    try {
      await usersApi.deleteAdmin(adminId);
      setAdmins(prev => prev.filter(a => a.id !== adminId));
      toast.success(`Admin "${adminEmail}" permanently deleted.`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete admin");
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await usersApi.updateAdminStatus(userId, !currentStatus);
      setAdmins(admins.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
      toast.success(currentStatus ? "Admin deactivated" : "Admin activated");
    } catch (err: any) {
      toast.error("Failed to update status: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const data: any = {
        email,
        password,
        full_name: fullName,
        role,
      };
      // Department is ONLY for PRODUCT_ADMIN; SHIPPING_ADMIN and DELIVERY_ADMIN are system-wide
      if (department && role === "PRODUCT_ADMIN") {
        data.department = department;
      } else {
        data.department = null;
      }
      
      const response = await usersApi.createAdmin(data);
      setAdmins([response.data, ...admins]);
      toast.success("Admin created successfully!");
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (admin: User) => {
    setEditingAdmin(admin);
    setRole(admin.role);
    setDepartment(admin.department || "");
    setIsEditModalOpen(true);
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    try {
      setIsSubmitting(true);
      const data: any = { role };
      // Department is ONLY for PRODUCT_ADMIN; all other roles are system-wide
      if (department && role === "PRODUCT_ADMIN") {
        data.department = department;
      } else {
        data.department = null;
      }
      
      const response = await usersApi.updateAdminRole(editingAdmin.id, data);
      setAdmins(admins.map(a => a.id === editingAdmin.id ? response.data : a));
      toast.success("Admin updated successfully!");
      setIsEditModalOpen(false);
      setEditingAdmin(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setRole("PRODUCT_ADMIN");
    setDepartment("");
  };

  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => {
      const matchesSearch = 
        admin.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (admin.full_name && admin.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = roleFilter === "ALL" || admin.role === roleFilter;
      const matchesDept = departmentFilter === "ALL" || admin.department === departmentFilter || (!admin.department && departmentFilter === "SYSTEM_WIDE");
      return matchesSearch && matchesRole && matchesDept;
    });
  }, [admins, searchQuery, roleFilter, departmentFilter]);

  if (isLoading && admins.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage enterprise administrators and their permissions</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Admin
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 flex items-center text-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search admins by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="PRODUCT_ADMIN">Product Admin</option>
            <option value="SHIPPING_ADMIN">Shipping Admin</option>
            <option value="DELIVERY_ADMIN">Delivery Admin</option>
          </select>
          <select 
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
          >
            <option value="ALL">All Departments</option>
            <option value="SYSTEM_WIDE">System Wide</option>
            <option value="ELECTRONICS">Electronics</option>
            <option value="FASHION">Fashion</option>
            <option value="GROCERY">Grocery</option>
            <option value="FURNITURE">Furniture</option>
            <option value="BEAUTY">Beauty</option>
            <option value="HOME_KITCHEN">Home & Kitchen</option>
          </select>
        </div>
      </div>

      {/* Admin Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800/50">
                        {admin.full_name?.charAt(0).toUpperCase() || admin.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{admin.full_name || "N/A"}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      <ShieldAlert className="h-3 w-3 mr-1" /> {admin.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {admin.department ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {admin.department.replace("_", " ")}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500 italic">System Wide</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.is_active 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}>
                      {admin.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-2">
                    {admin.role !== 'SUPER_ADMIN' && (
                      <>
                        <button
                          onClick={() => openEditModal(admin)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                          title="Edit role / department"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(admin.id, admin.is_active)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                            admin.is_active 
                              ? "text-red-700 bg-red-50 hover:bg-red-100 border-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40" 
                              : "text-green-700 bg-green-50 hover:bg-green-100 border-green-100 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
                          }`}
                          title={admin.is_active ? "Deactivate admin" : "Activate admin"}
                        >
                          {admin.is_active ? (
                            <><X className="h-4 w-4 mr-1" /> Deactivate</>
                          ) : (
                            <><Check className="h-4 w-4 mr-1" /> Activate</>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/40 transition-colors"
                          title="Permanently delete this admin"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAdmins.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No admins found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Admin Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEditModalOpen ? "Edit Admin" : "Create New Admin"}
              </h2>
              <button 
                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); setEditingAdmin(null); }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={isEditModalOpen ? handleEditAdmin : handleCreateAdmin} className="p-6 space-y-4">
              
              {isEditModalOpen && editingAdmin && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Editing <span className="font-semibold text-gray-900 dark:text-white">{editingAdmin.email}</span></p>
                </div>
              )}

              {!isEditModalOpen && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="PRODUCT_ADMIN">Product Admin</option>
                  <option value="SHIPPING_ADMIN">Shipping Admin</option>
                  <option value="DELIVERY_ADMIN">Delivery Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              {/* Department: ONLY shown for PRODUCT_ADMIN */}
              {role === "PRODUCT_ADMIN" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Department</option>
                    <option value="ELECTRONICS">Electronics</option>
                    <option value="FASHION">Fashion</option>
                    <option value="GROCERY">Grocery</option>
                    <option value="FURNITURE">Furniture</option>
                    <option value="BEAUTY">Beauty</option>
                    <option value="HOME_KITCHEN">Home &amp; Kitchen</option>
                  </select>
                </div>
              )}

              {/* System-wide notice for non-PRODUCT_ADMIN roles */}
              {role !== "PRODUCT_ADMIN" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg px-4 py-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    {role === "SUPER_ADMIN" && "⚡ Super Admin has full system-wide access across all departments."}
                    {role === "SHIPPING_ADMIN" && "📦 Shipping Admin manages the centralized shipping pipeline — not department scoped."}
                    {role === "DELIVERY_ADMIN" && "🚚 Delivery Admin manages the centralized delivery pipeline — not department scoped."}
                  </p>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); setEditingAdmin(null); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSubmitting && (
                    <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {isEditModalOpen ? "Save Changes" : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

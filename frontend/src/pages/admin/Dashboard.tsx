import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "@/api";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  ArrowRight
} from "lucide-react";

interface DashboardStats {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  active_products: number;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApi.getDashboardStats();
        setStats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load dashboard stats.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-6 text-center text-red-600 dark:text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg transition-transform hover:-translate-y-1">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold">${stats?.total_revenue?.toFixed(2) || "0.00"}</p>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
        </div>

        {/* Orders Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Orders</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_orders || 0}</p>
            </div>
            <div className="rounded-full bg-blue-50 dark:bg-blue-900/20 p-3 text-blue-600 dark:text-blue-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </div>
          <Link to="/admin/orders" className="mt-4 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
            View orders <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Users Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_users || 0}</p>
            </div>
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-900/20 p-3 text-emerald-600 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <Link to="/admin/users" className="mt-4 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
            View users <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Products Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Products</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats?.active_products || 0}</p>
            </div>
            <div className="rounded-full bg-orange-50 dark:bg-orange-900/20 p-3 text-orange-600 dark:text-orange-400">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <Link to="/admin/products" className="mt-4 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
            View products <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

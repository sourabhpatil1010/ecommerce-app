import { useState, useEffect } from "react";
import { dashboardApi } from "@/api";
import { formatCurrency } from "@/utils/currency";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  TrendingUp,
  Activity,
  Box,
  RefreshCcw,
  CheckCircle2
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar 
} from "recharts";
import { Skeleton, DashboardCardSkeleton, ErrorState } from "@/components/common";

interface DashboardStats {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  active_products: number;
}

// Mock Data
const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const orderStatusData = [
  { name: 'Pending', value: 10, color: '#f59e0b' },
  { name: 'Confirmed', value: 25, color: '#3b82f6' },
  { name: 'Packed', value: 15, color: '#6366f1' },
  { name: 'Shipped', value: 30, color: '#8b5cf6' },
  { name: 'Delivered', value: 45, color: '#10b981' },
];

const departmentData = [
  { name: 'Electronics', sales: 4000 },
  { name: 'Fashion', sales: 3000 },
  { name: 'Grocery', sales: 2000 },
  { name: 'Furniture', sales: 2780 },
  { name: 'Beauty', sales: 1890 },
  { name: 'Home', sales: 2390 },
];

const recentActivity = [
  { id: 1, text: 'New order #1024 placed by Alex', time: '10 mins ago', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 2, text: 'User Sarah registered', time: '1 hour ago', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 3, text: 'Product "Wireless Headphones" restocked', time: '2 hours ago', icon: Package, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { id: 4, text: 'Order #1020 marked as delivered', time: '3 hours ago', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  { id: 5, text: 'Refund for order #1015 processed', time: '5 hours ago', icon: RefreshCcw, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
];

const ratingData = [
  { stars: '5 Star', count: 120 },
  { stars: '4 Star', count: 45 },
  { stars: '3 Star', count: 15 },
  { stars: '2 Star', count: 5 },
  { stars: '1 Star', count: 2 },
];

const topProducts = [
  { id: '1', name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', sales: 124, revenue: 12400 },
  { id: '2', name: 'Premium Cotton T-Shirt', category: 'Fashion', sales: 98, revenue: 1960 },
  { id: '3', name: 'Smart Fitness Watch', category: 'Electronics', sales: 85, revenue: 17000 },
  { id: '4', name: 'Organic Arabica Coffee', category: 'Grocery', sales: 76, revenue: 1140 },
  { id: '5', name: 'Ergonomic Desk Chair', category: 'Furniture', sales: 42, revenue: 6300 },
];

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
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32 hidden sm:block rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <DashboardCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[380px] rounded-2xl" />
          <Skeleton className="h-[380px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Dashboard Failed to Load" 
        message={error} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Overview</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Metrics and performance for your store</p>
        </div>
        <button className="hidden sm:flex items-center gap-2 rounded-lg bg-black dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
          <Activity className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Revenue</h3>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
              <DollarSign className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(stats?.total_revenue || 0)}</p>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="mr-1 h-4 w-4" />
            <span>+12.5% from last month</span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Orders</h3>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
              <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.total_orders || 0}</p>
          <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="mr-1 h-4 w-4" />
            <span>+8.2% from last month</span>
          </div>
        </div>

        {/* Users Card */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customers</h3>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
              <Users className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.total_users || 0}</p>
          <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="mr-1 h-4 w-4" />
            <span>+5.1% from last month</span>
          </div>
        </div>

        {/* Products Card */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Products</h3>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
              <Package className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.active_products || 0}</p>
          <div className="mt-4 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
            <span>24 out of stock</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`$${value}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#111827" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  className="dark:stroke-white dark:dot-fill-black"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Orders Status</h3>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value}%`, 'Orders']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full grid grid-cols-2 gap-2 mt-4">
              {orderStatusData.map((item, index) => (
                <div key={index} className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Sales by Department</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`$${value}`, 'Sales']}
                />
                <Bar dataKey="sales" fill="#111827" radius={[4, 4, 0, 0]} className="dark:fill-white" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Analytics */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Rating Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis dataKey="stars" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} width={50} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [value, 'Reviews']}
                />
                <Bar dataKey="count" fill="#fbbf24" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            <button className="text-sm font-semibold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-6">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.bg}`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Products</h3>
          <button className="text-sm font-semibold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
            Full Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Sales</th>
                <th className="px-6 py-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {topProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Box className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{product.category}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{product.sales}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

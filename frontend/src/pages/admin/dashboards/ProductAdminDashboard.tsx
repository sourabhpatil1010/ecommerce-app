import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "@/api/orders";
import { Order } from "@/types/order";
import { formatCurrency } from "@/utils/currency";
import { Package, Check, X, Clock, ShoppingBag, CheckCircle } from "lucide-react";

export function ProductAdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      // Fetch only pending and confirmed orders for this department
      const response = await getAllOrders({ statuses: ["PLACED", "CONFIRMED"] });
      setOrders(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirm = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, { status: "CONFIRMED" });
      setOrders((prev) => 
        prev.map((o) => (o.id === orderId ? { ...o, status: "CONFIRMED" } : o))
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to confirm order");
    }
  };

  const handlePack = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, { status: "PACKED" });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to pack order");
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, { status: "CANCELLED", notes: "Rejected by admin" });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to reject order");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-black dark:border-gray-800 dark:border-t-white"></div>
      </div>
    );
  }

  const placedCount = orders.filter(o => o.status === "PLACED").length;
  const confirmedCount = orders.filter(o => o.status === "CONFIRMED").length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Product Fulfillment</h1>
        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Review and pack incoming orders before shipping.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Pending</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2">{orders.length}</h2>
            </div>
            <div className="h-10 w-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Awaiting Confirmation</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2">{placedCount}</h2>
            </div>
            <div className="h-10 w-10 bg-orange-50 dark:bg-orange-950/30 rounded-xl flex items-center justify-center text-orange-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Ready to Pack</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2">{confirmedCount}</h2>
            </div>
            <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center text-blue-500">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 p-4 text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
          <X className="w-4 h-4" />
          <p>{error}</p>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center">
            <Package className="w-4 h-4 mr-2 text-gray-400" />
            Action Queue
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Items</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CheckCircle className="h-8 w-8 mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm font-medium text-gray-500">You're all caught up!</p>
                      <p className="text-xs mt-1">No orders require action right now.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isPlaced = order.status === "PLACED";
                  const isConfirmed = order.status === "CONFIRMED";
                  
                  return (
                  <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-200">
                        {order.id.split("-")[0].toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                         isPlaced ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400" : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                       }`}>
                         {order.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPlaced && (
                          <>
                            <button
                              onClick={() => handleReject(order.id)}
                              className="h-8 px-3 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 transition-all flex items-center justify-center text-xs font-bold"
                            >
                              <X className="w-3.5 h-3.5 sm:mr-1" />
                              <span className="hidden sm:inline">Reject</span>
                            </button>
                            <button
                              onClick={() => handleConfirm(order.id)}
                              className="h-8 px-3 rounded-full bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center justify-center text-xs font-bold shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5 sm:mr-1" />
                              <span className="hidden sm:inline">Confirm</span>
                            </button>
                          </>
                        )}
                        {isConfirmed && (
                          <button
                            onClick={() => handlePack(order.id)}
                            className="h-8 px-4 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center text-xs font-bold shadow-[0_2px_10px_rgba(37,99,235,0.2)]"
                          >
                            <Package className="w-3.5 h-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Mark as Packed</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

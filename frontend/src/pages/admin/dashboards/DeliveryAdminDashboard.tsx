import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "@/api/orders";
import { Order } from "@/types/order";
import { formatCurrency } from "@/utils/currency";
import { Navigation, CheckCircle, XCircle, AlertTriangle, Truck } from "lucide-react";

export function DeliveryAdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await getAllOrders({ statuses: ["SHIPPED", "OUT_FOR_DELIVERY"] });
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

  const handleUpdate = async (orderId: string, status: string, notes?: string) => {
    try {
      await updateOrderStatus(orderId, { status, notes });
      if (status === "OUT_FOR_DELIVERY") {
        setOrders((prev) => 
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      } else {
        // DELIVERED, FAILED, RETURNED are terminal for this dashboard
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to mark order as ${status}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-black dark:border-gray-800 dark:border-t-white"></div>
      </div>
    );
  }

  const shippedCount = orders.filter(o => o.status === "SHIPPED").length;
  const outCount = orders.filter(o => o.status === "OUT_FOR_DELIVERY").length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Delivery Management</h1>
        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Track and update active deliveries in real-time.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">In Transit</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2">{shippedCount}</h2>
            </div>
            <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center text-blue-500">
              <Truck className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Out for Delivery</p>
               <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2">{outCount}</h2>
             </div>
             <div className="h-10 w-10 bg-orange-50 dark:bg-orange-950/30 rounded-xl flex items-center justify-center text-orange-500">
               <Navigation className="w-5 h-5" />
             </div>
           </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 p-4 text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
          <p>{error}</p>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center">
            <Navigation className="w-4 h-4 mr-2 text-gray-400" />
            Delivery Queue
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Address</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CheckCircle className="h-8 w-8 mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm font-medium text-gray-500">No active deliveries.</p>
                      <p className="text-xs mt-1">All packages have been accounted for.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isOutForDelivery = order.status === "OUT_FOR_DELIVERY";
                  
                  return (
                  <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-200">
                        {order.id.split("-")[0].toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                         isOutForDelivery 
                           ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400" 
                           : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                       }`}>
                         {order.status.replace("_", " ")}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {order.shipping_address ? (
                        <span className="truncate max-w-[200px] block" title={order.shipping_address}>
                          {order.shipping_address.replace(/\n/g, ", ")}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No address provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {!isOutForDelivery ? (
                        <button
                          onClick={() => handleUpdate(order.id, "OUT_FOR_DELIVERY")}
                          className="h-9 px-5 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-all inline-flex items-center justify-center text-xs font-bold shadow-[0_2px_10px_rgba(234,88,12,0.2)]"
                        >
                          <Navigation className="w-3.5 h-3.5 sm:mr-1.5" />
                          <span className="hidden sm:inline">Set Out for Delivery</span>
                        </button>
                      ) : (
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleUpdate(order.id, "FAILED", "Delivery attempt failed")}
                            className="h-9 w-9 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center dark:bg-gray-800 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                            title="Mark Failed"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdate(order.id, "RETURNED")}
                            className="h-9 w-9 rounded-full bg-gray-100 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 transition-colors flex items-center justify-center dark:bg-gray-800 dark:hover:bg-yellow-950/30 dark:hover:text-yellow-400"
                            title="Mark Returned"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdate(order.id, "DELIVERED")}
                            className="h-9 px-4 rounded-full bg-green-600 text-white hover:bg-green-700 transition-all inline-flex items-center justify-center text-xs font-bold shadow-[0_2px_10px_rgba(22,163,74,0.2)]"
                            title="Mark Delivered"
                          >
                            <CheckCircle className="w-3.5 h-3.5 sm:mr-1.5" />
                            <span className="hidden sm:inline">Delivered</span>
                          </button>
                        </div>
                      )}
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

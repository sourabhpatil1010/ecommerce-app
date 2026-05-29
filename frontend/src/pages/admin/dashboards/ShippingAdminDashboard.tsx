import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "@/api/orders";
import { Order } from "@/types/order";
import { formatCurrency } from "@/utils/currency";
import { Truck, Send, CheckCircle, Package } from "lucide-react";

export function ShippingAdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [shippingData, setShippingData] = useState<Record<string, { tracking_id: string; courier: string }>>({});

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      // Fetch packed orders
      const response = await getAllOrders({ statuses: ["PACKED"] });
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

  const handleShip = async (orderId: string) => {
    const data = shippingData[orderId];
    if (!data?.tracking_id || !data?.courier) {
      alert("Please provide tracking ID and courier before shipping.");
      return;
    }
    try {
      await updateOrderStatus(orderId, {
        status: "SHIPPED",
        tracking_id: data.tracking_id,
        courier: data.courier
      });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to ship order");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-black dark:border-gray-800 dark:border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Shipping Logistics</h1>
        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Manage packages ready for courier handover.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Awaiting Shipment</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2">{orders.length}</h2>
            </div>
            <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center text-blue-500">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hidden md:block">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-xs font-bold uppercase tracking-widest text-green-400">Daily Goal</p>
               <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2">Zero Backlog</h2>
             </div>
             <div className="h-10 w-10 bg-green-50 dark:bg-green-950/30 rounded-xl flex items-center justify-center text-green-500">
               <Truck className="w-5 h-5" />
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
            <Truck className="w-4 h-4 mr-2 text-gray-400" />
            Dispatch Queue
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Tracking Details</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CheckCircle className="h-8 w-8 mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm font-medium text-gray-500">Queue is empty!</p>
                      <p className="text-xs mt-1">All packed orders have been dispatched.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  return (
                  <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-200">
                        {order.id.split("-")[0].toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                         {order.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2 w-full max-w-xs">
                        <input
                          type="text"
                          placeholder="Courier Name"
                          className="w-1/2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white dark:bg-gray-800 dark:focus:bg-gray-900 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-gray-900 dark:text-white"
                          value={shippingData[order.id]?.courier || ""}
                          onChange={(e) => setShippingData({
                            ...shippingData,
                            [order.id]: { ...shippingData[order.id], courier: e.target.value }
                          })}
                        />
                        <input
                          type="text"
                          placeholder="Tracking ID"
                          className="w-1/2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white dark:bg-gray-800 dark:focus:bg-gray-900 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-gray-900 dark:text-white font-mono"
                          value={shippingData[order.id]?.tracking_id || ""}
                          onChange={(e) => setShippingData({
                            ...shippingData,
                            [order.id]: { ...shippingData[order.id], tracking_id: e.target.value }
                          })}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleShip(order.id)}
                        disabled={!shippingData[order.id]?.tracking_id || !shippingData[order.id]?.courier}
                        className="h-9 px-5 rounded-full bg-black text-white hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-black transition-all inline-flex items-center justify-center text-xs font-bold shadow-sm dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:disabled:hover:bg-white"
                      >
                        <Send className="w-3.5 h-3.5 sm:mr-1.5" />
                        <span className="hidden sm:inline">Dispatch</span>
                      </button>
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

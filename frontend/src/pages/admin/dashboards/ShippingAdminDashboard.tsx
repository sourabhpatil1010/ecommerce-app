import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "@/api/orders";
import { Order } from "@/types/order";
import { formatCurrency } from "@/utils/currency";
import { Truck, PackageCheck, Send } from "lucide-react";

export function ShippingAdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [shippingData, setShippingData] = useState<Record<string, { tracking_id: string; courier: string }>>({});

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      // Fetch confirmed and packed orders
      const response = await getAllOrders({ statuses: ["ORDER_CONFIRMED", "CONFIRMED", "PACKED"] });
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

  const handlePack = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, { status: "PACKED" });
      setOrders((prev) => 
        prev.map((o) => (o.id === orderId ? { ...o, status: "PACKED" } : o))
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to pack order");
    }
  };

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
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shipping Admin Dashboard</h1>
      </div>
      
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-6 text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <Truck className="w-5 h-5 mr-2 text-indigo-500" />
            Shipping Queue
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Details</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No orders in shipping queue.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isPacked = order.status === "PACKED";
                  return (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {order.id.split("-")[0]}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isPacked ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isPacked ? (
                          <div className="flex flex-col space-y-2">
                            <input 
                              type="text" 
                              placeholder="Tracking ID"
                              className="text-xs border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
                              value={shippingData[order.id]?.tracking_id || ""}
                              onChange={(e) => setShippingData({
                                ...shippingData, 
                                [order.id]: { ...shippingData[order.id], tracking_id: e.target.value }
                              })}
                            />
                            <input 
                              type="text" 
                              placeholder="Courier"
                              className="text-xs border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
                              value={shippingData[order.id]?.courier || ""}
                              onChange={(e) => setShippingData({
                                ...shippingData, 
                                [order.id]: { ...shippingData[order.id], courier: e.target.value }
                              })}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Needs Packing</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!isPacked ? (
                          <button
                            onClick={() => handlePack(order.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <PackageCheck className="w-4 h-4 mr-1" />
                            Pack
                          </button>
                        ) : (
                          <button
                            onClick={() => handleShip(order.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Ship
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

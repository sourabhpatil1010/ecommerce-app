import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "@/api/orders";
import { Order } from "@/types/order";
import { formatCurrency } from "@/utils/currency";
import { Navigation, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

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
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Admin Dashboard</h1>
      </div>
      
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-6 text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <Navigation className="w-5 h-5 mr-2 text-indigo-500" />
            Delivery Queue
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No orders in delivery queue.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isOutForDelivery = order.status === "OUT_FOR_DELIVERY";
                  return (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {order.id.split("-")[0]}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isOutForDelivery ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.shipping_address ? (
                          <span className="truncate max-w-xs block" title={order.shipping_address}>
                            {order.shipping_address}
                          </span>
                        ) : (
                          "No address provided"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {!isOutForDelivery ? (
                          <button
                            onClick={() => handleUpdate(order.id, "OUT_FOR_DELIVERY")}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-orange-600 hover:bg-orange-700"
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            Out for Delivery
                          </button>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleUpdate(order.id, "DELIVERED")}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                              title="Delivered"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdate(order.id, "RETURNED")}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700"
                              title="Returned"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdate(order.id, "FAILED", "Delivery attempt failed")}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                              title="Failed"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
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

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "@/api/orders";
import { formatCurrency } from "@/utils/currency";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

const normalizeStatus = (status: string) => {
  if (!status) return "UNKNOWN";
  const s = status.toUpperCase();
  if (s === "PENDING" || s === "PROCESSING") return "ORDER_CONFIRMED";
  return s;
};

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrders()
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
        setError("Could not load your orders. Please try again later.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const getStatusBadgeClass = (status: string) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case "ORDER_CONFIRMED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400";
      case "DELIVERED":
        return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const formatStatus = (status: string) => {
    return normalizeStatus(status).replace(/_/g, " ");
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Invalid Date";
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 dark:border-gray-800 border-t-black dark:border-t-white" />
      </div>
    );
  }

  return (
    <div className="container-app py-16 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-white">
          Order History
        </h1>
        <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          Check the status of recent orders, manage returns, and discover similar products.
        </p>
      </div>

      {error && (
        <div className="mb-8 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-400">
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl">
          <div className="h-20 w-20 text-gray-300 dark:text-gray-700 mb-6 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.0"
              stroke="currentColor"
              className="h-16 w-16"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
            No orders found
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mb-8 dark:text-gray-400">
            You haven't placed any orders yet. Browse our selection and find something you love!
          </p>
          <Link
            to="/products"
            className="rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 hover:scale-[1.02] transition-all dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${getStatusBadgeClass(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                  <span className="text-sm font-mono text-gray-400 dark:text-gray-500">
                    ID: {order.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Date Placed</p>
                    <p className="font-semibold text-black dark:text-white">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="font-bold text-black dark:text-white">{formatCurrency(order.total_amount)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 md:mt-0 border-t border-gray-100 dark:border-gray-800 pt-6 md:pt-0 md:border-none w-full md:w-auto">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-4 hidden md:block">
                  {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                </div>
                <Link
                  to={`/orders/${order.id}`}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3.5 text-sm font-bold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm group-hover:border-gray-300 dark:group-hover:border-gray-600"
                >
                  View Order
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

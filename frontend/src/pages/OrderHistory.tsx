import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "@/api/orders";

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
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
      case "completed":
      case "delivered":
        return "bg-green-50 text-green-700 border-green-250 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-250 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30";
      default:
        return "bg-blue-50 text-blue-700 border-blue-250 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
        Order History
      </h1>

      {error && (
        <div
          role="alert"
          className="mb-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
        >
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-gray-50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-2xl">
          <div className="h-16 w-16 text-gray-400 mb-4 bg-gray-100 dark:bg-gray-850 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.375c1.08 0 1.968-.9 1.968-2v-1.5c0-1.1-.9-2-1.968-2H9v5.5Zm11.25-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            No orders found
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            You haven't placed any orders yet. Browse our selection and find something you love!
          </p>
          <Link
            to="/products"
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 shadow-md shadow-primary-200/50 hover:shadow-lg transition-all"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-250 flex flex-col md:flex-row md:items-center justify-between p-6 gap-6"
            >
              {/* Left detail card */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <p>Placed on: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatDate(order.created_at)}</span></p>
                  <p>Items: <span className="font-semibold text-gray-700 dark:text-gray-300">{order.items.reduce((sum, i) => sum + i.quantity, 0)}</span></p>
                </div>
              </div>

              {/* Right cost / action details */}
              <div className="flex items-center justify-between md:justify-end gap-6 md:min-w-[200px]">
                <div className="text-left md:text-right">
                  <p className="text-xs text-gray-405 font-medium uppercase tracking-wider">Total Amount</p>
                  <p className="text-lg font-black text-gray-950 dark:text-white mt-0.5">
                    ${order.total_amount.toFixed(2)}
                  </p>
                </div>
                <Link
                  to={`/orders/${order.id}`}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-250 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

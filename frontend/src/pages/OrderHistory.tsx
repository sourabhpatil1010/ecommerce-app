import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "@/api/orders";
import { formatCurrency } from "@/utils/currency";
import { PackageOpen, ChevronRight, ShoppingBag, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Skeleton, EmptyState, ErrorState } from "@/components/common";

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
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20";
      case "DELIVERED":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case "ORDER_CONFIRMED": return <Clock className="w-3.5 h-3.5 mr-1" />;
      case "SHIPPED":
      case "OUT_FOR_DELIVERY": return <Truck className="w-3.5 h-3.5 mr-1" />;
      case "DELIVERED": return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case "CANCELLED": return <XCircle className="w-3.5 h-3.5 mr-1" />;
      default: return <PackageOpen className="w-3.5 h-3.5 mr-1" />;
    }
  };

  const getStatusProgress = (status: string) => {
    const normalized = normalizeStatus(status);
    if (normalized === "CANCELLED") return 0;
    if (normalized === "DELIVERED") return 100;
    if (normalized === "OUT_FOR_DELIVERY") return 90;
    if (normalized === "SHIPPED") return 75;
    if (normalized === "PACKED") return 50;
    return 25; // ORDER_CONFIRMED
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
      <div className="container-app py-16 max-w-5xl animate-in fade-in duration-500">
        <div className="mb-12">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
              <Skeleton className="h-1.5 w-full max-w-md mb-8 rounded-full" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          ))}
        </div>
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

      {error ? (
        <ErrorState title="Failed to load orders" message={error} onRetry={() => window.location.reload()} />
      ) : orders.length === 0 ? (
        <EmptyState 
          icon={ShoppingBag}
          title="No orders found"
          description="You haven't placed any orders yet. Browse our selection and find something you love!"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => {
            const progress = getStatusProgress(order.status);
            const isCancelled = normalizeStatus(order.status) === "CANCELLED";
            const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all group relative overflow-hidden"
              >
                {/* Status and ID Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border ${getStatusBadgeClass(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {formatStatus(order.status)}
                    </span>
                    <span className="text-sm font-mono font-medium bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-md text-gray-600 dark:text-gray-400">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <Link
                    to={`/orders/${order.id}`}
                    data-testid={`view-order-${order.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-50 dark:bg-gray-800 px-5 py-2.5 text-sm font-bold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                  </Link>
                </div>

                {/* Progress Bar Mini */}
                {!isCancelled && (
                  <div className="w-full max-w-md mt-2">
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-black dark:bg-white rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                )}

                {/* Order Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">Date Placed</p>
                    <p className="font-semibold text-black dark:text-white">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">Total Amount</p>
                    <p className="font-bold text-black dark:text-white">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">Items</p>
                    <p className="font-semibold text-black dark:text-white flex items-center gap-1.5">
                      <PackageOpen className="w-4 h-4 text-gray-400" />
                      {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">Status Updated</p>
                    <p className="font-semibold text-black dark:text-white">{formatDate(order.updated_at)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrder } from "@/api/orders";
import { formatCurrency } from "@/utils/currency";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product: Product | null;
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

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getOrder(id)
      .then((res) => {
        setOrder(res.data);
      })
      .catch((err) => {
        console.error("Failed to load order details:", err);
        setError("Could not load the details for this order.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStepClass = (step: string, currentStatus: string) => {
    const statuses = ["pending", "processing", "shipped", "delivered"];
    const stepIdx = statuses.indexOf(step);
    const currentIdx = statuses.indexOf(currentStatus.toLowerCase());

    if (currentStatus.toLowerCase() === "cancelled") {
      return "text-red-500 border-red-500 bg-red-50 dark:bg-red-950/20";
    }

    if (stepIdx <= currentIdx) {
      return "text-primary-600 border-primary-600 bg-primary-50 dark:bg-primary-950/20 dark:text-primary-400 dark:border-primary-400";
    }
    return "text-gray-400 border-gray-200 bg-white dark:bg-gray-850 dark:border-gray-700";
  };

  const getStatusLineClass = (step: string, currentStatus: string) => {
    const statuses = ["pending", "processing", "shipped", "delivered"];
    const stepIdx = statuses.indexOf(step);
    const currentIdx = statuses.indexOf(currentStatus.toLowerCase());

    if (currentStatus.toLowerCase() === "cancelled") {
      return "bg-red-200 dark:bg-red-900";
    }

    if (stepIdx < currentIdx) {
      return "bg-primary-600 dark:bg-primary-500";
    }
    return "bg-gray-200 dark:bg-gray-700";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-primary-600 dark:border-t-primary-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-app py-16 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 text-red-500 mb-4 bg-red-50 rounded-full flex items-center justify-center">
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
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {error || "Order not found"}
        </h2>
        <p className="text-gray-550 mb-8">
          The order details page you requested could not be retrieved.
        </p>
        <Link
          to="/orders"
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const shippingThreshold = 4000;
  const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 500;
  const taxCost = subtotal * 0.08;
  const placeholderImage = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&q=80";

  return (
    <div className="container-app py-12 space-y-8">
      {/* Header and Back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 mb-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.0"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            <span>Back to Orders</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Order Details
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Order ID: <span className="font-semibold text-gray-800 dark:text-gray-250">{order.id}</span>
          </p>
        </div>
        <div className="text-left sm:text-right bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-4 rounded-xl shadow-inner min-w-[200px]">
          <p className="text-xs text-gray-405 font-medium uppercase tracking-wider">Status</p>
          <p className="text-lg font-black mt-1 text-primary-600 dark:text-primary-400 uppercase tracking-wide">
            {order.status}
          </p>
        </div>
      </div>

      {/* Visual Status Progress Tracker */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Order Status Tracking
        </h2>
        {order.status.toLowerCase() === "cancelled" ? (
          <div className="flex items-center gap-3 text-red-650 font-bold bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200/50">
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <span>This order has been cancelled.</span>
          </div>
        ) : (
          <div className="relative flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-2">
            {/* Step: Pending */}
            <div className="flex flex-col items-center text-center z-10 w-full sm:w-auto">
              <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${getStatusStepClass("pending", order.status)}`}>
                1
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2">Pending</span>
            </div>

            {/* Line: Pending -> Processing */}
            <div className={`hidden sm:block h-0.5 flex-grow ${getStatusLineClass("pending", order.status)}`} />

            {/* Step: Processing */}
            <div className="flex flex-col items-center text-center z-10 w-full sm:w-auto">
              <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${getStatusStepClass("processing", order.status)}`}>
                2
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2">Processing</span>
            </div>

            {/* Line: Processing -> Shipped */}
            <div className={`hidden sm:block h-0.5 flex-grow ${getStatusLineClass("processing", order.status)}`} />

            {/* Step: Shipped */}
            <div className="flex flex-col items-center text-center z-10 w-full sm:w-auto">
              <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${getStatusStepClass("shipped", order.status)}`}>
                3
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2">Shipped</span>
            </div>

            {/* Line: Shipped -> Delivered */}
            <div className={`hidden sm:block h-0.5 flex-grow ${getStatusLineClass("shipped", order.status)}`} />

            {/* Step: Delivered */}
            <div className="flex flex-col items-center text-center z-10 w-full sm:w-auto">
              <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${getStatusStepClass("delivered", order.status)}`}>
                4
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2">Delivered</span>
            </div>
          </div>
        )}
      </div>

      {/* Two column detail cards */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              Items Ordered
            </h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="relative aspect-square h-16 w-16 overflow-hidden rounded-lg bg-gray-50 border border-gray-100 dark:border-gray-800">
                    <img
                      src={item.product?.image_url || placeholderImage}
                      alt={item.product?.name || "Product"}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-grow min-w-0 flex flex-col justify-center">
                    <Link
                      to={`/products/${item.product_id}`}
                      className="font-bold text-gray-950 dark:text-white text-sm hover:text-primary-600 dark:hover:text-primary-400 truncate"
                    >
                      {item.product?.name || "Unknown Product"}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      Qty: {item.quantity} · {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm self-center">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info summaries */}
        <div className="lg:col-span-1 space-y-6">
          {/* Shipping Info Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-50 dark:border-gray-800">
              Shipping Address
            </h3>
            <p className="text-sm text-gray-650 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {order.shipping_address}
            </p>
          </div>

          {/* Payment Info Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-50 dark:border-gray-800">
              Order Date & Time
            </h3>
            <p className="text-sm text-gray-650 dark:text-gray-300">
              {formatDate(order.created_at)}
            </p>
          </div>

          {/* Cost Summary Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-50 dark:border-gray-800">
              Cost Breakdown
            </h3>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              {shippingCost === 0 ? (
                <span className="font-semibold text-green-600 dark:text-green-400">Free</span>
              ) : (
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(shippingCost)}</span>
              )}
            </div>

            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(taxCost)}</span>
            </div>

            <div className="border-t border-gray-150 dark:border-gray-800 pt-3 flex justify-between text-sm font-bold text-gray-950 dark:text-white">
              <span>Order Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

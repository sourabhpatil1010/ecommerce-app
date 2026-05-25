import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getOrder } from "@/api/orders";
import { formatCurrency } from "@/utils/currency";

interface Order {
  id: string;
  total_amount: number;
  shipping_address: string;
  created_at: string;
}

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || "";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    if (!orderId) return;

    getOrder(orderId)
      .then((res) => {
        setOrder(res.data);
      })
      .catch((err) => {
        console.error("Failed to load order details for success screen:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId]);

  return (
    <div className="container-app py-16 max-w-2xl flex flex-col items-center">
      {/* Checkout Progress Tracker */}
      <div className="mb-12 w-full max-w-md mx-auto">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          <span className="text-primary-600 dark:text-primary-400">1. Shipping</span>
          <span className="text-primary-600 dark:text-primary-400">2. Payment</span>
          <span className="text-primary-600 dark:text-primary-400 font-bold">3. Confirmed</span>
        </div>
        <div className="mt-2 flex h-2 gap-1 overflow-hidden rounded-full bg-gray-150 dark:bg-gray-800">
          <div className="w-1/3 rounded-full bg-primary-650" />
          <div className="w-1/3 rounded-full bg-primary-650" />
          <div className="w-1/3 rounded-full bg-primary-650" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 sm:p-10 shadow-xl w-full text-center space-y-6 relative overflow-hidden">
        {/* Animated Checkmark Background Wave */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Animated Green Circle Checkmark */}
        <div className="mx-auto h-20 w-20 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-md">
          <svg
            className="h-10 w-10 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Thank you for your purchase! Your payment has been processed and your order has been confirmed.
          </p>
        </div>

        {/* Order Details box */}
        {loading ? (
          <div className="py-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600" />
          </div>
        ) : (
          order && (
            <div className="bg-gray-50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-5 text-left text-sm space-y-3.5 max-w-md mx-auto">
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-200/60 dark:border-gray-700/50">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Order ID
                </span>
                <span className="font-mono text-xs font-bold text-gray-800 dark:text-gray-200">
                  {order.id}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Total Paid</span>
                <span className="font-extrabold text-gray-950 dark:text-white">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-gray-450 dark:text-gray-550 block font-semibold text-xxs uppercase tracking-wider">
                  Ship To
                </span>
                <p className="text-xs text-gray-550 dark:text-gray-300 font-medium leading-relaxed">
                  {order.shipping_address}
                </p>
              </div>
            </div>
          )
        )}

        <div className="pt-4 grid gap-3 sm:grid-cols-2">
          <Link
            to="/orders"
            className="flex items-center justify-center rounded-xl border border-gray-250 hover:border-gray-350 dark:border-gray-700 dark:hover:border-gray-650 bg-white dark:bg-gray-850 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 transition-all"
          >
            View My Orders
          </Link>
          <Link
            to="/products"
            className="flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary-200/50 hover:shadow-lg transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

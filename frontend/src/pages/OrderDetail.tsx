import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrder, cancelOrder } from "@/api/orders";
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
  tracking_id: string | null;
  courier: string | null;
  items: OrderItem[];
  status_history: {
    id: string;
    new_status: string;
    created_at: string;
    notes: string | null;
  }[];
  created_at: string;
  updated_at: string;
}

const normalizeStatus = (status: string) => {
  if (!status) return "UNKNOWN";
  const s = status.toUpperCase();
  if (s === "PENDING" || s === "PROCESSING") return "ORDER_CONFIRMED";
  return s;
};

/* ─────────────────────── Toast Component ─────────────────────── */
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl text-sm font-semibold transition-all animate-slide-up ${
        type === "success"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
      style={{ animation: "slideUp 0.35s cubic-bezier(.21,1.02,.73,1)" }}
    >
      {type === "success" ? (
        <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}

/* ──────────────── Cancel Confirmation Modal ──────────────── */
function CancelModal({
  onConfirm,
  onClose,
  isLoading,
}: {
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.2s ease-out" }}
      onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md mx-4 overflow-hidden"
        style={{ animation: "scaleIn 0.25s cubic-bezier(.21,1.02,.73,1)" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4">
            <svg className="h-7 w-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Cancel Order
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors shadow-md shadow-red-200/50 dark:shadow-red-900/30 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Cancelling…</span>
              </>
            ) : (
              "Yes, Cancel Order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Main Page ─────────────────────── */
export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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

  const handleCancelOrder = useCallback(async () => {
    if (!id || !order) return;
    setIsCancelling(true);
    try {
      const res = await cancelOrder(id);
      setOrder(res.data);
      setShowCancelModal(false);
      setToast({ message: "Order has been cancelled successfully.", type: "success" });
    } catch (err: unknown) {
      setShowCancelModal(false);
      const errorDetail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Failed to cancel the order. Please try again.";
      setToast({ message: errorDetail, type: "error" });
    } finally {
      setIsCancelling(false);
    }
  }, [id, order]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Invalid Date";
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatStatus = (status: string) => {
    return status ? status.replace(/_/g, " ") : "UNKNOWN";
  };

  const isCancellable = order ? normalizeStatus(order.status) === "ORDER_CONFIRMED" : false;
  const isCancelled = order ? normalizeStatus(order.status) === "CANCELLED" : false;

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
        <h2 className="text-2xl font-bold text-gray-800 mb-2 dark:text-gray-100">
          {error || "Order not found"}
        </h2>
        <p className="text-gray-500 mb-8 dark:text-gray-400">
          The order details page you requested could not be retrieved.
        </p>
        <Link
          to="/orders"
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm dark:text-gray-200 dark:bg-slate-900"
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



  let estimatedDeliveryDate = "Invalid Date";
  try {
    const estimatedDelivery = new Date(order.created_at);
    if (!isNaN(estimatedDelivery.getTime())) {
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
      estimatedDeliveryDate = estimatedDelivery.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  } catch (e) {
    // Ignore error, fallback used
  }

  return (
    <div className="container-app py-12 space-y-8">
      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <CancelModal
          onConfirm={handleCancelOrder}
          onClose={() => !isCancelling && setShowCancelModal(false)}
          isLoading={isCancelling}
        />
      )}

      {/* Inline animation styles */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

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
            Order ID: <span className="font-semibold text-gray-800 dark:text-gray-200">{order.id}</span>
          </p>
          {!isCancelled && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Estimated Delivery: <span className="font-semibold text-gray-800 dark:text-gray-200">{estimatedDeliveryDate}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col items-start sm:items-end gap-3">
          <div className={`text-left sm:text-right p-4 rounded-xl shadow-inner min-w-[200px] border ${
            isCancelled
              ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30"
              : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
          }`}>
            <p className="text-xs text-gray-405 font-medium uppercase tracking-wider">Status</p>
            <p className={`text-lg font-black mt-1 uppercase tracking-wide ${
              isCancelled
                ? "text-red-600 dark:text-red-400"
                : "text-primary-600 dark:text-primary-400"
            }`}>
              {formatStatus(order.status)}
            </p>
          </div>
          {/* Cancel Order Button — only visible when ORDER_CONFIRMED */}
          {isCancellable && (
            <button
              id="cancel-order-btn"
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-gray-900 px-5 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all shadow-sm hover:shadow-md hover:border-red-400 dark:hover:border-red-700"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Visual Status Progress Tracker */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
          Order Updates
        </h2>
        
        {isCancelled && (!order.status_history || order.status_history.length === 0) ? (
          <div className="flex items-center gap-3 text-red-600 font-bold bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200/50">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <span>This order has been cancelled.</span>
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 md:ml-6 mt-4 pb-4">
            {(!order.status_history || order.status_history.length === 0) && (
              <div className="relative pl-6 md:pl-8 mb-8">
                <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary-600 ring-4 ring-white dark:ring-gray-900" />
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                      {formatStatus(order.status)}
                    </h3>
                  </div>
                  <time className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    {formatDate(order.created_at)}
                  </time>
                </div>
              </div>
            )}
            {order.status_history?.map((history, idx) => {
              const isLast = idx === order.status_history.length - 1;
              const isCancelledNode = history.new_status.includes("CANCELLED") || history.new_status.includes("FAILED");
              const dotColor = isCancelledNode ? "bg-red-500" : (isLast ? "bg-primary-600" : "bg-gray-400 dark:bg-gray-500");
              const ringColor = isCancelledNode ? "ring-red-100 dark:ring-red-900/30" : "ring-white dark:ring-gray-900";
              
              return (
                <div key={history.id} className="relative pl-6 md:pl-8 mb-8 last:mb-0">
                  <span className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full ${dotColor} ring-4 ${ringColor}`} />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <div>
                      <h3 className={`text-sm font-bold uppercase tracking-wide ${isCancelledNode ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {formatStatus(history.new_status)}
                      </h3>
                      {history.notes && (
                        <p className="text-sm text-gray-600 mt-2 dark:text-gray-400">{history.notes}</p>
                      )}
                    </div>
                    <time className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap mt-1 sm:mt-0">
                      {formatDate(history.created_at)}
                    </time>
                  </div>
                </div>
              );
            })}
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
                  <div className="relative aspect-square h-16 w-16 overflow-hidden rounded-lg bg-gray-50 border border-gray-100 dark:border-gray-800 dark:bg-slate-800">
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
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
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
          {/* Shipment Details Card */}
          {(order.tracking_id || order.courier) && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-50 dark:border-gray-800">
                Shipment Details
              </h3>
              <div className="space-y-3">
                {order.courier && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Courier Partner</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{order.courier}</p>
                  </div>
                )}
                {order.tracking_id && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Tracking ID</p>
                    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-0.5 font-mono">{order.tracking_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shipping Info Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-50 dark:border-gray-800">
              Shipping Address
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {order.shipping_address}
            </p>
          </div>

          {/* Payment Info Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-50 dark:border-gray-800">
              Order Date & Time
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
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

            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between text-sm font-bold text-gray-950 dark:text-white">
              <span>Order Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

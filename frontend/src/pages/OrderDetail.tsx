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
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-xl text-sm font-semibold transition-all animate-slide-up ${
        type === "success"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
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
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md mx-4 overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-5">
            <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Cancel Order
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
            Are you sure you want to cancel this order? This action cannot be undone and refunds may take 3-5 business days.
          </p>
        </div>
        <div className="px-8 pb-8 flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full rounded-full bg-red-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
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
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-3.5 text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Keep Order
          </button>
        </div>
      </div>
    </div>
  );
}

const STAGES = [
  { key: "PLACED", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PACKED", label: "Packed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

const getStageIndex = (status: string) => {
  const norm = status?.toUpperCase() || "";
  if (norm.includes("DELIVERED")) return 5;
  if (norm.includes("OUT_FOR_DELIVERY")) return 4;
  if (norm.includes("SHIPPED")) return 3;
  if (norm.includes("PACKED")) return 2;
  if (norm.includes("CONFIRMED") || norm.includes("PROCESSING") || norm.includes("PENDING")) return 1;
  return 0; // PLACED
};

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
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const isCancellable = order ? normalizeStatus(order.status) === "ORDER_CONFIRMED" : false;
  const isCancelled = order ? normalizeStatus(order.status) === "CANCELLED" : false;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-black dark:border-gray-800 dark:border-t-white" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="h-20 w-20 text-gray-300 dark:text-gray-700 mb-6 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-16 w-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-3">
          {error || "Order not found"}
        </h2>
        <Link
          to="/orders"
          className="mt-6 rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition-all dark:bg-white dark:text-black dark:hover:bg-gray-200"
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
      estimatedDeliveryDate = estimatedDelivery.toLocaleDateString("en-US", { weekday: 'long', month: "short", day: "numeric" });
    }
  } catch (e) {
    // Ignore error
  }

  const currentStageIndex = isCancelled ? -1 : getStageIndex(order.status);
  const progressPercentage = isCancelled ? 0 : Math.min(100, Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100));

  const stageTimestamps: Record<string, string> = {};
  if (order.status_history) {
    order.status_history.forEach(history => {
      const stageIdx = getStageIndex(history.new_status);
      if (stageIdx >= 0 && stageIdx < STAGES.length) {
        stageTimestamps[STAGES[stageIdx].key] = history.created_at;
      }
    });
  }
  if (currentStageIndex >= 0 && !stageTimestamps[STAGES[currentStageIndex].key]) {
      stageTimestamps[STAGES[currentStageIndex].key] = order.updated_at;
  }
  if (!stageTimestamps["PLACED"]) {
      stageTimestamps["PLACED"] = order.created_at;
  }

  return (
    <div className="container-app py-16 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {showCancelModal && (
        <CancelModal
          onConfirm={handleCancelOrder}
          onClose={() => !isCancelling && setShowCancelModal(false)}
          isLoading={isCancelling}
        />
      )}

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Orders
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-white">
            Order Details
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            Order ID: <span className="font-mono text-black dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{order.id.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>

        {isCancellable && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-6 py-2.5 rounded-full border-2 border-red-100 text-red-600 text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-colors dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Tracking Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 sm:p-12 shadow-sm mb-8 relative overflow-hidden">
        {isCancelled ? (
          <div className="text-center py-6">
            <div className="mx-auto h-16 w-16 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Order Cancelled</h2>
            <p className="text-gray-500 dark:text-gray-400">This order has been cancelled and will not be shipped.</p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
               <div>
                 <h2 className="text-2xl font-bold text-black dark:text-white mb-1">
                   {currentStageIndex === 5 ? "Delivered" : "Arriving"}
                 </h2>
                 <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                   {currentStageIndex === 5 ? formatDate(stageTimestamps["DELIVERED"]) : estimatedDeliveryDate}
                 </p>
               </div>
               <div className="mt-4 md:mt-0 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-1">Status</span>
                  <span className="text-sm font-bold text-black dark:text-white">
                    {STAGES[currentStageIndex]?.label || order.status.replace(/_/g, " ")}
                  </span>
               </div>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="relative pt-4 pb-8 px-2 md:px-8">
              {/* Background Line */}
              <div className="absolute top-6 left-6 right-6 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full" />
              
              {/* Foreground Line */}
              <div 
                className="absolute top-6 left-6 h-1.5 bg-black dark:bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: `calc(${progressPercentage}% - ${progressPercentage === 100 ? '3rem' : '3rem'})` }}
              />

              <div className="relative flex justify-between">
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isActive = idx === currentStageIndex;
                  const hasTimestamp = !!stageTimestamps[stage.key];
                  
                  return (
                    <div key={stage.key} className="flex flex-col items-center relative w-12 sm:w-20">
                      <div className={`h-5 w-5 rounded-full z-10 transition-all duration-500 border-[3px] bg-white dark:bg-gray-900 ${
                        isCompleted ? "border-black dark:border-white scale-125" : "border-gray-200 dark:border-gray-700"
                      } ${isActive ? "ring-4 ring-black/10 dark:ring-white/10" : ""}`} />
                      
                      <div className="mt-4 text-center absolute top-8 w-24 left-1/2 -translate-x-1/2">
                        <p className={`text-[11px] font-bold uppercase tracking-wider ${isCompleted ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                          {stage.label}
                        </p>
                        {hasTimestamp && isCompleted && (
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {formatDate(stageTimestamps[stage.key])}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Items & Shipping */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-black dark:text-white mb-6">Items Ordered</h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800">
                    <img
                      src={item.product?.image_url || placeholderImage}
                      alt={item.product?.name || "Product"}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <Link
                      to={`/products/${item.product_id}`}
                      className="font-bold text-black dark:text-white text-base hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {item.product?.name || "Unknown Product"}
                    </Link>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                      Qty: {item.quantity} · {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <span className="text-base font-extrabold text-black dark:text-white self-center">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-black dark:text-white mb-6">Delivery Details</h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Shipping Address</p>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-medium">
                    {order.shipping_address}
                  </p>
                </div>
              </div>

              {(order.courier || order.tracking_id) && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {order.courier && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Courier</p>
                      <p className="text-sm font-semibold text-black dark:text-white">{order.courier}</p>
                    </div>
                  )}
                  {order.tracking_id && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Tracking ID</p>
                      <p className="text-sm font-mono font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block text-black dark:text-white">
                        {order.tracking_id}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Summary */}
        <div className="lg:col-span-5">
          <div className="bg-gray-50 dark:bg-gray-900 border-none rounded-3xl p-8 sticky top-24">
            <h3 className="text-xl font-bold text-black dark:text-white mb-6">Payment Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="text-black dark:text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                {shippingCost === 0 ? (
                  <span className="text-green-600 dark:text-green-400 font-bold">Free</span>
                ) : (
                  <span className="text-black dark:text-white">{formatCurrency(shippingCost)}</span>
                )}
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                <span>Estimated Tax (8%)</span>
                <span className="text-black dark:text-white">{formatCurrency(taxCost)}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-6 flex justify-between items-center">
              <span className="text-lg font-bold text-black dark:text-white">Total</span>
              <span className="text-2xl font-extrabold text-black dark:text-white">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

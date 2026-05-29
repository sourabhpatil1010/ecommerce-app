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

/* ─────────────────────── Icons ─────────────────────── */
const Icons = {
  PLACED: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  CONFIRMED: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  PACKED: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-9.688l2.25-1.313m0 0l2.25 1.313m-2.25-1.313v-2.25m0 11.25l2.25-1.313m-2.25 1.313l-2.25-1.313m0-9.688l2.25 1.313m-2.25-1.313l-2.25 1.313" />
    </svg>
  ),
  SHIPPED: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  OUT_FOR_DELIVERY: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  DELIVERED: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )
};

const STAGES = [
  { key: "PLACED", label: "Placed", icon: Icons.PLACED },
  { key: "CONFIRMED", label: "Confirmed", icon: Icons.CONFIRMED },
  { key: "PACKED", label: "Packed", icon: Icons.PACKED },
  { key: "SHIPPED", label: "Shipped", icon: Icons.SHIPPED },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Icons.OUT_FOR_DELIVERY },
  { key: "DELIVERED", label: "Delivered", icon: Icons.DELIVERED },
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
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const isCancellable = order ? normalizeStatus(order.status) === "ORDER_CONFIRMED" : false;
  const isCancelled = order ? normalizeStatus(order.status) === "CANCELLED" : false;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-800 border-t-cyan-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-900 py-16 flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 text-red-400 mb-6 bg-red-900/30 rounded-full flex items-center justify-center backdrop-blur-md border border-red-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-10 w-10"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">
          {error || "Order not found"}
        </h2>
        <p className="text-gray-400 mb-8 max-w-md">
          The order details page you requested could not be retrieved. It may have been deleted or never existed.
        </p>
        <Link
          to="/orders"
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all"
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
    // Ignore error
  }

  const currentStageIndex = isCancelled ? -1 : getStageIndex(order.status);
  const progressPercentage = isCancelled ? 0 : Math.min(100, Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100));

  // Try to map status history timestamps to stages
  const stageTimestamps: Record<string, string> = {};
  if (order.status_history) {
    order.status_history.forEach(history => {
      const stageIdx = getStageIndex(history.new_status);
      if (stageIdx >= 0 && stageIdx < STAGES.length) {
        stageTimestamps[STAGES[stageIdx].key] = history.created_at;
      }
    });
  }
  // Make sure current stage has a timestamp (fallback to order updated_at)
  if (currentStageIndex >= 0 && !stageTimestamps[STAGES[currentStageIndex].key]) {
      stageTimestamps[STAGES[currentStageIndex].key] = order.updated_at;
  }
  // Placed is always created_at
  if (!stageTimestamps["PLACED"]) {
      stageTimestamps["PLACED"] = order.created_at;
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] text-gray-100 pb-24">
      <div className="container-app py-8 space-y-8">
        
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

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mb-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to Orders
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Order Details
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-400">
              <p>ID: <span className="font-mono text-gray-200">{order.id}</span></p>
              {!isCancelled && (
                <p>Est. Delivery: <span className="font-semibold text-cyan-400">{estimatedDeliveryDate}</span></p>
              )}
            </div>
          </div>

          {/* Status Summary Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] min-w-[260px] flex items-center justify-between hover:shadow-[0_8px_30px_rgba(34,211,238,0.05)] transition-all">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Current Status</p>
              <p className={`text-xl font-bold uppercase tracking-wide ${isCancelled ? "text-red-400" : "bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"}`}>
                {isCancelled ? "CANCELLED" : STAGES[currentStageIndex]?.label || order.status.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Updated: {formatDate(order.updated_at)}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isCancelled ? 'bg-red-900/30 text-red-400' : 'bg-cyan-900/30 text-cyan-400'}`}>
               {isCancelled ? (
                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               ) : (
                 STAGES[currentStageIndex]?.icon || Icons.CONFIRMED
               )}
            </div>
          </div>
        </div>

        {/* Progress Tracker Section */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-xl font-bold text-white">Order Progress</h2>
            {isCancellable && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-4 py-2 rounded-full transition-colors border border-red-400/20"
              >
                Cancel Order
              </button>
            )}
          </div>

          {isCancelled ? (
             <div className="flex flex-col items-center justify-center py-8 text-center relative z-10">
               <div className="h-16 w-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </div>
               <h3 className="text-xl font-bold text-red-400 mb-2">Order Cancelled</h3>
               <p className="text-gray-400 text-sm max-w-md">This order has been cancelled and will not be processed further. If you have been charged, a refund will be initiated.</p>
             </div>
          ) : (
            <div className="relative z-10">
              {/* Horizontal Tracker for larger screens */}
              <div className="hidden md:flex justify-between items-start w-full relative mb-12 px-4">
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isActive = idx === currentStageIndex;
                  const hasTimestamp = !!stageTimestamps[stage.key];
                  
                  return (
                    <div key={stage.key} className="flex flex-col items-center relative w-1/5 z-10">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center border-[3px] shadow-lg transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-400 border-transparent text-white shadow-cyan-500/30' 
                          : 'bg-gray-800 border-gray-700 text-gray-500'
                      } ${isActive ? 'scale-110 ring-4 ring-cyan-500/20' : ''}`}>
                        {stage.icon}
                      </div>
                      <div className="mt-4 text-center">
                        <p className={`text-sm font-bold tracking-wide ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                          {stage.label}
                        </p>
                        {hasTimestamp && isCompleted && (
                          <p className="text-[11px] text-gray-400 mt-1 font-medium whitespace-nowrap">
                            {formatDate(stageTimestamps[stage.key])}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Connecting lines background */}
                <div className="absolute top-6 left-12 right-12 h-[3px] bg-gray-800 -z-10 rounded-full" />
                {/* Connecting lines foreground */}
                <div 
                  className="absolute top-6 left-12 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 -z-10 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `calc(${progressPercentage}% - ${progressPercentage === 100 ? '4rem' : '3rem'})` }}
                />
              </div>

              {/* Vertical Tracker for mobile */}
              <div className="md:hidden flex flex-col space-y-6 relative pl-4">
                <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-800" />
                <div 
                  className="absolute left-[27px] top-6 w-0.5 bg-gradient-to-b from-blue-500 to-cyan-400 transition-all duration-1000 ease-out" 
                  style={{ height: `calc(${progressPercentage}%)` }} 
                />
                
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isActive = idx === currentStageIndex;
                  const hasTimestamp = !!stageTimestamps[stage.key];
                  
                  return (
                    <div key={stage.key} className="flex gap-4 relative z-10">
                      <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-400 border-transparent text-white shadow-cyan-500/30' 
                          : 'bg-gray-800 border-gray-700 text-gray-500'
                      } ${isActive ? 'scale-110 ring-4 ring-cyan-500/20' : ''}`}>
                        <div className="scale-75">{stage.icon}</div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className={`text-base font-bold ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                          {stage.label}
                        </p>
                        {hasTimestamp && isCompleted && (
                          <p className="text-xs text-gray-400 mt-0.5 font-medium">
                            {formatDate(stageTimestamps[stage.key])}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar Label */}
              <div className="mt-8 md:mt-4">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
                  <span>{progressPercentage.toFixed(0)}% Completed</span>
                  <span>100% when delivered</span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-cyan-300 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Three Responsive Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Order Summary */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-[0_8px_30px_rgba(34,211,238,0.05)] transition-all flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
              Order Summary
            </h3>
            <div className="space-y-4 flex-grow">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-200">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Shipping</span>
                {shippingCost === 0 ? (
                  <span className="font-semibold text-cyan-400">Free</span>
                ) : (
                  <span className="font-semibold text-gray-200">{formatCurrency(shippingCost)}</span>
                )}
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-gray-200">{formatCurrency(taxCost)}</span>
              </div>
            </div>
            <div className="border-t border-white/10 pt-5 mt-5 flex justify-between items-center text-lg font-bold text-white">
              <span>Total</span>
              <span className="text-cyan-400 drop-shadow-md">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          {/* Card 2: Shipping Address */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-[0_8px_30px_rgba(34,211,238,0.05)] transition-all">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
              Shipping Address
            </h3>
            <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
              <p className="font-semibold text-gray-200 mb-2">{order.shipping_address.split('\n')[0]}</p>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line mb-3">
                {order.shipping_address.includes('\n') ? order.shipping_address.substring(order.shipping_address.indexOf('\n') + 1) : order.shipping_address}
              </p>
              
              {(order.courier || order.tracking_id) && (
                <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
                  {order.courier && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Courier</span>
                      <span className="text-sm text-gray-300 font-medium">{order.courier}</span>
                    </div>
                  )}
                  {order.tracking_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Tracking ID</span>
                      <span className="text-sm text-cyan-400 font-mono bg-cyan-400/10 px-2 py-0.5 rounded">{order.tracking_id}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Order Items */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-[0_8px_30px_rgba(34,211,238,0.05)] transition-all flex flex-col h-[400px] lg:h-auto">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
              Order Items ({order.items.length})
            </h3>
            <div className="overflow-y-auto pr-2 -mr-2 space-y-4 custom-scrollbar flex-grow">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                  <div className="relative aspect-square h-16 w-16 overflow-hidden rounded-xl bg-gray-800 shrink-0">
                    <img
                      src={item.product?.image_url || placeholderImage}
                      alt={item.product?.name || "Product"}
                      className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-grow min-w-0 flex flex-col justify-center">
                    <Link
                      to={`/products/${item.product_id}`}
                      className="font-bold text-gray-200 text-sm hover:text-cyan-400 truncate transition-colors"
                    >
                      {item.product?.name || "Unknown Product"}
                    </Link>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      <span className="font-bold text-white text-sm">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* Info Banner at the bottom */}
      {!isCancelled && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-xl border-t border-white/10 px-4 py-4 md:py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
          <div className="container-app flex items-center justify-center gap-3 text-sm font-medium">
             <div className="h-8 w-8 rounded-full bg-cyan-900/50 flex items-center justify-center text-cyan-400 shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
             </div>
             <p className="text-gray-300">
               {currentStageIndex === 5 
                  ? "Your order has been successfully delivered! Thank you for shopping with us."
                  : currentStageIndex === 4
                  ? "Your order is out for delivery and will arrive shortly."
                  : currentStageIndex === 3
                  ? "Your order has been shipped and is on its way to you."
                  : currentStageIndex === 2
                  ? "Your order has been packed and is awaiting shipment."
                  : "Your order is confirmed and currently being processed."}
             </p>
          </div>
        </div>
      )}
      
      {/* Custom Scrollbar Style for the Items List */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.3);
        }
      `}</style>
    </div>
  );
}


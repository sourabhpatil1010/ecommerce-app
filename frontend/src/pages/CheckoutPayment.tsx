import { useState, useEffect, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getOrder } from "@/api/orders";
import * as paymentsApi from "@/api/payments";

// Initialize Stripe Promise
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const isRealStripeConfigured = stripePublishableKey && !stripePublishableKey.includes("placeholder");
const stripePromise = isRealStripeConfigured ? loadStripe(stripePublishableKey) : null;

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
}

export function CheckoutPaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Payment intent state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isSimulatedMode, setIsSimulatedMode] = useState(!isRealStripeConfigured);

  useEffect(() => {
    if (!orderId) return;

    const loadOrderAndIntent = async () => {
      try {
        // 1. Fetch Order Details
        const orderRes = await getOrder(orderId);
        setOrder(orderRes.data);

        // 2. Fetch/Create Payment Intent
        if (isRealStripeConfigured) {
          try {
            const intentRes = await paymentsApi.createPaymentIntent(orderId);
            setClientSecret(intentRes.data.client_secret);
          } catch (intentErr) {
            console.warn("Stripe backend integration failed or returned 400. Falling back to simulation.", intentErr);
            setIsSimulatedMode(true);
          }
        } else {
          setIsSimulatedMode(true);
        }
      } catch (err) {
        console.error("Error loading order or payment intent:", err);
        setError("Could not retrieve order details. Please check the order ID.");
      } finally {
        setLoading(false);
      }
    };

    loadOrderAndIntent();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-gray-50/50 dark:bg-gray-950/20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Securing payment connection…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-app py-16 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 text-red-500 mb-4 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Order</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">{error || "The specified order was not found."}</p>
        <Link to="/orders" className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 shadow-md transition-all">
          Go to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-12 max-w-6xl">
      {/* Checkout Progress Tracker */}
      <div className="mb-10 max-w-md mx-auto">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          <span className="text-primary-600 dark:text-primary-400">1. Shipping</span>
          <span className="text-primary-600 dark:text-primary-400">2. Payment</span>
          <span>3. Confirmed</span>
        </div>
        <div className="mt-2 flex h-2 gap-1 overflow-hidden rounded-full bg-gray-150 dark:bg-gray-800">
          <div className="w-1/3 rounded-full bg-primary-650" />
          <div className="w-1/3 rounded-full bg-primary-650 animate-pulse" />
          <div className="w-1/3 rounded-full bg-transparent" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Main Payment Section */}
        <div className="lg:col-span-7 xl:col-span-8">
          {isSimulatedMode ? (
            <SimulatedPaymentForm order={order} />
          ) : (
            stripePromise && clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <RealStripeForm order={order} clientSecret={clientSecret} />
              </Elements>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-250 dark:border-yellow-900/50 p-6 rounded-2xl">
                <h3 className="font-bold text-yellow-800 dark:text-yellow-400">Stripe Initialization Error</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-2">
                  Stripe failed to initialize. We are automatically switching you to Simulated Payment Mode.
                </p>
                <button
                  onClick={() => setIsSimulatedMode(true)}
                  className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl text-sm transition-all"
                >
                  Proceed with Simulated Payment
                </button>
              </div>
            )
          )}
        </div>

        {/* Sidebar Order Summary */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
                Order Summary
              </h3>
              <p className="text-xs text-gray-400 mt-1.5 font-mono">ID: {order.id}</p>
            </div>

            {/* Items List */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[30vh] overflow-y-auto pr-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                    <img
                      src={item.product?.image_url || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&q=80"}
                      alt={item.product?.name || "Product"}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {item.product?.name}
                    </h4>
                    <p className="text-xxs text-gray-500 mt-0.5">
                      Qty: {item.quantity} · ${item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Shipping Detail */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
              <span className="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xxs mb-1">
                Shipping Address
              </span>
              <p className="text-gray-550 dark:text-gray-400 font-medium leading-relaxed">
                {order.shipping_address}
              </p>
            </div>

            {/* Pricing Total */}
            <div className="border-t border-gray-150 dark:border-gray-800 pt-4 flex justify-between text-base font-bold text-gray-950 dark:text-white">
              <span>Amount Due</span>
              <span>${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** -------------------------------------------------------------
 * 1. REAL STRIPE FORM (Elements-wrapped CardElement)
 * ------------------------------------------------------------- */
function RealStripeForm({ order, clientSecret }: { order: Order; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setError(null);
    setIsProcessing(true);
    setStatusMessage("Authorizing card payment...");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card details not loaded yet.");
      setIsProcessing(false);
      return;
    }

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: fullName,
          },
        },
      });

      if (confirmError) {
        setError(confirmError.message || "An error occurred with your credit card confirmation.");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        setStatusMessage("Verifying order payment status...");
        // Poll for backend updates (up to 8 times)
        const isVerified = await pollStatus(order.id);
        if (isVerified) {
          navigate(`/checkout/success?order_id=${order.id}`, { replace: true });
        } else {
          setError("Payment confirmed but order status update timed out. Please check your orders page.");
          setIsProcessing(false);
        }
      } else {
        setError("Payment authorization failed or was canceled.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred during confirmation.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="h-10 w-10 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Secure Stripe Checkout</h2>
          <p className="text-xs text-gray-500">Your transaction is encrypted and secured via Stripe.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}

      {isProcessing && (
        <div className="flex flex-col items-center justify-center p-6 bg-primary-50/50 dark:bg-primary-950/10 border border-primary-100 dark:border-primary-900/30 rounded-xl gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-600" />
          <p className="text-sm font-semibold text-primary-800 dark:text-primary-400">{statusMessage}</p>
        </div>
      )}

      <div className="space-y-4" style={{ display: isProcessing ? "none" : "block" }}>
        {/* Billing Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cardName" className="text-xs font-semibold text-gray-650 uppercase tracking-wider">
            Cardholder Name
          </label>
          <input
            id="cardName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Stripe Elements Credit Card Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-650 uppercase tracking-wider">
            Credit Card Details
          </label>
          <div className="p-3.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "14px",
                    color: "#111827",
                    fontFamily: "Inter, sans-serif",
                    "::placeholder": {
                      color: "#9ca3af",
                    },
                  },
                  invalid: {
                    color: "#dc2626",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-200/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        Pay Now (${order.total_amount.toFixed(2)})
      </button>
    </form>
  );
}

/** -------------------------------------------------------------
 * 2. SIMULATED MOCK PAYMENT FORM (Sleek credit card visualization)
 * ------------------------------------------------------------- */
function SimulatedPaymentForm({ order }: { order: Order }) {
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (val: string) => {
    const formatted = val.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().substring(0, 19);
    setCardNumber(formatted);
  };

  const handleSimulatePayment = async (success: boolean) => {
    setError(null);
    setIsProcessing(true);
    setStatusMessage(success ? "Simulating secure Stripe request..." : "Initiating payment failure routine...");

    try {
      // 1. Hit backend simulate-webhook endpoint to simulate payment status updates
      await paymentsApi.simulatePaymentWebhook(order.id, success);
      
      // 2. Poll for payment status change (succeeded/failed) in DB to prove webhook verification
      setStatusMessage("Awaiting webhook database sync...");
      const isVerified = await pollStatus(order.id);
      
      if (success) {
        if (isVerified) {
          navigate(`/checkout/success?order_id=${order.id}`, { replace: true });
        } else {
          setError("Webhook simulation completed, but payment status verification timed out.");
          setIsProcessing(false);
        }
      } else {
        setError("Simulated Payment Failed. Please verify your details or use a different test card.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setError("Simulated payment failed to contact local webhook simulator.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-750 dark:bg-blue-950/30 dark:text-blue-400 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
          Mock Payment Mode
        </span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Simulated Stripe Checkout</h2>
        <p className="text-xs text-gray-500 mt-1">
          No valid Stripe Publishable Key found in environment. Simulated payment will execute a mock webhook sequence.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}

      {isProcessing && (
        <div className="flex flex-col items-center justify-center p-8 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-200 border-t-blue-600" />
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-400">{statusMessage}</p>
        </div>
      )}

      <div className="space-y-6" style={{ display: isProcessing ? "none" : "block" }}>
        {/* Interactive Physical-like Credit Card Visualizer */}
        <div className="w-full max-w-sm mx-auto h-48 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950 text-white p-6 flex flex-col justify-between shadow-xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-gradient-to-br from-white/5 to-white/0 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold tracking-widest text-white/70">PAYMENT CARD</span>
            {/* Contactless symbol SVG */}
            <svg className="h-6 w-6 text-white/50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8zm1.5 0c0 3.6 2.9 6.5 6.5 6.5s6.5-2.9 6.5-6.5-2.9-6.5-6.5-6.5-6.5 2.9-6.5 6.5z" />
            </svg>
          </div>
          {/* Card Chip Visual */}
          <div className="h-9 w-11 rounded-lg bg-yellow-600/35 border border-yellow-500/30 backdrop-blur-sm mt-2 flex items-center justify-center">
            <div className="h-6 w-8 rounded border border-yellow-500/20" />
          </div>
          <div className="space-y-2">
            <div className="text-xl font-mono tracking-widest text-white/90">
              {cardNumber || "•••• •••• •••• ••••"}
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-white/50">Cardholder</span>
                <span className="text-xs font-semibold tracking-wide uppercase text-white/95">
                  {cardHolder || "Jane Doe"}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[8px] uppercase tracking-wider text-white/50">Expires</span>
                <span className="text-xs font-semibold tracking-wide text-white/95">
                  {expiry || "MM/YY"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-650 uppercase tracking-wider">
              Cardholder Name
            </label>
            <input
              type="text"
              required
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-650 uppercase tracking-wider">
              Card Number
            </label>
            <input
              type="text"
              required
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="4111 1111 1111 1111"
              className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-650 uppercase tracking-wider">
              Expiration Date
            </label>
            <input
              type="text"
              required
              value={expiry}
              onChange={(e) => setExpiry(e.target.value.substring(0, 5))}
              placeholder="MM/YY"
              className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-650 uppercase tracking-wider">
              CVV
            </label>
            <input
              type="text"
              required
              value={cvv}
              onChange={(e) => setCvv(e.target.value.substring(0, 4))}
              placeholder="123"
              className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 px-3.5 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Simulated Buttons */}
        <div className="grid gap-3 sm:grid-cols-2 pt-2">
          <button
            type="button"
            onClick={() => handleSimulatePayment(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-green-200/50 hover:shadow-lg transition-all"
          >
            Simulate Success Payment
          </button>
          <button
            type="button"
            onClick={() => handleSimulatePayment(false)}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-650 hover:bg-red-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-red-200/50 hover:shadow-lg transition-all"
          >
            Simulate Failure Payment
          </button>
        </div>
      </div>
    </div>
  );
}

/** -------------------------------------------------------------
 * STATUS POLLING HELPER
 * ------------------------------------------------------------- */
async function pollStatus(orderId: string, maxAttempts = 8, intervalMs = 1200): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await paymentsApi.getPaymentStatus(orderId);
      if (res.data.status === "succeeded") {
        return true;
      }
      if (res.data.status === "failed") {
        return false;
      }
    } catch (err) {
      console.warn("Polling payment status error: ", err);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return false;
}

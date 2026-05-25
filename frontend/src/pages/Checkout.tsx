import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, useCart } from "@/hooks";
import { createOrder } from "@/api/orders";
import { formatCurrency } from "@/utils/currency";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, loading: cartLoading, fetchCart } = useCart();

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("United States");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingThreshold = 4000;
  const shippingCost = total >= shippingThreshold || total === 0 ? 0 : 500;
  const taxCost = total * 0.08;
  const orderTotal = total + shippingCost + taxCost;

  const placeholderImage = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&q=80";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const fullShippingAddress = `${fullName}, ${address}, ${city}, ${state} ${zipCode}, ${country}`;

    try {
      const res = await createOrder(fullShippingAddress);
      // Refresh the cart from backend since it has been cleared
      await fetchCart();
      // Redirect to secure payment checkout page
      navigate(`/checkout/payment/${res.data.id}`, { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(
        axiosErr?.response?.data?.detail ??
          "Something went wrong while placing your order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="container-app py-16 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 text-gray-400 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
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
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.116 60.116 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          You must add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/products"
          className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 shadow transition-all"
        >
          View Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
        Checkout
      </h1>

      {error && (
        <div
          role="alert"
          className="mb-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
        >
          <svg
            className="mt-0.5 h-4 w-4 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white pb-4 border-b border-gray-100 dark:border-gray-800">
              Shipping Information
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="fullName" className="text-xs font-semibold text-gray-650 dark:text-gray-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="address" className="text-xs font-semibold text-gray-650 dark:text-gray-400 uppercase tracking-wider">
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="123 Main St, Apt 4B"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                />
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="city" className="text-xs font-semibold text-gray-650 dark:text-gray-400 uppercase tracking-wider">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="San Francisco"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                />
              </div>

              {/* State */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="state" className="text-xs font-semibold text-gray-650 dark:text-gray-400 uppercase tracking-wider">
                  State / Province
                </label>
                <input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  placeholder="CA"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                />
              </div>

              {/* Zip Code */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="zipCode" className="text-xs font-semibold text-gray-650 dark:text-gray-400 uppercase tracking-wider">
                  ZIP / Postal Code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  required
                  placeholder="94107"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                />
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="country" className="text-xs font-semibold text-gray-650 dark:text-gray-400 uppercase tracking-wider">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  placeholder="United States"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <Link
                to="/cart"
                className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
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
                Back to Cart
              </Link>

              <button
                type="submit"
                disabled={isSubmitting || cartLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary-200/50 hover:bg-primary-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Placing Order…
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
              Order Summary
            </h2>

            {/* Cart Items List */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[30vh] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50">
                    <img
                      src={item.product?.image_url || placeholderImage}
                      alt={item.product?.name || "Product"}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {item.product?.name}
                    </h3>
                    <p className="text-xs text-gray-550 dark:text-gray-400 mt-0.5">
                      Qty: {item.quantity} · {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Details */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(total)}</span>
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

              <div className="border-t border-gray-150 dark:border-gray-800 pt-4 mt-4 flex justify-between text-base font-bold text-gray-950 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth, useCart } from "@/hooks";
import { formatCurrency } from "@/utils/currency";

export function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    items,
    total,
    loading: cartLoading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-black dark:border-t-white" />
      </div>
    );
  }

  const shippingThreshold = 4000;
  const shippingCost = total >= shippingThreshold || total === 0 ? 0 : 500;
  const taxCost = total * 0.08; // 8% estimated tax
  const orderTotal = total + shippingCost + taxCost;

  const placeholderImage = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&q=80";

  return (
    <div className="container-app py-16">
      <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-white mb-10">
        Shopping Bag
      </h1>

      {cartLoading && items.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-black dark:border-t-white" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-gray-50/50 dark:bg-gray-950/20 border-none rounded-3xl">
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
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-3">
            Your bag is empty
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-sm mb-8">
            Looks like you haven't added anything to your bag yet. Browse our collection and find something you like!
          </p>
          <Link
            to="/products"
            className="rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition-all dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6 self-start">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-6 p-4 sm:p-6 bg-white dark:bg-gray-900 border-b sm:border border-gray-100 sm:rounded-3xl dark:border-gray-800 transition-shadow"
              >
                {/* Product Image */}
                <Link
                  to={`/products/${item.product_id}`}
                  className="relative aspect-square w-full sm:w-36 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-50 dark:bg-slate-800 self-center sm:self-auto"
                >
                  <img
                    src={item.product?.image_url || placeholderImage}
                    alt={item.product?.name || "Product Image"}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                </Link>

                {/* Details */}
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <Link
                        to={`/products/${item.product_id}`}
                        className="font-bold text-black dark:text-white text-lg hover:text-gray-600 dark:hover:text-gray-300 line-clamp-2"
                      >
                        {item.product?.name}
                      </Link>
                      <span className="font-bold text-black dark:text-white text-lg sm:hidden">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </span>
                    </div>
                    {item.product && item.product.stock < 5 && (
                      <p className="text-[11px] uppercase tracking-wider text-amber-500 font-bold mt-1.5">
                        Only {item.product.stock} left in stock
                      </p>
                    )}
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                      {formatCurrency(item.unit_price)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-6 mt-6 sm:mt-4">
                    {/* Minimal Quantity controls */}
                    <div className="flex items-center rounded-full bg-gray-100 dark:bg-gray-800 h-10 px-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || cartLoading}
                        className="flex h-8 w-8 items-center justify-center text-black rounded-full transition-colors hover:bg-gray-200 disabled:opacity-30 dark:text-white dark:hover:bg-gray-700"
                        aria-label="Decrease quantity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-black dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={(item.product && item.quantity >= item.product.stock) || cartLoading}
                        className="flex h-8 w-8 items-center justify-center text-black rounded-full transition-colors hover:bg-gray-200 disabled:opacity-30 dark:text-white dark:hover:bg-gray-700"
                        aria-label="Increase quantity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={cartLoading}
                      className="text-sm font-semibold text-gray-400 hover:text-black transition-colors flex items-center gap-1.5 dark:text-gray-500 dark:hover:text-white underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Subtotal Desktop */}
                <div className="hidden sm:flex flex-col items-end justify-between py-1 pr-1 pl-4 min-w-[100px]">
                  <span className="font-extrabold text-black dark:text-white text-lg">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4 px-4 sm:px-0">
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                <span>Continue Shopping</span>
              </Link>

              <button
                type="button"
                onClick={clearCart}
                disabled={cartLoading}
                className="text-sm font-semibold text-gray-400 hover:text-red-600 transition-colors dark:text-gray-500 dark:hover:text-red-400"
              >
                Clear Bag
              </button>
            </div>
          </div>

          {/* Cart Summary (Sticky, Minimal) */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 dark:bg-gray-900 border-none rounded-3xl p-8 sticky top-24">
              <h2 className="text-xl font-bold text-black dark:text-white mb-8">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-black dark:text-white">
                    {formatCurrency(total)}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 dark:text-green-400">
                      Free
                    </span>
                  ) : (
                    <span className="text-black dark:text-white">
                      {formatCurrency(shippingCost)}
                    </span>
                  )}
                </div>

                {shippingCost > 0 && (
                  <div className="bg-gray-200/50 dark:bg-gray-800 text-black dark:text-white p-3 rounded-xl text-xs font-semibold">
                    Add {formatCurrency(shippingThreshold - total)} more to qualify for Free Shipping!
                  </div>
                )}

                <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-black dark:text-white">
                    {formatCurrency(taxCost)}
                  </span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-6 flex justify-between text-lg font-extrabold text-black dark:text-white">
                  <span>Total</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-10 w-full flex items-center justify-center rounded-full bg-black py-4 text-sm font-bold text-white hover:bg-gray-800 hover:scale-[1.02] transition-all dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Proceed to Checkout
              </Link>

              {/* Guarantees */}
              <div className="mt-8 flex flex-col gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-5 w-5 flex-shrink-0 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span>Secure transactions. Your data is encrypted.</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-5 w-5 flex-shrink-0 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0Zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0Zm3 0h1.875a1.125 1.125 0 011.12 1.243l-1.264 12a1.125 1.125 0 01-1.12 1.243H18.75m-6 0h6" />
                  </svg>
                  <span>Free shipping for orders over ₹4,000.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

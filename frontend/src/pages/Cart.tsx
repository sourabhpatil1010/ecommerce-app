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
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-primary-600 dark:border-t-primary-500" />
      </div>
    );
  }

  const shippingThreshold = 4000;
  const shippingCost = total >= shippingThreshold || total === 0 ? 0 : 500;
  const taxCost = total * 0.08; // 8% estimated tax
  const orderTotal = total + shippingCost + taxCost;

  const placeholderImage = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&q=80";

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
        Shopping Cart
      </h1>

      {cartLoading && items.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-primary-600 dark:border-t-primary-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-gray-50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-2xl">
          <div className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4 bg-gray-100 dark:bg-gray-850 rounded-full flex items-center justify-center shadow-inner">
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Your cart is empty
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            Looks like you haven't added anything to your cart yet. Browse our collection and find something you like!
          </p>
          <Link
            to="/products"
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 shadow-md shadow-primary-200/50 hover:shadow-lg transition-all"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <Link
                  to={`/products/${item.product_id}`}
                  className="relative aspect-square w-full sm:w-24 overflow-hidden rounded-lg bg-gray-50 border border-gray-100 dark:border-gray-800 self-center sm:self-auto"
                >
                  <img
                    src={item.product?.image_url || placeholderImage}
                    alt={item.product?.name || "Product Image"}
                    className="h-full w-full object-cover object-center"
                  />
                </Link>

                {/* Details */}
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <Link
                        to={`/products/${item.product_id}`}
                        className="font-bold text-gray-950 dark:text-white text-base hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1"
                      >
                        {item.product?.name}
                      </Link>
                      <span className="font-bold text-gray-900 dark:text-white text-base sm:hidden">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </span>
                    </div>
                    {item.product && item.product.stock < 5 && (
                      <p className="text-[11px] text-amber-500 font-semibold mt-0.5">
                        Only {item.product.stock} left in stock
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Unit Price: {formatCurrency(item.unit_price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 mt-4 sm:mt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 h-9">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || cartLoading}
                        className="flex h-full w-9 items-center justify-center text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-30 dark:text-gray-400 dark:hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.0}
                          stroke="currentColor"
                          className="h-3.5 w-3.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-semibold text-sm text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={
                          (item.product && item.quantity >= item.product.stock) ||
                          cartLoading
                        }
                        className="flex h-full w-9 items-center justify-center text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-30 dark:text-gray-400 dark:hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.0}
                          stroke="currentColor"
                          className="h-3.5 w-3.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={cartLoading}
                      className="text-sm font-semibold text-gray-450 hover:text-red-600 transition-colors flex items-center gap-1.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* Subtotal Desktop */}
                <div className="hidden sm:flex flex-col items-end justify-between py-1 pr-1 pl-4 min-w-[80px]">
                  <span className="font-bold text-gray-950 dark:text-white text-base">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
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
                <span>Continue Shopping</span>
              </Link>

              <button
                type="button"
                onClick={clearCart}
                disabled={cartLoading}
                className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(total)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      Free
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(shippingCost)}
                    </span>
                  )}
                </div>

                {shippingCost > 0 && (
                  <div className="bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 p-2.5 rounded-lg text-xs font-medium">
                    Add {formatCurrency(shippingThreshold - total)} more to qualify for Free Shipping!
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(taxCost)}
                  </span>
                </div>

                <div className="border-t border-gray-150 dark:border-gray-800 pt-4 mt-4 flex justify-between text-base font-bold text-gray-950 dark:text-white">
                  <span>Total</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-8 w-full block text-center rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white hover:bg-primary-700 shadow-md shadow-primary-200/50 hover:shadow-lg transition-all"
              >
                Proceed to Checkout
              </Link>

              {/* Guarantees */}
              <div className="mt-6 flex flex-col gap-3 pt-6 border-t border-gray-100 dark:border-gray-850">
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-4.5 w-4.5 text-green-500 flex-shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                    />
                  </svg>
                  <span>Secure transactions. Your data is encrypted.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-4.5 w-4.5 text-blue-500 flex-shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm3 0h1.875a1.125 1.125 0 0 1 1.12 1.243l-1.264 12a1.125 1.125 0 0 1-1.12 1.243H18.75m-6 0h6"
                    />
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

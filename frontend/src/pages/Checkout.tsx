import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/hooks";
import { createOrder } from "@/api/orders";
import { formatCurrency } from "@/utils/currency";
import { Address, AddressCreate } from "@/types/address";
import { getAddresses, createAddress } from "@/api/addresses";
import { AddressCard } from "@/components/address/AddressCard";
import { AddressForm } from "@/components/address/AddressForm";
import { Skeleton, EmptyState } from "@/components/common";
import { couponsApi } from "@/api";
import toast from "react-hot-toast";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, loading: cartLoading, fetchCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const shippingThreshold = 4000;
  const shippingCost = total >= shippingThreshold || total === 0 ? 0 : 500;
  
  let discountAmount = 0;
  if (appliedCoupon) {
    const calculatedDiscount = (total * appliedCoupon.discount_percentage) / 100;
    discountAmount = appliedCoupon.max_discount_amount 
      ? Math.min(calculatedDiscount, appliedCoupon.max_discount_amount) 
      : calculatedDiscount;
  }

  const subtotalAfterDiscount = Math.max(0, total - discountAmount);
  const taxCost = subtotalAfterDiscount * 0.08;
  const orderTotal = subtotalAfterDiscount + shippingCost + taxCost;

  const placeholderImage = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&q=80";

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await getAddresses();
      setAddresses(res.data);
      if (res.data.length > 0) {
        const defaultAddr = res.data.find((a: Address) => a.is_default) || res.data[0];
        setSelectedAddress(defaultAddr);
      } else {
        setShowAddressForm(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load addresses.");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddNewAddress = async (data: AddressCreate) => {
    setIsSubmittingForm(true);
    try {
      const res = await createAddress(data);
      toast.success("Address added successfully");
      await fetchAddresses();
      setSelectedAddress(res.data);
      setShowAddressForm(false);
    } catch (err) {
      toast.error("Failed to add address");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      setError("Please select a delivery address.");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);

    const fullShippingAddress = `${selectedAddress.full_name}, ${selectedAddress.address_line}, ${selectedAddress.locality}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}, Phone: ${selectedAddress.phone}`;

    try {
      const res = await createOrder(fullShippingAddress, appliedCoupon?.code);
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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await couponsApi.validateCoupon(couponCode.trim().toUpperCase());
      setAppliedCoupon(res.data);
      toast.success("Coupon applied successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Invalid or expired coupon");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="container-app py-16">
        <EmptyState 
          emoji="🛍️"
          title="Your bag is empty"
          description="You must add items to your bag before proceeding to checkout."
          actionLabel="View Collection"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="container-app py-12 max-w-6xl">
      
      {/* Visual Checkout Progress */}
      <div className="mb-10 max-w-md mx-auto">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
          <span className="text-black dark:text-white">1. Shipping</span>
          <span>2. Payment</span>
          <span>3. Complete</span>
        </div>
        <div className="mt-3 flex h-1 gap-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div className="w-1/3 rounded-full bg-black dark:bg-white" />
          <div className="w-1/3 rounded-full bg-transparent" />
          <div className="w-1/3 rounded-full bg-transparent" />
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-12">
        
        {/* Shipping Form / Selection */}
        <div className="lg:col-span-7 xl:col-span-8 self-start space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white mb-6">
              Delivery Details
            </h1>

            {loadingAddresses ? (
              <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in duration-500">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : (
              <div className="space-y-8">
                {addresses.length > 0 && !showAddressForm && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        selectable
                        selected={selectedAddress?.id === addr.id}
                        onSelect={setSelectedAddress}
                      />
                    ))}
                  </div>
                )}

                {addresses.length > 0 && !showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-2 text-black dark:text-white font-bold hover:text-gray-600 transition-colors underline underline-offset-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add a new address
                  </button>
                )}

                {showAddressForm && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl">
                    <h3 className="text-xl font-bold text-black dark:text-white mb-6">Add New Address</h3>
                    <AddressForm
                      onSubmit={handleAddNewAddress}
                      onCancel={() => setShowAddressForm(false)}
                      isLoading={isSubmittingForm}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Action Row */}
          <div className="pt-8 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
            <Link
              to="/cart"
              className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Return to Bag
            </Link>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || cartLoading || !selectedAddress || showAddressForm}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-black px-8 py-4 text-sm font-bold text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:active:scale-100 transition-all dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black" />
                  Processing…
                </>
              ) : (
                "Continue to Payment"
              )}
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-gray-50 dark:bg-gray-900 border-none rounded-3xl p-8 sticky top-24">
            <h2 className="text-xl font-bold text-black dark:text-white mb-6">
              In Your Bag
            </h2>

            {/* Cart Items List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-white dark:bg-slate-800">
                    <img
                      src={item.product?.image_url || placeholderImage}
                      alt={item.product?.name || "Product"}
                      className="h-full w-full object-cover object-center"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-grow min-w-0 flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-black dark:text-white truncate">
                      {item.product?.name}
                    </h3>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                      Qty: {item.quantity} · {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-black dark:text-white whitespace-nowrap self-center">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-bold text-black dark:text-white mb-3">Promo Code</h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-green-800 dark:text-green-400">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">{appliedCoupon.discount_percentage}% off applied</p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white placeholder-gray-400"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || validatingCoupon}
                    className="bg-black dark:bg-white text-white dark:text-black font-bold text-sm px-6 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? "..." : "Apply"}
                  </button>
                </div>
              )}
            </div>

            {/* Pricing Details */}
            <div className="space-y-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="text-black dark:text-white">{formatCurrency(total)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-sm font-medium text-green-600 dark:text-green-400">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

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

              <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-6 flex justify-between text-xl font-extrabold text-black dark:text-white">
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

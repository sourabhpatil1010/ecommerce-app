import type { CartItem } from "@/types";

interface CartSummaryProps {
  items: CartItem[];
}

export function CartSummary({ items }: CartSummaryProps) {
  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  return (
    <div className="rounded-lg border bg-gray-50 p-6 dark:bg-slate-800">
      <h3 className="text-lg font-semibold">Order Summary</h3>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {/* TODO: shipping, taxes, total */}
      </div>
    </div>
  );
}

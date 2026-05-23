import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  // Suppress unused variable checks for skeleton component
  void onUpdateQuantity;
  void onRemove;

  return (
    <div className="flex items-center justify-between border-b py-4">
      {/* TODO: product image, name, quantity controls, subtotal, remove button */}
      <span>Product ID: {item.product_id}</span>
      <span>Qty: {item.quantity}</span>
      <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
    </div>
  );
}

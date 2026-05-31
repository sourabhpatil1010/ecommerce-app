import React, { useState } from "react";
import { AddressCreate, Address } from "@/types/address";

interface AddressFormProps {
  initialData?: Address | null;
  onSubmit: (data: AddressCreate) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<AddressCreate>({
    full_name: initialData?.full_name || "",
    phone: initialData?.phone || "",
    pincode: initialData?.pincode || "",
    locality: initialData?.locality || "",
    address_line: initialData?.address_line || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    landmark: initialData?.landmark || "",
    alternate_phone: initialData?.alternate_phone || "",
    address_type: initialData?.address_type || "Home",
    is_default: initialData?.is_default || false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            data-testid="address-fullname-input"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-shadow"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Mobile Number
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            data-testid="address-phone-input"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-shadow"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Pincode
          </label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
            data-testid="address-pincode-input"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-shadow"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Locality
          </label>
          <input
            type="text"
            name="locality"
            value={formData.locality}
            onChange={handleChange}
            required
            data-testid="address-locality-input"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-shadow"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Address (Area and Street)
          </label>
          <textarea
            name="address_line"
            value={formData.address_line}
            onChange={handleChange}
            required
            rows={3}
            data-testid="address-line-input"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-shadow resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            City/District/Town
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            data-testid="address-city-input"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-shadow"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            State
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            data-testid="address-state-input"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-shadow"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Landmark (Optional)
          </label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            data-testid="address-landmark-input"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-shadow"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Alternate Phone (Optional)
          </label>
          <input
            type="text"
            name="alternate_phone"
            value={formData.alternate_phone}
            onChange={handleChange}
            data-testid="address-alternate-phone-input"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-shadow"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Address Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="address_type"
              value="Home"
              checked={formData.address_type === "Home"}
              onChange={handleChange}
              data-testid="address-type-home"
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-800 dark:text-gray-200">Home (All day delivery)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="address_type"
              value="Work"
              checked={formData.address_type === "Work"}
              onChange={handleChange}
              data-testid="address-type-work"
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-800 dark:text-gray-200">Work (Delivery between 10 AM - 5 PM)</span>
          </label>
        </div>
      </div>

      {!initialData?.is_default && (
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              data-testid="address-is-default"
              className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
            />
            <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Make this my default address</span>
          </label>
        </div>
      )}

      <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          data-testid="address-cancel-btn"
          className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          data-testid="address-submit-btn"
          className="flex-1 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isLoading && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
          Save Address
        </button>
      </div>
    </form>
  );
};

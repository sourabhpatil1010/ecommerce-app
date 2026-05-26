import React from "react";
import { Address } from "@/types/address";

interface AddressCardProps {
  address: Address;
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  onSelect?: (address: Address) => void;
  selected?: boolean;
  selectable?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  onSelect,
  selected = false,
  selectable = false,
}) => {
  return (
    <div
      className={`relative p-5 rounded-xl border-2 transition-all ${
        selected
          ? "border-primary-500 bg-primary-50/30 dark:bg-primary-900/10"
          : selectable
          ? "border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer bg-white dark:bg-gray-900"
          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      }`}
      onClick={() => selectable && onSelect && onSelect(address)}
    >
      {selected && (
        <div className="absolute -top-3 -right-3 bg-primary-500 text-white p-1 rounded-full shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 dark:text-white text-lg">
            {address.full_name}
          </span>
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-md uppercase tracking-wider">
            {address.address_type}
          </span>
        </div>
        {!selectable && (
          <div className="relative group">
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                />
              </svg>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 py-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(address);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(address.id);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-gray-600 dark:text-gray-400 text-sm space-y-1 mt-3">
        <p className="font-medium">{address.phone}</p>
        <p className="leading-relaxed">
          {address.address_line}, {address.locality}
        </p>
        <p>
          {address.city}, {address.state} - <span className="font-semibold">{address.pincode}</span>
        </p>
        {address.landmark && <p>Landmark: {address.landmark}</p>}
      </div>

      {!selectable && !address.is_default && onSetDefault && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetDefault(address.id);
            }}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            Set as Default
          </button>
        </div>
      )}
      {!selectable && address.is_default && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          Default Address
        </div>
      )}
    </div>
  );
};

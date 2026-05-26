import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Address, AddressCreate, AddressUpdate } from "@/types/address";
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/api/addresses";
import { AddressCard } from "@/components/address/AddressCard";
import { AddressForm } from "@/components/address/AddressForm";

export function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await getAddresses();
      setAddresses(res.data);
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(id);
      toast.success("Address deleted successfully");
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      toast.success("Default address updated");
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to update default address");
    }
  };

  const handleSubmitForm = async (data: AddressCreate) => {
    setIsSubmitting(true);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, data as AddressUpdate);
        toast.success("Address updated successfully");
      } else {
        await createAddress(data);
        toast.success("Address added successfully");
      }
      setShowForm(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (err) {
      toast.error(editingAddress ? "Failed to update address" : "Failed to add address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  if (loading) {
    return (
      <div className="container-app py-12 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container-app py-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/profile" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Manage Addresses
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
          {error}
        </div>
      )}

      {showForm ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h2>
          <AddressForm
            initialData={editingAddress}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
            isLoading={isSubmitting}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={handleAddNew}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-primary-600 dark:text-primary-500 font-semibold hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            ADD A NEW ADDRESS
          </button>

          <div className="grid gap-6">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
          
          {addresses.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No addresses saved yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

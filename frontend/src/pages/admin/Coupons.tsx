import { useState, useEffect } from "react";
import { couponsApi } from "@/api";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { Plus, Edit } from "lucide-react";

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount_percentage: 10,
    max_discount_amount: null as number | null,
    valid_until: "",
    is_active: true,
    usage_limit: null as number | null,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponsApi.getCoupons();
      setCoupons(res.data);
    } catch (err) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
      };

      if (editingId) {
        await couponsApi.updateCoupon(editingId, payload);
        toast.success("Coupon updated");
      } else {
        await couponsApi.createCoupon(payload);
        toast.success("Coupon created");
      }
      setShowModal(false);
      setEditingId(null);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save coupon");
    }
  };

  const openEdit = (coupon: any) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      discount_percentage: coupon.discount_percentage,
      max_discount_amount: coupon.max_discount_amount || null,
      valid_until: coupon.valid_until ? format(new Date(coupon.valid_until), "yyyy-MM-dd'T'HH:mm") : "",
      is_active: coupon.is_active,
      usage_limit: coupon.usage_limit || null,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              code: "",
              discount_percentage: 10,
              max_discount_amount: null,
              valid_until: "",
              is_active: true,
              usage_limit: null,
            });
            setShowModal(true);
          }}
          data-testid="admin-add-coupon-btn"
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <Plus className="h-4 w-4" />
          Add Coupon
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Discount</th>
                <th className="px-6 py-4 font-medium">Limit / Used</th>
                <th className="px-6 py-4 font-medium">Valid Until</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No coupons found.</td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-black dark:text-white">{c.code}</td>
                    <td className="px-6 py-4">{c.discount_percentage}% {c.max_discount_amount ? `(Max ₹${c.max_discount_amount})` : ''}</td>
                    <td className="px-6 py-4">{c.usage_limit ? `${c.used_count} / ${c.usage_limit}` : `${c.used_count} / ∞`}</td>
                    <td className="px-6 py-4">{c.valid_until ? format(new Date(c.valid_until), 'MMM d, yyyy') : 'Never'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(c)} data-testid={`admin-edit-coupon-${c.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h2 className="text-xl font-bold mb-4 dark:text-white">{editingId ? 'Edit Coupon' : 'New Coupon'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Code (Unique)</label>
                <input
                  type="text"
                  required
                  disabled={!!editingId}
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  data-testid="coupon-code-input"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-white dark:focus:ring-white disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.discount_percentage}
                    onChange={e => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                    data-testid="coupon-discount-input"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-white dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.max_discount_amount || ''}
                    onChange={e => setFormData({ ...formData, max_discount_amount: e.target.value ? Number(e.target.value) : null })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-white dark:focus:ring-white"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usage_limit || ''}
                    onChange={e => setFormData({ ...formData, usage_limit: e.target.value ? Number(e.target.value) : null })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-white dark:focus:ring-white"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valid Until</label>
                  <input
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-white dark:focus:ring-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="coupon-save-btn"
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

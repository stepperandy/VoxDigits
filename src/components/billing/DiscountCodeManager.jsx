import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Plus, Trash2, Power, Tag, Copy, Check, AlertCircle,
} from "lucide-react";

export default function DiscountCodeManager() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [codes, setCodes] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const emptyForm = {
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 10,
    duration: "once",
    duration_months: "",
    max_uses: "",
    valid_from: "",
    valid_until: "",
    is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    base44.auth.me()
      .then((u) => {
        setUser(u);
        setIsAdmin(u?.role === "admin");
        if (u?.role === "admin") loadCodes();
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.DiscountCode.list("-created_date", 100);
      setCodes(list);
      setError(null);
    } catch (err) {
      setError("Failed to load discount codes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discount_value) {
      setError("Code and discount value are required");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        duration: form.duration,
        duration_months: form.duration === "repeating" ? Number(form.duration_months) || null : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
        is_active: form.is_active,
      };
      await base44.entities.DiscountCode.create(payload);
      setForm(emptyForm);
      await loadCodes();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to create code");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (code) => {
    try {
      await base44.entities.DiscountCode.update(code.id, { is_active: !code.is_active });
      await loadCodes();
    } catch (err) {
      setError("Failed to update code");
    }
  };

  const handleDelete = async (code) => {
    if (!confirm(`Delete discount code "${code.code}"?`)) return;
    try {
      await base44.entities.DiscountCode.delete(code.id);
      await loadCodes();
    } catch (err) {
      setError("Failed to delete code");
    }
  };

  const handleCopy = (codeStr) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCode(codeStr);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm({ ...form, code });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading discount codes...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-purple-400" />
        <h2 className="text-white font-semibold">Discount Codes</h2>
        <span className="text-xs text-gray-500 ml-2">Admin</span>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 mb-6">
        <h3 className="text-white font-medium mb-4 text-sm">Create New Discount Code</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-xs mb-1.5">Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SAVE10"
                className="flex-1 bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm uppercase"
                required
              />
              <button
                type="button"
                onClick={generateRandomCode}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium whitespace-nowrap"
              >
                Random
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1.5">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="10% off for new clients"
              className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1.5">Discount Type</label>
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
              className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed_amount">Fixed Amount ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1.5">
              Discount Value {form.discount_type === "percentage" ? "(%)" : "($)"}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
              className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1.5">Duration</label>
            <select
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="once">Once (first payment only)</option>
              <option value="repeating">Repeating (multiple months)</option>
              <option value="forever">Forever (all payments)</option>
            </select>
          </div>
          {form.duration === "repeating" && (
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Duration (months)</label>
              <input
                type="number"
                min="1"
                value={form.duration_months}
                onChange={(e) => setForm({ ...form, duration_months: e.target.value })}
                placeholder="3"
                className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-gray-400 text-xs mb-1.5">Max Uses (blank = unlimited)</label>
            <input
              type="number"
              min="1"
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              placeholder="100"
              className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1.5">Valid Until (blank = no expiry)</label>
            <input
              type="date"
              value={form.valid_until}
              onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
              className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Create Code
        </button>
      </form>

      {/* Codes list */}
      {codes.length === 0 ? (
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 text-center">
          <p className="text-gray-500 text-sm">No discount codes yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map((code) => (
            <div
              key={code.id}
              className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-white text-lg">{code.code}</span>
                  <button
                    onClick={() => handleCopy(code.code)}
                    className="text-gray-500 hover:text-gray-300"
                    title="Copy code"
                  >
                    {copiedCode === code.code ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      code.is_active
                        ? "bg-green-500/10 text-green-400"
                        : "bg-gray-500/10 text-gray-500"
                    }`}
                  >
                    {code.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                  <span>
                    {code.discount_type === "percentage"
                      ? `${code.discount_value}% off`
                      : `$${Number(code.discount_value).toFixed(2)} off`}
                  </span>
                  <span>•</span>
                  <span>
                    {code.duration === "once"
                      ? "First payment"
                      : code.duration === "repeating"
                      ? `${code.duration_months || 1} months`
                      : "Forever"}
                  </span>
                  {code.max_uses && (
                    <>
                      <span>•</span>
                      <span>{code.used_count || 0}/{code.max_uses} used</span>
                    </>
                  )}
                  {code.valid_until && (
                    <>
                      <span>•</span>
                      <span>Expires {new Date(code.valid_until).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
                {code.description && (
                  <p className="text-gray-600 text-xs mt-1">{code.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(code)}
                  className={`p-2 rounded-lg transition-colors ${
                    code.is_active
                      ? "text-yellow-400 hover:bg-yellow-500/10"
                      : "text-green-400 hover:bg-green-500/10"
                  }`}
                  title={code.is_active ? "Deactivate" : "Activate"}
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(code)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
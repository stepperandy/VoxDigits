import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const me = await base44.auth.me();
      setMethods(me.payment_methods || []);
    } catch (err) {
      console.error('Failed to load payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    // In production, integrate with Stripe.js
    alert('Redirect to Stripe payment form');
  };

  if (loading) return <div className="text-slate-500 text-sm">Loading...</div>;

  return (
    <div className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <CreditCard size={16} /> Payment Methods
        </h3>
        <Button
          onClick={handleAddCard}
          size="sm"
          className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
        >
          <Plus size={14} /> Add Card
        </Button>
      </div>

      {methods.length === 0 ? (
        <p className="text-slate-500 text-sm">No payment methods added yet.</p>
      ) : (
        <div className="space-y-2">
          {methods.map(method => (
            <div key={method.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <CreditCard size={16} className="text-slate-500" />
                <div>
                  <p className="text-white text-sm font-semibold">
                    {method.type.charAt(0).toUpperCase() + method.type.slice(1)} •••• {method.last_digits}
                  </p>
                  <p className="text-slate-500 text-xs">{method.expiry}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {method.is_default && (
                  <div className="flex items-center gap-1 text-green-400 text-xs">
                    <CheckCircle2 size={12} /> Default
                  </div>
                )}
                <Button variant="ghost" size="icon">
                  <Trash2 size={14} className="text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { X, Truck, Send, CheckCircle } from 'lucide-react';
import { BoutiqueOrder, CourierPartner } from '../../types/orders';
import { useOrders } from '../../context/OrdersContext';
import { generateDispatchWhatsAppUrl } from '../../utils/courierTracking';

interface DispatchModalProps {
  order: BoutiqueOrder;
  isOpen: boolean;
  onClose: () => void;
}

const COURIER_OPTIONS: CourierPartner[] = [
  'DTDC',
  'Speed Post (India Post)',
  'Delhivery',
  'Professional Couriers',
  'Kerala Express',
  'Boutique Handover',
  'Other',
];

export const DispatchModal: React.FC<DispatchModalProps> = ({ order, isOpen, onClose }) => {
  const { dispatchOrder } = useOrders();

  const [partner, setPartner] = useState<CourierPartner>(order.courierPartner || 'DTDC');
  const [awb, setAwb] = useState<string>(order.trackingAwb || '');
  const [isDispatched, setIsDispatched] = useState(false);
  const [dispatchedOrder, setDispatchedOrder] = useState<BoutiqueOrder | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awb.trim() && partner !== 'Boutique Handover') {
      alert('Please enter an AWB / Tracking number.');
      return;
    }

    const updated = dispatchOrder(order.id, partner, awb.trim());
    if (updated) {
      setDispatchedOrder(updated);
      setIsDispatched(true);
    }
  };

  const handleSendWhatsAppNotification = () => {
    if (!dispatchedOrder) return;
    const url = generateDispatchWhatsAppUrl(dispatchedOrder);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-maroon-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-canvas-border overflow-hidden z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-canvas-border bg-canvas-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-maroon-900 text-brass-light">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-maroon-950">
                Dispatch Order #{order.orderNumber}
              </h3>
              <p className="text-[11px] text-obsidian-muted">
                {order.customer.fullName} • {order.customer.city}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-canvas-border text-obsidian-slate transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {isDispatched && dispatchedOrder ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-maroon-950">
                  Order Marked as Shipped!
                </h4>
                <p className="text-xs text-obsidian-slate mt-1">
                  Assigned {partner} tracking: <span className="font-mono font-bold text-obsidian">{awb}</span>
                </p>
              </div>

              <div className="p-3 bg-canvas-subtle rounded-xl text-left text-xs space-y-1 border border-canvas-border">
                <span className="font-bold text-maroon-950 block text-[10px] uppercase tracking-wider">
                  Notify Customer
                </span>
                <p className="text-obsidian-slate leading-relaxed">
                  Send live tracking link & dispatch alert to <span className="font-semibold text-obsidian">{order.customer.fullName}</span> on WhatsApp.
                </p>
              </div>

              <button
                onClick={handleSendWhatsAppNotification}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Send WhatsApp Dispatch Alert</span>
              </button>

              <button
                onClick={onClose}
                className="text-xs text-obsidian-muted hover:text-obsidian underline underline-offset-2 block mx-auto"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-obsidian-slate block mb-1">
                  Logistics / Courier Partner
                </label>
                <select
                  value={partner}
                  onChange={(e) => setPartner(e.target.value as CourierPartner)}
                  className="w-full px-3 py-2 text-xs border border-canvas-border rounded-lg bg-canvas-subtle focus:outline-none focus:border-maroon-900 font-medium"
                >
                  {COURIER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-obsidian-slate block mb-1">
                  AWB / Consignment Tracking Number
                </label>
                <input
                  type="text"
                  value={awb}
                  onChange={(e) => setAwb(e.target.value.toUpperCase())}
                  placeholder="e.g. D847291039IN"
                  className="w-full px-3 py-2 text-xs font-mono font-semibold tracking-wider border border-canvas-border rounded-lg bg-canvas-subtle focus:outline-none focus:border-maroon-900"
                  required={partner !== 'Boutique Handover'}
                />
                <span className="text-[10px] text-obsidian-muted mt-1 block">
                  This will generate the live parcel tracking link for the customer.
                </span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-canvas-subtle hover:bg-canvas-border text-obsidian text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-lg bg-maroon-900 hover:bg-maroon-850 text-brass-light text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

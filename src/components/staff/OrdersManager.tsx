import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  FileText,
  Tag,
  Truck,
  MessageCircle,
  ExternalLink,
  Clock,
  CheckCircle2,
  Scissors,
  RefreshCw,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { BoutiqueOrder, FulfillmentStatus } from '../../types/orders';
import { useOrders } from '../../context/OrdersContext';
import { formatCurrencyINR } from '../../utils/formatters';
import { generateGSTTaxInvoicePDF } from '../../utils/invoiceGenerator';
import { generateShippingLabelPDF } from '../../utils/shippingLabelGenerator';
import { DispatchModal } from './DispatchModal';

export const OrdersManager: React.FC = () => {
  const { orders, updateOrderStatus, updatePaymentStatus, resetToSampleOrders } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FulfillmentStatus | 'all'>('all');
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<BoutiqueOrder | null>(null);

  // Compute Metrics
  const metrics = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const newOrdersCount = orders.filter((o) => o.fulfillmentStatus === 'new').length;
    const tailoringCount = orders.filter((o) => o.fulfillmentStatus === 'tailoring').length;
    const readyCount = orders.filter((o) => o.fulfillmentStatus === 'ready_for_dispatch').length;
    const shippedCount = orders.filter((o) => o.fulfillmentStatus === 'shipped').length;

    return {
      totalRevenue,
      newOrdersCount,
      tailoringCount,
      readyCount,
      shippedCount,
      totalOrders: orders.length,
    };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Status Filter
      if (statusFilter !== 'all' && ord.fulfillmentStatus !== statusFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = ord.customer.fullName.toLowerCase().includes(query);
        const matchesPhone = ord.customer.phoneNumber.includes(query);
        const matchesOrder = ord.orderNumber.toLowerCase().includes(query);
        const matchesInvoice = ord.invoiceNumber.toLowerCase().includes(query);
        const matchesCity = ord.customer.city.toLowerCase().includes(query);
        const matchesItem = ord.items.some(
          (it) => it.title.toLowerCase().includes(query) || it.sku.toLowerCase().includes(query)
        );

        return matchesName || matchesPhone || matchesOrder || matchesInvoice || matchesCity || matchesItem;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleDownloadInvoice = (order: BoutiqueOrder) => {
    generateGSTTaxInvoicePDF(order, { autoDownload: true });
  };

  const handleDownloadShippingLabel = (order: BoutiqueOrder) => {
    generateShippingLabelPDF(order, { autoDownload: true });
  };

  const handleOpenCustomerWhatsApp = (order: BoutiqueOrder) => {
    const cleanPhone = order.customer.phoneNumber.replace(/\D/g, '');
    const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `Hello ${order.customer.fullName}, greetings from Kenzae Designer Boutique, Mulanthuruthy regarding your order #${order.orderNumber}.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const getStatusBadge = (status: FulfillmentStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
            New Order
          </span>
        );
      case 'tailoring':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
            <Scissors className="w-3 h-3" />
            <span>In Tailoring</span>
          </span>
        );
      case 'ready_for_dispatch':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Ready to Ship</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-canvas-subtle text-obsidian-slate border border-canvas-border flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-900 border border-red-200">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Telemetry & Revenue Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-canvas-border shadow-luxury">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-obsidian-muted block">
            Boutique Sales Revenue
          </span>
          <div className="text-xl sm:text-2xl font-bold text-maroon-950 font-sans mt-1">
            {formatCurrencyINR(metrics.totalRevenue)}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
            GST Tax-Compliant Transactions
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-canvas-border shadow-luxury">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-obsidian-muted block">
            Atelier Tailoring Active
          </span>
          <div className="text-xl sm:text-2xl font-bold text-purple-950 font-sans mt-1">
            {metrics.tailoringCount} Piece{metrics.tailoringCount === 1 ? '' : 's'}
          </div>
          <span className="text-[10px] text-obsidian-muted mt-1 block">
            Fall, Pico &amp; Blouse Stitching
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-canvas-border shadow-luxury">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-obsidian-muted block">
            Awaiting Courier Dispatch
          </span>
          <div className="text-xl sm:text-2xl font-bold text-amber-950 font-sans mt-1">
            {metrics.readyCount + metrics.newOrdersCount}
          </div>
          <span className="text-[10px] text-amber-800 mt-1 block">
            Mulanthuruthy Packing Station
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-canvas-border shadow-luxury">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-obsidian-muted block">
            Total Orders Handled
          </span>
          <div className="text-xl sm:text-2xl font-bold text-obsidian font-sans mt-1">
            {metrics.totalOrders}
          </div>
          <button
            onClick={resetToSampleOrders}
            className="text-[10px] text-brass-dark hover:text-maroon-900 mt-1 inline-flex items-center gap-1 underline underline-offset-2"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Reset Demo Orders</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-canvas-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-obsidian-slate absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, order #, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-canvas-border rounded-xl focus:outline-none focus:border-maroon-900 bg-canvas-subtle"
          />
        </div>

        {/* Pipeline Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          {(
            [
              { label: 'All', value: 'all' },
              { label: 'New', value: 'new' },
              { label: 'Tailoring', value: 'tailoring' },
              { label: 'Ready', value: 'ready_for_dispatch' },
              { label: 'Shipped', value: 'shipped' },
              { label: 'Delivered', value: 'delivered' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg font-semibold tracking-wider uppercase text-[10px] transition-all shrink-0 ${
                statusFilter === tab.value
                  ? 'bg-maroon-900 text-brass-light shadow-xs'
                  : 'bg-canvas-subtle text-obsidian-slate hover:bg-canvas-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-canvas-border">
            <Package className="w-10 h-10 text-obsidian-muted mx-auto stroke-[1.5]" />
            <h3 className="font-serif text-base font-semibold text-maroon-950 mt-2">
              No orders found in this view
            </h3>
            <p className="text-xs text-obsidian-slate mt-1 max-w-sm mx-auto">
              Try adjusting your search query or switching to another pipeline status filter.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isKerala = order.taxBreakdown.isKeralaIntrastate;
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-canvas-border shadow-luxury overflow-hidden flex flex-col transition-all hover:border-maroon-900/30"
              >
                {/* Order Card Header */}
                <div className="p-4 bg-canvas-subtle/60 border-b border-canvas-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white border border-canvas-border text-maroon-950 font-serif font-bold text-sm shadow-xs">
                      #{order.orderNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-obsidian">
                          {order.invoiceNumber}
                        </span>
                        <span className="text-[10px] text-obsidian-muted">
                          • {orderDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-obsidian-slate font-medium">
                          Method: {order.paymentMethod.replace('_', ' ').toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updatePaymentStatus(
                              order.id,
                              order.paymentStatus === 'paid' ? 'pending' : 'paid'
                            )
                          }
                          title="Click to toggle Paid / Pending"
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded transition-transform active:scale-95 cursor-pointer ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {order.paymentStatus}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status & Quick Transition */}
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.fulfillmentStatus)}

                    <select
                      value={order.fulfillmentStatus}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value as FulfillmentStatus)
                      }
                      className="px-2.5 py-1 text-xs border border-canvas-border rounded-lg bg-white font-medium text-obsidian focus:outline-none focus:border-maroon-900 shadow-xs"
                    >
                      <option value="new">New</option>
                      <option value="tailoring">In Tailoring</option>
                      <option value="ready_for_dispatch">Ready to Ship</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Column 1: Customer & Shipping Details */}
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-maroon-950 text-[10px] uppercase tracking-wider block">
                      Customer &amp; Destination
                    </span>
                    <div className="p-3 bg-canvas-subtle/50 rounded-xl border border-canvas-border space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-obsidian text-sm">
                        <User className="w-3.5 h-3.5 text-brass-dark" />
                        <span>{order.customer.fullName}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-obsidian-slate">
                        <Phone className="w-3.5 h-3.5 text-brass-dark" />
                        <span>{order.customer.phoneNumber}</span>
                      </div>

                      <div className="flex items-start gap-1.5 text-obsidian-slate pt-1 border-t border-canvas-border/60">
                        <MapPin className="w-3.5 h-3.5 text-brass-dark shrink-0 mt-0.5" />
                        <div>
                          <p className="leading-snug">{order.customer.streetAddress}</p>
                          <p className="font-semibold text-obsidian mt-0.5">
                            {order.customer.city}, {order.customer.state} – {order.customer.pincode}
                          </p>
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brass-light/30 text-maroon-950">
                            {isKerala ? 'Kerala Intra-State (CGST+SGST)' : 'Inter-State Delivery (IGST)'}
                          </span>
                        </div>
                      </div>

                      {order.customer.specialDeliveryNote && (
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-900 text-[11px] mt-2 border border-amber-200">
                          <span className="font-bold block">Customer Note:</span>
                          "{order.customer.specialDeliveryNote}"
                        </div>
                      )}
                    </div>

                    {/* Logistics Tracking Info if Shipped */}
                    {order.trackingAwb && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Carrier: {order.courierPartner}
                          </span>
                          <span className="font-mono text-xs font-bold">
                            {order.trackingAwb}
                          </span>
                        </div>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:underline pt-1"
                          >
                            <span>Live Consignment Status</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Column 2: Items & Tailoring Specs */}
                  <div className="space-y-2 text-xs lg:col-span-1">
                    <span className="font-bold text-maroon-950 text-[10px] uppercase tracking-wider block">
                      Ensemble Items ({order.items.reduce((s, it) => s + it.quantity, 0)})
                    </span>

                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-canvas-subtle/50 border border-canvas-border flex items-center gap-3"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-14 object-cover object-top rounded-lg border border-canvas-border shrink-0 bg-white"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-serif text-xs font-semibold text-obsidian line-clamp-1">
                              {item.title}
                            </h5>
                            <span className="font-mono text-[10px] text-obsidian-muted">
                              {item.sku} • Qty: {item.quantity}
                            </span>

                            {/* Tailoring Badge */}
                            <div className="mt-0.5">
                              {item.tailoring.type === 'saree' && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white border border-canvas-border text-maroon-950">
                                  {item.tailoring.sareeFinishing === 'fall_and_pico'
                                    ? `+ Fall & Pico (₹${item.tailoring.additionalCost})`
                                    : item.tailoring.sareeFinishing === 'custom_blouse_stitching'
                                    ? `+ Custom Blouse (₹${item.tailoring.additionalCost})`
                                    : 'Standard Unstitched'}
                                </span>
                              )}

                              {item.tailoring.selectedSize && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white border border-canvas-border text-maroon-950">
                                  Size: {item.tailoring.selectedSize}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-sans font-semibold text-xs text-maroon-950">
                            {formatCurrencyINR(item.itemTotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Financial Summary & Actions */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-maroon-950 text-[10px] uppercase tracking-wider block mb-1">
                        GST Tax &amp; Totals
                      </span>
                      <div className="p-3 bg-canvas-subtle/50 rounded-xl border border-canvas-border space-y-1.5 text-xs text-obsidian-slate">
                        <div className="flex justify-between">
                          <span>Taxable Value:</span>
                          <span className="font-medium text-obsidian">
                            ₹{order.taxBreakdown.taxableAmount.toFixed(2)}
                          </span>
                        </div>

                        {isKerala ? (
                          <>
                            <div className="flex justify-between">
                              <span>CGST (2.5%):</span>
                              <span className="font-medium text-obsidian">
                                ₹{order.taxBreakdown.cgstAmount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>SGST (2.5%):</span>
                              <span className="font-medium text-obsidian">
                                ₹{order.taxBreakdown.sgstAmount.toFixed(2)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between">
                            <span>IGST (5.0%):</span>
                            <span className="font-medium text-obsidian">
                              ₹{order.taxBreakdown.igstAmount.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span className="font-medium text-obsidian">
                            {order.shippingFee === 0 ? (
                              <span className="text-emerald-700 font-bold">FREE</span>
                            ) : (
                              formatCurrencyINR(order.shippingFee)
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between pt-2 border-t border-canvas-border text-sm font-bold text-maroon-950">
                          <span>Grand Total:</span>
                          <span className="font-sans font-bold text-base">
                            {formatCurrencyINR(order.grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="py-2 px-3 rounded-lg bg-maroon-900 hover:bg-maroon-850 text-brass-light hover:text-white font-semibold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all border border-maroon-900"
                        title="Download GST-compliant PDF invoice"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>GST Invoice</span>
                      </button>

                      <button
                        onClick={() => handleDownloadShippingLabel(order)}
                        className="py-2 px-3 rounded-lg bg-canvas-subtle hover:bg-white text-obsidian font-semibold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 border border-canvas-border shadow-xs transition-all"
                        title="Print 4x6 thermal shipping label & checklist"
                      >
                        <Tag className="w-3.5 h-3.5 text-brass-dark" />
                        <span>Label / Slip</span>
                      </button>

                      <button
                        onClick={() => setSelectedOrderForDispatch(order)}
                        className="py-2 px-3 rounded-lg bg-white hover:bg-emerald-50 text-emerald-900 font-semibold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 border border-emerald-300 shadow-xs transition-all"
                        title="Assign Courier AWB & trigger WhatsApp update"
                      >
                        <Truck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{order.trackingAwb ? 'Re-Dispatch' : 'Dispatch'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenCustomerWhatsApp(order)}
                        className="py-2 px-3 rounded-lg bg-white hover:bg-emerald-50 text-obsidian font-semibold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 border border-canvas-border shadow-xs transition-all"
                        title="Chat with customer on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-whatsapp" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dispatch Modal Trigger */}
      {selectedOrderForDispatch && (
        <DispatchModal
          order={selectedOrderForDispatch}
          isOpen={Boolean(selectedOrderForDispatch)}
          onClose={() => setSelectedOrderForDispatch(null)}
        />
      )}
    </div>
  );
};

export default OrdersManager;

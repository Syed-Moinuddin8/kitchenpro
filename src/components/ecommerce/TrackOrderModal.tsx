import React, { useState } from 'react';
import { Search, X, Package, Truck, CheckCircle2, Clock, Printer, AlertCircle } from 'lucide-react';
import { Order, StoreSettings } from '../../types';
import { formatINR } from '../../services/billingEngine';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onViewInvoice: (order: Order) => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  orders,
  onViewInvoice,
}) => {
  const [lookupQuery, setLookupQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    const q = lookupQuery.trim().toLowerCase();
    const match = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === q ||
        o.invoiceNumber.toLowerCase() === q ||
        o.customer.phone === q
    );
    setFoundOrder(match || null);
    setSearched(true);
  };

  const steps: ('new' | 'confirmed' | 'packed' | 'shipped' | 'delivered')[] = [
    'new',
    'confirmed',
    'packed',
    'shipped',
    'delivered',
  ];

  const getStepStatus = (currentStatus: string, stepName: string) => {
    const orderIndex = steps.indexOf(currentStatus as any);
    const stepIndex = steps.indexOf(stepName as any);
    if (currentStatus === 'cancelled') return 'cancelled';
    if (orderIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-zinc-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-zinc-950 text-white border-b border-zinc-800 shrink-0">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-orange-500 shrink-0" />
            <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider">
              LIVE ORDER & SHIPMENT TRACKING
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 sm:p-6 bg-zinc-50 border-b border-zinc-200 shrink-0">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="Enter Order Number, Invoice No or Mobile No"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-zinc-300 rounded text-xs font-semibold focus:ring-1 focus:ring-orange-500"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold uppercase tracking-wider rounded whitespace-nowrap"
            >
              TRACK NOW
            </button>
          </form>
          <p className="text-[11px] text-zinc-500 mt-1.5">
            Example: <b>KP-ORD-2026-1001</b> or mobile <b>9820198201</b>
          </p>
        </div>

        {/* Result Area */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {searched && !foundOrder && (
            <div className="p-6 text-center text-zinc-500 bg-zinc-50 rounded border">
              <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="font-bold text-zinc-900 text-sm">No order found matching "{lookupQuery}"</p>
              <p className="text-xs mt-1">Please verify the reference code or phone number.</p>
            </div>
          )}

          {foundOrder && (
            <div className="space-y-6">
              {/* Order Basic Meta */}
              <div className="flex flex-wrap items-center justify-between p-3 sm:p-4 bg-zinc-50 border border-zinc-200 rounded gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Order Number</span>
                  <span className="text-xs sm:text-sm font-extrabold text-zinc-900">{foundOrder.orderNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Invoice Ref</span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-800">{foundOrder.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Amount</span>
                  <span className="text-xs sm:text-sm font-black text-orange-600">{formatINR(foundOrder.grandTotal)}</span>
                </div>
                <button
                  onClick={() => onViewInvoice(foundOrder)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View Tax Invoice</span>
                </button>
              </div>

              {/* Status Timeline */}
              <div>
                <h4 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider mb-4">
                  Shipment Progress Timeline
                </h4>
                <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center text-xs">
                  {steps.map((st, i) => {
                    const state = getStepStatus(foundOrder.orderStatus, st);
                    const isDone = state === 'completed';

                    return (
                      <div key={st} className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold mb-1.5 transition text-xs ${
                            isDone
                              ? 'bg-orange-600 text-white shadow'
                              : 'bg-zinc-200 text-zinc-500'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : i + 1}
                        </div>
                        <span className={`text-[9px] sm:text-[11px] font-bold uppercase truncate max-w-full ${isDone ? 'text-zinc-900' : 'text-zinc-400'}`}>
                          {st.replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status History Logs */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded space-y-2">
                <h5 className="text-[11px] font-bold text-zinc-600 uppercase">Activity Log:</h5>
                <div className="space-y-1.5 divide-y divide-zinc-200 text-xs">
                  {foundOrder.statusHistory.map((hist, idx) => (
                    <div key={idx} className="pt-1.5 flex justify-between">
                      <span className="font-semibold text-zinc-800 capitalize">
                        {hist.status}: {hist.notes}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(hist.timestamp).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items Summary */}
              <div>
                <h5 className="text-xs font-bold text-zinc-900 uppercase mb-2">Package Contents</h5>
                <div className="divide-y divide-zinc-200 border rounded bg-white">
                  {foundOrder.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-zinc-900">{it.productName}</p>
                        <p className="text-[10px] text-zinc-500">Qty: {it.quantity} | SKU: {it.sku}</p>
                      </div>
                      <span className="font-extrabold text-zinc-900">{formatINR(it.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Printer, Download, X, ExternalLink, ShieldCheck, QrCode, Check, FileDown } from 'lucide-react';
import { Order, StoreSettings } from '../../types';
import { formatINR } from '../../services/billingEngine';
import { executeDirectPrint, downloadInvoiceHtml } from '../../services/printService';

interface ThermalReceiptModalProps {
  order: Order;
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  defaultFormat?: '58mm' | '80mm' | 'A4';
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  storeSettings,
  isOpen,
  onClose,
  defaultFormat = '80mm',
}) => {
  const [format, setFormat] = useState<'58mm' | '80mm' | 'A4'>(defaultFormat);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetElementId = format === 'A4' ? 'printable-a4-invoice' : 'printable-thermal-receipt';
  const documentTitle = `Kitchen_Pro_Invoice_${order.invoiceNumber}_${format}`;

  const handlePrint = () => {
    const res = executeDirectPrint(targetElementId, documentTitle);
    if (res.fallbackUsed === 'window') {
      setFeedbackMessage('Print dialog opened in new window');
    } else if (res.fallbackUsed === 'download') {
      setFeedbackMessage('Invoice downloaded! Open it to print');
    } else {
      setFeedbackMessage('Print triggered');
    }
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleDownload = () => {
    downloadInvoiceHtml(targetElementId, order.invoiceNumber);
    setFeedbackMessage('Invoice HTML file downloaded!');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const isInterState = order.isInterState || (order.customer.gstin && !order.customer.gstin.startsWith(storeSettings.stateCode));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto print-modal-container">
      <div className="relative w-full max-w-4xl bg-white rounded-xs shadow-2xl border-2 border-zinc-300 overflow-hidden my-auto max-h-[95vh] flex flex-col print-modal-card">
        {/* Header Bar - Hidden during printing */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 bg-[#141414] text-white border-b-2 border-zinc-800 print-hide shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-[#F27D26] text-black rounded-xs shrink-0">
              <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-lg text-white uppercase tracking-tight">Invoice & Print Center</h3>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">Invoice: #{order.invoiceNumber} | Order: {order.orderNumber}</p>
            </div>
          </div>

          {/* Format Switcher */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-zinc-900 p-1 rounded-xs border border-zinc-700 overflow-x-auto">
            <button
              id="format-btn-80mm"
              onClick={() => setFormat('80mm')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-tighter rounded-xs transition whitespace-nowrap ${
                format === '80mm' ? 'bg-[#F27D26] text-black shadow-xs' : 'text-gray-400 hover:text-white'
              }`}
            >
              80mm Thermal
            </button>
            <button
              id="format-btn-58mm"
              onClick={() => setFormat('58mm')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-tighter rounded-xs transition whitespace-nowrap ${
                format === '58mm' ? 'bg-[#F27D26] text-black shadow-xs' : 'text-gray-400 hover:text-white'
              }`}
            >
              58mm Mini
            </button>
            <button
              id="format-btn-a4"
              onClick={() => setFormat('A4')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-tighter rounded-xs transition whitespace-nowrap ${
                format === 'A4' ? 'bg-[#F27D26] text-black shadow-xs' : 'text-gray-400 hover:text-white'
              }`}
            >
              A4 Tax Invoice
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-download-invoice"
              onClick={handleDownload}
              title="Download standalone print-ready HTML / PDF invoice"
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-200 text-xs font-black uppercase tracking-tighter rounded-xs border border-zinc-700 transition"
            >
              <FileDown className="w-3.5 h-3.5 text-[#F27D26]" />
              <span className="hidden sm:inline">Save File</span>
            </button>

            <button
              id="btn-print-now"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 sm:px-5 py-1.5 sm:py-2 bg-[#F27D26] hover:bg-white text-black text-xs font-black uppercase tracking-tighter rounded-xs shadow-xs transition"
            >
              <Printer className="w-4 h-4 text-black" />
              <span>Print Now</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-xs transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert if triggered */}
        {feedbackMessage && (
          <div className="bg-[#F27D26] text-black px-4 sm:px-6 py-2 text-xs font-black flex items-center justify-between uppercase tracking-tighter print-hide">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{feedbackMessage}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-black font-bold hover:underline text-[10px]"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* Preview Container */}
        <div className="p-3 sm:p-6 bg-zinc-100 flex justify-center max-h-[75vh] overflow-auto print-modal-preview">
          {/* ============================================================ */}
          {/* THERMAL 80mm / 58mm FORMAT */}
          {/* ============================================================ */}
          {(format === '80mm' || format === '58mm') && (
            <div
              id="printable-thermal-receipt"
              className={`bg-white p-4 text-black border border-dashed border-zinc-300 shadow-sm font-mono text-xs ${
                format === '58mm' ? 'w-[280px]' : 'w-[360px]'
              }`}
            >
              {/* Receipt Header */}
              <div className="text-center pb-2 border-b border-black">
                <h1 className="font-extrabold text-sm uppercase tracking-wide">KITCHEN PRO</h1>
                <p className="text-[10px] leading-tight font-sans font-semibold">{storeSettings.businessName}</p>
                <p className="text-[9px] leading-tight mt-1">{storeSettings.address}</p>
                <p className="text-[9px]">{storeSettings.city}, {storeSettings.state} - {storeSettings.pincode}</p>
                <p className="text-[10px] font-bold mt-1">GSTIN: {storeSettings.gstin}</p>
                <p className="text-[9px]">Ph: {storeSettings.phone}</p>
              </div>

              {/* Bill Details */}
              <div className="py-2 border-b border-black text-[10px] leading-relaxed">
                <div className="flex justify-between">
                  <span>INVOICE: <b>{order.invoiceNumber}</b></span>
                  <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>TIME: {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>CASHIER: {order.cashierName || 'Staff'}</span>
                </div>
                <div className="mt-1">
                  <span>CUSTOMER: <b>{order.customer.name}</b></span>
                </div>
                <div>
                  <span>MOB: {order.customer.phone}</span>
                </div>
                {order.customer.gstin && (
                  <div>
                    <span>CUST GST: <b>{order.customer.gstin}</b></span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="py-2 border-b border-black">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-black font-bold">
                      <th className="py-1">ITEM</th>
                      <th className="py-1 text-center">QTY</th>
                      <th className="py-1 text-right">RATE</th>
                      <th className="py-1 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((it, idx) => (
                      <tr key={idx} className="border-b border-zinc-200">
                        <td className="py-1 pr-1">
                          <div className="font-semibold leading-tight">{it.productName}</div>
                          <div className="text-[8px] text-zinc-600">GST: {it.gstRate}%</div>
                        </td>
                        <td className="py-1 text-center align-top">{it.quantity}</td>
                        <td className="py-1 text-right align-top">{formatINR(it.unitPrice)}</td>
                        <td className="py-1 text-right align-top font-bold">{formatINR(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculation Summary */}
              <div className="py-2 border-b border-black text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatINR(order.subtotal)}</span>
                </div>
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between text-orange-700 font-semibold">
                    <span>Discount ({order.couponCode || 'Promo'}):</span>
                    <span>-{formatINR(order.couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>Taxable Value:</span>
                  <span>{formatINR(order.taxableAmount)}</span>
                </div>
                {order.cgstTotal > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>CGST:</span>
                    <span>{formatINR(order.cgstTotal)}</span>
                  </div>
                )}
                {order.sgstTotal > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>SGST:</span>
                    <span>{formatINR(order.sgstTotal)}</span>
                  </div>
                )}
                {order.igstTotal > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>IGST:</span>
                    <span>{formatINR(order.igstTotal)}</span>
                  </div>
                )}
                {order.roundOff !== 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Round Off:</span>
                    <span>{order.roundOff > 0 ? `+${order.roundOff}` : order.roundOff}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-extrabold border-t border-black pt-1">
                  <span>NET PAYABLE:</span>
                  <span>{formatINR(order.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-[9px] pt-1">
                  <span>PAYMENT MODE:</span>
                  <span className="uppercase font-bold">{order.paymentMethod}</span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="text-center pt-3 space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-wider">★ THANK YOU FOR VISITING KITCHEN PRO ★</p>
                <p className="text-[8px] text-zinc-600">Goods once sold can be exchanged within 7 days with invoice.</p>
                <div className="flex justify-center pt-1">
                  <div className="border border-black p-1 inline-block">
                    <QrCode className="w-10 h-10 mx-auto" />
                  </div>
                </div>
                <p className="text-[8px] text-zinc-500">Scan for e-Warranty & Support</p>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* A4 OFFICIAL GST TAX INVOICE FORMAT */}
          {/* ============================================================ */}
          {format === 'A4' && (
            <div
              id="printable-a4-invoice"
              className="bg-white p-8 text-black border border-zinc-300 shadow-sm w-[780px] text-xs font-sans"
            >
              {/* Header Box */}
              <div className="flex justify-between items-start border-b-2 border-black pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-2xl tracking-wider text-black">KITCHEN</span>
                    <span className="font-black text-2xl tracking-wider text-orange-600">PRO</span>
                  </div>
                  <h2 className="font-bold text-sm text-zinc-900 mt-1">{storeSettings.businessName}</h2>
                  <p className="text-zinc-600 text-[11px] max-w-sm">{storeSettings.address}</p>
                  <p className="text-zinc-600 text-[11px]">{storeSettings.city}, {storeSettings.state} - {storeSettings.pincode}</p>
                  <p className="text-zinc-800 font-bold text-[11px] mt-1">GSTIN / UIN: {storeSettings.gstin}</p>
                  <p className="text-zinc-600 text-[11px]">Email: {storeSettings.email} | Support: {storeSettings.supportPhone}</p>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                    TAX INVOICE (GST)
                  </div>
                  <div className="mt-3 space-y-1 text-right">
                    <p><span className="text-zinc-500">Invoice No:</span> <b className="text-zinc-900">{order.invoiceNumber}</b></p>
                    <p><span className="text-zinc-500">Invoice Date:</span> <b>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</b></p>
                    <p><span className="text-zinc-500">Order Ref:</span> <b>{order.orderNumber}</b></p>
                    <p><span className="text-zinc-500">Channel:</span> <b className="uppercase">{order.type} Sale</b></p>
                    <p><span className="text-zinc-500">Place of Supply:</span> <b>{storeSettings.state} ({storeSettings.stateCode})</b></p>
                  </div>
                </div>
              </div>

              {/* Billed To / Shipped To */}
              <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-zinc-50 border border-zinc-200 rounded">
                <div>
                  <p className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider mb-1">BILLED TO / CUSTOMER DETAILS</p>
                  <p className="font-bold text-zinc-900 text-sm">{order.customer.name}</p>
                  {order.customer.gstin && (
                    <p className="font-semibold text-orange-700">Buyer GSTIN: {order.customer.gstin}</p>
                  )}
                  <p className="text-zinc-600">Phone: {order.customer.phone}</p>
                  {order.customer.email && <p className="text-zinc-600">Email: {order.customer.email}</p>}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider mb-1">DELIVERY ADDRESS / DISPATCH</p>
                  {order.shippingAddress ? (
                    <>
                      <p className="font-semibold text-zinc-800">{order.shippingAddress.fullName}</p>
                      <p className="text-zinc-600">{order.shippingAddress.street}</p>
                      <p className="text-zinc-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                    </>
                  ) : (
                    <p className="text-zinc-600 italic">Direct Counter Store Pickup at Main Hub</p>
                  )}
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-zinc-300 rounded overflow-hidden mb-4">
                <table className="w-full text-left">
                  <thead className="bg-zinc-900 text-white text-[10px] uppercase">
                    <tr>
                      <th className="p-2 w-8 text-center">#</th>
                      <th className="p-2">Description of Goods</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Unit Rate</th>
                      <th className="p-2 text-right">Taxable</th>
                      <th className="p-2 text-center">GST %</th>
                      <th className="p-2 text-right">Tax Amt</th>
                      <th className="p-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {order.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50">
                        <td className="p-2 text-center text-zinc-500">{idx + 1}</td>
                        <td className="p-2">
                          <p className="font-bold text-zinc-900">{it.productName}</p>
                          <p className="text-[10px] text-zinc-500">SKU: {it.sku}</p>
                        </td>
                        <td className="p-2 text-center font-bold">{it.quantity}</td>
                        <td className="p-2 text-right">{formatINR(it.unitPrice)}</td>
                        <td className="p-2 text-right">{formatINR(it.taxableAmount)}</td>
                        <td className="p-2 text-center font-semibold">{it.gstRate}%</td>
                        <td className="p-2 text-right font-mono">{formatINR(it.cgst + it.sgst + it.igst)}</td>
                        <td className="p-2 text-right font-bold text-zinc-900">{formatINR(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculation Breakdown */}
              <div className="grid grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-[11px]">
                    <p className="font-bold text-zinc-900 mb-1">Terms & Conditions:</p>
                    <ol className="list-decimal list-inside text-zinc-600 space-y-0.5">
                      <li>Goods once sold carry manufacturer warranty as specified.</li>
                      <li>Interest @18% p.a. will be charged for overdue credit payments.</li>
                      <li>Subject to Mumbai jurisdiction only.</li>
                    </ol>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded">
                    <ShieldCheck className="w-6 h-6 text-orange-600 shrink-0" />
                    <p className="text-[10px] text-orange-900 leading-tight">
                      This is an authentic computer-generated GST invoice complying with Rule 46 of the CGST Rules, 2017.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded space-y-2">
                  <div className="flex justify-between text-zinc-600">
                    <span>Taxable Subtotal:</span>
                    <span className="font-semibold">{formatINR(order.taxableAmount)}</span>
                  </div>
                  {order.cgstTotal > 0 && (
                    <div className="flex justify-between text-zinc-600">
                      <span>CGST Total:</span>
                      <span>{formatINR(order.cgstTotal)}</span>
                    </div>
                  )}
                  {order.sgstTotal > 0 && (
                    <div className="flex justify-between text-zinc-600">
                      <span>SGST Total:</span>
                      <span>{formatINR(order.sgstTotal)}</span>
                    </div>
                  )}
                  {order.igstTotal > 0 && (
                    <div className="flex justify-between text-zinc-600">
                      <span>IGST Total:</span>
                      <span>{formatINR(order.igstTotal)}</span>
                    </div>
                  )}
                  {order.couponDiscount > 0 && (
                    <div className="flex justify-between text-orange-700 font-semibold">
                      <span>Coupon Discount:</span>
                      <span>-{formatINR(order.couponDiscount)}</span>
                    </div>
                  )}
                  {order.shippingCharges > 0 && (
                    <div className="flex justify-between text-zinc-600">
                      <span>Delivery / Freight:</span>
                      <span>{formatINR(order.shippingCharges)}</span>
                    </div>
                  )}
                  {order.roundOff !== 0 && (
                    <div className="flex justify-between text-zinc-500">
                      <span>Round Off:</span>
                      <span>{order.roundOff > 0 ? `+${order.roundOff}` : order.roundOff}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-black pt-2 flex justify-between text-base font-extrabold text-zinc-950">
                    <span>GRAND TOTAL:</span>
                    <span>{formatINR(order.grandTotal)}</span>
                  </div>
                  <div className="pt-2 text-right">
                    <p className="text-[10px] text-zinc-500">Payment Mode: <b className="uppercase text-zinc-800">{order.paymentMethod}</b> | Status: <b className="text-emerald-700 uppercase">{order.paymentStatus}</b></p>
                  </div>
                </div>
              </div>

              {/* Authorized Signatory */}
              <div className="flex justify-between items-end mt-8 pt-4 border-t border-zinc-200">
                <div className="text-[10px] text-zinc-500">
                  <p>Generated by: Kitchen Pro Enterprise ERP</p>
                  <p>Date & Time: {new Date().toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center">
                  <div className="h-10 border-b border-zinc-400 w-48 mb-1"></div>
                  <p className="font-bold text-zinc-900 text-xs">For {storeSettings.businessName}</p>
                  <p className="text-[10px] text-zinc-500">Authorised Signatory</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Dedicated Print Service for Kitchen Pro ERP & POS
 * Reliable cross-browser & sandboxed-iframe printing for Thermal Receipts and A4 GST Tax Invoices
 */

export function generatePrintDocumentHtml(elementId: string, title: string = 'Kitchen Pro Invoice'): string {
  const sourceElement = document.getElementById(elementId);
  const contentHtml = sourceElement ? sourceElement.outerHTML : '<p>Invoice not found</p>';

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    html, body {
      margin: 0;
      padding: 0;
      background: #FFFFFF !important;
      color: #000000 !important;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    }

    .print-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #141414;
      color: white;
      padding: 12px 24px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .print-btn {
      background: #F27D26;
      color: #000000;
      border: none;
      padding: 10px 24px;
      font-weight: 900;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .print-btn:hover {
      background: #ffffff;
    }

    .close-btn {
      background: #333;
      color: #eee;
      border: none;
      padding: 8px 16px;
      font-size: 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    .close-btn:hover {
      background: #555;
    }

    .page-wrapper {
      display: flex;
      justify-content: center;
      padding: 24px;
      background: #f4f4f5;
      min-height: calc(100vh - 60px);
    }

    #printable-thermal-receipt {
      background: white !important;
      color: black !important;
      font-family: 'JetBrains Mono', monospace, Courier, monospace !important;
      padding: 16px;
      border: 1px dashed #bbb;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin: 0 auto;
    }

    #printable-a4-invoice {
      background: white !important;
      color: black !important;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
      padding: 28px;
      border: 1px solid #ddd;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      max-width: 800px;
      width: 100%;
      margin: 0 auto;
    }

    @media print {
      .print-bar {
        display: none !important;
      }
      .page-wrapper {
        padding: 0 !important;
        background: white !important;
        min-height: auto !important;
      }
      #printable-thermal-receipt {
        border: none !important;
        box-shadow: none !important;
        padding: 2mm !important;
        width: 100% !important;
        max-width: 80mm !important;
      }
      #printable-a4-invoice {
        border: none !important;
        box-shadow: none !important;
        padding: 4mm !important;
        max-width: 100% !important;
      }
      @page {
        margin: 5mm;
        size: auto;
      }
    }

    /* Utility classes */
    .font-mono { font-family: 'JetBrains Mono', monospace !important; }
    .font-sans { font-family: 'Plus Jakarta Sans', sans-serif !important; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: 700; }
    .font-black, .font-extrabold { font-weight: 900; }
    .font-semibold { font-weight: 600; }
    .uppercase { text-transform: uppercase; }
    .border { border: 1px solid #d1d5db; }
    .border-b { border-bottom: 1px solid #000000; }
    .border-t { border-top: 1px solid #000000; }
    .border-b-2 { border-bottom: 2px solid #000000; }
    .border-t-2 { border-top: 2px solid #000000; }
    .border-black { border-color: #000000; }
    .border-dashed { border-style: dashed; }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .items-end { align-items: flex-end; }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .w-full { width: 100%; }
    .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
    .p-4 { padding: 1rem; }
    .p-8 { padding: 2rem; }
    .p-2 { padding: 0.5rem; }
    .p-3 { padding: 0.75rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .pb-4 { padding-bottom: 1rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-8 { margin-top: 2rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-base { font-size: 1rem; line-height: 1.5rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-\\[10px\\] { font-size: 10px; line-height: 14px; }
    .text-\\[11px\\] { font-size: 11px; line-height: 15px; }
    .text-\\[9px\\] { font-size: 9px; line-height: 12px; }
    .text-\\[8px\\] { font-size: 8px; line-height: 10px; }
    .text-orange-600, .text-orange-700, .text-\\[\\#F27D26\\] { color: #F27D26 !important; }
    .text-zinc-600, .text-gray-600 { color: #4b5563 !important; }
    .text-zinc-500, .text-gray-500 { color: #6b7280 !important; }
    .bg-zinc-900, .bg-black { background-color: #141414 !important; color: white !important; }
    .bg-zinc-100 { background-color: #f4f4f5 !important; }
    .bg-zinc-50 { background-color: #f9fafb !important; }
    .bg-orange-50 { background-color: #fff7ed !important; }
    .border-zinc-300 { border-color: #d4d4d8 !important; }
    .border-zinc-200 { border-color: #e4e4e7 !important; }
    .border-orange-200 { border-color: #fed7aa !important; }
    .divide-y > * + * { border-top: 1px solid #e4e4e7; }
    table { border-collapse: collapse; width: 100%; }
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>${styles}</style>
      </head>
      <body>
        <div class="print-bar">
          <div>
            <span style="font-weight:900; font-size:14px; text-transform:uppercase; letter-spacing:0.5px;">KITCHEN PRO INVOICE CENTER</span>
            <span style="font-size:11px; color:#aaa; margin-left:12px;">${title}</span>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="print-btn" onclick="window.print()">
              🖨️ PRINT / SAVE AS PDF
            </button>
            <button class="close-btn" onclick="window.close()">Close</button>
          </div>
        </div>
        <div class="page-wrapper">
          ${contentHtml}
        </div>
        <script>
          // Automatically trigger print dialog on load
          window.addEventListener('load', function() {
            setTimeout(function() {
              try {
                window.print();
              } catch (e) {
                console.warn('Auto print trigger', e);
              }
            }, 400);
          });
        </script>
      </body>
    </html>
  `;
}

/**
 * Direct Print Action - Works inside sandboxed iframes & direct windows
 */
export function executeDirectPrint(elementId: string, title: string = 'Kitchen Pro Invoice'): { success: boolean; fallbackUsed?: string } {
  const htmlContent = generatePrintDocumentHtml(elementId, title);

  // Strategy 1: Open synchronous popup window (must be called immediately during user click event)
  try {
    const printWin = window.open('', '_blank', 'width=900,height=920,menubar=no,toolbar=no,location=no,status=no');
    if (printWin && !printWin.closed) {
      printWin.document.open();
      printWin.document.write(htmlContent);
      printWin.document.close();
      return { success: true, fallbackUsed: 'window' };
    }
  } catch (winErr) {
    console.warn('Direct window.open print was blocked by browser sandbox:', winErr);
  }

  // Strategy 2: Blob URL download / open
  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    
    // Try opening blob URL in new tab
    const blobWin = window.open(blobUrl, '_blank');
    if (blobWin) {
      return { success: true, fallbackUsed: 'blob' };
    }

    // Fallback: Download file directly
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    return { success: true, fallbackUsed: 'download' };
  } catch (blobErr) {
    console.warn('Blob print fallback error:', blobErr);
  }

  // Strategy 3: Standard window.print
  try {
    window.print();
    return { success: true, fallbackUsed: 'window.print' };
  } catch (stdErr) {
    console.error('All print strategies exhausted:', stdErr);
    return { success: false };
  }
}

/**
 * Downloads a complete, standalone, self-contained printable invoice file
 */
export function downloadInvoiceHtml(elementId: string, invoiceNumber: string): void {
  const htmlContent = generatePrintDocumentHtml(elementId, `Invoice_${invoiceNumber}`);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `Invoice_${invoiceNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, FileText, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PublicInvoicePage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/public/invoice/${token}`);
        if (!res.ok) throw new Error("Invoice not found or invalid link.");
        const data = await res.json();
        setInvoice(data.invoice);
        setCompany(data.company);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f3ec] flex items-center justify-center font-mono font-bold text-lg">
        Loading Invoice...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#f6f3ec] flex items-center justify-center p-6">
        <div className="bg-[#FFE5E5] text-[#D32F2F] border-[4px] border-[#D32F2F] p-8 max-w-lg w-full shadow-[8px_8px_0_0_#D32F2F] flex flex-col items-center gap-4 text-center">
          <AlertCircle size={48} />
          <h1 className="font-display-md text-2xl font-black uppercase">Link Invalid</h1>
          <p className="font-bold">{error || "This invoice link is invalid or has expired."}</p>
        </div>
      </div>
    );
  }

  const pdfUrl = `/api/public/invoice/${token}/download`;

  return (
    <div className="min-h-screen bg-[#f6f3ec] flex flex-col items-center py-12 px-4 sm:px-6">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-5xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#FACC15] border-[3px] border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="font-display-md text-3xl font-black uppercase">Invoice {invoice.invoiceNumber}</h1>
              <p className="font-mono font-bold text-black/60 uppercase">{company?.name}</p>
            </div>
          </div>

          <a 
            href={pdfUrl}
            download={`Invoice-${invoice.invoiceNumber}.pdf`}
            className="bg-[#FACC15] text-black border-[3px] border-black px-6 py-4 font-black uppercase text-sm flex items-center gap-2 shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            <Download size={20} /> Download PDF
          </a>
        </div>

        {/* PDF Viewer */}
        <div className="w-full h-[80vh] bg-white border-[4px] border-black shadow-[12px_12px_0_0_#000] relative overflow-hidden">
          <iframe 
            src={`${pdfUrl}#view=FitH`} 
            className="w-full h-full border-none"
            title={`Invoice ${invoice.invoiceNumber}`}
          />
        </div>
      </motion.div>
    </div>
  );
}

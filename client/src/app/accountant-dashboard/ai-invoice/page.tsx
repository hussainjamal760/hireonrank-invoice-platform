"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Download, CheckCircle2, ShieldAlert, X, 
  ArrowUpRight, ArrowLeft, FileText, RefreshCw, Zap,
  Trash2, Coins, FileCode, PenTool, HelpCircle, ArrowRight
} from "lucide-react";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface GeneratedInvoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  dueDate: string;
}

const EXAMPLE_PROMPTS = [
  {
    label: "Web Dev Project",
    category: "Development",
    icon: FileCode,
    text: "Web development services for client Tesla: Frontend coding $3000, Backend API $2500, Hosting and Setup $500."
  },
  {
    label: "Hourly Consulting",
    category: "Consulting",
    icon: Coins,
    text: "Consulting services for 12 hours for Acme Corp at $150 per hour."
  },
  {
    label: "Marketing Design",
    category: "Design",
    icon: PenTool,
    text: "Design brochure for $250 and business cards for $85 for Spark Inc."
  }
];

const TAX_PRESETS = [0, 5, 10, 18];

export default function AIInvoicePage() {
  const router = useRouter();
  const [promptText, setPromptText] = useState("");
  const [taxRate, setTaxRate] = useState<number>(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedInvoice, setGeneratedInvoice] = useState<GeneratedInvoice | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) {
      setError("Please describe your invoice details first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setGeneratedInvoice(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ai/invoice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          text: promptText.trim(),
          taxRate: Number(taxRate) || 0
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate AI invoice");
      }

      setGeneratedInvoice(data.invoice);
      setSuccess(`Successfully generated Invoice ${data.invoice.invoiceNumber}!`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedInvoice) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/invoices/${generatedInvoice._id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${generatedInvoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      setError(err.message || "Failed to download PDF.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-[4px] border-black pb-6">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push("/accountant-dashboard/invoices")}
            className="group flex items-center gap-2 w-max px-3.5 py-1.5 border-[2px] border-black bg-white hover:bg-black hover:text-[#FACC15] font-label-caps uppercase text-[10px] font-black shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Invoices
          </button>
          <div className="flex items-center gap-3 mt-1">
            <div className="p-2 bg-[#FACC15] border-[3px] border-black shadow-[3px_3px_0_0_#000000]">
              <Sparkles size={24} className="text-black" />
            </div>
            <div>
              <h1 className="font-display-lg text-4xl uppercase font-black tracking-tight text-black">AI Invoice Center</h1>
              <p className="font-mono text-xs text-black/60 font-bold uppercase mt-0.5">Generate client invoices using natural language instructions</p>
            </div>
          </div>
        </div>

        {/* Step progress tracker */}
        <div className="flex items-center gap-2 bg-[#fbfbfa] border-[3px] border-black p-3 font-mono text-[10px] font-black shadow-[3px_3px_0_0_#000000] uppercase">
          <span className={`px-2 py-1 rounded ${!generatedInvoice ? "bg-[#FACC15] text-black" : "bg-black/10 text-black/50"}`}>1. Describe</span>
          <ArrowRight size={10} className="text-black/40" />
          <span className={`px-2 py-1 rounded ${loading ? "bg-[#FACC15] text-black" : "bg-black/10 text-black/50"}`}>2. Process</span>
          <ArrowRight size={10} className="text-black/40" />
          <span className={`px-2 py-1 rounded ${generatedInvoice ? "bg-[#FACC15] text-black" : "bg-black/10 text-black/50"}`}>3. Preview</span>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#D32F2F] rounded"
          >
            <ShieldAlert size={24} className="shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto hover:opacity-70 cursor-pointer border-0 bg-transparent outline-none">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#E5F6E5] text-[#008A00] border-[3px] border-[#008A00] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#008A00] rounded"
          >
            <CheckCircle2 size={24} className="shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto hover:opacity-70 cursor-pointer border-0 bg-transparent outline-none">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-6 bg-[#fbfbfa] border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000] space-y-6 relative overflow-hidden">
          {/* Subtle design element */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/10 rounded-full translate-x-12 -translate-y-12 border-4 border-dashed border-black/10/10"></div>

          <div>
            <h2 className="font-display-md text-xl uppercase font-black mb-1 border-b-[2px] border-black pb-2 flex items-center gap-2">
              <Zap size={20} className="text-[#FACC15] fill-[#FACC15]" /> AI Instructions
            </h2>
            <p className="font-bold text-[10px] text-black/50 uppercase tracking-wider">
              Describe your invoice details below. Let the AI calculate everything.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <label className="font-label-caps uppercase text-[11px] font-black tracking-wide">Invoice Description</label>
                {promptText && (
                  <button 
                    type="button" 
                    onClick={() => setPromptText("")}
                    className="flex items-center gap-1 font-mono text-[10px] font-black text-red-500 hover:text-red-700 bg-transparent border-0 outline-none cursor-pointer"
                  >
                    <Trash2 size={12} /> Clear Text
                  </button>
                )}
              </div>
              <textarea
                rows={5}
                placeholder="Describe: Who is the client? What did you build? What is the pricing? e.g. Bill ACME Corp for 10 hours of design consulting at $120/hr and 1 set of wireframes for $350..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                disabled={loading}
                className="w-full p-4 bg-white border-[3px] border-black font-mono font-bold text-xs focus:outline-none focus:bg-[#FACC15] focus:shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.1)] disabled:opacity-55 resize-y transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-[11px] font-black tracking-wide">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  value={taxRate || ""}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  disabled={loading}
                  className="w-full p-3 bg-white border-[3px] border-black font-mono font-bold text-xs focus:outline-none focus:bg-[#FACC15] disabled:opacity-55"
                />
              </div>

              {/* Tax presets */}
              <div className="flex flex-col gap-2 justify-end">
                <span className="font-mono text-[9px] font-black text-black/40 uppercase">Quick Tax Presets</span>
                <div className="flex gap-1.5">
                  {TAX_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTaxRate(preset)}
                      disabled={loading}
                      className={`flex-1 py-2 font-mono text-[10px] font-black border-[2px] border-black cursor-pointer transition-all hover:bg-[#FACC15] hover:text-black ${taxRate === preset ? "bg-[#FACC15] text-black shadow-[1.5px_1.5px_0_0_#000000]" : "bg-white text-black"}`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-[#FACC15] hover:bg-[#FACC15] hover:text-black py-4 font-label-caps border-[3px] border-black transition-all uppercase font-black flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} /> Parsing Invoice Context...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="animate-pulse" /> Generate Invoice with AI
                </>
              )}
            </button>
          </form>

          {/* Prompt Suggestions */}
          <div className="space-y-3.5 pt-4 border-t-2 border-dashed border-black/10/10">
            <span className="font-label-caps uppercase text-[10px] font-black tracking-wider text-black/40 flex items-center gap-1">
              <HelpCircle size={12} /> Click a prompt example to test
            </span>
            <div className="flex flex-col gap-2.5">
              {EXAMPLE_PROMPTS.map((ex, idx) => {
                const CategoryIcon = ex.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPromptText(ex.text)}
                    disabled={loading}
                    className="w-full text-left p-3.5 border-[2px] border-black bg-white hover:bg-black hover:text-white transition-all cursor-pointer flex gap-3 group relative shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    <div className="w-8 h-8 rounded border-2 border-black bg-[#FACC15] text-black flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-colors">
                      <CategoryIcon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-label-caps uppercase font-black text-[9px] bg-black text-[#FACC15] group-hover:bg-[#FACC15] group-hover:text-black px-1.5 py-0.5 rounded transition-colors">
                          {ex.category}
                        </span>
                        <strong className="font-mono text-[10px] uppercase truncate opacity-70 group-hover:opacity-100 transition-opacity">
                          {ex.label}
                        </strong>
                      </div>
                      <p className="font-mono text-[10.5px] leading-relaxed truncate mt-1 text-black/60 group-hover:text-white/80 transition-colors">
                        {ex.text}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-6 flex flex-col">
          <AnimatePresence mode="wait">
            {generatedInvoice ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white border-[3px] border-black p-6 shadow-[8px_8px_0_0_#000000] flex-1 flex flex-col justify-between overflow-hidden"
              >
                {/* Accent Gradient Line */}
                <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-[#FACC15] via-[#3B82F6] to-[#10B981]"></div>

                <div className="space-y-6 pt-2">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between border-b-[3px] border-black pb-4">
                    <div>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase bg-black text-[#FACC15] px-2.5 py-1 border border-black font-black tracking-wider rounded">
                        <Sparkles size={10} className="fill-[#FACC15]" /> AI Generated Document
                      </span>
                      <h3 className="font-display-md text-2xl uppercase font-black mt-2.5 tracking-tight">
                        {generatedInvoice.invoiceNumber}
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-black/[0.04] border-2 border-black rounded-lg flex items-center justify-center">
                      <FileText size={24} className="text-black" />
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="grid grid-cols-2 gap-4 bg-[#fbfbfa] border-[3px] border-black p-4 font-mono text-xs shadow-[2px_2px_0_0_#000000]">
                    <div>
                      <span className="text-black/50 block font-bold uppercase tracking-tight mb-1">Client Name</span>
                      <span className="font-black text-black uppercase text-sm">{generatedInvoice.clientName}</span>
                    </div>
                    <div>
                      <span className="text-black/50 block font-bold uppercase tracking-tight mb-1">Due Date</span>
                      <span className="font-black text-black text-sm">
                        {new Date(generatedInvoice.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    <span className="font-label-caps uppercase text-xs font-black text-black/50 tracking-wider">Invoice Items</span>
                    <div className="border-[3px] border-black divide-y-[2px] divide-black overflow-hidden rounded-md bg-white">
                      {generatedInvoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3.5 hover:bg-black/[0.02] transition-colors font-mono text-xs">
                          <div className="flex-1 min-w-0 pr-4">
                            <span className="font-black text-black uppercase block truncate text-[13px]">{item.description}</span>
                            <span className="text-black/50 font-bold mt-0.5 block">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</span>
                          </div>
                          <span className="font-black text-black text-[13px] shrink-0 bg-[#FACC15]/20 px-2 py-1 border border-black rounded font-mono">${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes Box */}
                  {generatedInvoice.notes && (
                    <div className="bg-[#FEFCE8] border-[2px] border-dashed border-[#FEF08A] p-3 text-xs font-mono text-[#854D0E] rounded-md">
                      <span className="font-bold uppercase block text-[10px] tracking-wider mb-1">Notes / Memo:</span>
                      <p className="leading-relaxed font-medium">{generatedInvoice.notes}</p>
                    </div>
                  )}

                  {/* Totals Summary */}
                  <div className="border-t-[3px] border-black pt-4 space-y-2 font-mono text-sm">
                    <div className="flex justify-between text-black/70 px-2">
                      <span className="font-bold uppercase text-xs">Subtotal</span>
                      <span className="font-semibold">${generatedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    {generatedInvoice.taxRate > 0 && (
                      <div className="flex justify-between text-black/70 px-2">
                        <span className="font-bold uppercase text-xs">Tax ({generatedInvoice.taxRate}%)</span>
                        <span className="font-semibold">${generatedInvoice.taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base border-[3px] border-black p-3.5 mt-2 bg-[#FACC15] text-black font-black uppercase shadow-[3px_3px_0_0_#000000]">
                      <span>Total Amount</span>
                      <span className="text-lg">${generatedInvoice.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-4 border-t-[2px] border-black/10/10">
                  <button
                    onClick={handleDownload}
                    className="bg-black text-[#FACC15] hover:bg-[#FACC15] hover:text-black py-3.5 font-label-caps border-[3px] border-black transition-colors uppercase font-black flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] cursor-pointer"
                  >
                    <Download size={16} /> Download PDF
                  </button>
                  <button
                    onClick={() => router.push("/accountant-dashboard/invoices")}
                    className="bg-white text-black hover:bg-black hover:text-[#FACC15] py-3.5 font-label-caps border-[3px] border-black transition-colors uppercase font-black flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] cursor-pointer"
                  >
                    Go to Ledger <ArrowUpRight size={16} />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* High-fidelity Mock Blueprint Empty State */
              <div className="border-[3px] border-black border-dashed bg-[#fafafa]/50 p-8 flex-1 flex flex-col justify-between min-h-[450px] relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
                {/* Mock Dotted Background */}
                <div className="absolute inset-0 pattern-grid opacity-[0.03] pointer-events-none"></div>

                {/* Mock Document Header */}
                <div className="space-y-4 opacity-25">
                  <div className="flex justify-between items-center border-b-2 border-black/30/30 pb-3">
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-black rounded"></div>
                      <div className="h-6 w-36 bg-black rounded"></div>
                    </div>
                    <div className="w-10 h-10 bg-black rounded"></div>
                  </div>
                  
                  {/* Mock Meta Info Block */}
                  <div className="grid grid-cols-2 gap-4 border-2 border-black/30/30 p-3">
                    <div className="space-y-1.5">
                      <div className="h-3 w-16 bg-black rounded"></div>
                      <div className="h-4 w-24 bg-black rounded"></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3 w-16 bg-black rounded"></div>
                      <div className="h-4 w-20 bg-black rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Center Content focus */}
                <div className="text-center py-10 z-10 flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-[#FACC15]/20 border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0_0_#000000] rounded-full animate-bounce">
                    <Sparkles size={28} className="text-black" />
                  </div>
                  <div>
                    <h3 className="font-display-md text-lg uppercase font-black text-black">Awaiting Invoice Details</h3>
                    <p className="font-bold text-[10.5px] mt-1.5 text-black/50 max-w-sm mx-auto leading-relaxed">
                      Describe client tasks on the left, then click generate. Your invoice blueprint will populate here instantly.
                    </p>
                  </div>
                </div>

                {/* Mock Document Footer */}
                <div className="space-y-3 opacity-25">
                  <div className="border-t-2 border-black/30/30 pt-3 flex justify-between">
                    <div className="h-3.5 w-16 bg-black rounded"></div>
                    <div className="h-3.5 w-20 bg-black rounded"></div>
                  </div>
                  <div className="flex justify-between items-center border-t-2 border-black/30/30 pt-3">
                    <div className="h-10 w-24 bg-black rounded"></div>
                    <div className="h-10 w-24 bg-black rounded"></div>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

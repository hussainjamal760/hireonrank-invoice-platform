"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, Calendar, ShieldAlert, CheckCircle2,
  ListFilter, Play, ArrowUpRight, DollarSign, Check,
  Plus, Download, Search, MoreVertical, Eye, Send,
  Clock, X, Copy, Mail
} from "lucide-react";

interface Invoice {
  _id: string;
  type: 'PAYROLL' | 'CUSTOM';
  invoiceNumber: string;
  displayClient: string;
  displayAmount: number;
  displayDate: string;
  status: string;
  createdAt: string;
  viewedAt?: string;
  sentAt?: string;
  paidAt?: string;
  dueDate?: string;
  publicLinkToken?: string;
  items?: any[];
  employeeId?: any;
}

export default function InvoicesTab() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterMonth, setFilterMonth] = useState("ALL");

  // Panels
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState<Invoice | null>(null);

  // Bulk Run
  const [runMonth, setRunMonth] = useState("");
  const [runLoading, setRunLoading] = useState(false);

  const decodeCompanyId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(base64));
      return decoded.currentCompanyId;
    } catch {
      return null;
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    const companyId = decodeCompanyId();
    if (!token || !companyId) return;

    try {
      // Fetch General Custom Invoices
      const resCustom = await fetch(`/api/invoices?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataCustom = await resCustom.json();

      const customInvoices = (dataCustom.invoices || []).map((inv: any) => ({
        ...inv,
        type: 'CUSTOM',
        displayClient: inv.clientName,
        displayAmount: inv.totalAmount,
        displayDate: new Date(inv.dueDate).toLocaleDateString()
      }));

      setInvoices(customInvoices.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (err: any) {
      setError(err.message || "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    setRunMonth(`${year}-${month}`);
    fetchInvoices();
  }, []);

  const handleGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runMonth) return setError("Please select a month to generate invoices");

    setRunLoading(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/invoice/generate-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ month: runMonth })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate invoices");

      setSuccess(`Invoices successfully generated for ${runMonth}!`);
      fetchInvoices();
    } catch (err: any) {
      setError(err.message || "Failed to generate invoices");
    } finally {
      setRunLoading(false);
    }
  };

  const handleStatusUpdate = async (invoiceId: string, newStatus: string, isPayroll: boolean) => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const endpoint = isPayroll ? `/api/invoice/${invoiceId}/status` : `/api/invoices/${invoiceId}/status`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to update status to ${newStatus}`);

      setSuccess(`Invoice marked as ${newStatus} successfully.`);
      fetchInvoices();
    } catch (err: any) {
      setError(err.message || "Failed to update invoice status");
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    const isPayroll = invoice.type === 'PAYROLL';
    const endpoint = isPayroll 
      ? `/api/payroll/${invoice._id}/download` 
      : `/api/invoices/${invoice._id}/download`;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      setError(err.message || "Failed to download PDF");
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PAID') return 'bg-emerald-400 text-black';
    if (s === 'SENT') return 'bg-blue-400 text-black';
    if (s === 'VIEWED') return 'bg-orange-400 text-black';
    if (s === 'OVERDUE') return 'bg-red-500 text-white';
    if (s === 'DRAFT' || s === 'PENDING' || s === 'GENERATED') return 'bg-gray-200 text-black';
    return 'bg-yellow-400 text-black';
  };

  const uniqueMonths = Array.from(new Set(invoices.map((i: any) => i.month || i.displayDate.substring(0, 7)))).sort().reverse();
  const uniqueStatuses = Array.from(new Set(invoices.map((i) => i.status.toUpperCase())));

  const filteredInvoices = invoices.filter((i: any) => {
    const matchesMonth = filterMonth === "ALL" || i.month === filterMonth || i.displayDate.includes(filterMonth);
    const matchesStatus = filterStatus === "ALL" || i.status.toUpperCase() === filterStatus;
    const matchesSearch = !searchQuery || 
      i.displayClient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMonth && matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12 relative">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[4px] border-black pb-6"
      >
        <div>
          <h1 className="font-display-lg text-5xl md:text-6xl text-black uppercase font-black tracking-tighter">Invoices</h1>
          <p className="font-body-md text-on-surface-variant font-bold mt-2">Manage, track, and deliver custom & payroll invoices.</p>
        </div>
        <Link 
          href="/accountant-dashboard/invoices/custom"
          className="bg-[#FACC15] text-black border-[3px] border-black px-6 py-4 font-black uppercase text-sm flex items-center gap-2 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
        >
          <Plus size={20} /> Create Invoice
        </Link>
      </motion.div>

      {/* Notifications / Toasts */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-[100] bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#D32F2F] max-w-md"
          >
            <ShieldAlert size={24} className="shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto hover:opacity-70"><X size={16} /></button>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-[100] bg-[#E5F6E5] text-[#008A00] border-[3px] border-[#008A00] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#008A00] max-w-md"
          >
            <CheckCircle2 size={24} className="shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess("")} className="ml-auto hover:opacity-70"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Quick Action Box */}
        <div className="lg:col-span-1 bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between">
          <div>
            <h2 className="font-display-md text-xl uppercase font-black mb-4 border-b-[2px] border-black pb-2 flex items-center gap-2">
              <Play size={20} /> Quick Action
            </h2>
            <p className="font-bold text-sm text-black/70 mb-4">
              Need to bill a client? Use our advanced drag-and-drop designer to create a fully customized invoice instantly.
            </p>
          </div>
          <button
            onClick={() => router.push('/accountant-dashboard/invoices/custom')}
            className="w-full bg-black text-[#FACC15] hover:bg-[#FACC15] hover:text-black py-3 font-label-caps border-[3px] border-black transition-colors uppercase font-black flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
          >
            Create New Invoice <ArrowUpRight size={18} />
          </button>
        </div>

        {/* Invoice Filters */}
        <div className="lg:col-span-3 bg-[#fbfbfa] border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000] flex flex-col justify-between">
          <h2 className="font-display-md text-xl uppercase font-black mb-4 border-b-[2px] border-black pb-2 flex items-center gap-2">
            <ListFilter size={20} /> Advanced Filtering
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-xs font-bold">Search</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3.5 text-black/40" />
                <input
                  type="text"
                  placeholder="Client or Invoice #"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-[3px] border-black font-mono font-bold focus:outline-none focus:bg-[#FACC15]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-xs font-bold">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] cursor-pointer uppercase"
              >
                <option value="ALL">ALL STATUSES</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-xs font-bold">Period / Month</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] cursor-pointer"
              >
                <option value="ALL">ALL PERIODS</option>
                {uniqueMonths.map((m) => (
                  <option key={m as string} value={m as string}>{m as string}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Ledger Table */}
      <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000]">
        <h2 className="font-display-md text-2xl uppercase font-black mb-6 border-b-[3px] border-black pb-4 flex items-center gap-2">
          <FileText size={22} /> Invoices Ledger
        </h2>

        {loading ? (
          <div className="py-12 text-center">
            <span className="font-label-caps text-lg uppercase tracking-widest text-[#735c00] animate-pulse">
              Consulting Invoice Ledgers...
            </span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-12 text-center text-black/60 font-mono font-bold">
            No generated invoices found for this selection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#FACC15] border-b-[3px] border-black font-label-caps text-xs uppercase font-black text-black">
                  <th className="p-4 border-r-[2px] border-black">Invoice #</th>
                  <th className="p-4 border-r-[2px] border-black">Type</th>
                  <th className="p-4 border-r-[2px] border-black">Client / Employee</th>
                  <th className="p-4 border-r-[2px] border-black">Period / Due</th>
                  <th className="p-4 border-r-[2px] border-black">Amount</th>
                  <th className="p-4 border-r-[2px] border-black">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-[1px] divide-black font-mono text-sm">
                {filteredInvoices.map((inv: Invoice) => {
                  const isPaid = inv.status.toUpperCase() === 'PAID';
                  const isPayroll = inv.type === 'PAYROLL';
                  
                  return (
                    <tr key={inv._id} className="hover:bg-[#FACC15]/10 text-black group">
                      <td className="p-4 border-r-[2px] border-black font-bold text-xs">
                        <span className="bg-black text-[#FACC15] border-[2px] border-black px-2 py-0.5 font-mono text-xs font-black shadow-[1px_1px_0_0_#000000]">
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td className="p-4 border-r-[2px] border-black font-bold text-[10px]">
                        <span className={`px-2 py-0.5 border-[1px] border-black ${isPayroll ? 'bg-blue-100' : 'bg-purple-100'}`}>
                          {inv.type}
                        </span>
                      </td>
                      <td className="p-4 border-r-[2px] border-black font-bold">
                        <div className="flex flex-col">
                          <span>{inv.displayClient}</span>
                          {isPayroll && (
                             <span className="text-[10px] text-black/50 font-bold">{inv.employeeId?.email || ""}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 border-r-[2px] border-black font-bold text-xs">{inv.displayDate}</td>
                      <td className="p-4 border-r-[2px] border-black bg-[#FACC15]/10 font-bold text-black text-base">
                        ${inv.displayAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 border-r-[2px] border-black font-bold">
                        <span className={`border-[2px] border-black px-2 py-1 text-xs font-black uppercase shadow-[1px_1px_0_0_#000000] ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="bg-white text-black hover:bg-[#FACC15] border-[2px] border-black p-1.5 shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          
                          <button
                            onClick={() => setShowDeliveryModal(inv)}
                            className="bg-white text-black hover:bg-blue-400 border-[2px] border-black p-1.5 shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            title="Send/Share"
                          >
                            <Send size={16} />
                          </button>

                          <button
                            onClick={() => handleDownload(inv)}
                            className="bg-white text-black hover:bg-purple-400 border-[2px] border-black p-1.5 shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>

                          {!isPaid && (
                            <button
                              onClick={() => handleStatusUpdate(inv._id, 'PAID', isPayroll)}
                              className="bg-black text-white hover:bg-emerald-400 hover:text-black border-[2px] border-black p-1.5 shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                              title="Mark as Paid"
                            >
                              <Check size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Delivery Modal */}
      <AnimatePresence>
        {showDeliveryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white border-[4px] border-black shadow-[8px_8px_0_0_#000000] p-6 w-full max-w-lg relative"
            >
              <button 
                onClick={() => setShowDeliveryModal(null)}
                className="absolute top-4 right-4 hover:opacity-50 transition-opacity"
              >
                <X size={24} />
              </button>

              <h2 className="font-display-md text-2xl uppercase font-black border-b-[3px] border-black pb-3 mb-6 flex items-center gap-2">
                <Send size={24} /> Deliver Invoice
              </h2>

              <div className="flex flex-col gap-6">
                <div className="bg-[#fbfbfa] border-[3px] border-black p-4">
                  <div className="font-label-caps text-xs uppercase font-bold text-black/60 mb-1">Invoice</div>
                  <div className="font-mono font-black text-lg">{showDeliveryModal.invoiceNumber}</div>
                  <div className="font-bold">{showDeliveryModal.displayClient}</div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const res = await fetch(`/api/invoices/${showDeliveryModal._id}/send`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || 'Failed to send email');
                        setSuccess("Invoice sent successfully via email!");
                        setShowDeliveryModal(null);
                        setTimeout(() => setSuccess(""), 3000);
                        fetchInvoices();
                      } catch (err: any) {
                        setError(err.message || 'Error sending email');
                      }
                    }}
                    className="w-full bg-[#FACC15] text-black hover:bg-black hover:text-[#FACC15] border-[3px] border-black p-4 font-black uppercase text-sm shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                  >
                    <Mail size={18} /> Send via Email
                  </button>

                  {showDeliveryModal.publicLinkToken && (
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/public/invoice/${showDeliveryModal.publicLinkToken}`;
                        navigator.clipboard.writeText(url);
                        setSuccess("Public link copied to clipboard!");
                        setShowDeliveryModal(null);
                        setTimeout(() => setSuccess(""), 3000);
                      }}
                      className="w-full bg-white text-black hover:bg-gray-100 border-[3px] border-black p-4 font-black uppercase text-sm shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                    >
                      <Copy size={18} /> Copy Public Link
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Detail Slide-out Panel */}
      <AnimatePresence>
        {selectedInvoice && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoice(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white border-l-[4px] border-black shadow-[-8px_0_0_0_#000000] flex flex-col"
            >
              <div className="p-6 border-b-[4px] border-black flex items-center justify-between bg-[#FACC15]">
                <h2 className="font-display-md text-2xl uppercase font-black flex items-center gap-2">
                  <FileText size={24} /> Details
                </h2>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="bg-black text-white p-1 hover:opacity-80 transition-opacity"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                {/* Header Info */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-black text-[#FACC15] px-3 py-1 font-mono font-black text-lg border-[2px] border-black shadow-[2px_2px_0_0_#000000]">
                      {selectedInvoice.invoiceNumber}
                    </span>
                    <span className={`border-[2px] border-black px-3 py-1 text-sm font-black uppercase shadow-[2px_2px_0_0_#000000] ${getStatusColor(selectedInvoice.status)}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <div className="font-bold text-xl mb-1">{selectedInvoice.displayClient}</div>
                  <div className="font-mono text-3xl font-black text-black">
                    ${selectedInvoice.displayAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div className="bg-[#fbfbfa] border-[3px] border-black p-5 shadow-[4px_4px_0_0_#000000]">
                  <h3 className="font-label-caps uppercase font-black mb-4 flex items-center gap-2 border-b-[2px] border-black pb-2">
                    <Clock size={16} /> Activity Timeline
                  </h3>
                  <div className="flex flex-col gap-4 font-mono text-sm relative before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-black/20">
                    <div className="flex gap-4 relative z-10">
                      <div className="w-4 h-4 rounded-full bg-black border-[2px] border-white shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Created</div>
                        <div className="text-black/60">{new Date(selectedInvoice.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    {selectedInvoice.sentAt && (
                      <div className="flex gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-blue-500 border-[2px] border-white shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Sent to Client</div>
                          <div className="text-black/60">{new Date(selectedInvoice.sentAt).toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                    {selectedInvoice.viewedAt && (
                      <div className="flex gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-orange-500 border-[2px] border-white shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Viewed by Client</div>
                          <div className="text-black/60">{new Date(selectedInvoice.viewedAt).toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                    {selectedInvoice.paidAt && (
                      <div className="flex gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 border-[2px] border-white shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Marked as Paid</div>
                          <div className="text-black/60">{new Date(selectedInvoice.paidAt).toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Breakdown (If Custom Invoice) */}
                {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                  <div>
                    <h3 className="font-label-caps uppercase font-black mb-3 border-b-[2px] border-black pb-2">
                      Line Items
                    </h3>
                    <div className="flex flex-col gap-3 font-mono text-sm">
                      {selectedInvoice.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between border-b-[1px] border-black/20 pb-2">
                          <div>
                            <div className="font-bold">{item.description}</div>
                            <div className="text-black/60 text-xs">{item.quantity} x ${item.unitPrice}</div>
                          </div>
                          <div className="font-black">${item.amount.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t-[4px] border-black bg-white flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowDeliveryModal(selectedInvoice);
                    setSelectedInvoice(null);
                  }}
                  className="w-full bg-blue-400 text-black border-[3px] border-black p-3 font-black uppercase text-sm shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} /> Send / Deliver
                </button>
                <button
                  onClick={() => handleDownload(selectedInvoice)}
                  className="w-full bg-white text-black hover:bg-gray-100 border-[3px] border-black p-3 font-black uppercase text-sm shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Download PDF
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

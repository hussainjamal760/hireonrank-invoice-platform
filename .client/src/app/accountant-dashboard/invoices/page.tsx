"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Calendar, ShieldAlert, CheckCircle2,
  ListFilter, Play, ArrowUpRight, DollarSign, Check
} from "lucide-react";

interface Invoice {
  _id: string;
  employeeId: {
    name: string;
    email: string;
    designation?: string;
  };
  invoiceNumber: string;
  month: string;
  amount: number;
  status: 'generated' | 'paid' | 'pending';
  createdAt: string;
}

export default function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Bulk Run State
  const [runMonth, setRunMonth] = useState("");
  const [runLoading, setRunLoading] = useState(false);

  // Filter
  const [filterMonth, setFilterMonth] = useState("ALL");

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
      const res = await fetch(`/api/invoice/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch invoices");
      setInvoices(data.invoices || []);
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

  const handleMarkAsPaid = async (invoiceId: string) => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/invoice/${invoiceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "paid" })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark invoice as paid");

      setSuccess("Invoice marked as PAID successfully.");
      fetchInvoices();
    } catch (err: any) {
      setError(err.message || "Failed to update invoice status");
    }
  };

  const uniqueMonths = Array.from(new Set(invoices.map((i) => i.month))).sort().reverse();

  const filteredInvoices = filterMonth === "ALL"
    ? invoices
    : invoices.filter(i => i.month === filterMonth);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[4px] border-black pb-6"
      >
        <div>
          <h1 className="font-display-lg text-5xl md:text-6xl text-black uppercase font-black tracking-tighter">Invoices Tab</h1>
          <p className="font-body-md text-on-surface-variant font-bold mt-2">Generate and audit employee payroll invoice status records.</p>
        </div>
      </motion.div>

      {/* Notifications */}
      {error && (
        <div className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#D32F2F]">
          <ShieldAlert size={24} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-[#E5F6E5] text-[#008A00] border-[3px] border-[#008A00] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#008A00]">
          <CheckCircle2 size={24} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bulk invoice generation form */}
        <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between h-full">
          <div>
            <h2 className="font-display-md text-2xl uppercase font-black mb-4 border-b-[2px] border-black pb-2 flex items-center gap-2">
              <Play size={20} /> Generate Invoices
            </h2>
            <p className="text-xs font-bold text-black/60 mb-6">
              Loop through all employees of the company and generate a monthly invoice automatically.
            </p>
          </div>

          <form onSubmit={handleGenerateInvoices} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-xs font-bold flex items-center gap-1.5">
                <Calendar size={14} /> Invoice Month
              </label>
              <input
                type="month"
                required
                value={runMonth}
                onChange={(e) => setRunMonth(e.target.value)}
                className="bg-[#f6f3ec] border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15]"
              />
            </div>
            
            <button
              type="submit"
              disabled={runLoading}
              className="w-full bg-black text-[#FACC15] hover:bg-[#FACC15] hover:text-black py-4 font-label-caps border-[3px] border-black transition-colors uppercase font-black flex items-center justify-center gap-2 mt-4 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
            >
              {runLoading ? "Processing..." : "Generate Monthly Invoices"} <ArrowUpRight size={18} />
            </button>
          </form>
        </div>

        {/* Invoice Filter */}
        <div className="lg:col-span-2 bg-[#fbfbfa] border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000] flex flex-col justify-between">
          <div>
            <h2 className="font-display-md text-2xl uppercase font-black mb-4 border-b-[2px] border-black pb-2 flex items-center gap-2">
              <ListFilter size={20} /> Filter Invoices
            </h2>
            <p className="text-xs font-bold text-black/60 mb-6">
              Filter invoices by generation month/period to audit payroll status.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-caps uppercase text-xs font-bold">Select Period</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] cursor-pointer"
            >
              <option value="ALL">Show All Periods ({invoices.length})</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
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
                  <th className="p-4 border-r-[2px] border-black">Employee</th>
                  <th className="p-4 border-r-[2px] border-black">Month</th>
                  <th className="p-4 border-r-[2px] border-black">Amount</th>
                  <th className="p-4 border-r-[2px] border-black">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-[1px] divide-black font-mono text-sm">
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'paid';
                  return (
                    <tr key={inv._id} className="hover:bg-[#FACC15]/10 text-black">
                      <td className="p-4 border-r-[2px] border-black font-bold text-xs">
                        <span className="bg-black text-[#FACC15] border-[2px] border-black px-2 py-0.5 font-mono text-xs font-black shadow-[1px_1px_0_0_#000000]">
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td className="p-4 border-r-[2px] border-black font-bold">
                        <div className="flex flex-col">
                          <span>{inv.employeeId?.name || "Deleted Employee"}</span>
                          <span className="text-[10px] text-black/50 font-bold">{inv.employeeId?.email || ""}</span>
                        </div>
                      </td>
                      <td className="p-4 border-r-[2px] border-black font-bold text-xs">{inv.month}</td>
                      <td className="p-4 border-r-[2px] border-black bg-[#FACC15]/10 font-bold text-black text-base">
                        ${inv.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 border-r-[2px] border-black font-bold">
                        <span className={`border-[2px] border-black px-2 py-0.5 text-xs font-black uppercase shadow-[1px_1px_0_0_#000000] ${
                          isPaid ? 'bg-emerald-400 text-black' : 'bg-amber-400 text-black'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {!isPaid ? (
                          <button
                            onClick={() => handleMarkAsPaid(inv._id)}
                            className="bg-black text-white hover:bg-emerald-400 hover:text-black border-[2px] border-black px-3 py-1.5 font-label-caps text-xs uppercase font-black shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-1 mx-auto"
                          >
                            <Check size={14} /> Mark as Paid
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-xs uppercase flex items-center justify-center gap-1">
                            <CheckCircle2 size={16} /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Banknote, Calendar, ShieldAlert, CheckCircle2,
  ListFilter, Play, ArrowUpRight, Award, Scissors, FileSpreadsheet,
  Download, Check
} from "lucide-react";

interface PayrollRecord {
  _id: string;
  employeeId: {
    name: string;
    email: string;
    designation?: string;
  };
  month: string;
  baseSalary: number;
  totalAllowances: number;
  totalTax: number;
  netSalary: number;
  status: string;
  currency?: string;
  createdAt: string;
}

export default function PayrollTab() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Period Execution Form
  const [targetMonth, setTargetMonth] = useState("");
  const [runLoading, setRunLoading] = useState(false);

  // Filters
  const [filterMonth, setFilterMonth] = useState("ALL");

  const getCurrencySymbol = (currencyCode: string) => {
    switch(currencyCode?.toUpperCase()) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      case 'PKR': return 'Rs ';
      case 'AUD': return 'A$';
      case 'CAD': return 'C$';
      case 'USD': default: return '$';
    }
  };

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

  const fetchPayrollHistory = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    const companyId = decodeCompanyId();
    if (!token || !companyId) return;

    try {
      const res = await fetch(`/api/payroll/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch payroll history");
      setRecords(data.records || []);
    } catch (err: any) {
      setError(err.message || "Failed to load payroll history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Default targetMonth to current Year and Month, e.g. "2026-06"
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    setTargetMonth(`${year}-${month}`);

    fetchPayrollHistory();
  }, []);

  const handleGenerateRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMonth) return setError("Please select a target month for the run");

    setRunLoading(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/payroll/generate-monthly", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ month: targetMonth })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to execute payroll run");

      setSuccess(`Payroll successfully executed for ${targetMonth}! Invoices have been auto-generated.`);
      fetchPayrollHistory();
    } catch (err: any) {
      setError(err.message || "Failed to generate monthly payroll run");
    } finally {
      setRunLoading(false);
    }
  };

  const handleDownload = async (record: PayrollRecord) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/payroll/${record._id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SalarySlip-${record.month}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      setError(err.message || "Failed to download PDF");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/payroll/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to update status to ${newStatus}`);

      setSuccess(`Payroll marked as ${newStatus} successfully.`);
      fetchPayrollHistory();
    } catch (err: any) {
      setError(err.message || "Failed to update payroll status");
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-200 text-black';
    const s = status.toUpperCase();
    if (s === 'PAID') return 'bg-emerald-400 text-black';
    if (s === 'PROCESSED') return 'bg-blue-400 text-black';
    if (s === 'PENDING') return 'bg-yellow-400 text-black';
    return 'bg-gray-200 text-black';
  };

  // Extract unique periods for filter dropdown
  const uniqueMonths = Array.from(new Set(records.map((r) => r.month))).sort().reverse();

  // Filter records
  const filteredRecords = filterMonth === "ALL" 
    ? records 
    : records.filter(r => r.month === filterMonth);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[4px] border-black pb-6"
      >
        <div>
          <h1 className="font-display-lg text-5xl md:text-6xl text-black uppercase font-black tracking-tighter">Payroll Tab</h1>
          <p className="font-body-md text-on-surface-variant font-bold mt-2">Generate monthly payroll runs and audit past salary disbursements.</p>
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

      {/* Upper Area: Run Generator & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trigger Payroll Run Form */}
        <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between h-full">
          <div>
            <h2 className="font-display-md text-2xl uppercase font-black mb-4 border-b-[2px] border-black pb-2 flex items-center gap-2">
              <Play size={20} /> Execute Run
            </h2>
            <p className="text-xs font-bold text-black/60 mb-6">
              Calculates allowances, tax deductions, net salaries, and auto-generates invoice ledgers in bulk.
            </p>
          </div>

          <form onSubmit={handleGenerateRun} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-xs font-bold flex items-center gap-1.5">
                <Calendar size={14} /> Target Month
              </label>
              <input
                type="month"
                required
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="bg-[#f6f3ec] border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] appearance-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={runLoading}
              className="w-full bg-black text-[#FACC15] hover:bg-[#FACC15] hover:text-black py-4 font-label-caps border-[3px] border-black transition-colors uppercase font-black flex items-center justify-center gap-2 mt-4 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
            >
              {runLoading ? "Calculating..." : "Execute Payroll Run"} <ArrowUpRight size={18} />
            </button>
          </form>
        </div>

        {/* History Filter Tool */}
        <div className="lg:col-span-2 bg-[#fbfbfa] border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000] flex flex-col justify-between">
          <div>
            <h2 className="font-display-md text-2xl uppercase font-black mb-4 border-b-[2px] border-black pb-2 flex items-center gap-2">
              <ListFilter size={20} /> Filter History
            </h2>
            <p className="text-xs font-bold text-black/60 mb-6">
              Select a target payroll month/period to filter the audit log below.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-caps uppercase text-xs font-bold">Select Period</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] cursor-pointer"
            >
              <option value="ALL">Show All Periods ({records.length})</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000]">
        <h2 className="font-display-md text-2xl uppercase font-black mb-6 border-b-[3px] border-black pb-4 flex items-center gap-2">
          <FileSpreadsheet size={22} /> Payroll Audit Ledger
        </h2>

        {loading ? (
          <div className="py-12 text-center">
            <span className="font-label-caps text-lg uppercase tracking-widest text-[#735c00] animate-pulse">
              Consulting Ledger Database...
            </span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-black/60 font-mono font-bold">
            No payroll records found for this selection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#FACC15] border-b-[3px] border-black font-label-caps text-xs uppercase font-black text-black">
                  <th className="p-4 border-r-[2px] border-black">Employee</th>
                  <th className="p-4 border-r-[2px] border-black">Month</th>
                  <th className="p-4 border-r-[2px] border-black">Base Salary</th>
                  <th className="p-4 border-r-[2px] border-black">Allowances</th>
                  <th className="p-4 border-r-[2px] border-black">Taxes</th>
                  <th className="p-4 border-r-[2px] border-black">Net Salary</th>
                  <th className="p-4 border-r-[2px] border-black">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-[1px] divide-black font-mono text-sm">
                {filteredRecords.map((rec) => (
                  <tr key={rec._id} className="hover:bg-[#FACC15]/10 text-black">
                    <td className="p-4 border-r-[2px] border-black font-bold">
                      <div className="flex flex-col">
                        <span>{rec.employeeId?.name || "Deleted Employee"}</span>
                        <span className="text-[10px] text-black/50 font-bold">{rec.employeeId?.email || ""}</span>
                      </div>
                    </td>
                    <td className="p-4 border-r-[2px] border-black font-bold text-xs">{rec.month}</td>
                    <td className="p-4 border-r-[2px] border-black">{getCurrencySymbol(rec.currency || 'USD')}{rec.baseSalary?.toLocaleString()}</td>
                    <td className="p-4 border-r-[2px] border-black text-emerald-600 font-bold flex items-center gap-1">
                      <Award size={12} /> +{getCurrencySymbol(rec.currency || 'USD')}{rec.totalAllowances?.toLocaleString()}
                    </td>
                    <td className="p-4 border-r-[2px] border-black text-red-600 font-bold">
                      <div className="flex items-center gap-1">
                        <Scissors size={12} /> -{getCurrencySymbol(rec.currency || 'USD')}{rec.totalTax?.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4 border-r-[2px] border-black bg-[#FACC15]/10 font-bold text-base text-black">
                      {getCurrencySymbol(rec.currency || 'USD')}{rec.netSalary?.toLocaleString()}
                    </td>
                    <td className="p-4 border-r-[2px] border-black font-bold">
                      <span className={`border-[2px] border-black px-2 py-1 text-[10px] font-black uppercase shadow-[1px_1px_0_0_#000000] ${getStatusColor(rec.status)}`}>
                        {rec.status || 'PROCESSED'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(rec)}
                          className="bg-white text-black hover:bg-purple-400 border-[2px] border-black p-1.5 shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                        {rec.status && rec.status.toUpperCase() !== 'PAID' && (
                          <button
                            onClick={() => handleStatusUpdate(rec._id, 'PAID')}
                            className="bg-black text-white hover:bg-emerald-400 hover:text-black border-[2px] border-black p-1.5 shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            title="Mark as Paid"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

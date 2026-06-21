"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, Download, ShieldAlert, Award, Scissors } from "lucide-react";

interface PayrollRecord {
  _id: string;
  month: string;
  baseSalary: number;
  totalAllowances: number;
  totalTax: number;
  netSalary: number;
  status: string;
  currency?: string;
  createdAt: string;
}

export default function SalarySlips() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterMonth, setFilterMonth] = useState("ALL");

  const decodeCompanyId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.currentCompanyId;
    } catch {
      return null;
    }
  };

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
      if (!res.ok) throw new Error(data.message || "Failed to fetch salary slips");
      setRecords(data.records || []);
    } catch (err: any) {
      setError(err.message || "Failed to load salary slips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollHistory();
  }, []);

  const handleDownload = async (rec: PayrollRecord) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/payroll/${rec._id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to download PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip-${rec.month}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Failed to download PDF");
    }
  };

  const uniqueMonths = Array.from(new Set(records.map(r => r.month))).sort((a, b) => b.localeCompare(a));
  const filteredRecords = filterMonth === "ALL" ? records : records.filter(r => r.month === filterMonth);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      <div className="border-b-[4px] border-black pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-headline-lg text-5xl md:text-6xl uppercase font-black tracking-tighter">Salary Slips</h1>
          <p className="font-body-md text-black/60 font-bold uppercase mt-2">Access your monthly payroll records and download payslips.</p>
        </div>
      </div>

      {error && (
        <div className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#D32F2F]">
          <ShieldAlert size={24} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-[#fbfbfa] border-[4px] border-black p-6 shadow-[6px_6px_0_0_#000000] max-w-sm">
        <label className="font-label-caps uppercase text-xs font-bold block mb-2">Filter by Period</label>
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

      {/* Ledger Table */}
      <div className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0_0_#000000]">
        <h2 className="font-display-md text-2xl uppercase font-black mb-6 border-b-[3px] border-black pb-4 flex items-center gap-2">
          <FileSpreadsheet size={22} /> Payslip Ledger
        </h2>

        {loading ? (
          <div className="py-12 text-center">
            <span className="font-label-caps text-lg uppercase tracking-widest text-[#735c00] animate-pulse">
              Fetching Your Records...
            </span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-black/60 font-mono font-bold">
            No salary slips found for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#FACC15] border-b-[3px] border-black font-label-caps text-xs uppercase font-black text-black">
                  <th className="p-4 border-r-[2px] border-black">Month</th>
                  <th className="p-4 border-r-[2px] border-black">Base Salary</th>
                  <th className="p-4 border-r-[2px] border-black">Allowances</th>
                  <th className="p-4 border-r-[2px] border-black">Deductions</th>
                  <th className="p-4 border-r-[2px] border-black">Net Salary</th>
                  <th className="p-4 border-r-[2px] border-black">Status</th>
                  <th className="p-4 text-center">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black font-mono text-sm">
                {filteredRecords.map((rec) => (
                  <tr key={rec._id} className="hover:bg-[#FACC15]/10 text-black transition-colors">
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
                      <span className={`border-[2px] border-black px-2 py-1 text-[10px] font-black uppercase shadow-[1px_1px_0_0_#000000] ${rec.status === 'PAID' ? 'bg-emerald-300 text-emerald-900' : 'bg-white text-black'}`}>
                        {rec.status || 'PROCESSED'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleDownload(rec)}
                          className="bg-black text-white hover:bg-[#FACC15] hover:text-black border-[2px] border-black p-2 shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
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

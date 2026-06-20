"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, ShieldAlert, CheckCircle2, Eye, X, Printer, 
  Download, Building, Calendar, DollarSign, Wallet, ArrowRight
} from "lucide-react";

interface PayrollRecord {
  _id: string;
  employeeName: string;
  employeeEmail: string;
  period: string;
  baseSalary: number;
  deductions: number;
  bonuses: number;
  netPay: number;
  status: "PENDING" | "PROCESSED" | "PAID";
  paidAt?: string;
  createdAt: string;
}

interface CompanyDetails {
  id: string;
  name: string;
  logo?: string;
}

export default function SalarySlipsPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token missing.");
      setLoading(false);
      return;
    }

    try {
      // Fetch payroll history
      const res = await fetch("/api/payroll", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch payroll history");
      setRecords(data.records || []);

      // Fetch company details to brand the payslip receipt
      const companyRes = await fetch("/api/companies/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const companyData = await companyRes.json();
      if (companyRes.ok && companyData.companies && companyData.companies.length > 0) {
        // Retrieve current active company
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = JSON.parse(atob(base64));
        const activeCompany = companyData.companies.find((c: any) => c.id === decoded.currentCompanyId);
        if (activeCompany) {
          setCompany(activeCompany);
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12 print:p-0">
      {/* Header (hidden on print) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[4px] border-black pb-6 print:hidden"
      >
        <div>
          <h1 className="font-display-lg text-5xl md:text-6xl text-black uppercase font-black tracking-tighter">Compensation</h1>
          <p className="font-body-md text-on-surface-variant font-bold mt-2">Access and inspect your monthly salary slips and payment history.</p>
        </div>
      </motion.div>

      {/* Error alert (hidden on print) */}
      {error && (
        <div className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#D32F2F] print:hidden">
          <ShieldAlert size={24} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000] print:hidden">
        {loading ? (
          <div className="py-16 text-center">
            <span className="font-label-caps text-lg uppercase tracking-widest text-[#735c00] animate-pulse">
              Querying Payroll Ledger...
            </span>
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center text-black/60 font-bold font-mono">
            No salary records found for your account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#FACC15] border-b-[3px] border-black font-label-caps text-xs uppercase font-black text-black">
                  <th className="p-4 border-r-[2px] border-black">Period</th>
                  <th className="p-4 border-r-[2px] border-black">Base Salary</th>
                  <th className="p-4 border-r-[2px] border-black">Allowances / Bonuses</th>
                  <th className="p-4 border-r-[2px] border-black">Deductions</th>
                  <th className="p-4 border-r-[2px] border-black">Net Pay</th>
                  <th className="p-4 border-r-[2px] border-black">Date Paid</th>
                  <th className="p-4 border-r-[2px] border-black">Status</th>
                  <th className="p-4 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y-[1px] divide-black font-mono text-sm">
                {records.map((record) => (
                  <tr key={record._id} className="hover:bg-[#FACC15]/10 text-black">
                    <td className="p-4 border-r-[2px] border-black font-bold flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{record.period}</span>
                    </td>
                    <td className="p-4 border-r-[2px] border-black">Rs {record.baseSalary.toLocaleString()}</td>
                    <td className="p-4 border-r-[2px] border-black text-emerald-600 font-bold">+ Rs {record.bonuses.toLocaleString()}</td>
                    <td className="p-4 border-r-[2px] border-black text-red-600 font-bold">- Rs {record.deductions.toLocaleString()}</td>
                    <td className="p-4 border-r-[2px] border-black font-black">Rs {record.netPay.toLocaleString()}</td>
                    <td className="p-4 border-r-[2px] border-black text-xs font-bold">
                      {record.paidAt ? new Date(record.paidAt).toLocaleDateString() : "Pending"}
                    </td>
                    <td className="p-4 border-r-[2px] border-black">
                      <span className={`border-[2px] border-black px-2.5 py-0.5 text-xs font-black uppercase ${
                        record.status === "PAID" 
                          ? "bg-[#E5F6E5] text-[#008A00]" 
                          : record.status === "PROCESSED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="bg-black text-white hover:bg-[#FACC15] hover:text-black border-[2px] border-black px-3 py-1 font-label-caps text-xs uppercase font-black transition-colors flex items-center gap-1.5 mx-auto shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                      >
                        <Eye size={14} /> Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slip Inspector Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:relative print:inset-auto print:bg-white print:p-0 print:z-0">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-[4px] border-black w-full max-w-xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative flex flex-col print:border-0 print:shadow-none"
            >
              {/* Modal Actions Header (hidden on print) */}
              <div className="border-b-[3px] border-black bg-[#f6f3ec] p-4 flex justify-between items-center print:hidden">
                <span className="font-label-caps uppercase font-black text-sm flex items-center gap-2">
                  <FileText size={18} /> Salary Slip Details
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrint}
                    className="p-1.5 hover:bg-black/10 border-[2px] border-transparent hover:border-black transition-all cursor-pointer"
                    title="Print Payslip"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="p-1.5 hover:bg-black/10 border-[2px] border-transparent hover:border-black transition-all cursor-pointer"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* The Salary Slip Invoice Receipt */}
              <div className="p-8 flex flex-col gap-6 print:p-0">
                {/* Branding & Document Title */}
                <div className="flex justify-between items-start border-b-[3px] border-black pb-6">
                  <div className="flex items-center gap-3">
                    {company?.logo ? (
                      <img src={company.logo} alt="Company Logo" className="w-12 h-12 object-cover border-[2.5px] border-black" />
                    ) : (
                      <div className="w-12 h-12 bg-[#FACC15] border-[2.5px] border-black flex items-center justify-center font-black">
                        <Building size={20} />
                      </div>
                    )}
                    <div>
                      <h2 className="font-display-md text-2xl uppercase font-black leading-none">{company?.name || "Voicy Org"}</h2>
                      <span className="text-[10px] font-bold font-mono tracking-wider opacity-75 uppercase">Pay Ledger Record</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="font-display-md text-xl uppercase font-black tracking-tight text-[#ff3333]">SALARY SLIP</h3>
                    <span className="font-mono text-xs font-bold border-[2px] border-black px-2 py-0.5 inline-block mt-2 bg-[#f6f3ec]">
                      {selectedRecord.period}
                    </span>
                  </div>
                </div>

                {/* Employee Details Card */}
                <div className="border-[2.5px] border-black p-4 bg-[#f6f3ec]">
                  <h4 className="font-label-caps text-xs uppercase font-black border-b-[1.5px] border-black/30 pb-1.5 mb-2.5">Employee Information</h4>
                  <div className="grid grid-cols-2 gap-y-1.5 font-mono text-xs text-black">
                    <div>
                      <span className="opacity-75 block text-[10px] uppercase font-bold">NAME</span>
                      <span className="font-black">{selectedRecord.employeeName}</span>
                    </div>
                    <div>
                      <span className="opacity-75 block text-[10px] uppercase font-bold">EMAIL</span>
                      <span className="font-black">{selectedRecord.employeeEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Earnings & Deductions Breakdown */}
                <div className="flex flex-col gap-4 font-mono text-sm">
                  <div className="border-[2px] border-black">
                    <div className="bg-[#FACC15] border-b-[2px] border-black px-4 py-2 font-label-caps text-xs uppercase font-black">Itemized Pay Details</div>
                    
                    <div className="divide-y-[1px] divide-black/30">
                      <div className="flex justify-between px-4 py-3">
                        <span className="font-bold">Base Salary</span>
                        <span>Rs {selectedRecord.baseSalary.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between px-4 py-3 text-emerald-600 font-bold">
                        <span>Allowances & Bonuses</span>
                        <span>+ Rs {selectedRecord.bonuses.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between px-4 py-3 text-red-600 font-bold">
                        <span>Taxes & Deductions</span>
                        <span>- Rs {selectedRecord.deductions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Net Pay Highlight */}
                <div className="flex justify-between items-center bg-[#ffcccc] border-[3px] border-black p-5 shadow-[4px_4px_0_0_#000000]">
                  <div>
                    <span className="font-headline-md text-xl uppercase font-black tracking-tight block">NET DISBURSED</span>
                    <span className="font-mono text-[9px] opacity-75 uppercase font-bold">Calculated Net Payable Salary</span>
                  </div>
                  <span className="font-display-lg text-3xl font-black">
                    Rs {selectedRecord.netPay.toLocaleString()}
                  </span>
                </div>

                {/* Status Indicator */}
                <div className="flex justify-between items-center border-t-[2.5px] border-black pt-4 font-mono text-xs">
                  <div>
                    <span className="opacity-75 font-bold uppercase block text-[9px]">PAYMENT STATUS</span>
                    <span className="font-black flex items-center gap-1.5 uppercase mt-0.5">
                      <span className={`w-2.5 h-2.5 border-[1.5px] border-black inline-block rounded-none ${
                        selectedRecord.status === "PAID" ? "bg-[#008A00]" : "bg-yellow-400 animate-pulse"
                      }`}></span>
                      {selectedRecord.status}
                    </span>
                  </div>
                  {selectedRecord.paidAt && (
                    <div className="text-right">
                      <span className="opacity-75 font-bold uppercase block text-[9px]">DISBURSED DATE</span>
                      <span className="font-black mt-0.5 block">{new Date(selectedRecord.paidAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

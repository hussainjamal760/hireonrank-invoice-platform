"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Banknote, Calendar, ShieldAlert, CheckCircle2,
  ListFilter, Play, ArrowUpRight, Award, Scissors, FileSpreadsheet,
  Download, Check, Sparkles, Plus, Trash2, X, Users, Building2, HelpCircle
} from "lucide-react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { exportTableToCSV, exportTableToPDF } from "@/utils/tableExport";

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

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  department?: string;
  salary: number;
  status: string;
}

interface Company {
  id: string;
  name: string;
  logo?: string;
  role: string;
}

interface AIParsedPayroll {
  employeeId: string;
  employeeName: string;
  payPeriod: string;
  baseSalary: number;
  allowances: { name: string; amount: number }[];
  bonus: number;
  grossSalary: number;
  taxDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
}

const EXAMPLE_PROMPTS = [
  {
    label: "June Allowance & Bonus",
    category: "Standard",
    text: "Generate June payroll for [Employee] with 15,000 transport allowance, 10,000 medical allowance, 5,000 performance bonus and standard tax deductions."
  },
  {
    label: "Advance Deduction",
    category: "Deduction",
    text: "Process July payroll for [Employee]. Add 20,000 performance bonus, but deduct 10,000 for advance salary recovery and standard taxes."
  },
  {
    label: "Salary Revision Test",
    category: "Revision",
    text: "Generate payroll for [Employee] with base salary temporarily increased to 95,000, 10% tax deduction, and no other allowances."
  }
];

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'PKR', symbol: 'Rs ' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'CAD', symbol: 'C$' }
];

export default function PayrollTab() {
  const [activeTab, setActiveTab] = useState<"ledger" | "ai-generator">("ledger");

  // Shared / Ledger States
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Period Execution Form (Ledger tab)
  const [targetMonth, setTargetMonth] = useState("");
  const [runLoading, setRunLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState("ALL");

  // AI Payroll Tab States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [promptText, setPromptText] = useState("");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [aiLoading, setAiLoading] = useState(false);

  // Preview Modal States
  const [generatedPayroll, setGeneratedPayroll] = useState<AIParsedPayroll | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

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

  // 1. Fetch History
  const fetchPayrollHistory = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    const companyId = decodeCompanyId();
    if (!token || !companyId) {
      setLoading(false);
      return;
    }

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

  // 2. Fetch Companies
  const fetchCompanies = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/companies/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.companies) {
        setCompanies(data.companies);
        const currentActive = decodeCompanyId();
        if (currentActive) {
          setSelectedCompanyId(currentActive);
        } else if (data.companies.length > 0) {
          setSelectedCompanyId(data.companies[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  // 3. Fetch Employees for selected company
  const fetchEmployees = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/company/employees", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.employees) {
        setEmployees(data.employees);
        if (data.employees.length > 0) {
          setSelectedEmployeeId(data.employees[0]._id);
        } else {
          setSelectedEmployeeId("");
        }
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // 4. Switch Company Context
  const selectCompany = async (companyId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/companies/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ companyId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to select company");

      localStorage.setItem("token", data.token);
      // Refresh current employees and ledger with new token context
      await fetchEmployees();
      await fetchPayrollHistory();
    } catch (err: any) {
      setError(err.message || "Failed to switch company context.");
    }
  };

  const handleCompanyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCompanyId = e.target.value;
    setSelectedCompanyId(newCompanyId);
    if (newCompanyId) {
      await selectCompany(newCompanyId);
    }
  };

  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    setTargetMonth(`${year}-${month}`);

    const loadAll = async () => {
      await fetchCompanies();
      await fetchEmployees();
      await fetchPayrollHistory();
    };
    loadAll();
  }, []);

  // 5. Generate AI Payroll
  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return setError("Please select an employee.");
    if (!promptText.trim()) return setError("Please enter an instruction prompt.");

    setAiLoading(true);
    setError("");
    setSuccess("");
    setGeneratedPayroll(null);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/ai/payroll/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          text: promptText.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate payroll");

      setGeneratedPayroll(data.payroll);
      setIsPreviewModalOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to run AI payroll generation.");
    } finally {
      setAiLoading(false);
    }
  };

  // 6. Save AI Payroll
  const handleSavePayroll = async () => {
    if (!generatedPayroll) return;

    setSaveLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/ai/payroll/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...generatedPayroll, currency: currency.code })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save payroll record");

      setSuccess(`Payroll generated and saved successfully for ${generatedPayroll.employeeName}!`);
      setIsPreviewModalOpen(false);
      setGeneratedPayroll(null);
      setPromptText("");
      
      // Refresh list & switch tab
      await fetchPayrollHistory();
      setActiveTab("ledger");
    } catch (err: any) {
      setError(err.message || "Failed to save payroll calculations.");
    } finally {
      setSaveLoading(false);
    }
  };

  // 7. Manual run (from original page)
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

  // Preview Form State Manipulators
  const updateField = (field: keyof AIParsedPayroll, value: any) => {
    if (!generatedPayroll) return;
    const updated = { ...generatedPayroll, [field]: value };
    recalculateTotals(updated);
  };

  const updateAllowance = (index: number, key: "name" | "amount", value: any) => {
    if (!generatedPayroll) return;
    const updatedAllowances = [...generatedPayroll.allowances];
    updatedAllowances[index] = { ...updatedAllowances[index], [key]: value };
    const updated = { ...generatedPayroll, allowances: updatedAllowances };
    recalculateTotals(updated);
  };

  const deleteAllowance = (index: number) => {
    if (!generatedPayroll) return;
    const updatedAllowances = generatedPayroll.allowances.filter((_, i) => i !== index);
    const updated = { ...generatedPayroll, allowances: updatedAllowances };
    recalculateTotals(updated);
  };

  const addAllowance = () => {
    if (!generatedPayroll) return;
    const updatedAllowances = [...generatedPayroll.allowances, { name: "Allowance", amount: 0 }];
    const updated = { ...generatedPayroll, allowances: updatedAllowances };
    recalculateTotals(updated);
  };

  const recalculateTotals = (updated: AIParsedPayroll) => {
    const baseSalary = Number(updated.baseSalary) || 0;
    const allowancesSum = updated.allowances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
    const bonus = Number(updated.bonus) || 0;
    const grossSalary = Math.round((baseSalary + allowancesSum + bonus) * 100) / 100;

    const taxDeduction = Number(updated.taxDeduction) || 0;
    const otherDeductions = Number(updated.otherDeductions) || 0;
    const totalDeductions = Math.round((taxDeduction + otherDeductions) * 100) / 100;

    const netSalary = Math.max(0, Math.round((grossSalary - totalDeductions) * 100) / 100);

    setGeneratedPayroll({
      ...updated,
      grossSalary,
      totalDeductions,
      netSalary
    });
  };

  const fillExamplePrompt = (template: string) => {
    const selectedEmp = employees.find(e => e._id === selectedEmployeeId);
    const name = selectedEmp ? selectedEmp.name : "Ahmed";
    setPromptText(template.replace("[Employee]", name));
  };

  // Filter records
  const uniqueMonths = Array.from(new Set(records.map((r) => r.month))).sort().reverse();
  const filteredRecords = filterMonth === "ALL" 
    ? records 
    : records.filter(r => r.month === filterMonth);

  const handleExportCSV = () => {
    const data = filteredRecords.map(r => ({
      Employee: r.employeeId?.name || "Deleted Employee",
      Month: r.month,
      "Base Salary": r.baseSalary,
      Allowances: r.totalAllowances,
      Taxes: r.totalTax,
      "Net Salary": r.netSalary,
      Status: r.status || "PROCESSED"
    }));
    exportTableToCSV(data, "Payroll_Audit_Ledger");
  };

  const handleExportPDF = () => {
    const headers = ["Employee", "Month", "Base Salary", "Allowances", "Taxes", "Net Salary", "Status"];
    const data = filteredRecords.map(r => [
      r.employeeId?.name || "Deleted Employee",
      r.month,
      `${getCurrencySymbol(r.currency || 'USD')}${r.baseSalary?.toLocaleString()}`,
      `+${getCurrencySymbol(r.currency || 'USD')}${r.totalAllowances?.toLocaleString()}`,
      `-${getCurrencySymbol(r.currency || 'USD')}${r.totalTax?.toLocaleString()}`,
      `${getCurrencySymbol(r.currency || 'USD')}${r.netSalary?.toLocaleString()}`,
      r.status || "PROCESSED"
    ]);
    exportTableToPDF("Payroll Audit Ledger", headers, data, "Payroll_Audit_Ledger");
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[4px] border-black pb-6"
      >
        <div>
          <h1 className="font-display-lg text-5xl md:text-6xl text-black uppercase font-black tracking-tighter">Payroll Center</h1>
          <p className="font-body-md text-on-surface-variant font-bold mt-2">Generate monthly runs, audit historical ledger, or trigger smart AI calculations.</p>
        </div>
      </motion.div>

      {/* Notifications */}
      {error && (
        <div className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center justify-between gap-3 shadow-[4px_4px_0_0_#D32F2F]">
          <div className="flex items-center gap-3">
            <ShieldAlert size={24} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-red-700 hover:text-black">
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-[#E5F6E5] text-[#008A00] border-[3px] border-[#008A00] p-4 font-bold flex items-center justify-between gap-3 shadow-[4px_4px_0_0_#008A00]">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess("")} className="text-emerald-700 hover:text-black">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Tabs Menu Selector */}
      <div className="flex border-b-[4px] border-black gap-2">
        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-6 py-3 font-label-caps text-xs font-black uppercase border-[3px] border-black border-b-0 transition-all ${
            activeTab === "ledger"
              ? "bg-[#FACC15] text-black translate-y-[4px]"
              : "bg-white text-black hover:bg-black/5"
          }`}
        >
          Payroll Ledger
        </button>
        <button
          onClick={() => setActiveTab("ai-generator")}
          className={`px-6 py-3 font-label-caps text-xs font-black uppercase border-[3px] border-black border-b-0 transition-all ${
            activeTab === "ai-generator"
              ? "bg-[#FACC15] text-black translate-y-[4px]"
              : "bg-white text-black hover:bg-black/5"
          }`}
        >
          AI Payroll Generator
        </button>
      </div>

      {activeTab === "ledger" ? (
        <>
          {/* Upper Area: Run Generator & Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trigger Payroll Run Form */}
            <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between h-full">
              <div>
                <h2 className="font-display-md text-2xl uppercase font-black mb-4 border-b-[2px] border-black pb-2 flex items-center gap-2">
                  <Play size={20} /> Execute Run
                </h2>
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
                  className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] cursor-pointer animate-none"
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 border-b-[3px] border-black pb-4 gap-4">
              <h2 className="font-display-md text-2xl uppercase font-black flex items-center gap-2">
                <FileSpreadsheet size={22} /> Payroll Audit Ledger
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleExportCSV}
                  className="bg-white text-black border-[2px] border-black px-3 py-1 font-label-caps text-xs font-black shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  CSV
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="bg-[#FACC15] text-black border-[2px] border-black px-3 py-1 font-label-caps text-xs font-black shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  PDF
                </button>
              </div>
            </div>

            {loading ? (
              <TableSkeleton columns={8} rows={5} />
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
        </>
      ) : (
        /* AI Payroll Generator Tab Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Box */}
          <div className="lg:col-span-6 bg-[#fbfbfa] border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000] space-y-6">
            <div>
              <h2 className="font-display-md text-2xl uppercase font-black mb-1 border-b-[2px] border-black pb-2 flex items-center gap-2">
                <Sparkles size={20} className="text-[#FACC15] fill-black" /> AI Instructions
              </h2>
              <p className="font-bold text-[10px] text-black/50 uppercase tracking-wider">
                Select employee, describe their adjustments, and generate payroll structure.
              </p>
            </div>

            <form onSubmit={handleAIGenerate} className="space-y-4">
              {/* Company Selector */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-xs font-bold flex items-center gap-1.5">
                  <Building2 size={14} /> 1. Select Company
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={handleCompanyChange}
                  className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] cursor-pointer"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                  ))}
                </select>
              </div>

              {/* Employee Selector */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-xs font-bold flex items-center gap-1.5">
                  <Users size={14} /> 2. Select Employee
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] cursor-pointer"
                >
                  {employees.length === 0 ? (
                    <option value="">No active employees found</option>
                  ) : (
                    employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} — {emp.designation || "Staff"} ({emp.department || "No Department"})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Currency Selector */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-xs font-bold flex items-center gap-1.5">
                  <Banknote size={14} /> 3. Select Currency
                </label>
                <select
                  value={currency.code}
                  onChange={(e) => {
                    const selected = CURRENCIES.find(c => c.code === e.target.value);
                    if (selected) setCurrency(selected);
                  }}
                  className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] cursor-pointer"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>

              {/* Text Area */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-xs font-bold">
                  4. Enter Natural Language Payroll request
                </label>
                <textarea
                  rows={5}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="e.g. Generate June payroll for Ahmed with 15,000 transport allowance, 10,000 medical allowance, 5,000 performance bonus and standard tax deductions."
                  className="w-full p-4 bg-white border-[3px] border-black font-mono font-bold text-xs focus:outline-none focus:bg-[#FACC15] resize-y"
                  disabled={aiLoading}
                />
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={aiLoading || !selectedEmployeeId}
                className="w-full bg-black text-[#FACC15] hover:bg-[#FACC15] hover:text-black py-4 font-label-caps border-[3px] border-black transition-all uppercase font-black flex items-center justify-center gap-2 mt-4 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <>Processing Payroll via AI...</>
                ) : (
                  <>
                    <Sparkles size={18} className="animate-pulse" /> Generate Payroll calculations
                  </>
                )}
              </button>
            </form>

            {/* Prompt Templates */}
            <div className="space-y-3.5 pt-4 border-t-2 border-dashed border-black/10/10">
              <span className="font-label-caps uppercase text-[10px] font-black tracking-wider text-black/40 flex items-center gap-1">
                <HelpCircle size={12} /> Prompt Examples (Auto-inserts selected employee)
              </span>
              <div className="flex flex-col gap-2">
                {EXAMPLE_PROMPTS.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => fillExamplePrompt(ex.text)}
                    className="w-full text-left p-3.5 border-[2px] border-black bg-white hover:bg-black hover:text-white transition-all cursor-pointer flex gap-3 group relative shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    <div className="w-8 h-8 border-2 border-black bg-[#FACC15] text-black flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-colors font-bold text-xs font-mono">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-label-caps uppercase font-black text-[9px] bg-black text-[#FACC15] group-hover:bg-[#FACC15] group-hover:text-black px-1.5 py-0.5 rounded transition-colors">
                        {ex.category}
                      </span>
                      <p className="font-mono text-[10.5px] leading-relaxed truncate mt-1 text-black/60 group-hover:text-white/80 transition-colors">
                        {ex.text}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt Guide / Empty State info */}
          <div className="lg:col-span-6 flex flex-col justify-center items-center border-[3px] border-black border-dashed bg-[#fafafa]/50 p-8 min-h-[450px]">
            <div className="w-16 h-16 bg-[#FACC15]/20 border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0_0_#000000] rounded-full mb-4">
              <Sparkles size={28} className="text-black" />
            </div>
            <h3 className="font-display-md text-lg uppercase font-black text-black">Awaiting Generation Input</h3>
            <p className="font-bold text-[10.5px] mt-1.5 text-black/50 max-w-xs text-center leading-relaxed">
              Define modifications for the selected employee on the left. AI calculations will generate a complete salary ledger ready for audit and edits.
            </p>
          </div>
        </div>
      )}

      {/* Editable Preview Modal */}
      <AnimatePresence>
        {isPreviewModalOpen && generatedPayroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border-[3px] border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[8px_8px_0_0_#000000] flex flex-col">
              
              {/* Modal Header */}
              <div className="bg-[#FACC15] border-b-[3px] border-black p-4 flex justify-between items-center shrink-0">
                <h3 className="font-display-md text-xl uppercase font-black flex items-center gap-2">
                  <Sparkles size={20} className="fill-black" /> Preview & Edit Payroll calculations
                </h3>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="bg-white text-black border-[2px] border-black p-1 shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  {/* Name (Read-only) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-caps text-xs font-bold uppercase">Employee Name</label>
                    <input
                      type="text"
                      disabled
                      value={generatedPayroll.employeeName}
                      className="bg-black/5 border-[2px] border-black p-2 font-mono text-sm focus:outline-none cursor-not-allowed opacity-75 font-bold"
                    />
                  </div>

                  {/* Period (Editable) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-caps text-xs font-bold uppercase">Pay Period</label>
                    <input
                      type="text"
                      value={generatedPayroll.payPeriod}
                      onChange={(e) => updateField("payPeriod", e.target.value)}
                      className="bg-[#f6f3ec] border-[2px] border-black p-2 font-mono text-sm focus:outline-none focus:bg-[#FACC15]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Base Salary (Editable) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-caps text-xs font-bold uppercase">Base Salary</label>
                    <input
                      type="number"
                      value={generatedPayroll.baseSalary}
                      onChange={(e) => updateField("baseSalary", parseFloat(e.target.value) || 0)}
                      className="bg-[#f6f3ec] border-[2px] border-black p-2 font-mono text-sm focus:outline-none focus:bg-[#FACC15]"
                    />
                  </div>

                  {/* Performance Bonus (Editable) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-caps text-xs font-bold uppercase">Performance Bonus</label>
                    <input
                      type="number"
                      value={generatedPayroll.bonus}
                      onChange={(e) => updateField("bonus", parseFloat(e.target.value) || 0)}
                      className="bg-[#f6f3ec] border-[2px] border-black p-2 font-mono text-sm focus:outline-none focus:bg-[#FACC15]"
                    />
                  </div>
                </div>

                {/* Allowances Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-black pb-1.5">
                    <label className="font-label-caps text-xs font-bold uppercase flex items-center gap-1.5">
                      <Award size={14} /> Allowances Breakdown
                    </label>
                    <button
                      type="button"
                      onClick={addAllowance}
                      className="flex items-center gap-1 bg-[#FACC15] hover:bg-black hover:text-[#FACC15] border-[2px] border-black px-2 py-0.5 font-label-caps text-[10px] font-black shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer transition-all"
                    >
                      <Plus size={10} /> Add Allowance
                    </button>
                  </div>

                  {generatedPayroll.allowances.length === 0 ? (
                    <div className="text-center py-4 bg-[#fbfbfa] border-[2px] border-dashed border-black/30 font-mono text-xs text-black/50 font-bold">
                      No allowances generated. Click add to add one.
                    </div>
                  ) : (
                    <div className="border-[2px] border-black divide-y-[2px] divide-black overflow-hidden bg-white max-h-44 overflow-y-auto">
                      {generatedPayroll.allowances.map((allow, idx) => (
                        <div key={idx} className="flex gap-2 p-2 bg-[#fbfbfa] items-center">
                          <input
                            type="text"
                            value={allow.name}
                            onChange={(e) => updateAllowance(idx, "name", e.target.value)}
                            placeholder="Name, e.g. Transport"
                            className="flex-1 bg-white border-[1.5px] border-black p-1.5 font-mono text-xs focus:outline-none focus:bg-[#FACC15]"
                          />
                          <input
                            type="number"
                            value={allow.amount}
                            onChange={(e) => updateAllowance(idx, "amount", parseFloat(e.target.value) || 0)}
                            placeholder="Amount"
                            className="w-32 bg-white border-[1.5px] border-black p-1.5 font-mono text-xs focus:outline-none focus:bg-[#FACC15]"
                          />
                          <button
                            type="button"
                            onClick={() => deleteAllowance(idx)}
                            className="bg-[#FFE5E5] hover:bg-red-200 border-[1.5px] border-black p-1.5 text-red-700 cursor-pointer transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Deductions Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-black pb-1.5">
                    <label className="font-label-caps text-xs font-bold uppercase flex items-center gap-1.5">
                      <Scissors size={14} /> Deductions Breakdown
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-caps text-[10px] font-bold text-black/60 uppercase">Tax Deduction</label>
                      <input
                        type="number"
                        value={generatedPayroll.taxDeduction}
                        onChange={(e) => updateField("taxDeduction", parseFloat(e.target.value) || 0)}
                        className="bg-[#f6f3ec] border-[2px] border-black p-2 font-mono text-sm focus:outline-none focus:bg-[#FACC15]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-caps text-[10px] font-bold text-black/60 uppercase">Other Deductions</label>
                      <input
                        type="number"
                        value={generatedPayroll.otherDeductions}
                        onChange={(e) => updateField("otherDeductions", parseFloat(e.target.value) || 0)}
                        className="bg-[#f6f3ec] border-[2px] border-black p-2 font-mono text-sm focus:outline-none focus:bg-[#FACC15]"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculations Summary Card */}
                <div className="border-[3px] border-black p-4 bg-[#fbfbfa] space-y-2.5 font-mono text-sm shadow-[3px_3px_0_0_#000000]">
                  <div className="flex justify-between text-black/70">
                    <span className="font-bold uppercase text-xs">Base Salary:</span>
                    <span>{getCurrencySymbol("USD")}{generatedPayroll.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-black/70">
                    <span className="font-bold uppercase text-xs">Allowances & Bonuses:</span>
                    <span className="text-emerald-600 font-bold">
                      +{getCurrencySymbol("USD")}{(generatedPayroll.allowances.reduce((s, a) => s + a.amount, 0) + generatedPayroll.bonus).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-black/70">
                    <span className="font-bold uppercase text-xs">Gross Salary:</span>
                    <span className="font-black">
                      {getCurrencySymbol("USD")}{generatedPayroll.grossSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-black/70 border-t border-black/20 pt-2">
                    <span className="font-bold uppercase text-xs">Total Deductions:</span>
                    <span className="text-red-600 font-bold">
                      -{getCurrencySymbol("USD")}{generatedPayroll.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-base border-[2px] border-black p-2.5 mt-2 bg-[#FACC15] text-black font-black uppercase">
                    <span>Net take home:</span>
                    <span>{getCurrencySymbol("USD")}{generatedPayroll.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer / Actions */}
              <div className="border-t-[3px] border-black p-4 bg-[#fbfbfa] grid grid-cols-2 gap-4 shrink-0">
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="bg-white hover:bg-black hover:text-white py-3.5 font-label-caps border-[3px] border-black transition-colors uppercase font-black flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePayroll}
                  disabled={saveLoading}
                  className="bg-black text-[#FACC15] hover:bg-[#FACC15] hover:text-black py-3.5 font-label-caps border-[3px] border-black transition-all uppercase font-black flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saveLoading ? "Saving calculations..." : "Save Payroll"}
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

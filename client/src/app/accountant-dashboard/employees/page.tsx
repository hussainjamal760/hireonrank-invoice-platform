"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, UserPlus, Mail, ShieldAlert, CheckCircle2,
  Trash2, X, DollarSign, Plus, Settings, CreditCard,
  Briefcase, Percent, ShieldQuestion, UserCheck, Download
} from "lucide-react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { exportTableToCSV, exportTableToPDF } from "@/utils/tableExport";

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  department?: string;
  salary: number;
  status: string;
  currency?: string;
}

interface Allowance {
  name: string;
  amount: number;
}

interface TaxRule {
  name: string;
  rate: number; 
}

interface EmployeeProfile {
  baseSalary: number;
  currency: string;
  bonusThisMonth?: number;
  deductionThisMonth?: number;
  allowances: Allowance[];
  taxRules: TaxRule[];
}

export default function EmployeesTab() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

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

  const uniqueDepartments = ["All", ...Array.from(new Set(employees.map(e => e.department).filter(Boolean)))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === "All" || emp.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });


  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Temporary Inputs for Allowances/Taxes
  const [newAllowance, setNewAllowance] = useState({ name: "", amount: "" });
  const [newTax, setNewTax] = useState({ name: "", rate: "" });

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/company/employees", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch employees");
      setEmployees(data.employees || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong fetching employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenProfile = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeProfile(null);
    setIsProfileModalOpen(true);
    setProfileLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/employee/${employee._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch financial profile");
      
      setEmployeeProfile(data.profile || {
        baseSalary: employee.salary,
        currency: "USD",
        bonusThisMonth: 0,
        deductionThisMonth: 0,
        allowances: [],
        taxRules: []
      });
    } catch (err: any) {
      setError(err.message || "Failed to load financial profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedEmployee || !employeeProfile) return;
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/employee/${selectedEmployee._id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(employeeProfile)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update financial profile");

      setSuccess(`Financial profile for ${selectedEmployee.name} updated successfully!`);
      setIsProfileModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    }
  };

  const handleAddAllowance = () => {
    if (!newAllowance.name || !newAllowance.amount || !employeeProfile) return;
    const amountNum = parseFloat(newAllowance.amount);
    if (isNaN(amountNum) || amountNum < 0) return setError("Allowance amount must be a positive number");

    setEmployeeProfile({
      ...employeeProfile,
      allowances: [...employeeProfile.allowances, { name: newAllowance.name, amount: amountNum }]
    });
    setNewAllowance({ name: "", amount: "" });
  };

  const handleDeleteAllowance = (index: number) => {
    if (!employeeProfile) return;
    setEmployeeProfile({
      ...employeeProfile,
      allowances: employeeProfile.allowances.filter((_, idx) => idx !== index)
    });
  };

  const handleAddTax = () => {
    if (!newTax.name || !newTax.rate || !employeeProfile) return;
    const rateNum = parseFloat(newTax.rate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) return setError("Tax percentage must be between 0 and 100");

    setEmployeeProfile({
      ...employeeProfile,
      taxRules: [...employeeProfile.taxRules, { name: newTax.name, rate: rateNum }]
    });
    setNewTax({ name: "", rate: "" });
  };

  const handleDeleteTax = (index: number) => {
    if (!employeeProfile) return;
    setEmployeeProfile({
      ...employeeProfile,
      taxRules: employeeProfile.taxRules.filter((_, idx) => idx !== index)
    });
  };

  // Helper calculation
  const calculateNetPay = () => {
    if (!employeeProfile) return 0;
    const base = employeeProfile.baseSalary || 0;
    const bonus = employeeProfile.bonusThisMonth || 0;
    const deduction = employeeProfile.deductionThisMonth || 0;
    const totalAllowances = employeeProfile.allowances.reduce((sum, a) => sum + a.amount, 0);
    const totalTaxes = employeeProfile.taxRules.reduce((sum, t) => sum + (base * (t.rate / 100)), 0);
    return Math.max(0, base + bonus + totalAllowances - deduction - totalTaxes);
  };

  const handleExportCSV = () => {
    const data = filteredEmployees.map(emp => ({
      Name: emp.name,
      Email: emp.email,
      Department: emp.department || "N/A",
      Designation: emp.designation || "N/A",
      "Base Salary": `${getCurrencySymbol(emp.currency || 'USD')}${emp.salary}`
    }));
    exportTableToCSV(data, "Employees_Report");
  };

  const handleExportPDF = () => {
    const headers = ["Name", "Email", "Department", "Designation", "Base Salary"];
    const data = filteredEmployees.map(emp => [
      emp.name,
      emp.email,
      emp.department || "N/A",
      emp.designation || "N/A",
      `${getCurrencySymbol(emp.currency || 'USD')}${emp.salary}`
    ]);
    exportTableToPDF("Employees Directory", headers, data, "Employees_Report");
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
          <h1 className="font-display-lg text-5xl md:text-6xl text-black uppercase font-black tracking-tighter">Employees Tab</h1>
          <p className="font-body-md text-on-surface-variant font-bold mt-2">Manage employee compensation, allowances, and tax deductions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="bg-white text-black border-[3px] border-black px-4 py-3 font-label-caps text-xs tracking-widest uppercase font-black hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] flex items-center gap-2"
          >
            <Download size={16} /> CSV
          </button>
          <button 
            onClick={handleExportPDF}
            className="bg-white text-black border-[3px] border-black px-4 py-3 font-label-caps text-xs tracking-widest uppercase font-black hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] flex items-center gap-2"
          >
            <Download size={16} /> PDF
          </button>
          <button 
            onClick={() => router.push('/accountant-dashboard/users')}
            className="bg-[#FACC15] text-black border-[3px] border-black px-6 py-3 font-label-caps text-xs tracking-widest uppercase font-black hover:bg-black hover:text-[#FACC15] transition-colors shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
          >
            Add Employee
          </button>
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-white border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] shadow-[4px_4px_0_0_#000000]"
        />
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-white border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] shadow-[4px_4px_0_0_#000000] cursor-pointer appearance-none md:min-w-[200px]"
        >
          {uniqueDepartments.map(dept => (
            <option key={dept as string} value={dept as string}>{dept as string}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000]">
        {loading ? (
          <TableSkeleton columns={6} rows={5} />
        ) : employees.length === 0 ? (
          <div className="py-12 text-center text-black/60 font-mono font-bold">
            No employees registered in this company yet. Click 'Add Employee' to configure.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#FACC15] border-b-[3px] border-black font-label-caps text-xs uppercase font-black text-black">
                  <th className="p-4 border-r-[2px] border-black">Employee</th>
                  <th className="p-4 border-r-[2px] border-black">Email</th>
                  <th className="p-4 border-r-[2px] border-black">Department</th>
                  <th className="p-4 border-r-[2px] border-black">Designation</th>
                  <th className="p-4 border-r-[2px] border-black">Base Salary</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-[1px] divide-black font-mono text-sm">
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-[#FACC15]/10 text-black">
                    <td className="p-4 border-r-[2px] border-black font-bold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-none border-[2px] border-black bg-surface-container flex items-center justify-center text-xs font-black shadow-[1px_1px_0_0_#000000]">
                        <UserCheck size={14} />
                      </div>
                      <span>{emp.name}</span>
                    </td>
                    <td className="p-4 border-r-[2px] border-black font-bold text-xs">{emp.email}</td>
                    <td className="p-4 border-r-[2px] border-black">{emp.department || "N/A"}</td>
                    <td className="p-4 border-r-[2px] border-black">{emp.designation || "N/A"}</td>
                    <td className="p-4 border-r-[2px] border-black font-bold">{getCurrencySymbol(emp.currency || 'USD')}{emp.salary?.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenProfile(emp)}
                        className="bg-black text-white hover:bg-[#FACC15] hover:text-black border-[2px] border-black px-3 py-1.5 font-label-caps text-xs uppercase font-black shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >
                        Financial Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Financial Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && selectedEmployee && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-[4px] border-black p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto neo-brutal-shadow-lg no-scrollbar"
            >
              <div className="flex justify-between items-center border-b-[3px] border-black pb-4 mb-6">
                <div>
                  <h2 className="font-display-md text-2xl uppercase font-black flex items-center gap-2">
                    <Settings size={24} /> Financial Profile
                  </h2>
                  <span className="font-mono text-xs text-black/60 font-bold">{selectedEmployee.name} ({selectedEmployee.email})</span>
                </div>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-black hover:text-[#FACC15] transition-colors">
                  <X size={24} strokeWidth={2.5} />
                </button>
              </div>

              {profileLoading || !employeeProfile ? (
                <div className="py-12 text-center">
                  <span className="font-label-caps text-lg uppercase tracking-widest text-[#735c00] animate-pulse">
                    Decrypting Financial Data...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Base Salary and Currency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-label-caps uppercase text-xs font-bold">Base Salary</label>
                      <input
                        type="number"
                        value={employeeProfile.baseSalary || ""}
                        onChange={(e) => setEmployeeProfile({ ...employeeProfile, baseSalary: parseFloat(e.target.value) || 0 })}
                        className="bg-[#f6f3ec] border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] font-mono text-lg font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-label-caps uppercase text-xs font-bold">Currency</label>
                      <select
                        value={employeeProfile.currency || "USD"}
                        onChange={(e) => setEmployeeProfile({ ...employeeProfile, currency: e.target.value })}
                        className="bg-[#f6f3ec] border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] font-mono text-lg font-bold appearance-none cursor-pointer"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="PKR">PKR (Rs)</option>
                        <option value="AUD">AUD (A$)</option>
                        <option value="CAD">CAD (C$)</option>
                      </select>
                    </div>
                  </div>

                  {/* Bonus and Deductions this month */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-label-caps uppercase text-xs font-bold text-green-700">Bonus This Month</label>
                      <input
                        type="number"
                        value={employeeProfile.bonusThisMonth || ""}
                        onChange={(e) => setEmployeeProfile({ ...employeeProfile, bonusThisMonth: parseFloat(e.target.value) || 0 })}
                        className="bg-[#E5F6E5] border-[3px] border-green-700 p-3 font-body-md focus:outline-none focus:bg-green-100 font-mono text-lg font-bold text-green-900"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-label-caps uppercase text-xs font-bold text-red-700">Deduction This Month</label>
                      <input
                        type="number"
                        value={employeeProfile.deductionThisMonth || ""}
                        onChange={(e) => setEmployeeProfile({ ...employeeProfile, deductionThisMonth: parseFloat(e.target.value) || 0 })}
                        className="bg-[#FFE5E5] border-[3px] border-red-700 p-3 font-body-md focus:outline-none focus:bg-red-100 font-mono text-lg font-bold text-red-900"
                      />
                    </div>
                  </div>

                  {/* Allowances section */}
                  <div className="border-[3px] border-black p-4 bg-[#fbfbfa]">
                    <h3 className="font-display-md text-lg uppercase font-black flex items-center gap-2 mb-4 border-b-[2px] border-black pb-2">
                      <CreditCard size={18} /> Allowances
                    </h3>

                    {employeeProfile.allowances.length === 0 ? (
                      <p className="text-xs text-black/60 font-mono font-bold mb-4">No allowances configured.</p>
                    ) : (
                      <div className="flex flex-wrap gap-3 mb-4">
                        {employeeProfile.allowances.map((allow, idx) => (
                          <div key={idx} className="bg-white border-[2px] border-black px-3 py-1.5 flex items-center gap-3 shadow-[2px_2px_0_0_#000000] font-mono text-xs font-bold">
                            <span>{allow.name}: {getCurrencySymbol(employeeProfile.currency || 'USD')}{allow.amount}</span>
                            <button onClick={() => handleDeleteAllowance(idx)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Travel"
                        value={newAllowance.name}
                        onChange={(e) => setNewAllowance({ ...newAllowance, name: e.target.value })}
                        className="bg-white border-[2px] border-black p-2 font-mono text-xs focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newAllowance.amount}
                        onChange={(e) => setNewAllowance({ ...newAllowance, amount: e.target.value })}
                        className="bg-white border-[2px] border-black p-2 font-mono text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddAllowance}
                        className="bg-black text-white hover:bg-[#FACC15] hover:text-black border-[2px] border-black font-label-caps uppercase font-black text-xs flex items-center justify-center gap-1 shadow-[2px_2px_0_0_#000000]"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>

                  {/* Tax Rules section */}
                  <div className="border-[3px] border-black p-4 bg-[#fbfbfa]">
                    <h3 className="font-display-md text-lg uppercase font-black flex items-center gap-2 mb-4 border-b-[2px] border-black pb-2">
                      <Percent size={18} /> Tax Rules
                    </h3>

                    {employeeProfile.taxRules.length === 0 ? (
                      <p className="text-xs text-black/60 font-mono font-bold mb-4">No tax rules configured.</p>
                    ) : (
                      <div className="flex flex-wrap gap-3 mb-4">
                        {employeeProfile.taxRules.map((tax, idx) => (
                          <div key={idx} className="bg-white border-[2px] border-black px-3 py-1.5 flex items-center gap-3 shadow-[2px_2px_0_0_#000000] font-mono text-xs font-bold">
                            <span>{tax.name}: {tax.rate}%</span>
                            <button onClick={() => handleDeleteTax(idx)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Income Tax"
                        value={newTax.name}
                        onChange={(e) => setNewTax({ ...newTax, name: e.target.value })}
                        className="bg-white border-[2px] border-black p-2 font-mono text-xs focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Rate %"
                        value={newTax.rate}
                        onChange={(e) => setNewTax({ ...newTax, rate: e.target.value })}
                        className="bg-white border-[2px] border-black p-2 font-mono text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddTax}
                        className="bg-black text-white hover:bg-[#FACC15] hover:text-black border-[2px] border-black font-label-caps uppercase font-black text-xs flex items-center justify-center gap-1 shadow-[2px_2px_0_0_#000000]"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>

                  {/* Calculations Preview & Save */}
                  <div className="border-[3px] border-black bg-[#FACC15] p-4 flex justify-between items-center mt-2 shadow-[4px_4px_0_0_#000000]">
                    <div>
                      <span className="font-label-caps uppercase text-xs font-black text-black">Net Salary Projection</span>
                      <div className="font-mono text-2xl font-black text-black">
                        {getCurrencySymbol(employeeProfile.currency || 'USD')}{calculateNetPay().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="bg-black text-white hover:bg-white hover:text-black border-[2px] border-black px-6 py-3 font-label-caps uppercase font-black text-xs shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                      Save Financial Profile
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

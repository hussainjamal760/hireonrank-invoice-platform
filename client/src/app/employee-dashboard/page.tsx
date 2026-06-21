"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, FileText, Calendar, Wallet, Banknote, ShieldAlert, Award, Scissors } from "lucide-react";
import Link from "next/link";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";

export default function EmployeeDashboard() {
  const [globalData, setGlobalData] = useState<any>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/employee/me-global", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profiles");
        
        setGlobalData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <DashboardSkeleton layout="employee" kpiCount={4} />;
  }

  if (error) {
    return (
      <div className="bg-[#FFE5E5] text-[#D32F2F] border-[4px] border-[#D32F2F] p-6 font-bold flex items-center gap-4 shadow-[6px_6px_0_0_#D32F2F]">
        <ShieldAlert size={32} />
        <span className="text-xl">{error}</span>
      </div>
    );
  }

  let filteredProfiles = globalData?.profiles || [];
  if (selectedCompanyId !== "ALL") {
    filteredProfiles = filteredProfiles.filter((p: any) => p.companyId === selectedCompanyId);
  }

  const primaryCurrency = filteredProfiles[0]?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(primaryCurrency);

  let baseSalary = 0;
  let totalAllowances = 0;
  let totalTaxes = 0;

  filteredProfiles.forEach((profile: any) => {
    baseSalary += profile.baseSalary || 0;
    totalAllowances += (profile.allowances || []).reduce((sum: number, a: any) => sum + a.amount, 0) + (profile.bonusThisMonth || 0);
    totalTaxes += (profile.taxRules || []).reduce((sum: number, t: any) => sum + ((profile.baseSalary || 0) * (t.rate / 100)), 0) + (profile.deductionThisMonth || 0);
  });

  const netSalary = Math.max(0, baseSalary + totalAllowances - totalTaxes);
  const employeeName = globalData?.employees?.[0]?.name || "Employee";

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b-[4px] border-black pb-6 gap-4">
        <div>
          <h1 className="font-headline-lg text-5xl md:text-6xl uppercase font-black tracking-tighter">My Dashboard</h1>
          <p className="font-body-md text-black/60 font-bold uppercase mt-2">Welcome back, {employeeName}!</p>
        </div>
        <select 
          value={selectedCompanyId} 
          onChange={e => setSelectedCompanyId(e.target.value)}
          className="bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] cursor-pointer shadow-[4px_4px_0_0_#000000]"
        >
          <option value="ALL">All Companies</option>
          {globalData?.companies?.map((c: any) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ x: 4, y: 4, boxShadow: "0px 0px 0px 0px #000000" }}
          className="bg-[#fbfbfa] border-[4px] border-black p-6 shadow-[6px_6px_0_0_#000000] transition-all flex flex-col justify-between h-40"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-caps uppercase font-black text-sm tracking-wider">Base Salary</span>
            <Wallet size={24} className="text-black" />
          </div>
          <div className="font-display-md text-3xl font-black">{currencySymbol}{baseSalary.toLocaleString()}</div>
        </motion.div>

        <motion.div 
          whileHover={{ x: 4, y: 4, boxShadow: "0px 0px 0px 0px #000000" }}
          className="bg-[#E5F6E5] border-[4px] border-black p-6 shadow-[6px_6px_0_0_#000000] transition-all flex flex-col justify-between h-40"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-caps uppercase font-black text-sm tracking-wider text-emerald-900">Allowances</span>
            <Award size={24} className="text-emerald-700" />
          </div>
          <div className="font-display-md text-3xl font-black text-emerald-700">+{currencySymbol}{totalAllowances.toLocaleString()}</div>
        </motion.div>

        <motion.div 
          whileHover={{ x: 4, y: 4, boxShadow: "0px 0px 0px 0px #000000" }}
          className="bg-[#FFE5E5] border-[4px] border-black p-6 shadow-[6px_6px_0_0_#000000] transition-all flex flex-col justify-between h-40"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-caps uppercase font-black text-sm tracking-wider text-red-900">Deductions</span>
            <Scissors size={24} className="text-red-700" />
          </div>
          <div className="font-display-md text-3xl font-black text-red-700">-{currencySymbol}{totalTaxes.toLocaleString()}</div>
        </motion.div>

        <motion.div 
          whileHover={{ x: 4, y: 4, boxShadow: "0px 0px 0px 0px #000000" }}
          className="bg-[#FACC15] border-[4px] border-black p-6 shadow-[6px_6px_0_0_#000000] transition-all flex flex-col justify-between h-40"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-caps uppercase font-black text-sm tracking-wider">Net Monthly</span>
            <Banknote size={24} className="text-black" />
          </div>
          <div className="font-display-md text-3xl font-black">{currencySymbol}{netSalary.toLocaleString()}</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <Link href="/employee-dashboard/salary-slips" className="group">
          <div className="bg-white border-[4px] border-black p-8 shadow-[8px_8px_0_0_#000000] group-hover:shadow-[4px_4px_0_0_#000000] group-hover:translate-x-[4px] group-hover:translate-y-[4px] transition-all h-full flex flex-col justify-between cursor-pointer">
            <div>
              <div className="w-12 h-12 bg-[#FACC15] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0_0_#000000] mb-6">
                <FileText size={24} strokeWidth={2.5} />
              </div>
              <h2 className="font-display-md text-2xl uppercase font-black mb-2">Salary Slips</h2>
              <p className="font-mono text-sm font-bold text-black/60">
                View, download, and track your monthly payslips and compensation history.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/employee-dashboard/settings" className="group">
          <div className="bg-[#050505] text-white border-[4px] border-black p-8 shadow-[8px_8px_0_0_#FACC15] group-hover:shadow-[4px_4px_0_0_#FACC15] group-hover:translate-x-[4px] group-hover:translate-y-[4px] transition-all h-full flex flex-col justify-between cursor-pointer">
            <div>
              <div className="w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0_0_#FACC15] mb-6 text-black">
                <Calendar size={24} strokeWidth={2.5} />
              </div>
              <h2 className="font-display-md text-2xl uppercase font-black mb-2">My Profile</h2>
              <p className="font-mono text-sm font-bold text-white/60">
                Review your designation, department, and general employment details.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

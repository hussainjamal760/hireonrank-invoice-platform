"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, Users, FileText, Banknote, Wallet,
  TrendingUp, TrendingDown, Clock, Activity, Loader2
} from "lucide-react";

interface DashboardStats {
  totalEmployees: number;
  totalInvoices: number;
  totalRevenue: number;
  pendingRevenue: number;
  totalPayroll: number;
  teamMembers: number;
  trends: {
    employees: string;
    invoices: string;
    revenue: string;
    pendingRevenue: string;
    payroll: string;
    teamMembers: string;
  };
}

interface ActivityLog {
  _id: string;
  action: string;
  description: string;
  createdAt: string;
}

interface Invoice {
  _id: string;
  status: string;
  amount: number;
}

export default function AccountantDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // 1. Fetch KPI metrics MoM trends
      const statsRes = await fetch("/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      // 2. Fetch Activity log feed
      const activityRes = await fetch("/api/dashboard/activity", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activityData = await activityRes.json();

      // 3. Fetch payroll invoices to calculate status breakdown
      // First, decode companyId from token
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(base64));
      const companyId = decoded.currentCompanyId;

      let invoicesData = [];
      if (companyId) {
        const invoicesRes = await fetch(`/api/invoice/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (invoicesRes.ok) {
          const resJson = await invoicesRes.json();
          invoicesData = resJson.invoices || [];
        }
      }

      setStats(statsData);
      setLogs(Array.isArray(activityData) ? activityData : []);
      setInvoices(invoicesData);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch command center statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[#FACC15] animate-spin" strokeWidth={3} />
        <span className="font-label-caps text-lg uppercase tracking-widest text-[#735c00] animate-pulse">
          Querying Ledger Data...
        </span>
      </div>
    );
  }

  // Invoice status counts
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending' || inv.status === 'generated');
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');

  const pendingCount = pendingInvoices.length;
  const paidCount = paidInvoices.length;
  const totalInvoicesCount = invoices.length;

  const totalPayrollCost = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[4px] border-black pb-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-3 bg-white border-[2px] border-black inline-flex px-3 py-1 shadow-[2px_2px_0_0_#FACC15]">
            <span className="w-3 h-3 bg-emerald-400 border-[2px] border-black animate-pulse"></span>
            <span className="text-black font-label-caps text-xs tracking-widest uppercase font-black">Ledger Online</span>
          </div>
          <h1 className="font-display-lg text-5xl md:text-6xl text-black uppercase font-black tracking-tighter">Command Center</h1>
        </div>
        <button 
          onClick={fetchData}
          className="bg-black text-white border-[3px] border-black px-6 py-3 font-label-caps text-xs tracking-widest uppercase font-black hover:bg-[#FACC15] hover:text-black transition-colors shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
        >
          Sync Ledger
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Employees */}
        <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center text-black shadow-[2px_2px_0_0_#000000]">
              <Users size={24} />
            </div>
            {stats?.trends?.employees && (
              <span className="bg-emerald-400 text-black border-[2px] border-black px-2 py-0.5 text-xs font-black shadow-[1px_1px_0_0_#000000]">
                {stats.trends.employees} MoM
              </span>
            )}
          </div>
          <div>
            <h3 className="text-black/60 font-label-caps uppercase text-xs tracking-widest mb-1 font-bold">Total Active Employees</h3>
            <div className="font-display-lg text-4xl text-black font-black font-mono">{stats?.totalEmployees || 0}</div>
          </div>
        </div>

        {/* Total Payroll Cost */}
        <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center text-black shadow-[2px_2px_0_0_#000000]">
              <Wallet size={24} />
            </div>
            {stats?.trends?.payroll && (
              <span className="bg-emerald-400 text-black border-[2px] border-black px-2 py-0.5 text-xs font-black shadow-[1px_1px_0_0_#000000]">
                {stats.trends.payroll} MoM
              </span>
            )}
          </div>
          <div>
            <h3 className="text-black/60 font-label-caps uppercase text-xs tracking-widest mb-1 font-bold">Total Payroll Cost</h3>
            <div className="font-display-lg text-4xl text-black font-black font-mono">
              ${totalPayrollCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Invoices Status Tracking */}
        <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center text-black shadow-[2px_2px_0_0_#000000]">
              <FileText size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-black/60 font-label-caps uppercase text-xs tracking-widest mb-2 font-bold">Payroll Invoices Status</h3>
            <div className="flex gap-4">
              <div>
                <span className="text-xs font-bold text-black/60">PAID</span>
                <div className="font-mono text-2xl font-black text-emerald-600">{paidCount}</div>
              </div>
              <div className="border-l-[2px] border-black/20 pl-4">
                <span className="text-xs font-bold text-black/60">PENDING</span>
                <div className="font-mono text-2xl font-black text-amber-500">{pendingCount}</div>
              </div>
              <div className="border-l-[2px] border-black/20 pl-4">
                <span className="text-xs font-bold text-black/60">TOTAL</span>
                <div className="font-mono text-2xl font-black text-black">{totalInvoicesCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Layout: Activity Log and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Logs (Takes 2 Columns) */}
        <div className="lg:col-span-2 bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000] flex flex-col">
          <h2 className="text-black font-display-md text-2xl uppercase font-black tracking-tight border-b-[3px] border-black pb-4 mb-6">
            System Live Logs
          </h2>
          {logs.length === 0 ? (
            <div className="py-12 text-center text-black/60 font-mono font-bold">
              No recent accounting operations found.
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {logs.map((log, i) => (
                <div key={log._id} className="flex gap-4 items-start group">
                  <div className="relative flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 border-[2px] border-black bg-[#FACC15] text-black flex items-center justify-center shadow-[2px_2px_0_0_#000000]">
                      <Activity size={18} />
                    </div>
                    {i !== logs.length - 1 && (
                      <div className="w-[3px] bg-black h-12 mt-2"></div>
                    )}
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-black/60 font-label-caps text-[10px] uppercase font-black font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    <span className="text-black font-body-md text-sm font-bold leading-snug group-hover:underline">
                      {log.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Operations Guide (Takes 1 Column) */}
        <div className="bg-[#FACC15] border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000] text-black flex flex-col justify-between">
          <div>
            <h2 className="font-display-md text-2xl uppercase font-black border-b-[3px] border-black pb-4 mb-6">
              Operations Hub
            </h2>
            <ul className="space-y-4 font-body-md font-bold">
              <li className="flex items-start gap-2">
                <span className="border-[2px] border-black bg-white w-6 h-6 flex items-center justify-center shrink-0 font-mono text-xs">1</span>
                <span>Add active team members under the Employees tab.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="border-[2px] border-black bg-white w-6 h-6 flex items-center justify-center shrink-0 font-mono text-xs">2</span>
                <span>Configure financial salary, allowances, and tax rules.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="border-[2px] border-black bg-white w-6 h-6 flex items-center justify-center shrink-0 font-mono text-xs">3</span>
                <span>Run bulk monthly payroll and auto-generate invoice ledgers.</span>
              </li>
            </ul>
          </div>
          
          <div className="pt-6 mt-6 border-t-[2px] border-black font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <Clock size={16} />
            <span>Last Sync: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

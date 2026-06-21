"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, Users, FileText, Banknote, Wallet,
  TrendingUp, TrendingDown, Clock, Activity, Loader2
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useCurrencyConverter } from "@/components/useCurrencyConverter";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { exportTableToPDF } from "@/utils/tableExport";

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
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [invoiceChart, setInvoiceChart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const { convert, formatCurrency: formatConvertedCurrency, loading: currencyLoading } = useCurrencyConverter();

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // 1. Fetch KPI metrics MoM trends
      const statsRes = await fetch("/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = statsRes.ok ? await statsRes.json() : null;
      
      // 2. Fetch Activity log feed
      const activityRes = await fetch("/api/dashboard/activity", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activityData = activityRes.ok ? await activityRes.json() : [];

      // 3. Fetch Revenue Chart
      const revenueChartRes = await fetch("/api/dashboard/revenue-chart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const revenueChartData = revenueChartRes.ok ? await revenueChartRes.json() : [];

      // 4. Fetch Invoice Chart
      const invoiceChartRes = await fetch("/api/dashboard/invoice-chart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const invoiceChartData = invoiceChartRes.ok ? await invoiceChartRes.json() : [];

      // 5. Fetch payroll invoices to calculate status breakdown
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

      // 6. Fetch user profile for preferred currency
      const profileRes = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.user?.preferredCurrency) {
          setPreferredCurrency(profileData.user.preferredCurrency);
        }
      }

      setStats(statsData);
      setLogs(Array.isArray(activityData) ? activityData : []);
      setRevenueChart(Array.isArray(revenueChartData) ? revenueChartData : []);
      setInvoiceChart(Array.isArray(invoiceChartData) ? invoiceChartData : []);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
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
    return <DashboardSkeleton layout="accountant" kpiCount={4} />;
  }

  // Invoice status counts
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending' || inv.status === 'generated');
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');

  const pendingCount = pendingInvoices.length;
  const paidCount = paidInvoices.length;
  const totalInvoicesCount = invoices.length;

  const totalPayrollCost = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  const displayCurrency = (val: number | undefined) => {
    if (!val) return formatConvertedCurrency(0, preferredCurrency, true);
    const converted = convert(val, "USD", preferredCurrency);
    return formatConvertedCurrency(converted, preferredCurrency, true);
  };

  const handleDownloadReport = () => {
    const headers = ["Metric", "Value"];
    const data = [
      ["Active Employees", stats?.totalEmployees?.toString() || "0"],
      ["Collected Revenue", displayCurrency(stats?.totalRevenue)],
      ["Pending Revenue", displayCurrency(stats?.pendingRevenue)],
      ["Total Payroll Cost", displayCurrency(stats?.totalPayroll)]
    ];
    exportTableToPDF("Command Center Report", headers, data, "Accountant_Dashboard_Report");
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-12">
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
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDownloadReport}
            className="text-black font-label-caps text-xs tracking-widest uppercase font-bold hover:underline underline-offset-4 decoration-[2px]"
          >
            Download PDF Report
          </button>
          <button 
            onClick={fetchData}
            className="bg-black text-white border-[3px] border-black px-6 py-3 font-label-caps text-xs tracking-widest uppercase font-black hover:bg-[#FACC15] hover:text-black transition-colors shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
          >
            Sync Ledger
          </button>
        </div>
      </motion.div>

      {/* KPI Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Total Revenue */}
        <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-[#FACC15] border-[2px] border-black flex items-center justify-center text-black shadow-[2px_2px_0_0_#000000]">
              <Banknote size={24} />
            </div>
            {stats?.trends?.revenue && (
              <span className={`text-black border-[2px] border-black px-2 py-0.5 text-xs font-black shadow-[1px_1px_0_0_#000000] ${stats.trends.revenue.startsWith('-') ? 'bg-red-400' : 'bg-emerald-400'}`}>
                {stats.trends.revenue} MoM
              </span>
            )}
          </div>
          <div>
            <h3 className="text-black/60 font-label-caps uppercase text-xs tracking-widest mb-1 font-bold">Collected Revenue</h3>
            <div className="font-display-lg text-3xl xl:text-4xl text-black font-black font-mono">
              {displayCurrency(stats?.totalRevenue)}
            </div>
          </div>
        </div>

        {/* KPI 2: Pending Revenue */}
        <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center text-black shadow-[2px_2px_0_0_#000000]">
              <TrendingUp size={24} />
            </div>
            {stats?.trends?.pendingRevenue && (
              <span className={`text-black border-[2px] border-black px-2 py-0.5 text-xs font-black shadow-[1px_1px_0_0_#000000] ${stats.trends.pendingRevenue.startsWith('-') ? 'bg-emerald-400' : 'bg-amber-400'}`}>
                {stats.trends.pendingRevenue} MoM
              </span>
            )}
          </div>
          <div>
            <h3 className="text-black/60 font-label-caps uppercase text-xs tracking-widest mb-1 font-bold">Pending Revenue</h3>
            <div className="font-display-lg text-3xl xl:text-4xl text-black font-black font-mono">
              {displayCurrency(stats?.pendingRevenue)}
            </div>
          </div>
        </div>

        {/* KPI 3: Total Employees */}
        <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center text-black shadow-[2px_2px_0_0_#000000]">
              <Users size={24} />
            </div>
            {stats?.trends?.employees && (
              <span className={`text-black border-[2px] border-black px-2 py-0.5 text-xs font-black shadow-[1px_1px_0_0_#000000] ${stats.trends.employees.startsWith('-') ? 'bg-red-400' : 'bg-emerald-400'}`}>
                {stats.trends.employees} MoM
              </span>
            )}
          </div>
          <div>
            <h3 className="text-black/60 font-label-caps uppercase text-xs tracking-widest mb-1 font-bold">Active Employees</h3>
            <div className="font-display-lg text-3xl xl:text-4xl text-black font-black font-mono">{stats?.totalEmployees || 0}</div>
          </div>
        </div>

        {/* KPI 4: Total Payroll */}
        <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center text-black shadow-[2px_2px_0_0_#000000]">
              <Wallet size={24} />
            </div>
            {stats?.trends?.payroll && (
              <span className={`text-black border-[2px] border-black px-2 py-0.5 text-xs font-black shadow-[1px_1px_0_0_#000000] ${stats.trends.payroll.startsWith('-') ? 'bg-emerald-400' : 'bg-amber-400'}`}>
                {stats.trends.payroll} MoM
              </span>
            )}
          </div>
          <div>
            <h3 className="text-black/60 font-label-caps uppercase text-xs tracking-widest mb-1 font-bold">Total Payroll Cost</h3>
            <div className="font-display-lg text-3xl xl:text-4xl text-black font-black font-mono">
              {displayCurrency(stats?.totalPayroll)}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000] flex flex-col h-[400px]">
          <h2 className="text-black font-display-md text-xl uppercase font-black tracking-tight border-b-[3px] border-black pb-4 mb-6 flex justify-between items-center">
            <span>Revenue Growth (6 Mo)</span>
            <Banknote size={20} className="text-[#FACC15]" />
          </h2>
          <div className="flex-1 w-full font-mono text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000000" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" stroke="#000000" tick={{ fill: '#000000', fontWeight: 'bold' }} />
                <YAxis stroke="#000000" tick={{ fill: '#000000', fontWeight: 'bold' }} tickFormatter={(value) => displayCurrency(value)} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '3px solid #000000', borderRadius: 0, boxShadow: '4px 4px 0 0 #FACC15', fontWeight: 'bold' }}
                  formatter={(value: any) => [displayCurrency(value), "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#000000" stroke="#000000" strokeWidth={2} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoices Chart */}
        <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000] flex flex-col h-[400px]">
          <h2 className="text-black font-display-md text-xl uppercase font-black tracking-tight border-b-[3px] border-black pb-4 mb-6 flex justify-between items-center">
            <span>Invoice Volume (6 Mo)</span>
            <FileText size={20} className="text-[#FACC15]" />
          </h2>
          <div className="flex-1 w-full font-mono text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={invoiceChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000000" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" stroke="#000000" tick={{ fill: '#000000', fontWeight: 'bold' }} />
                <YAxis stroke="#000000" tick={{ fill: '#000000', fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '3px solid #000000', borderRadius: 0, boxShadow: '4px 4px 0 0 #FACC15', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="sent" stroke="#FACC15" strokeWidth={4} dot={{ stroke: '#000000', strokeWidth: 2, fill: '#FACC15', r: 5 }} name="Sent Invoices" />
                <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={4} dot={{ stroke: '#000000', strokeWidth: 2, fill: '#10b981', r: 5 }} name="Paid Invoices" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Layout: Activity Log and Operations Guide */}
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
            <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
              <li className="flex items-start gap-2 pt-4 border-t-[2px] border-black/20/20 mt-4">
                <span className="border-[2px] border-black bg-emerald-400 w-6 h-6 flex items-center justify-center shrink-0 font-mono text-xs text-black">4</span>
                <span>Generate custom client invoices and track payments.</span>
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

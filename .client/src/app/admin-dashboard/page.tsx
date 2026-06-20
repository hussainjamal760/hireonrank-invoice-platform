"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Building2, Activity, Users, FileText, Banknote, Wallet,
  TrendingUp, TrendingDown, Clock, ChevronRight
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from "recharts";

const iconMap: Record<string, any> = {
  FileText: FileText,
  Banknote: Banknote,
  Building2: Building2,
  Users: Users,
  Activity: Activity,
  Wallet: Wallet
};

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0_0_#FACC15]">
        <p className="text-black font-label-caps text-xs uppercase mb-3 tracking-widest border-b-[2px] border-black pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-display-md text-lg text-black flex items-center gap-2">
            <span className="w-3 h-3 border-[2px] border-black" style={{ backgroundColor: entry.color || '#FACC15' }}></span>
            {entry.name}: <span className="font-black">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const KpiCard = ({ title, value, trend, icon: Icon, delay, isPositive = true }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all group cursor-pointer"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center text-black group-hover:bg-[#FACC15] transition-colors shadow-[2px_2px_0_0_#000000]">
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className={`flex items-center gap-1.5 px-2 py-1 border-[2px] border-black font-bold text-xs shadow-[2px_2px_0_0_#000000] ${isPositive ? 'bg-emerald-400 text-black' : 'bg-red-400 text-black'}`}>
        {isPositive ? <TrendingUp size={16} strokeWidth={3} /> : <TrendingDown size={16} strokeWidth={3} />}
        {trend}
      </div>
    </div>
    <div>
      <h3 className="text-black/60 font-label-caps uppercase text-xs tracking-widest mb-2 font-bold">{title}</h3>
      <div className="font-display-lg text-4xl text-black font-black tracking-tight">{value}</div>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    totalPayroll: 0,
    systemLoad: 0
  });

  const [charts, setCharts] = useState({
    growthData: [],
    revenueData: [],
    invoiceData: []
  });

  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const headers = { "Authorization": `Bearer ${token}` };

        const [statsRes, chartsRes, actRes] = await Promise.all([
          fetch("/api/admin/stats", { headers }),
          fetch("/api/admin/charts", { headers }),
          fetch("/api/admin/activity", { headers })
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
        
        if (chartsRes.ok) {
          const data = await chartsRes.json();
          setCharts(data);
        }

        if (actRes.ok) {
          const data = await actRes.json();
          setActivities(data);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="font-display-lg text-lg uppercase tracking-widest text-black animate-pulse">
          Loading Data...
        </span>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val}`;
  };

  const formatNumber = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
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
          <div className="flex items-center gap-3 mb-3 bg-white border-[2px] border-black inline-flex px-3 py-1 shadow-[2px_2px_0_0_#FACC15]">
            <span className="w-3 h-3 bg-emerald-400 border-[2px] border-black animate-pulse"></span>
            <span className="text-black font-label-caps text-xs tracking-widest uppercase font-black">System Online</span>
          </div>
          <h1 className="font-display-lg text-5xl md:text-6xl text-black uppercase font-black tracking-tighter">Command Center</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-black font-label-caps text-xs tracking-widest uppercase font-bold hover:underline underline-offset-4 decoration-[2px]">Generate Report</button>
          <button className="bg-black text-white border-[3px] border-black px-6 py-3 font-label-caps text-xs tracking-widest uppercase font-black hover:bg-[#FACC15] hover:text-black transition-colors shadow-[4px_4px_0_0_#000000]">
            Export Data
          </button>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard title="Total Companies" value={formatNumber(stats.totalCompanies)} trend="+12%" icon={Building2} delay={0.1} />
        <KpiCard title="Active Users" value={formatNumber(stats.totalUsers)} trend="+8%" icon={Users} delay={0.15} />
        <KpiCard title="Total Invoices" value={formatNumber(stats.totalInvoices)} trend="+24%" icon={FileText} delay={0.2} />
        <KpiCard title="Revenue Processed" value={formatCurrency(stats.totalRevenue)} trend="+31%" icon={Wallet} delay={0.25} />
        <KpiCard title="Payroll Executed" value={formatCurrency(stats.totalPayroll)} trend="+18%" icon={Banknote} delay={0.3} />
        <KpiCard title="System Load" value={`${stats.systemLoad}%`} trend="Normal" icon={Activity} delay={0.35} isPositive={true} />
      </div>

      {/* Charts & Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Charts Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Revenue Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000]"
          >
            <div className="flex justify-between items-center mb-8 border-b-[3px] border-black pb-4">
              <h2 className="text-black font-display-md text-2xl uppercase font-black tracking-tight">Revenue Trajectory (K)</h2>
              <button className="bg-[#FACC15] text-black border-[2px] border-black p-2 shadow-[2px_2px_0_0_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"><ChevronRight size={20} strokeWidth={3} /></button>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#000000" opacity={0.1} vertical={false} />
                  <XAxis dataKey="name" axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={{ stroke: '#000', strokeWidth: 2 }} tick={{ fill: '#000', fontSize: 12, fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={{ stroke: '#000', strokeWidth: 2 }} tick={{ fill: '#000', fontSize: 12, fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 'bold' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#FACC15" stroke="#000" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Grid for smaller charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Growth Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15]"
            >
              <h2 className="text-black font-display-md text-lg uppercase font-black tracking-tight mb-6 border-b-[2px] border-black pb-2">Company Growth</h2>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.growthData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000000" opacity={0.1} vertical={false} />
                    <XAxis dataKey="name" axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={false} tick={{ fill: '#000', fontSize: 10, fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={false} tick={{ fill: '#000', fontSize: 10, fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 'bold' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="step" dataKey="companies" name="Companies" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="#3b82f6" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Invoices Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15]"
            >
              <h2 className="text-black font-display-md text-lg uppercase font-black tracking-tight mb-6 border-b-[2px] border-black pb-2">Invoice Volume</h2>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.invoiceData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000000" opacity={0.1} vertical={false} />
                    <XAxis dataKey="name" axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={false} tick={{ fill: '#000', fontSize: 10, fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={false} tick={{ fill: '#000', fontSize: 10, fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 'bold' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="sent" name="Sent" stroke="#000" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#000' }} />
                    <Line type="monotone" dataKey="paid" name="Paid" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#10B981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Activity Feed Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white border-[3px] border-black p-6 flex flex-col h-full shadow-[6px_6px_0_0_#000000]"
        >
          <div className="flex items-center justify-between border-b-[3px] border-black pb-4 mb-6">
            <h2 className="text-black font-display-md text-2xl uppercase font-black tracking-tight">Live Events</h2>
            <div className="w-10 h-10 border-[2px] border-black bg-[#FACC15] flex items-center justify-center text-black shadow-[2px_2px_0_0_#000000]">
              <Clock size={20} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="flex flex-col gap-6 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {activities.length > 0 ? activities.map((activity, i) => {
              const Icon = iconMap[activity.iconStr] || Activity;
              return (
                <div key={activity._id || i} className="flex gap-4 group cursor-pointer">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-12 h-12 border-[2px] border-black flex items-center justify-center shrink-0 z-10 ${activity.bg} ${activity.color} shadow-[2px_2px_0_0_#000000] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    {i !== activities.length - 1 && (
                      <div className="absolute top-12 bottom-[-24px] w-[3px] bg-black"></div>
                    )}
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-black/60 font-label-caps text-xs uppercase font-bold tracking-widest mb-1">
                      {formatTimeAgo(activity.time)}
                    </span>
                    <span className="text-black font-body-md text-sm font-bold leading-snug group-hover:underline decoration-[2px] underline-offset-2">
                      {activity.text}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center mt-10">No recent activity</div>
            )}
          </div>

          <button className="w-full mt-6 bg-white border-[3px] border-black py-3 text-sm font-label-caps uppercase font-black tracking-widest text-black hover:bg-[#FACC15] shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
            View All Logs
          </button>
        </motion.div>

      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { 
  Building2, Activity, Users, FileText, Banknote, Wallet,
  TrendingUp, TrendingDown, Clock, ChevronRight
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from "recharts";

// Mock Data
const growthData = [
  { name: 'Jan', companies: 400 },
  { name: 'Feb', companies: 600 },
  { name: 'Mar', companies: 850 },
  { name: 'Apr', companies: 930 },
  { name: 'May', companies: 1100 },
  { name: 'Jun', companies: 1248 },
];

const revenueData = [
  { name: 'Jan', revenue: 40 },
  { name: 'Feb', revenue: 65 },
  { name: 'Mar', revenue: 98 },
  { name: 'Apr', revenue: 120 },
  { name: 'May', revenue: 155 },
  { name: 'Jun', revenue: 184 },
];

const invoiceData = [
  { name: 'Jan', sent: 12, paid: 11 },
  { name: 'Feb', sent: 18, paid: 16 },
  { name: 'Mar', sent: 24, paid: 21 },
  { name: 'Apr', sent: 31, paid: 28 },
  { name: 'May', sent: 42, paid: 39 },
  { name: 'Jun', sent: 51, paid: 46 },
];

const activities = [
  { time: "2 min ago", text: "ABC Company created invoice #123", icon: FileText, bg: "bg-[#FACC15]", color: "text-black" },
  { time: "15 min ago", text: "XYZ Company generated payroll for 42 employees", icon: Banknote, bg: "bg-blue-400", color: "text-black" },
  { time: "1 hour ago", text: "New company 'Northwind' registered", icon: Building2, bg: "bg-purple-400", color: "text-black" },
  { time: "2 hours ago", text: "New user 'Sarah J.' joined Verafield", icon: Users, bg: "bg-emerald-400", color: "text-black" },
  { time: "5 hours ago", text: "System daily backup completed successfully", icon: Activity, bg: "bg-gray-200", color: "text-black" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111] border-[3px] border-white p-4 shadow-[4px_4px_0_0_#FACC15]">
        <p className="text-white font-label-caps text-xs uppercase mb-3 tracking-widest border-b-[2px] border-white pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-display-md text-lg text-white flex items-center gap-2">
            <span className="w-3 h-3 border-[2px] border-white" style={{ backgroundColor: entry.color || '#FACC15' }}></span>
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
    className="bg-[#111] border-[3px] border-white p-6 shadow-[4px_4px_0_0_#FACC15] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all group cursor-pointer"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center text-black group-hover:bg-[#FACC15] transition-colors">
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className={`flex items-center gap-1.5 px-2 py-1 border-[2px] border-white font-bold text-xs ${isPositive ? 'bg-emerald-500 text-black border-black' : 'bg-red-500 text-black border-black'}`}>
        {isPositive ? <TrendingUp size={16} strokeWidth={3} /> : <TrendingDown size={16} strokeWidth={3} />}
        {trend}
      </div>
    </div>
    <div>
      <h3 className="text-white/70 font-label-caps uppercase text-xs tracking-widest mb-2">{title}</h3>
      <div className="font-display-lg text-4xl text-white font-black tracking-tight">{value}</div>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[4px] border-white pb-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-3 bg-[#111] border-[2px] border-white inline-flex px-3 py-1 shadow-[2px_2px_0_0_#FACC15]">
            <span className="w-3 h-3 bg-emerald-400 border-[2px] border-black animate-pulse"></span>
            <span className="text-white font-label-caps text-xs tracking-widest uppercase font-black">System Online</span>
          </div>
          <h1 className="font-display-lg text-5xl md:text-6xl text-white uppercase font-black tracking-tighter">Command Center</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-white font-label-caps text-xs tracking-widest uppercase font-bold hover:underline underline-offset-4 decoration-[2px]">Generate Report</button>
          <button className="bg-white text-black border-[3px] border-black px-6 py-3 font-label-caps text-xs tracking-widest uppercase font-black hover:bg-[#FACC15] transition-colors shadow-[4px_4px_0_0_#ffffff]">
            Export Data
          </button>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard title="Total Companies" value="1,248" trend="+12%" icon={Building2} delay={0.1} />
        <KpiCard title="Active Users" value="42,930" trend="+8%" icon={Users} delay={0.15} />
        <KpiCard title="Total Invoices" value="148.2K" trend="+24%" icon={FileText} delay={0.2} />
        <KpiCard title="Revenue Processed" value="$84.2M" trend="+31%" icon={Wallet} delay={0.25} />
        <KpiCard title="Payroll Executed" value="$12.4M" trend="+18%" icon={Banknote} delay={0.3} />
        <KpiCard title="System Load" value="24%" trend="-2%" icon={Activity} delay={0.35} isPositive={false} />
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
            className="bg-[#111] border-[3px] border-white p-6 shadow-[6px_6px_0_0_#ffffff]"
          >
            <div className="flex justify-between items-center mb-8 border-b-[3px] border-white pb-4">
              <h2 className="text-white font-display-md text-2xl uppercase font-black tracking-tight">Revenue Trajectory</h2>
              <button className="bg-[#FACC15] text-black border-[2px] border-white p-2 shadow-[2px_2px_0_0_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"><ChevronRight size={20} strokeWidth={3} /></button>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.1} vertical={false} />
                  <XAxis dataKey="name" axisLine={{ stroke: '#fff', strokeWidth: 2 }} tickLine={{ stroke: '#fff', strokeWidth: 2 }} tick={{ fill: '#fff', fontSize: 12, fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={{ stroke: '#fff', strokeWidth: 2 }} tickLine={{ stroke: '#fff', strokeWidth: 2 }} tick={{ fill: '#fff', fontSize: 12, fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 'bold' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="revenue" name="Revenue (M)" fill="#FACC15" stroke="#fff" strokeWidth={2} />
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
              className="bg-[#111] border-[3px] border-white p-6 shadow-[4px_4px_0_0_#FACC15]"
            >
              <h2 className="text-white font-display-md text-lg uppercase font-black tracking-tight mb-6 border-b-[2px] border-white pb-2">Company Growth</h2>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.1} vertical={false} />
                    <XAxis dataKey="name" axisLine={{ stroke: '#fff', strokeWidth: 2 }} tickLine={false} tick={{ fill: '#fff', fontSize: 10, fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={{ stroke: '#fff', strokeWidth: 2 }} tickLine={false} tick={{ fill: '#fff', fontSize: 10, fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 'bold' }} />
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
              className="bg-[#111] border-[3px] border-white p-6 shadow-[4px_4px_0_0_#FACC15]"
            >
              <h2 className="text-white font-display-md text-lg uppercase font-black tracking-tight mb-6 border-b-[2px] border-white pb-2">Invoice Volume</h2>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={invoiceData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.1} vertical={false} />
                    <XAxis dataKey="name" axisLine={{ stroke: '#fff', strokeWidth: 2 }} tickLine={false} tick={{ fill: '#fff', fontSize: 10, fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={{ stroke: '#fff', strokeWidth: 2 }} tickLine={false} tick={{ fill: '#fff', fontSize: 10, fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 'bold' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="sent" name="Sent" stroke="#fff" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#111', stroke: '#fff' }} />
                    <Line type="monotone" dataKey="paid" name="Paid" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#111', stroke: '#10B981' }} />
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
          className="bg-[#111] border-[3px] border-white p-6 flex flex-col h-full shadow-[6px_6px_0_0_#ffffff]"
        >
          <div className="flex items-center justify-between border-b-[3px] border-white pb-4 mb-6">
            <h2 className="text-white font-display-md text-2xl uppercase font-black tracking-tight">Live Events</h2>
            <div className="w-10 h-10 border-[2px] border-white bg-white flex items-center justify-center text-black shadow-[2px_2px_0_0_#FACC15]">
              <Clock size={20} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2 no-scrollbar">
            {activities.map((activity, i) => {
              const Icon = activity.icon;
              return (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-12 h-12 border-[2px] border-white flex items-center justify-center shrink-0 z-10 ${activity.bg} ${activity.color} shadow-[2px_2px_0_0_#ffffff] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    {i !== activities.length - 1 && (
                      <div className="absolute top-12 bottom-[-24px] w-[3px] bg-white"></div>
                    )}
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-white/60 font-label-caps text-xs uppercase font-bold tracking-widest mb-1">{activity.time}</span>
                    <span className="text-white font-body-md text-sm font-bold leading-snug group-hover:underline decoration-[2px] underline-offset-2">{activity.text}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="w-full mt-6 bg-white border-[3px] border-black py-3 text-sm font-label-caps uppercase font-black tracking-widest text-black hover:bg-[#FACC15] shadow-[4px_4px_0_0_#FACC15] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
            View All Logs
          </button>
        </motion.div>

      </div>
    </div>
  );
}

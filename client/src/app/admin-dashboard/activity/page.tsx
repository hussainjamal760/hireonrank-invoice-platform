"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Activity, FileText, Banknote, Building2, Search, Filter,
  ArrowRight, Download
} from "lucide-react";

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: true
  }).format(date);
}

export default function ActivityLogsPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<"ALL" | "INVOICE" | "PAYROLL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("/api/admin/usage-logs", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        } else {
          const errData = await res.json();
          setError(errData.message || "Failed to load logs");
        }
      } catch (error: any) {
        console.error("Failed to fetch usage logs", error);
        setError(error.message || "Network Error");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [router]);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filterType === "ALL" || log.type === filterType;
    const matchesSearch = log.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            <Activity size={16} strokeWidth={3} className="text-black" />
            <span className="text-black font-label-caps text-xs tracking-widest uppercase font-black">Platform Usage</span>
          </div>
          <h1 className="font-display-lg text-4xl md:text-5xl text-black uppercase font-black tracking-tighter">
            Activity Logs
          </h1>
          <p className="text-black/60 font-body-md mt-2 font-bold max-w-xl">
            Track which companies are actively generating invoices and running payroll across the platform.
          </p>
        </div>
        <button className="bg-black text-white border-[3px] border-black px-6 py-3 font-label-caps text-xs tracking-widest uppercase font-black hover:bg-[#FACC15] hover:text-black transition-colors shadow-[4px_4px_0_0_#000000] flex items-center gap-2">
          <Download size={18} strokeWidth={3} />
          Export CSV
        </button>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border-[3px] border-black p-4 shadow-[4px_4px_0_0_#000000]">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-black/40" />
          </div>
          <input
            type="text"
            placeholder="Search by company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-[2px] border-black py-2 pl-10 pr-4 text-black font-body-md focus:outline-none focus:bg-white focus:shadow-[2px_2px_0_0_#FACC15] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-5 w-5 text-black/60" />
          <div className="flex bg-gray-100 border-[2px] border-black p-1">
            <button 
              onClick={() => setFilterType("ALL")}
              className={`px-4 py-1.5 font-label-caps text-xs uppercase font-bold tracking-wider transition-all ${filterType === "ALL" ? "bg-black text-white" : "text-black/60 hover:text-black"}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterType("INVOICE")}
              className={`px-4 py-1.5 font-label-caps text-xs uppercase font-bold tracking-wider transition-all ${filterType === "INVOICE" ? "bg-black text-white" : "text-black/60 hover:text-black"}`}
            >
              Invoices
            </button>
            <button 
              onClick={() => setFilterType("PAYROLL")}
              className={`px-4 py-1.5 font-label-caps text-xs uppercase font-bold tracking-wider transition-all ${filterType === "PAYROLL" ? "bg-black text-white" : "text-black/60 hover:text-black"}`}
            >
              Payroll
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border-[3px] border-black shadow-[8px_8px_0_0_#FACC15] overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <span className="font-display-lg text-lg uppercase tracking-widest text-black animate-pulse">Loading Logs...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <span className="font-display-lg text-lg uppercase tracking-widest text-red-500">Error: {error}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-[3px] border-black bg-gray-50">
                  <th className="p-4 font-label-caps text-xs uppercase font-black tracking-widest text-black">Type</th>
                  <th className="p-4 font-label-caps text-xs uppercase font-black tracking-widest text-black">Company</th>
                  <th className="p-4 font-label-caps text-xs uppercase font-black tracking-widest text-black">Volume (Count)</th>
                  <th className="p-4 font-label-caps text-xs uppercase font-black tracking-widest text-black">Total Value</th>
                  <th className="p-4 font-label-caps text-xs uppercase font-black tracking-widest text-black">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="border-b-[2px] border-black/10/10 hover:bg-[#FACC15]/10 transition-colors group">
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 border-[2px] border-black shadow-[2px_2px_0_0_#000000] ${log.type === 'INVOICE' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                        {log.type === 'INVOICE' ? <FileText size={14} className="text-black" strokeWidth={3} /> : <Banknote size={14} className="text-black" strokeWidth={3} />}
                        <span className="font-label-caps text-xs uppercase font-bold tracking-widest text-black">{log.type}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black flex items-center justify-center text-white shrink-0 rounded-md">
                          <Building2 size={14} />
                        </div>
                        <span className="font-body-md font-bold text-black group-hover:underline decoration-2 underline-offset-2">{log.company}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-display-md text-xl font-black text-black">
                        {log.count} <span className="text-sm text-black/50 font-body-md font-bold">generated</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-body-md font-black text-black bg-gray-100 px-2 py-1 rounded">
                        {log.value}
                      </span>
                    </td>
                    <td className="p-4 text-black/70 font-body-md font-bold text-sm">
                      {formatDateTime(log.date)}
                    </td>
                  </tr>
                ))}
                
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-black/50 font-label-caps font-bold tracking-widest uppercase">
                      No activity logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

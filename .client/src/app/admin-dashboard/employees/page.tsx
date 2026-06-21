"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Search, Loader2, Building2, Briefcase, Mail } from "lucide-react";
import { TableSkeleton } from "@/components/TableSkeleton";

interface Employee {
  _id: string;
  name: string;
  email: string;
  designation?: string;
  department?: string;
  salary: number;
  status: 'ACTIVE' | 'INACTIVE';
  joinDate: string;
}

interface CompanyWithEmployees {
  company: {
    _id: string;
    name: string;
    status: string;
  };
  employees: Employee[];
}

export default function AdminEmployeesPage() {
  const router = useRouter();
  const [data, setData] = useState<CompanyWithEmployees[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch("/api/admin/employees", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const filteredData = data.map(companyData => {
    return {
      ...companyData,
      employees: companyData.employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyData.company.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    };
  }).filter(companyData => companyData.employees.length > 0 || companyData.company.name.toLowerCase().includes(searchTerm.toLowerCase()));



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
            <Users size={16} className="text-black" />
            <span className="text-black font-label-caps text-xs tracking-widest uppercase font-black">Global Directory</span>
          </div>
          <h1 className="font-display-lg text-5xl md:text-6xl text-black uppercase font-black tracking-tighter">Workforce</h1>
        </div>
        <div className="flex items-center w-full md:w-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-black" />
          </div>
          <input
            type="text"
            placeholder="Search employees or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-[350px] bg-white border-[3px] border-black pl-12 pr-4 py-3 font-body-md text-black placeholder:text-black/40 focus:outline-none focus:ring-0 shadow-[4px_4px_0_0_#000000] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] transition-all"
          />
        </div>
      </motion.div>

      {/* Companies & Employees */}
      <div className="flex flex-col gap-10">
        {loading ? (
          <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000000] overflow-hidden flex flex-col animate-pulse">
            <div className="bg-[#f6f3ec] border-b-[3px] border-black p-4 flex items-center gap-4">
              <div className="w-10 h-10 border-[2px] border-black bg-black/10"></div>
              <div className="w-48 h-6 bg-black/10"></div>
            </div>
            <TableSkeleton columns={5} rows={3} />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white border-[3px] border-black p-12 text-center shadow-[6px_6px_0_0_#000000]">
            <span className="font-label-caps text-lg uppercase tracking-widest text-black/60">
              No employees found matching your search.
            </span>
          </div>
        ) : (
          filteredData.map((companyData, index) => (
            <motion.div 
              key={companyData.company._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000000] overflow-hidden flex flex-col"
            >
              <div className="bg-[#f6f3ec] border-b-[3px] border-black p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-[2px] border-black bg-white flex items-center justify-center font-display-md text-xl">
                    {companyData.company.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-headline-md text-xl uppercase font-black tracking-tighter leading-none mb-1">
                      {companyData.company.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase border-[2px] border-black shadow-[1px_1px_0_0_#000000] ${companyData.company.status === 'BANNED' ? 'bg-red-400' : 'bg-emerald-400'}`}>
                        {companyData.company.status}
                      </span>
                      <span className="font-label-caps text-xs text-black/60 font-bold tracking-widest">
                        {companyData.employees.length} Employee{companyData.employees.length !== 1 && 's'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {companyData.employees.length === 0 ? (
                <div className="p-8 text-center bg-white font-mono text-sm text-black/50 font-bold uppercase tracking-widest">
                  No active employees
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FACC15] border-b-[3px] border-black text-black font-label-caps uppercase text-xs tracking-widest font-black">
                        <th className="p-4 border-r-[3px] border-black">Employee</th>
                        <th className="p-4 border-r-[3px] border-black">Role</th>
                        <th className="p-4 border-r-[3px] border-black">Contact</th>
                        <th className="p-4 border-r-[3px] border-black text-center">Status</th>
                        <th className="p-4 text-center">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-sm font-bold text-black bg-white">
                      {companyData.employees.map((emp, idx) => (
                        <tr key={emp._id} className={`hover:bg-[#FACC15]/10 transition-colors ${idx !== companyData.employees.length - 1 ? 'border-b-[3px] border-black' : ''}`}>
                          <td className="p-4 border-r-[3px] border-black">
                            <span className="text-base">{emp.name}</span>
                          </td>
                          <td className="p-4 border-r-[3px] border-black">
                            <div className="flex flex-col">
                              <span>{emp.designation || 'N/A'}</span>
                              <span className="text-xs text-black/50">{emp.department || 'No Dept'}</span>
                            </div>
                          </td>
                          <td className="p-4 border-r-[3px] border-black">
                            <div className="flex items-center gap-2 text-xs">
                              <Mail size={12} />
                              <span className="truncate">{emp.email}</span>
                            </div>
                          </td>
                          <td className="p-4 border-r-[3px] border-black text-center">
                            <span className={`inline-block px-2 py-0.5 text-xs font-black uppercase border-[2px] border-black ${emp.status === 'ACTIVE' ? 'bg-[#E5F6E5] text-[#008A00]' : 'bg-[#FFE5E5] text-[#D32F2F]'}`}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {new Date(emp.joinDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

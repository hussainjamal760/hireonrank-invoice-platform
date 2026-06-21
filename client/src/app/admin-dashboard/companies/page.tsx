"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Search, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { TableSkeleton } from "@/components/TableSkeleton";
import { exportTableToCSV, exportTableToPDF } from "@/utils/tableExport";

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    companyId: string;
    companyStatus: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    companyId: "",
    companyStatus: "",
    title: "",
    message: ""
  });

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch("/api/admin/companies", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [router]);

  const requestToggleStatus = (id: string, currentStatus: string) => {
    const isBanned = currentStatus === 'BANNED';
    setModalState({
      isOpen: true,
      companyId: id,
      companyStatus: currentStatus,
      title: isBanned ? "Reactivate Company" : "Ban Company",
      message: isBanned 
        ? "Are you sure you want to reactivate this company? Users will be able to log in again."
        : "Are you sure you want to BAN this company? This will prevent all its users from logging in."
    });
  };

  const executeToggleStatus = async () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    const { companyId } = modalState;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/companies/${companyId}/toggle-status`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchCompanies();
      } else {
        alert("Failed to update company status.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while updating status.");
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const data = filteredCompanies.map(c => ({
      "Company Name": c.name,
      "Owner Name": c.ownerName,
      "Owner Email": c.ownerEmail,
      Employees: c.employeeCount,
      Clients: c.clientCount,
      Status: c.status
    }));
    exportTableToCSV(data, "Companies_Registry");
  };

  const handleExportPDF = () => {
    const headers = ["Company Name", "Owner Name", "Owner Email", "Employees", "Clients", "Status"];
    const data = filteredCompanies.map(c => [
      c.name,
      c.ownerName,
      c.ownerEmail,
      c.employeeCount,
      c.clientCount,
      c.status
    ]);
    exportTableToPDF("Companies Registry", headers, data, "Companies_Registry");
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
            <Building2 size={16} className="text-black" />
            <span className="text-black font-label-caps text-xs tracking-widest uppercase font-black">Registry</span>
          </div>
          <h1 className="font-display-lg text-5xl md:text-6xl text-black uppercase font-black tracking-tighter">Companies</h1>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto gap-4 group">
          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              className="bg-white text-black border-[3px] border-black px-4 py-3 font-label-caps text-xs font-black shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
            >
              CSV
            </button>
            <button 
              onClick={handleExportPDF}
              className="bg-[#FACC15] text-black border-[3px] border-black px-4 py-3 font-label-caps text-xs font-black shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
            >
              PDF
            </button>
          </div>
          <div className="relative w-full md:w-[300px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-black" />
            </div>
            <input
              type="text"
              placeholder="Search registry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-[3px] border-black pl-12 pr-4 py-3 font-body-md text-black placeholder:text-black/40 focus:outline-none focus:ring-0 shadow-[4px_4px_0_0_#000000] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Companies Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000000] overflow-hidden"
      >
        <div className="overflow-x-auto custom-scrollbar">
          {loading ? (
            <TableSkeleton columns={6} rows={5} />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FACC15] border-b-[3px] border-black text-black font-label-caps uppercase text-sm tracking-widest font-black">
                  <th className="p-4 border-r-[3px] border-black">Company Name</th>
                  <th className="p-4 border-r-[3px] border-black">Owner</th>
                  <th className="p-4 border-r-[3px] border-black text-center">Employees</th>
                  <th className="p-4 border-r-[3px] border-black text-center">Clients</th>
                  <th className="p-4 border-r-[3px] border-black text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm font-bold text-black">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-black/60 uppercase tracking-widest">
                      No companies found matching your search.
                    </td>
                  </tr>
              ) : (
                filteredCompanies.map((company, idx) => (
                  <tr key={company._id} className={`border-b-[3px] border-black hover:bg-black/5 transition-colors ${idx === filteredCompanies.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="p-4 border-r-[3px] border-black">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border-[2px] border-black bg-white flex items-center justify-center font-display-md text-lg">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-base">{company.name}</span>
                      </div>
                    </td>
                    <td className="p-4 border-r-[3px] border-black">
                      <div className="flex flex-col">
                        <span>{company.ownerName}</span>
                        <span className="text-black/60 text-xs font-normal">{company.ownerEmail}</span>
                      </div>
                    </td>
                    <td className="p-4 border-r-[3px] border-black text-center text-lg">{company.employeeCount}</td>
                    <td className="p-4 border-r-[3px] border-black text-center text-lg">{company.clientCount}</td>
                    <td className="p-4 border-r-[3px] border-black text-center">
                      <span className={`inline-block border-[2px] border-black px-2 py-1 text-xs uppercase shadow-[2px_2px_0_0_#000000] ${company.status === 'BANNED' ? 'bg-red-400' : 'bg-emerald-400'}`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => requestToggleStatus(company._id, company.status)}
                        className={`inline-flex items-center gap-2 border-[2px] border-black px-3 py-1 text-xs uppercase font-black hover:translate-x-[2px] hover:translate-y-[2px] transition-all shadow-[2px_2px_0_0_#000000] hover:shadow-none ${company.status === 'BANNED' ? 'bg-[#FACC15] text-black' : 'bg-black text-white hover:bg-red-500 hover:text-black'}`}
                      >
                        {company.status === 'BANNED' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                        {company.status === 'BANNED' ? 'Reactivate' : 'BAN'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
        </div>
      </motion.div>

      <ConfirmModal 
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={executeToggleStatus}
        onCancel={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        isDestructive={modalState.companyStatus !== 'BANNED'}
        confirmText={modalState.companyStatus === 'BANNED' ? 'Reactivate' : 'Ban Company'}
      />
    </div>
  );
}

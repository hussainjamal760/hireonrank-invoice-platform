"use client";

import { useEffect, useState } from "react";
import { FileText, Calendar, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";

export default function EmployeeDashboard() {
  const [globalData, setGlobalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/employee/me-global", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profile");
        
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
    return <DashboardSkeleton layout="employee" kpiCount={2} />;
  }

  if (error) {
    return (
      <div className="bg-[#FFE5E5] text-[#D32F2F] border-[4px] border-[#D32F2F] p-6 font-bold flex items-center gap-4 shadow-[6px_6px_0_0_#D32F2F]">
        <ShieldAlert size={32} />
        <span className="text-xl">{error}</span>
      </div>
    );
  }

  const employeeName = globalData?.employees?.[0]?.name || "Employee";

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      <div className="border-b-[4px] border-black pb-6">
        <h1 className="font-headline-lg text-5xl md:text-6xl uppercase font-black tracking-tighter">My Dashboard</h1>
        <p className="font-body-md text-black/60 font-bold uppercase mt-2">Welcome back, {employeeName}!</p>
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

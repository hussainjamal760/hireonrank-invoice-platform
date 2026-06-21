"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCircle2, Mail, Phone, Briefcase, Building2, Calendar, ShieldAlert } from "lucide-react";

export default function EmployeeSettings() {
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/employee/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profile");
        
        setEmployee(data.employee);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <span className="font-label-caps tracking-widest uppercase text-xl text-black/40 animate-pulse">
          Loading Profile Details...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFE5E5] text-[#D32F2F] border-[4px] border-[#D32F2F] p-6 font-bold flex items-center gap-4 shadow-[6px_6px_0_0_#D32F2F]">
        <ShieldAlert size={32} />
        <span className="text-xl">{error}</span>
      </div>
    );
  }

  const joinDate = employee?.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-12">
      <div className="border-b-[4px] border-black pb-6">
        <h1 className="font-headline-lg text-5xl md:text-6xl uppercase font-black tracking-tighter">My Profile</h1>
        <p className="font-body-md text-black/60 font-bold uppercase mt-2">View your personal and employment details.</p>
      </div>

      <div className="bg-[#fbfbfa] border-[4px] border-black p-8 shadow-[8px_8px_0_0_#000000]">
        <div className="flex items-center gap-6 mb-8 border-b-[3px] border-black pb-8">
          <div className="w-24 h-24 bg-[#FACC15] border-[4px] border-black flex items-center justify-center shadow-[4px_4px_0_0_#000000] shrink-0">
            <UserCircle2 size={48} strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-display-md text-3xl uppercase font-black">{employee?.name}</h2>
            <div className="inline-block mt-2 bg-black text-[#FACC15] px-3 py-1 font-label-caps text-xs tracking-widest uppercase font-black">
              {employee?.status || 'ACTIVE'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
              <Mail size={16} /> Email Address
            </label>
            <div className="bg-white border-[3px] border-black p-4 font-mono font-bold text-base shadow-[4px_4px_0_0_#000000] opacity-80 cursor-not-allowed">
              {employee?.email}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
              <Phone size={16} /> Phone Number
            </label>
            <div className="bg-white border-[3px] border-black p-4 font-mono font-bold text-base shadow-[4px_4px_0_0_#000000] opacity-80 cursor-not-allowed">
              {employee?.phone || 'Not provided'}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
              <Briefcase size={16} /> Designation
            </label>
            <div className="bg-white border-[3px] border-black p-4 font-mono font-bold text-base shadow-[4px_4px_0_0_#000000] opacity-80 cursor-not-allowed">
              {employee?.designation || 'Not specified'}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
              <Building2 size={16} /> Department
            </label>
            <div className="bg-white border-[3px] border-black p-4 font-mono font-bold text-base shadow-[4px_4px_0_0_#000000] opacity-80 cursor-not-allowed">
              {employee?.department || 'Not specified'}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
              <Calendar size={16} /> Date of Joining
            </label>
            <div className="bg-white border-[3px] border-black p-4 font-mono font-bold text-base shadow-[4px_4px_0_0_#000000] opacity-80 cursor-not-allowed">
              {joinDate}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs font-bold text-black/50 uppercase tracking-wider font-label-caps">
          Note: To update these details, please contact your company administrator or HR department.
        </div>
      </div>
    </div>
  );
}

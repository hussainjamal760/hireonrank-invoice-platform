"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Calendar, Briefcase, Phone, Zap, ArrowRight, ShieldAlert } from "lucide-react";

export default function EmployeeDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite_token");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    occupation: "",
    phoneNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!inviteToken) {
      router.push("/login");
    }
  }, [inviteToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.occupation || !formData.phoneNumber) {
      return setError("All fields are required");
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required. Please login again.");

      // 1. Save Profile Details
      const profileRes = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age),
          occupation: formData.occupation,
          phoneNumber: formData.phoneNumber
        })
      });

      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.message || "Failed to save profile details");

      // 2. Join Company using invite token
      const joinRes = await fetch("/api/companies/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ token: inviteToken })
      });

      const joinData = await joinRes.json();
      if (!joinRes.ok) throw new Error(joinData.message || "Failed to join the company");

      // Replace token with the new one that contains company context
      if (joinData.token) {
        localStorage.setItem("token", joinData.token);
      }

      router.push("/employee-dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred during onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f3ec] p-4 font-mono">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white border-[4px] border-black shadow-[8px_8px_0_0_#000000] p-8"
      >
        <div className="flex items-center gap-3 mb-8 border-b-[4px] border-black pb-6">
          <div className="w-12 h-12 bg-[#FACC15] border-[3px] border-black flex items-center justify-center shadow-[2px_2px_0_0_#000000]">
            <Zap size={24} className="text-black" />
          </div>
          <div>
            <h1 className="font-black text-2xl uppercase tracking-tighter">Voicy Setup</h1>
            <p className="text-black/60 font-bold text-sm uppercase">Complete Your Profile</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center gap-3 text-sm">
            <ShieldAlert size={20} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-black uppercase text-xs">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#f6f3ec] border-[3px] border-black pl-10 pr-4 py-3 font-bold focus:outline-none focus:bg-[#FACC15] transition-colors"
                placeholder="John Doe"
              />
              <User className="absolute left-3 top-3.5 text-black/50" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-black uppercase text-xs">Age</label>
            <div className="relative">
              <input
                type="number"
                required
                min="16"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-[#f6f3ec] border-[3px] border-black pl-10 pr-4 py-3 font-bold focus:outline-none focus:bg-[#FACC15] transition-colors"
                placeholder="25"
              />
              <Calendar className="absolute left-3 top-3.5 text-black/50" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-black uppercase text-xs">Occupation / Designation</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full bg-[#f6f3ec] border-[3px] border-black pl-10 pr-4 py-3 font-bold focus:outline-none focus:bg-[#FACC15] transition-colors"
                placeholder="Software Engineer"
              />
              <Briefcase className="absolute left-3 top-3.5 text-black/50" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-black uppercase text-xs">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full bg-[#f6f3ec] border-[3px] border-black pl-10 pr-4 py-3 font-bold focus:outline-none focus:bg-[#FACC15] transition-colors"
                placeholder="+1 234 567 8900"
              />
              <Phone className="absolute left-3 top-3.5 text-black/50" size={18} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-black text-white border-[3px] border-black py-4 font-black uppercase text-sm tracking-wider hover:bg-[#FACC15] hover:text-black transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
          >
            {loading ? "Processing..." : "Save & Continue"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

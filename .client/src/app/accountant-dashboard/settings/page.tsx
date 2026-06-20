"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Building2, Save, ShieldAlert, CheckCircle2,
  Mail, Phone, Briefcase, Calendar, MapPin, Users,
  Globe, BriefcaseBusiness, Tag, Plus, Trash2, Shield
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "company">("profile");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "", // Readonly
    phoneNumber: "",
    age: "",
    occupation: ""
  });

  // Company State
  const [companyForm, setCompanyForm] = useState({
    name: "",
    address: "",
    country: "",
    companyType: "",
    employeesCount: "",
    departments: [] as string[]
  });
  
  const [newDepartment, setNewDepartment] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Fetch Profile
      const profileRes = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.user) {
          setProfileForm({
            name: profileData.user.name || "",
            email: profileData.user.email || "",
            phoneNumber: profileData.user.phoneNumber || "",
            age: profileData.user.age?.toString() || "",
            occupation: profileData.user.occupation || ""
          });
        }
      }

      // Fetch Company
      const companyRes = await fetch("/api/companies/current", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (companyRes.ok) {
        const companyData = await companyRes.json();
        if (companyData.company) {
          setCompanyForm({
            name: companyData.company.name || "",
            address: companyData.company.address || "",
            country: companyData.company.country || "",
            companyType: companyData.company.companyType || "",
            employeesCount: companyData.company.employeesCount?.toString() || "",
            departments: companyData.company.departments || []
          });
        }
      }
    } catch (err: any) {
      setError("Failed to load settings data.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileForm.name,
          phoneNumber: profileForm.phoneNumber,
          age: parseInt(profileForm.age) || undefined,
          occupation: profileForm.occupation
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/companies/setup", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: companyForm.name,
          address: companyForm.address,
          country: companyForm.country,
          companyType: companyForm.companyType,
          employeesCount: parseInt(companyForm.employeesCount) || undefined,
          departments: companyForm.departments
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update company settings");
      setSuccess("Company settings updated successfully!");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const addDepartment = () => {
    if (newDepartment.trim() && !companyForm.departments.includes(newDepartment.trim())) {
      setCompanyForm(prev => ({
        ...prev,
        departments: [...prev.departments, newDepartment.trim()]
      }));
      setNewDepartment("");
    }
  };

  const removeDepartment = (dept: string) => {
    setCompanyForm(prev => ({
      ...prev,
      departments: prev.departments.filter(d => d !== dept)
    }));
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[4px] border-black pb-6"
      >
        <div>
          <h1 className="font-display-lg text-5xl md:text-6xl text-black uppercase font-black tracking-tighter">Settings</h1>
          <p className="font-body-md text-on-surface-variant font-bold mt-2">Manage your personal profile and company preferences.</p>
        </div>
      </motion.div>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#D32F2F]"
          >
            <ShieldAlert size={24} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-[#E5F6E5] text-[#008A00] border-[3px] border-[#008A00] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#008A00]"
          >
            <CheckCircle2 size={24} className="shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-1/4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 p-4 font-label-caps uppercase font-black tracking-widest text-sm transition-all border-[3px] ${
                activeTab === "profile" 
                  ? "bg-[#FACC15] text-black border-black shadow-[4px_4px_0_0_#000000] translate-x-[-4px] translate-y-[-4px]" 
                  : "bg-white text-black border-transparent hover:border-black/20"
              }`}
            >
              <User size={20} /> Personal Profile
            </button>
            <button
              onClick={() => setActiveTab("company")}
              className={`flex items-center gap-3 p-4 font-label-caps uppercase font-black tracking-widest text-sm transition-all border-[3px] ${
                activeTab === "company" 
                  ? "bg-[#FACC15] text-black border-black shadow-[4px_4px_0_0_#000000] translate-x-[-4px] translate-y-[-4px]" 
                  : "bg-white text-black border-transparent hover:border-black/20"
              }`}
            >
              <Building2 size={20} /> Company Settings
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="w-full lg:w-3/4">
          {loading ? (
            <div className="bg-white border-[3px] border-black p-12 text-center shadow-[6px_6px_0_0_#000000]">
              <span className="font-label-caps text-lg uppercase tracking-widest text-[#735c00] animate-pulse">
                Loading Settings...
              </span>
            </div>
          ) : (
            <div className="bg-white border-[3px] border-black p-6 md:p-8 shadow-[6px_6px_0_0_#000000]">
              
              {/* Profile Settings Form */}
              {activeTab === "profile" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                  <h2 className="font-display-md text-2xl uppercase font-black border-b-[2px] border-black pb-4 flex items-center gap-2">
                    <User size={24} /> Edit Profile
                  </h2>
                  <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
                          <User size={14} /> Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="bg-[#f6f3ec] border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
                          <Mail size={14} /> Email Address (Read-Only)
                        </label>
                        <input
                          type="email"
                          disabled
                          value={profileForm.email}
                          className="bg-black/5 border-[3px] border-black/20 p-3 font-body-md font-bold text-black/50 cursor-not-allowed"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
                          <Phone size={14} /> Phone Number
                        </label>
                        <input
                          type="text"
                          placeholder="+1 (555) 000-0000"
                          value={profileForm.phoneNumber}
                          onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                          className="bg-[#f6f3ec] border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
                          <Calendar size={14} /> Age
                        </label>
                        <input
                          type="number"
                          placeholder="30"
                          value={profileForm.age}
                          onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                          className="bg-[#f6f3ec] border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
                          <Briefcase size={14} /> Occupation
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Accountant"
                          value={profileForm.occupation}
                          onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                          className="bg-[#f6f3ec] border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] font-bold"
                        />
                      </div>
                    </div>
                    <div className="border-t-[3px] border-black pt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-black text-white px-8 py-3.5 font-label-caps uppercase font-black tracking-widest text-xs flex items-center gap-2 hover:bg-[#FACC15] hover:text-black border-[3px] border-black transition-colors shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? "Saving..." : <><Save size={16} /> Save Profile</>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Company Settings Form */}
              {activeTab === "company" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                  <h2 className="font-display-md text-2xl uppercase font-black border-b-[2px] border-black pb-4 flex items-center gap-2">
                    <Building2 size={24} /> Organization Settings
                  </h2>
                  <form onSubmit={handleCompanySubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
                          <BriefcaseBusiness size={14} /> Legal Company Name
                        </label>
                        <input
                          type="text"
                          required
                          value={companyForm.name}
                          onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                          className="bg-[#f6f3ec] border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] font-bold text-lg"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
                          <MapPin size={14} /> Registered Address
                        </label>
                        <input
                          type="text"
                          value={companyForm.address}
                          onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                          className="bg-[#f6f3ec] border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] font-bold"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
                          <Globe size={14} /> Country of Operations
                        </label>
                        <input
                          type="text"
                          value={companyForm.country}
                          onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })}
                          className="bg-[#f6f3ec] border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] font-bold"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
                          <Tag size={14} /> Business Industry / Type
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Technology, Retail"
                          value={companyForm.companyType}
                          onChange={(e) => setCompanyForm({ ...companyForm, companyType: e.target.value })}
                          className="bg-[#f6f3ec] border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] font-bold"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
                          <Users size={14} /> Total Employee Count
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 50"
                          value={companyForm.employeesCount}
                          onChange={(e) => setCompanyForm({ ...companyForm, employeesCount: e.target.value })}
                          className="bg-[#f6f3ec] border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] font-bold"
                        />
                      </div>
                    </div>

                    <div className="border-[3px] border-black p-6 bg-[#fbfbfa] mt-4 shadow-[4px_4px_0_0_#000000]">
                      <h3 className="font-label-caps uppercase font-black text-sm mb-4 border-b-[2px] border-black pb-2 flex items-center gap-2">
                        <Shield size={16} /> Internal Departments
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {companyForm.departments.length === 0 ? (
                          <p className="text-sm font-mono font-bold text-black/50">No departments configured yet.</p>
                        ) : (
                          companyForm.departments.map((dept, idx) => (
                            <div key={idx} className="bg-white border-[2px] border-black px-3 py-1 flex items-center gap-2 shadow-[2px_2px_0_0_#000000] font-label-caps font-bold text-xs">
                              {dept}
                              <button 
                                type="button" 
                                onClick={() => removeDepartment(dept)}
                                className="text-[#D32F2F] hover:text-red-700 hover:scale-110 transition-transform"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="New Department Name"
                          value={newDepartment}
                          onChange={(e) => setNewDepartment(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDepartment())}
                          className="flex-1 bg-white border-[2px] border-black p-2 font-mono text-sm focus:outline-none focus:bg-[#FACC15]"
                        />
                        <button
                          type="button"
                          onClick={addDepartment}
                          className="bg-black text-white px-4 font-label-caps text-xs font-black uppercase hover:bg-[#FACC15] hover:text-black border-[2px] border-black transition-colors flex items-center gap-1 shadow-[2px_2px_0_0_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        >
                          <Plus size={14} /> Add
                        </button>
                      </div>
                    </div>

                    <div className="border-t-[3px] border-black pt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-black text-white px-8 py-3.5 font-label-caps uppercase font-black tracking-widest text-xs flex items-center gap-2 hover:bg-[#FACC15] hover:text-black border-[3px] border-black transition-colors shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? "Saving..." : <><Save size={16} /> Save Company</>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

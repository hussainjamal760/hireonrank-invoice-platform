"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, ArrowRight, ShieldAlert, CheckCircle2, MapPin, Upload } from "lucide-react";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("../../components/Map"), { ssr: false });

export default function SetupCompany() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [country, setCountry] = useState("");
  const [employeesCount, setEmployeesCount] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [logo, setLogo] = useState<string>("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const searchStr = `${address} ${country}`.trim();
      if (searchStr.length > 3) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchStr)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.length > 0) {
              setLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
            }
          })
          .catch((err) => console.error(err));
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [address, country]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleApiResponse = async (res: Response) => {
    const contentType = res.headers.get("content-type");
    let data: any = {};
    
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(text || `Server returned status ${res.status}`);
    }

    if (!res.ok) {
      throw new Error(data.message || `Server returned error ${res.status}`);
    }

    return data;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Logo size must be less than 2MB");
        return;
      }
      setError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !companyType || !employeesCount) {
      return setError("Please fill all the details");
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication missing");

      const res = await fetch(`/api/companies/setup`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name, 
          address, 
          location, 
          companyType, 
          country,
          employeesCount,
          logo
        }),
      });

      await handleApiResponse(res);
      setSuccessMsg("Company setup successful!");
      
      setTimeout(() => {
        router.push("/admin-dashboard");
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || "Failed to setup company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden p-4 lg:p-8">
      <div className="absolute inset-0 pattern-grid opacity-10 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl bg-surface-container-low border-[4px] border-on-background neo-brutal-shadow-lg z-20 flex flex-col lg:flex-row overflow-hidden"
      >
        <div className="w-full lg:w-1/2 p-8 lg:p-12 border-b-[4px] lg:border-b-0 lg:border-r-[4px] border-on-background bg-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary-container border-[3px] border-on-background flex items-center justify-center neo-brutal-shadow">
              <Building2 size={32} className="text-on-background" />
            </div>
            <div>
              <h1 className="font-headline-lg text-3xl uppercase font-black leading-tight">Setup Company</h1>
              <p className="font-body-md text-on-surface-variant font-bold">Complete your profile to proceed</p>
            </div>
          </div>

          {error && (
            <div className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center gap-3 mb-6">
              <ShieldAlert size={20} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-[#E5F6E5] text-[#008A00] border-[3px] border-[#008A00] p-4 font-bold flex items-center gap-3 mb-6">
              <CheckCircle2 size={20} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-on-background">Company Logo</label>
              <div className="flex items-center gap-4">
                {logo ? (
                  <div className="w-16 h-16 border-[3px] border-on-background bg-background overflow-hidden flex-shrink-0">
                    <img src={logo} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 border-[3px] border-on-background bg-surface-container flex items-center justify-center flex-shrink-0">
                    <Building2 size={24} className="text-on-surface-variant opacity-50" />
                  </div>
                )}
                <label className="cursor-pointer bg-primary-container border-[3px] border-on-background px-4 py-2 font-label-caps font-bold text-sm uppercase hover:neo-brutal-shadow-active transition-all flex items-center gap-2">
                  <Upload size={16} />
                  Choose File
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-on-background">Company Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-background border-[3px] border-on-background px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-on-background">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full bg-background border-[3px] border-on-background px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="India">India</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-on-background">Company Address</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full bg-background border-[3px] border-on-background px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-on-background">Type</label>
                <select
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value)}
                  required
                  className="w-full bg-background border-[3px] border-on-background px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select</option>
                  <option value="LLC">LLC</option>
                  <option value="Corporation">Corporation</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-on-background">Employees</label>
                <select
                  value={employeesCount}
                  onChange={(e) => setEmployeesCount(e.target.value)}
                  required
                  className="w-full bg-background border-[3px] border-on-background px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-on-background text-white py-5 font-label-caps text-lg border-[4px] border-on-background hover:bg-white hover:text-on-background hover:neo-brutal-shadow-active transition-all uppercase font-black flex items-center justify-center gap-3 mt-6"
            >
              {loading ? "Saving..." : "Save & Continue"} <ArrowRight size={24} />
            </button>
          </form>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col relative min-h-[400px]">
         
          <div className="w-full h-full border-t-[4px] lg:border-t-0 border-on-background relative z-0">
            <DynamicMap location={location} setLocation={setLocation} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

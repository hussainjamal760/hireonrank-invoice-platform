"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Zap, LogOut, ShieldAlert, Image as ImageIcon } from "lucide-react";

export default function CreateCompany() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const handleApiResponse = async (res: Response) => {
    const contentType = res.headers.get("content-type");
    let data: any = {};
    
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      if (res.status === 502 || res.status === 504 || text.includes("Internal Server Error") || text.includes("Bad Gateway")) {
        throw new Error("Could not connect to the backend server. Please verify the backend is running on port 5000.");
      }
      throw new Error(text || `Server returned status ${res.status}`);
    }

    if (!res.ok) {
      throw new Error(data.message || `Server returned error ${res.status}`);
    }

    return data;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return setError("Image size must be less than 5MB");
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await handleApiResponse(res);
      setLogo(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload logo image");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return setError("Company name is required");
    }
    if (!token) {
      return setError("Authentication session expired. Please log in again.");
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, logo }),
      });

      const data = await handleApiResponse(res);
      
      // Update JWT token with new company context
      localStorage.setItem("token", data.token);
      
      // Redirect to dashboard
      router.push("/admin-dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#fcf9f2] flex items-center justify-center">
        <span className="font-label-caps text-lg uppercase tracking-widest text-[#735c00] animate-pulse">
          Loading Session...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcf9f2] px-margin-mobile md:px-margin-desktop py-12 relative overflow-hidden pattern-grid">
      {/* Background decoration */}
      <div className="absolute top-12 right-12 opacity-10 pointer-events-none select-none">
        <Building2 size={120} className="text-[#1c1c18]" />
      </div>

      <div className="w-full max-w-md flex flex-col gap-8 z-10">
        {/* Logo and title */}
        <div className="flex items-center justify-between border-b-[3px] border-[#1c1c18] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#facc15] border-[3px] border-[#1c1c18] flex items-center justify-center neo-brutal-shadow">
              <Zap size={20} className="text-[#1c1c18]" />
            </div>
            <span className="font-headline-md text-xl font-black uppercase italic">Voicy</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-label-caps uppercase text-xs font-bold text-red-600 hover:text-red-500 cursor-pointer bg-transparent border-0"
          >
            <LogOut size={16} /> Exit
          </button>
        </div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white border-[4px] border-[#1c1c18] p-8 neo-brutal-shadow-lg"
        >
          <div className="mb-8">
            <h1 className="font-display-lg text-3xl uppercase font-black leading-tight mb-2">
              Setup Company
            </h1>
            <p className="font-body-md text-[#4d4632] font-bold border-l-[3px] border-[#facc15] pl-4">
              Before accessing the admin terminal, you must create a company space.
            </p>
          </div>

          {error && (
            <div className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center gap-3 mb-6">
              <ShieldAlert size={20} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateCompany} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-[#1c1c18] text-sm font-bold">
                Company Name
              </label>
              <input
                type="text"
                placeholder="Acme Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#f6f3ec] text-[#1c1c18] border-[3px] border-[#1c1c18] px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-[#facc15] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-[#1c1c18] text-sm font-bold">
                Company Logo (Cloudinary Upload)
              </label>
              {logo ? (
                <div className="flex items-center gap-4 bg-[#f6f3ec] border-[3px] border-[#1c1c18] p-3">
                  <img src={logo} alt="Preview" className="w-12 h-12 border-[2px] border-[#1c1c18] object-cover bg-white" />
                  <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-mono">
                    {logo.substring(0, 30)}...
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogo("")}
                    className="font-label-caps uppercase text-xs font-bold text-red-600 hover:text-red-500 bg-transparent border-0 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="relative border-[3px] border-dashed border-[#1c1c18] bg-[#f6f3ec] p-6 text-center hover:bg-[#facc15]/10 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="text-[#1c1c18]/50 group-hover:scale-110 transition-transform" size={32} />
                    <span className="font-label-caps uppercase text-xs font-bold text-[#1c1c18]">
                      {uploading ? "Uploading logo..." : "Upload Logo Image"}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      PNG, JPG up to 5MB
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-[#1c1c18] text-[#facc15] py-4 font-label-caps text-md border-[4px] border-[#1c1c18] neo-brutal-shadow hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase font-black flex items-center justify-center gap-3 mt-4"
            >
              {loading ? "Creating Space..." : "Initialize Company"} <Building2 size={20} />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

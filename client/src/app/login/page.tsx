"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, ArrowRight, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

export default function Login() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [multiCompanyData, setMultiCompanyData] = useState<any[] | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const moveX = (e.clientX - window.innerWidth / 2) / 40;
        const moveY = (e.clientY - window.innerHeight / 2) / 40;
        const elements = containerRef.current.querySelectorAll('.parallax-element');
        elements.forEach((el, index) => {
          const speed = (index + 1) * 0.5;
          (el as HTMLElement).style.transform = `translate(${moveX * speed}px, ${moveY * speed}px) rotate(${(el as HTMLElement).dataset.rot}deg)`;
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const [inviteToken, setInviteToken] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("invite_token");
    if (token) {
      setInviteToken(token);
      fetch(`/api/companies/invite-info/${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && !data.userExists) {
            router.push(`/signup?invite_token=${token}&reason=account_required`);
          }
        })
        .catch(err => console.error("Error fetching invite info:", err));
    }
  }, [router]);

  // Google OAuth Initialization (Safe Single-Init Guard)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlInviteToken = urlParams.get("invite_token");
        if (urlInviteToken) {
          router.push(`/employee-details?invite_token=${urlInviteToken}`);
          return;
        }

        try {
          const payload = token.split('.')[1];
          const decoded = JSON.parse(atob(payload));
          if (decoded.role === 'EMPLOYEE') {
            router.push('/employee-dashboard');
          } else if (decoded.role === 'ADMIN') {
            router.push('/admin-dashboard');
          } else {
            router.push('/accountant-dashboard');
          }
        } catch {
          router.push('/accountant-dashboard');
        }
        return;
      }
    }

    const loadGoogleScript = () => {
      // Check if already loaded and initialized
      if ((window as any).googleAuthInitialized) return;

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google && !(window as any).googleAuthInitialized) {
          try {
            (window as any).google.accounts.id.initialize({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id",
              callback: handleGoogleLoginResponse,
            });
            (window as any).googleAuthInitialized = true;
            (window as any).google.accounts.id.renderButton(
              document.getElementById("google-signin-btn"),
              { theme: "outline", size: "large", width: 400 }
            );
          } catch (e) {
            console.warn("Google initialization skipped/already initialized", e);
          }
        }
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
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

  const handleGoogleLoginResponse = async (response: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential }),
      });

      const data = await handleApiResponse(res);

      if (data.state === "BANNED_STATE") {
        localStorage.removeItem("token");
        setError(data.message);
        return;
      }

      localStorage.setItem("token", data.token);

      if (data.state === "MULTIPLE_COMPANIES_STATE") {
        setMultiCompanyData(data.companies);
        return;
      }

      if (inviteToken) {
        router.push(`/employee-details?invite_token=${inviteToken}`);
      } else if (data.state === "NO_COMPANY_STATE") {
        router.push("/create-company");
      } else {
        if (data.role === 'EMPLOYEE') {
          router.push("/employee-dashboard");
        } else if (data.role === 'ADMIN') {
          router.push("/admin-dashboard");
        } else {
          router.push("/accountant-dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = async (companyId: string) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/companies/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ companyId })
      });
      const data = await handleApiResponse(res);
      localStorage.setItem("token", data.token);

      if (inviteToken) {
        router.push(`/employee-details?invite_token=${inviteToken}`);
      } else {
        if (data.role === 'EMPLOYEE') {
          router.push("/employee-dashboard");
        } else if (data.role === 'ADMIN') {
          router.push("/admin-dashboard");
        } else {
          router.push("/accountant-dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to select company");
    } finally {
      setLoading(false);
    }
  };

  // Submit email to send OTP
  const handleSendOtp = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!email) return setError("Please enter your email first");

    setOtpSending(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await handleApiResponse(res);
      setSuccessMsg("Verification code sent to your email!");
    } catch (err: any) {
      setError(err.message || "Something went wrong sending verification code.");
    } finally {
      setOtpSending(false);
    }
  };

  // Submit OTP to verify and login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email");
    if (!otp) return setError("Please enter the verification code");

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await handleApiResponse(res);

      if (data.state === "BANNED_STATE") {
        localStorage.removeItem("token");
        setError(data.message);
        return;
      }

      // Save token and navigate
      localStorage.setItem("token", data.token);

      if (data.state === "MULTIPLE_COMPANIES_STATE") {
        setMultiCompanyData(data.companies);
        return;
      }

      if (data.state === "ADMIN_BYPASS") {
        router.push("/admin-dashboard");
      } else if (inviteToken) {
        router.push(`/employee-details?invite_token=${inviteToken}`);
      } else if (data.state === "NO_COMPANY_STATE") {
        router.push("/create-company");
      } else {
        if (data.role === 'EMPLOYEE') {
          router.push("/employee-dashboard");
        } else if (data.role === 'ADMIN') {
          router.push("/admin-dashboard");
        } else {
          router.push("/accountant-dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background overflow-hidden">
      
      {/* Left Form Area */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-8 lg:p-16 z-20 bg-white border-b-[4px] lg:border-b-0 lg:border-r-[4px] border-on-background relative">
        <div className="w-full max-w-md flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-4 mb-12">
              <Link href="/" className="w-14 h-14 bg-primary-container border-[3px] border-on-background flex items-center justify-center hover:bg-white transition-colors cursor-pointer neo-brutal-shadow">
                <Zap size={28} className="text-on-background" />
              </Link>
              <span className="font-headline-md text-2xl font-black uppercase italic">Voicy</span>
            </div>

            <h1 className="font-headline-lg text-4xl md:text-5xl uppercase font-black leading-none mb-4">Back to work.</h1>
            <p className="font-body-md text-on-surface-variant font-bold border-l-[3px] border-primary pl-4">
              Access your dashboard to send invoices and process payroll.
            </p>
          </motion.div>

          {error && (
            <div className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center gap-3">
              <ShieldAlert size={20} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-[#E5F6E5] text-[#008A00] border-[3px] border-[#008A00] p-4 font-bold flex items-center gap-3">
              <CheckCircle2 size={20} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}



          {multiCompanyData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-6"
            >
              <h2 className="font-headline-md text-2xl font-black uppercase text-on-background border-b-[3px] border-on-background pb-2">Select Your Company</h2>
              <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {multiCompanyData.map((company: any) => (
                  <button
                    key={company.id}
                    onClick={() => handleCompanySelect(company.id)}
                    disabled={loading}
                    className="flex items-center gap-4 p-4 border-[3px] border-on-background bg-surface-container-low hover:bg-[#FACC15] transition-all hover:-translate-y-1 hover:translate-x-1 shadow-[4px_4px_0_0_#000000] text-left"
                  >
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-12 h-12 object-cover border-[3px] border-on-background shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-black text-[#FACC15] flex items-center justify-center font-black text-xl border-[3px] border-on-background shrink-0">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="font-black text-lg text-on-background uppercase truncate w-full">{company.name}</span>
                      <span className="text-xs font-label-caps font-bold uppercase text-on-surface-variant flex items-center gap-1">
                        <CheckCircle2 size={12} /> Role: {company.role}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6" 
            onSubmit={handleLoginSubmit}
          >
            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-on-background">Work Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-container-low text-on-background border-[3px] border-on-background px-4 py-4 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-label-caps uppercase text-on-background">Verification Code (OTP)</label>
                <button 
                  type="button" 
                  onClick={handleSendOtp}
                  disabled={otpSending}
                  className="font-label-caps uppercase text-primary hover:underline underline-offset-4 cursor-pointer font-bold"
                >
                  {otpSending ? "Sending..." : "Get Code?"}
                </button>
              </div>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full bg-surface-container-low text-on-background border-[3px] border-on-background px-4 py-4 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-on-background text-primary-container py-5 font-label-caps text-lg border-[4px] border-on-background neo-brutal-shadow-lg hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase font-black flex items-center justify-center gap-3 mt-4"
            >
              {loading ? "Entering..." : "Enter Terminal"} <ArrowRight size={24} />
            </button>
          </motion.form>
          )}

          {/* Social Sign-in section */}
          <div className="mt-2 flex flex-col items-center gap-4">
            <div id="google-signin-btn" className="w-full flex justify-center"></div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 pt-8 border-t-[3px] border-on-background"
          >
            <p className="font-body-md font-bold text-center">
              No account yet? <Link href={inviteToken ? `/signup?invite_token=${inviteToken}` : "/signup"} className="font-label-caps uppercase bg-primary-container border-[2px] border-on-background px-2 py-1 ml-2 hover:bg-white transition-colors">Sign up fast</Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Showcase Area */}
      <div 
        ref={containerRef}
        className="hidden lg:flex w-7/12 bg-primary-container relative items-center justify-center overflow-hidden pattern-grid"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-container via-transparent to-transparent opacity-50 z-10 pointer-events-none"></div>

        {/* Big Background Typography */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none w-full text-center mix-blend-overlay">
          <h2 className="font-display-lg text-[18vw] leading-none uppercase font-black italic whitespace-nowrap">VOICY</h2>
          <h2 className="font-display-lg text-[18vw] leading-none uppercase font-black italic whitespace-nowrap -mt-16 text-outline">VOICY</h2>
        </div>

        {/* Animated Invoice Cards */}
        <div className="relative w-full h-full max-w-2xl mx-auto z-20 flex items-center justify-center pointer-events-none">
          
          {/* Main Hero Invoice */}
          <motion.div 
            initial={{ y: 100, opacity: 0, rotate: -5 }}
            animate={{ y: 0, opacity: 1, rotate: -2 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            className="parallax-element absolute bg-white border-[4px] border-on-background w-[400px] neo-brutal-shadow-lg"
            data-rot="-2"
          >
            <div className="border-b-[3px] border-on-background bg-surface-container-highest p-3 flex justify-between items-center">
              <span className="font-label-caps uppercase flex items-center gap-2"><FileText size={16}/> INVOICE #9092</span>
              <span className="bg-[#E5F6E5] text-[#008A00] border-[2px] border-on-background px-2 py-1 font-label-caps text-[10px] flex items-center gap-1">
                <CheckCircle2 size={12}/> PAID
              </span>
            </div>
            <div className="p-6 pb-8">
              <div className="flex justify-between items-end mb-8 border-b-[3px] border-on-background pb-4">
                <div>
                  <h3 className="font-headline-md text-2xl uppercase font-black">Design Sprint</h3>
                  <p className="font-data-md text-on-surface-variant">Due: 12 Aug 2026</p>
                </div>
                <div className="w-12 h-12 bg-on-background rounded-full"></div>
              </div>
              <div className="space-y-4 font-data-md">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Wireframes</span>
                  <span>Rs 45,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Prototyping</span>
                  <span>Rs 60,000</span>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t-[3px] border-on-background border-dashed flex justify-between items-center">
                <span className="font-headline-md uppercase font-black text-xl">Total</span>
                <span className="font-headline-lg font-black text-primary">Rs 105,000</span>
              </div>
            </div>
          </motion.div>

          {/* Floating Salary Slip */}
          <motion.div 
            initial={{ x: 200, opacity: 0, rotate: 10 }}
            animate={{ x: 120, y: 150, opacity: 1, rotate: 8 }}
            transition={{ type: "spring", stiffness: 80, delay: 0.4 }}
            className="parallax-element absolute bg-on-background text-white border-[4px] border-white w-[300px] shadow-[8px_8px_0_0_#ffffff]"
            data-rot="8"
          >
            <div className="border-b-[3px] border-white p-3">
              <span className="font-label-caps uppercase text-primary-container">Salary Slip · Jun</span>
            </div>
            <div className="p-5">
              <div className="font-data-md mb-4 space-y-2">
                <div className="flex justify-between text-white">
                  <span>Base</span><span>Rs 145,000</span>
                </div>
                <div className="flex justify-between text-[#ff5555]">
                  <span>Tax</span><span>- Rs 14,200</span>
                </div>
              </div>
              <div className="bg-primary-container text-on-background border-[2px] border-white p-2 text-center font-headline-md uppercase font-black">
                NET: Rs 130,800
              </div>
            </div>
          </motion.div>

          {/* Floating Status Toast */}
          <motion.div 
            initial={{ x: -200, opacity: 0, rotate: -15 }}
            animate={{ x: -150, y: -120, opacity: 1, rotate: -10 }}
            transition={{ type: "spring", stiffness: 90, delay: 0.6 }}
            className="parallax-element absolute bg-white border-[4px] border-on-background p-4 neo-brutal-shadow flex items-center gap-4"
            data-rot="-10"
          >
            <div className="w-12 h-12 bg-primary-container border-[3px] border-on-background flex items-center justify-center animate-bounce">
              <Zap size={24} className="text-on-background" />
            </div>
            <div>
              <p className="font-headline-md text-lg uppercase font-black leading-none">Instant Transfer</p>
              <p className="font-data-md text-on-surface-variant">Cleared successfully</p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

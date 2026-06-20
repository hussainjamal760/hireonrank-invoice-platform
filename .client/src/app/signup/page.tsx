"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, ArrowRight, TrendingUp, Users, DollarSign, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function Signup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [devOtp, setDevOtp] = useState("");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const moveX = (e.clientX - window.innerWidth / 2) / 50;
        const moveY = (e.clientY - window.innerHeight / 2) / 50;
        const elements = containerRef.current.querySelectorAll('.parallax-element');
        elements.forEach((el, index) => {
          const speed = (index + 1) * 0.4;
          (el as HTMLElement).style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
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
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      router.push('/admin-dashboard');
      return;
    }

    const loadGoogleScript = () => {
      if ((window as any).googleAuthInitialized) return;

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google && !(window as any).googleAuthInitialized) {
          try {
            (window as any).google.accounts.id.initialize({
              client_id: "your-google-client-id",
              callback: handleGoogleLoginResponse,
            });
            (window as any).googleAuthInitialized = true;
            (window as any).google.accounts.id.renderButton(
              document.getElementById("google-signup-btn"),
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
      localStorage.setItem("token", data.token);
      if (inviteToken) {
        router.push(`/create-company?invite_token=${inviteToken}`);
      } else {
        router.push("/setup-company");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!email) return setError("Please enter your work email first");

    setOtpSending(true);
    setError("");
    setSuccessMsg("");
    setDevOtp("");

    try {
      const res = await fetch(`/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await handleApiResponse(res);
      setSuccessMsg("Verification code sent to your email!");
      if (data.otp) {
        setDevOtp(data.otp);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong sending verification code.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) return setError("Please enter your name");
    if (!email) return setError("Please enter your email");
    if (!otp) return setError("Please enter the verification code");
    if (!agree) return setError("You must agree to the Terms and Privacy Policy");

    setLoading(true);
    setError("");

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const res = await fetch(`/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, name: fullName }),
      });

      const data = await handleApiResponse(res);
      localStorage.setItem("token", data.token);
      if (inviteToken) {
        router.push(`/create-company?invite_token=${inviteToken}`);
      } else {
        router.push("/setup-company");
      }
    } catch (err: any) {
      setError(err.message || "Signup verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-background overflow-hidden">
      
      <div className="w-full lg:w-5/12 flex items-center justify-center p-8 lg:p-12 z-20 bg-surface-container-low border-b-[4px] lg:border-b-0 lg:border-l-[4px] border-on-background relative overflow-y-auto">
        <div className="w-full max-w-md flex flex-col gap-8 py-8">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-between items-start"
          >
            <div>
              <h1 className="font-headline-lg text-4xl uppercase font-black leading-tight mb-2">Join Voicy.</h1>
              <p className="font-body-md text-on-surface-variant font-bold border-l-[3px] border-primary pl-4">
                Deploy the protocol. Secure your integration slot today.
              </p>
            </div>
            <Link href="/" className="w-12 h-12 flex-shrink-0 bg-white border-[3px] border-on-background flex items-center justify-center hover:bg-primary-container transition-colors cursor-pointer neo-brutal-shadow">
              <Zap size={24} className="text-on-background" />
            </Link>
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

          {devOtp && (
            <div className="bg-primary-container border-[3px] border-on-background p-4 neo-brutal-shadow">
              <p className="font-bold text-sm uppercase">🔧 Development Mode Sandbox OTP</p>
              <p className="font-display-lg text-3xl font-black mt-2 tracking-widest text-center">{devOtp}</p>
            </div>
          )}

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5" 
            onSubmit={handleSignupSubmit}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-on-background">First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full bg-white border-[3px] border-on-background px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-on-background">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full bg-white border-[3px] border-on-background px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-on-background">Work Email</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border-[3px] border-on-background px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all" 
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
                className="w-full bg-white border-[3px] border-on-background px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all" 
              />
            </div>

            <div className="flex items-start gap-3 mt-2">
              <div className="relative flex items-center justify-center mt-1">
                <input 
                  type="checkbox" 
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  required
                  className="peer appearance-none w-5 h-5 border-[2px] border-on-background bg-white checked:bg-on-background checked:border-[3px] cursor-pointer transition-all" 
                />
                <svg className="absolute w-3 h-3 pointer-events-none opacity-0 peer-checked:opacity-100 text-white font-bold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <label className="font-body-md text-sm font-bold text-on-surface-variant cursor-pointer">
                I agree to the <Link href="#" className="text-on-background underline decoration-2 underline-offset-2">Terms</Link> and <Link href="#" className="text-on-background underline decoration-2 underline-offset-2">Privacy Policy</Link>.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-container text-on-background py-5 font-label-caps text-lg border-[4px] border-on-background neo-brutal-shadow hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase font-black flex items-center justify-center gap-3 mt-4"
            >
              {loading ? "Initializing..." : "Initialize Account"} <ArrowRight size={24} />
            </button>
          </motion.form>

          <div className="mt-2 flex flex-col items-center gap-4">
            <div id="google-signup-btn" className="w-full flex justify-center"></div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-2 text-center"
          >
            <p className="font-body-md font-bold">
              Already using Voicy? <Link href={inviteToken ? `/login?invite_token=${inviteToken}` : "/login"} className="font-label-caps uppercase text-primary hover:underline underline-offset-4 ml-1">Log in here</Link>
            </p>
          </motion.div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="hidden lg:flex w-7/12 bg-on-background text-white relative flex-col justify-center overflow-hidden"
      >
        <div className="absolute inset-0 pattern-grid opacity-10 pointer-events-none"></div>

        <div className="absolute top-12 left-12 z-20">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-block bg-primary-container text-on-background border-[3px] border-primary-container px-4 py-2 font-label-caps uppercase font-black"
          >
            Terminal Output
          </motion.div>
        </div>

        <div className="w-full max-w-2xl mx-auto z-20 px-12">
          <motion.h2 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-headline-lg text-6xl uppercase font-black mb-12 text-primary-container leading-none"
          >
            Scale without <br/>
            <span className="text-white border-b-[8px] border-primary-container">friction.</span>
          </motion.h2>

          <div className="grid grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="parallax-element bg-transparent border-[3px] border-white p-6 neo-brutal-shadow-lg shadow-[8px_8px_0_0_#FACC15]"
            >
              <div className="flex justify-between items-start mb-6">
                <DollarSign size={32} className="text-primary-container" />
                <TrendingUp size={24} className="text-primary-container" />
              </div>
              <span className="font-display-lg text-4xl block mb-2 font-black">Rs 4.2B</span>
              <span className="font-label-caps uppercase text-white opacity-80">Volume Processed</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="parallax-element bg-white text-on-background border-[3px] border-white p-6 neo-brutal-shadow-lg shadow-[8px_8px_0_0_#FACC15]"
            >
              <div className="flex justify-between items-start mb-6">
                <Users size={32} />
                <div className="w-3 h-3 bg-[#008A00] rounded-full animate-pulse border-[2px] border-on-background"></div>
              </div>
              <span className="font-display-lg text-4xl block mb-2 font-black">12,804</span>
              <span className="font-label-caps uppercase opacity-80">Active Network Nodes</span>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="parallax-element absolute bottom-12 right-12 text-primary font-data-md opacity-50 space-y-2 select-none"
        >
          <p>{`> `} INIT_PROTOCOL: INVOICE_ENGINE_V7</p>
          <p>{`> `} CONNECTING_NODES... [OK]</p>
          <p>{`> `} VERIFYING_LEDGER... [SECURE]</p>
          <p className="animate-pulse">{`> `} AWAITING_USER_INPUT_</p>
        </motion.div>

      </div>
    </div>
  );
}

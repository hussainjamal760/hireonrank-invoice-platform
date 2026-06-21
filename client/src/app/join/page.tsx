"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, ArrowRight, ShieldAlert, User, Calendar, Briefcase, Phone, LogIn, UserPlus, LogOut, Building2, AlertTriangle } from "lucide-react";

interface InviteInfo {
  email: string;
  userExists: boolean;
  company: {
    name: string;
    logo?: string;
    departments: string[];
  };
}

type PageState = 'loading' | 'error' | 'needs_signup' | 'needs_login' | 'email_mismatch' | 'form';

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [pageState, setPageState] = useState<PageState>('loading');
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    occupation: "",
    phoneNumber: "",
    department: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!token) {
      setPageState('error');
      setErrorMessage('No invitation token provided. Please use the link from your invitation email.');
      return;
    }

    const checkInvitation = async () => {
      try {
        const res = await fetch(`/api/companies/invite-info/${token}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setPageState('error');
          setErrorMessage(data.message || 'This invitation link is invalid or has expired.');
          return;
        }

        setInviteInfo(data);

        if (!data.userExists) {
          setPageState('needs_signup');
          return;
        }

        const authToken = localStorage.getItem('token');
        if (!authToken) {
          setPageState('needs_login');
          return;
        }

        try {
          const payload = JSON.parse(atob(authToken.split('.')[1]));
          const currentEmail = payload.email;
          setLoggedInEmail(currentEmail);

          if (currentEmail !== data.email) {
            setPageState('email_mismatch');
            return;
          }

          setFormData(prev => ({ ...prev, name: payload.name || '' }));
          setPageState('form');
        } catch {
          localStorage.removeItem('token');
          setPageState('needs_login');
        }
      } catch (err) {
        setPageState('error');
        setErrorMessage('Failed to verify invitation. Please check your connection and try again.');
      }
    };

    checkInvitation();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setPageState('needs_login');
    setLoggedInEmail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, age, occupation, phoneNumber, department } = formData;
    const departments = inviteInfo?.company?.departments || [];

    if (!name || !age || !occupation || !phoneNumber || (departments.length > 0 && !department)) {
      return setSubmitError('All fields are required');
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        setPageState('needs_login');
        return;
      }

      const res = await fetch('/api/companies/join-as-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          token,
          name,
          age: parseInt(age),
          occupation,
          phoneNumber,
          department: department || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to join the company');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      router.push('/employee-dashboard');
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-[#f6f3ec] flex items-center justify-center pattern-grid">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-[#FACC15] border-[4px] border-black flex items-center justify-center shadow-[4px_4px_0_0_#000] animate-bounce">
            <Zap size={32} className="text-black" />
          </div>
          <span className="font-black text-lg uppercase tracking-widest text-black/60 animate-pulse">Verifying Invitation...</span>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-[#f6f3ec] flex items-center justify-center p-4 pattern-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border-[4px] border-black shadow-[8px_8px_0_0_#000] p-8"
        >
          <div className="flex items-center gap-3 mb-6 border-b-[4px] border-black pb-6">
            <div className="w-12 h-12 bg-[#FF4444] border-[3px] border-black flex items-center justify-center shadow-[2px_2px_0_0_#000]">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-2xl uppercase tracking-tighter">Invalid Invitation</h1>
            </div>
          </div>
          <div className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-start gap-3 text-sm mb-6">
            <ShieldAlert size={20} className="flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-black text-white border-[3px] border-black py-4 font-black uppercase text-sm tracking-wider hover:bg-[#FACC15] hover:text-black transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
          >
            Go to Login <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  // Needs signup state
  if (pageState === 'needs_signup') {
    return (
      <div className="min-h-screen bg-[#f6f3ec] flex items-center justify-center p-4 pattern-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border-[4px] border-black shadow-[8px_8px_0_0_#000] p-8"
        >
          <div className="flex items-center gap-3 mb-6 border-b-[4px] border-black pb-6">
            <div className="w-12 h-12 bg-[#FACC15] border-[3px] border-black flex items-center justify-center shadow-[2px_2px_0_0_#000]">
              <UserPlus size={24} className="text-black" />
            </div>
            <div>
              <h1 className="font-black text-2xl uppercase tracking-tighter">Account Required</h1>
            </div>
          </div>

          {inviteInfo && (
            <div className="bg-[#FEF08A] text-[#854D0E] border-[3px] border-[#854D0E] p-4 font-bold flex items-start gap-3 text-sm mb-6">
              <Building2 size={20} className="flex-shrink-0 mt-0.5" />
              <span>
                You&apos;ve been invited to join <strong>{inviteInfo.company.name}</strong>. 
                Please create an account with <strong>{inviteInfo.email}</strong> to continue.
              </span>
            </div>
          )}

          <p className="font-bold text-sm text-black/70 mb-6">
            You need a Voicy account to accept this invitation. Sign up to get started.
          </p>

          <button
            onClick={() => router.push(`/signup?invite_token=${token}`)}
            className="w-full bg-black text-[#FACC15] border-[3px] border-black py-4 font-black uppercase text-sm tracking-wider hover:bg-[#FACC15] hover:text-black transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
          >
            <UserPlus size={18} /> Create Account
          </button>

          <p className="text-center font-bold text-sm mt-4 text-black/60">
            Already have an account?{' '}
            <button onClick={() => router.push(`/login?invite_token=${token}`)} className="text-black underline underline-offset-2 decoration-2 cursor-pointer bg-transparent border-0 font-bold">
              Log in here
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  // Needs login state
  if (pageState === 'needs_login') {
    return (
      <div className="min-h-screen bg-[#f6f3ec] flex items-center justify-center p-4 pattern-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border-[4px] border-black shadow-[8px_8px_0_0_#000] p-8"
        >
          <div className="flex items-center gap-3 mb-6 border-b-[4px] border-black pb-6">
            <div className="w-12 h-12 bg-[#FACC15] border-[3px] border-black flex items-center justify-center shadow-[2px_2px_0_0_#000]">
              <LogIn size={24} className="text-black" />
            </div>
            <div>
              <h1 className="font-black text-2xl uppercase tracking-tighter">Login Required</h1>
            </div>
          </div>

          {inviteInfo && (
            <div className="bg-[#FEF08A] text-[#854D0E] border-[3px] border-[#854D0E] p-4 font-bold flex items-start gap-3 text-sm mb-6">
              <Building2 size={20} className="flex-shrink-0 mt-0.5" />
              <span>
                You&apos;ve been invited to join <strong>{inviteInfo.company.name}</strong>. 
                Please log in with <strong>{inviteInfo.email}</strong> to continue.
              </span>
            </div>
          )}

          <p className="font-bold text-sm text-black/70 mb-6">
            Log in to your Voicy account to accept this invitation.
          </p>

          <button
            onClick={() => router.push(`/login?invite_token=${token}`)}
            className="w-full bg-black text-[#FACC15] border-[3px] border-black py-4 font-black uppercase text-sm tracking-wider hover:bg-[#FACC15] hover:text-black transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
          >
            <LogIn size={18} /> Log In
          </button>

          <p className="text-center font-bold text-sm mt-4 text-black/60">
            Don&apos;t have an account?{' '}
            <button onClick={() => router.push(`/signup?invite_token=${token}`)} className="text-black underline underline-offset-2 decoration-2 cursor-pointer bg-transparent border-0 font-bold">
              Sign up here
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  // Email mismatch state
  if (pageState === 'email_mismatch') {
    return (
      <div className="min-h-screen bg-[#f6f3ec] flex items-center justify-center p-4 pattern-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border-[4px] border-black shadow-[8px_8px_0_0_#000] p-8"
        >
          <div className="flex items-center gap-3 mb-6 border-b-[4px] border-black pb-6">
            <div className="w-12 h-12 bg-[#FF4444] border-[3px] border-black flex items-center justify-center shadow-[2px_2px_0_0_#000]">
              <ShieldAlert size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-2xl uppercase tracking-tighter">Wrong Account</h1>
            </div>
          </div>

          <div className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-start gap-3 text-sm mb-6">
            <ShieldAlert size={20} className="flex-shrink-0 mt-0.5" />
            <span>
              This invitation was sent to <strong>{inviteInfo?.email}</strong>, but you are logged in as <strong>{loggedInEmail}</strong>. 
              Please log out and log in with the correct account.
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogout}
              className="w-full bg-black text-[#FACC15] border-[3px] border-black py-4 font-black uppercase text-sm tracking-wider hover:bg-[#FACC15] hover:text-black transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
            >
              <LogOut size={18} /> Log Out & Switch Account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Form state
  const departments = inviteInfo?.company?.departments || [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f3ec] p-4 pattern-grid">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white border-[4px] border-black shadow-[8px_8px_0_0_#000] p-8"
      >
        <div className="flex items-center gap-3 mb-6 border-b-[4px] border-black pb-6">
          <div className="w-12 h-12 bg-[#FACC15] border-[3px] border-black flex items-center justify-center shadow-[2px_2px_0_0_#000]">
            <Zap size={24} className="text-black" />
          </div>
          <div>
            <h1 className="font-black text-2xl uppercase tracking-tighter">Join {inviteInfo?.company?.name || 'Company'}</h1>
            <p className="text-black/60 font-bold text-sm uppercase">Complete Your Profile</p>
          </div>
        </div>

        {inviteInfo && (
          <div className="bg-[#FEF08A] text-[#854D0E] border-[3px] border-[#854D0E] p-4 font-bold flex items-start gap-3 text-sm mb-6">
            <Building2 size={20} className="flex-shrink-0 mt-0.5" />
            <span>
              You are joining <strong>{inviteInfo.company.name}</strong> as an employee. 
              Fill in your details below to complete the onboarding.
            </span>
          </div>
        )}

        {submitError && (
          <div className="mb-6 bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center gap-3 text-sm">
            <ShieldAlert size={20} className="flex-shrink-0" />
            <span>{submitError}</span>
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

          {departments.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="font-black uppercase text-xs">Department</label>
              <div className="relative">
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-[#f6f3ec] border-[3px] border-black pl-10 pr-4 py-3 font-bold focus:outline-none focus:bg-[#FACC15] transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <Briefcase className="absolute left-3 top-3.5 text-black/50" size={18} />
              </div>
            </div>
          )}

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
            disabled={submitting}
            className="w-full mt-4 bg-black text-white border-[3px] border-black py-4 font-black uppercase text-sm tracking-wider hover:bg-[#FACC15] hover:text-black transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
          >
            {submitting ? 'Processing...' : 'Join & Continue'}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          setUser(payload);
        } catch (e) {
          console.error("Invalid token");
        }
      } else {
        setUser(null);
      }
    };
    
    checkToken();
    // Re-check when window gains focus in case they logged in on another tab
    window.addEventListener('focus', checkToken);
    return () => window.removeEventListener('focus', checkToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setDropdownOpen(false);
    window.location.href = "/";
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin-dashboard";
    if (user.role === "OWNER" || user.role === "ACCOUNTANT") return "/accountant-dashboard";
    // If no company context yet, might need to create company
    if (user.currentCompanyId === null) return "/setup-company";
    return "/accountant-dashboard"; // fallback
  };

  const initial = user?.email ? user.email.charAt(0).toUpperCase() : "?";

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col">
      <nav className="w-full bg-background border-b-[3px] border-on-background flex justify-between items-center px-margin-desktop py-4 relative z-50">
        <Link href="/" className="font-headline-md text-headline-md font-black italic text-on-background flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-container border-[3px] border-on-background flex items-center justify-center">
            <Zap size={20} className="text-on-background" />
          </div>
          Voicy
        </Link>
        <div className="hidden md:flex gap-8">
          <Link className="font-body-md text-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors duration-200" href="/platform">Platform</Link>
          <Link className="font-body-md text-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors duration-200" href="/design">Design</Link>
          <Link className="font-body-md text-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors duration-200" href="/payroll">Payroll</Link>
          <Link className="font-body-md text-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors duration-200" href="/pricing">Pricing</Link>
        </div>
        <div className="hidden md:flex gap-4 items-center">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-12 h-12 bg-primary-container border-[3px] border-on-background flex items-center justify-center font-headline-md text-xl uppercase font-black hover:bg-white hover:neo-brutal-shadow-active transition-all"
              >
                {initial}
              </button>
              
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-56 bg-white border-[3px] border-on-background neo-brutal-shadow flex flex-col"
                  >
                    <div className="p-3 border-b-[3px] border-on-background bg-surface-container-low truncate">
                      <p className="font-bold text-sm text-on-surface-variant">Signed in as</p>
                      <p className="font-label-caps uppercase font-black truncate">{user.email}</p>
                    </div>
                    <Link 
                      href={getDashboardLink()}
                      onClick={() => setDropdownOpen(false)}
                      className="p-3 font-label-caps uppercase font-bold hover:bg-primary-container transition-colors flex items-center gap-2 border-b-[3px] border-on-background"
                    >
                      <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="p-3 text-left font-label-caps uppercase font-bold text-[#D32F2F] hover:bg-[#FFE5E5] transition-colors flex items-center gap-2"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link className="font-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors" href="/login">Log in</Link>
              <Link href="/signup" className="bg-primary-container text-on-primary-container px-6 py-2 font-label-caps text-label-caps border-[3px] border-on-background neo-brutal-shadow hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px] transition-all inline-block">
                Start Free
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden relative z-50" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </nav>

      <div className="relative w-full z-40">
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden absolute top-0 left-0 w-full border-b-[3px] border-on-background bg-surface-container overflow-hidden shadow-[0_20px_20px_rgba(0,0,0,0.2)]"
            >
              <div className="flex flex-col p-6 gap-6">
                <Link onClick={() => setIsMenuOpen(false)} className="font-headline-md text-2xl uppercase font-black" href="/platform">Platform</Link>
                <Link onClick={() => setIsMenuOpen(false)} className="font-headline-md text-2xl uppercase font-black" href="/design">Design</Link>
                <Link onClick={() => setIsMenuOpen(false)} className="font-headline-md text-2xl uppercase font-black" href="/payroll">Payroll</Link>
                <Link onClick={() => setIsMenuOpen(false)} className="font-headline-md text-2xl uppercase font-black" href="/pricing">Pricing</Link>
                <div className="flex flex-col gap-4 mt-4 border-t-[3px] border-on-background pt-6">
                  {user ? (
                    <>
                      <div className="p-3 bg-surface-container-low border-[3px] border-on-background truncate">
                        <p className="font-bold text-xs text-on-surface-variant">Signed in as</p>
                        <p className="font-label-caps uppercase font-black truncate">{user.email}</p>
                      </div>
                      <Link onClick={() => setIsMenuOpen(false)} className="font-headline-md text-xl uppercase font-black flex items-center gap-2" href={getDashboardLink()}>
                        <LayoutDashboard size={20} /> Dashboard
                      </Link>
                      <button onClick={handleLogout} className="font-headline-md text-xl uppercase font-black text-[#D32F2F] text-left flex items-center gap-2">
                        <LogOut size={20} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link onClick={() => setIsMenuOpen(false)} className="font-headline-md text-xl uppercase font-black text-center" href="/login">Log in</Link>
                      <Link onClick={() => setIsMenuOpen(false)} href="/login" className="bg-primary-container text-on-background w-full py-4 font-label-caps text-lg border-[3px] border-on-background neo-brutal-shadow uppercase font-black text-center block">
                        Start Free
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

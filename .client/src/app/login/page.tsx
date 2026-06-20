"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import { Zap, ArrowRight, FileText, CheckCircle2 } from "lucide-react";

export default function Login() {
  const containerRef = useRef<HTMLDivElement>(null);

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

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6" 
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-on-background">Work Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full bg-surface-container-low text-on-background border-[3px] border-on-background px-4 py-4 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-label-caps uppercase text-on-background">Password</label>
                <Link href="#" className="font-label-caps uppercase text-primary hover:underline underline-offset-4">Reset?</Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-surface-container-low text-on-background border-[3px] border-on-background px-4 py-4 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
              />
            </div>

            <button type="submit" className="w-full bg-on-background text-primary-container py-5 font-label-caps text-lg border-[4px] border-on-background neo-brutal-shadow-lg hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase font-black flex items-center justify-center gap-3 mt-4">
              Enter Terminal <ArrowRight size={24} />
            </button>
          </motion.form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 pt-8 border-t-[3px] border-on-background"
          >
            <p className="font-body-md font-bold text-center">
              No account yet? <Link href="/signup" className="font-label-caps uppercase bg-primary-container border-[2px] border-on-background px-2 py-1 ml-2 hover:bg-white transition-colors">Sign up fast</Link>
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

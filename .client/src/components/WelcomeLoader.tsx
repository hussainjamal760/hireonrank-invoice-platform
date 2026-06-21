"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Banknote, Zap } from "lucide-react";

export const WelcomeLoader = () => {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeen = sessionStorage.getItem("hasSeenWelcome");
    if (!hasSeen) {
      setShow(true);
      // Disable scrolling while loader is active
      document.body.style.overflow = "hidden";
      
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("hasSeenWelcome", "true");
        document.body.style.overflow = "auto";
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "auto";
      };
    }
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] bg-[#FACC15] flex flex-col items-center justify-center overflow-hidden font-body-md"
        >
          {/* Brutalist Pattern Background */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(black 3px, transparent 3px)', 
              backgroundSize: '40px 40px' 
            }}
          ></div>

          {/* Marquee Banner Top */}
          <div className="absolute top-[15%] left-0 right-0 overflow-hidden bg-black text-[#FACC15] py-3 border-y-[6px] border-black transform -rotate-3 scale-110 z-0">
            <motion.div 
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="flex gap-10 whitespace-nowrap font-display-lg uppercase font-black text-4xl tracking-widest"
            >
              <span>INVOICES</span><span>PAYROLL</span><span>EMPLOYEES</span><span>BRUTALISM</span>
              <span>INVOICES</span><span>PAYROLL</span><span>EMPLOYEES</span><span>BRUTALISM</span>
              <span>INVOICES</span><span>PAYROLL</span><span>EMPLOYEES</span><span>BRUTALISM</span>
            </motion.div>
          </div>

          {/* Marquee Banner Bottom */}
          <div className="absolute bottom-[15%] left-0 right-0 overflow-hidden bg-black text-white py-3 border-y-[6px] border-black transform rotate-3 scale-110 z-0">
            <motion.div 
              animate={{ x: [-1000, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="flex gap-10 whitespace-nowrap font-display-lg uppercase font-black text-4xl tracking-widest"
            >
              <span>HIRE ON RANK</span><span>SYSTEM LOAD</span><span>FINANCE</span><span>HIRE ON RANK</span>
              <span>SYSTEM LOAD</span><span>FINANCE</span><span>HIRE ON RANK</span><span>SYSTEM LOAD</span>
            </motion.div>
          </div>

          {/* Floating Element 1 - Invoice */}
          <motion.div
            initial={{ y: 200, x: -150, rotate: -30, opacity: 0 }}
            animate={{ y: 0, x: -200, rotate: -15, opacity: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.3 }}
            className="absolute bg-white border-[6px] border-black p-6 shadow-[12px_12px_0_0_#000000] z-10 hidden lg:block"
          >
            <div className="flex gap-3 items-center font-black uppercase text-2xl border-b-[4px] border-black pb-3 mb-3">
              <FileText size={32} /> INV-999
            </div>
            <div className="font-mono font-black text-4xl">Rs 150,000</div>
            <div className="mt-4 inline-block bg-black text-[#FACC15] px-3 py-1 font-label-caps font-black text-sm uppercase">PENDING</div>
          </motion.div>

          {/* Floating Element 2 - Payroll */}
          <motion.div
            initial={{ y: -200, x: 150, rotate: 30, opacity: 0 }}
            animate={{ y: 0, x: 200, rotate: 15, opacity: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.5 }}
            className="absolute bg-[#E5F6E5] border-[6px] border-black p-6 shadow-[12px_12px_0_0_#000000] z-10 hidden lg:block"
          >
            <div className="flex gap-3 items-center font-black uppercase text-2xl border-b-[4px] border-black pb-3 mb-3 text-[#008A00]">
              <Banknote size={32} /> PAYROLL RUN
            </div>
            <div className="font-mono font-black text-4xl text-[#008A00]">SUCCESS</div>
            <div className="mt-4 inline-block bg-[#008A00] text-white px-3 py-1 font-label-caps font-black text-sm uppercase">42 EMPLOYEES</div>
          </motion.div>

          {/* Center Main Box */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
            className="relative z-20 flex flex-col items-center bg-white border-[8px] border-black p-10 md:p-14 shadow-[16px_16px_0_0_#000000] max-w-xl w-full mx-4"
          >
            <div className="absolute -top-8 -right-8 bg-black text-[#FACC15] p-4 border-[6px] border-black shadow-[8px_8px_0_0_#FACC15]">
              <Zap size={40} strokeWidth={2.5} />
            </div>
            
            <h1 className="font-display-lg text-6xl md:text-8xl uppercase font-black tracking-tighter text-black text-center leading-none mb-8">
              HIRE ON <br />
              <span className="bg-black text-[#FACC15] px-6 py-2 inline-block mt-4 transform -rotate-2 border-[4px] border-black">RANK</span>
            </h1>

            <div className="w-full bg-surface-container-low border-[6px] border-black h-12 relative overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
                className="absolute left-0 top-0 bottom-0 bg-black"
              />
              <div className="absolute inset-0 flex items-center justify-center font-mono text-sm md:text-base font-black mix-blend-difference text-white uppercase tracking-widest z-10">
                Initializing System...
              </div>
            </div>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

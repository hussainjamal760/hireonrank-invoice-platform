"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DollarSign, CheckCircle2, Zap } from "lucide-react";

export default function Payroll() {
  return (
    <>
      <Navbar />
      
      <main className="bg-background min-h-screen">
        <section className="py-24 px-margin-desktop border-b-[4px] border-on-background bg-[#ffcccc] flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
          <div className="absolute inset-0 pattern-grid opacity-30 pointer-events-none"></div>
          
          <div className="lg:w-1/2 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-16 h-16 bg-white border-[4px] border-on-background flex items-center justify-center mb-8 neo-brutal-shadow">
                <DollarSign size={32} className="text-[#ff3333]" />
              </div>
              <h1 className="font-display-lg text-6xl md:text-7xl uppercase font-black leading-none mb-6">
                Payroll runs<br/>before lunch.
              </h1>
              <p className="font-body-lg text-xl text-on-surface-variant max-w-xl border-l-[4px] border-on-background pl-6 mb-12">
                Process every employee's salary for the month with a single action. Overtime, deductions, and taxes calculated instantly.
              </p>
              
              <button className="bg-on-background text-white px-8 py-4 font-label-caps text-lg border-[4px] border-on-background neo-brutal-shadow-lg hover:translate-x-[2px] hover:translate-y-[2px] hover:neo-brutal-shadow-active transition-all uppercase font-black flex items-center gap-3">
                <Zap size={20} className="text-[#ff3333]"/> Run Batch Process
              </button>
            </motion.div>
          </div>
          
          <div className="lg:w-1/2 w-full relative z-10 flex items-center justify-center">
             <motion.div 
              initial={{ y: 50, opacity: 0, rotate: 2 }}
              animate={{ y: 0, opacity: 1, rotate: -2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md bg-white border-[4px] border-on-background shadow-[16px_16px_0_0_rgba(0,0,0,1)]"
            >
              <div className="border-b-[4px] border-on-background bg-on-background text-white p-6">
                <span className="font-headline-md text-3xl uppercase font-black block">Salary slip</span>
                <span className="font-data-md opacity-80 mt-2 block">June 2026 · Employee #0412</span>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-center mb-8 pb-4 border-b-[3px] border-on-background border-dashed">
                  <span className="font-label-caps text-lg uppercase bg-[#E5F6E5] text-[#008A00] border-[3px] border-on-background px-3 py-1 font-black">PROCESSED</span>
                </div>
                <div className="space-y-6 font-data-lg">
                  <div className="flex justify-between">
                    <span>Base salary</span>
                    <span className="font-black">Rs 145,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport allowance</span>
                    <span>Rs 8,000</span>
                  </div>
                  <div className="flex justify-between border-b-[3px] border-on-background pb-6">
                    <span>Performance bonus</span>
                    <span>Rs 12,000</span>
                  </div>
                  <div className="flex justify-between text-[#ff3333] pt-2">
                    <span>Tax withheld</span>
                    <span>− Rs 14,200</span>
                  </div>
                  <div className="flex justify-between text-[#ff3333] border-b-[4px] border-on-background pb-6">
                    <span>Provident fund</span>
                    <span>− Rs 7,250</span>
                  </div>
                </div>
                <div className="mt-8 flex justify-between items-center bg-[#ffcccc] border-[4px] border-on-background p-6">
                  <span className="font-headline-md text-2xl uppercase font-black">NET PAY</span>
                  <span className="font-display-lg text-4xl font-black">Rs 143,550</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-margin-desktop bg-surface-container-low">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="font-headline-lg text-5xl uppercase font-black text-center mb-16">The Engine Features</h2>
            
            <div className="bg-white border-[4px] border-on-background p-8 flex items-start gap-6 neo-brutal-shadow">
              <CheckCircle2 size={32} className="text-[#008A00] flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-headline-md text-2xl uppercase font-black mb-2">Automated Deductions</h4>
                <p className="font-body-lg text-on-surface-variant">Set rules once for overtime, tax, or loans. They apply automatically each cycle, ensuring mathematically perfect payouts.</p>
              </div>
            </div>
            
            <div className="bg-white border-[4px] border-on-background p-8 flex items-start gap-6 neo-brutal-shadow">
              <CheckCircle2 size={32} className="text-[#008A00] flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-headline-md text-2xl uppercase font-black mb-2">Instant Slip Generation</h4>
                <p className="font-body-lg text-on-surface-variant">The exact second payroll runs, every employee receives a clean, downloadable PDF slip in their secure portal.</p>
              </div>
            </div>
            
            <div className="bg-white border-[4px] border-on-background p-8 flex items-start gap-6 neo-brutal-shadow">
              <CheckCircle2 size={32} className="text-[#008A00] flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-headline-md text-2xl uppercase font-black mb-2">Auditable History</h4>
                <p className="font-body-lg text-on-surface-variant">Every past payroll run and slip stays on record. Completely searchable by employee ID, month, or transaction hash.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

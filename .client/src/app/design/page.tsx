"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Palette, CheckCircle2 } from "lucide-react";

export default function Design() {
  const [activeTheme, setActiveTheme] = useState("ledger");

  const themes = {
    ledger: { name: "Ledger", desc: "Minimal · Serif", bg: "bg-white", font: "font-display-lg" },
    studio: { name: "Studio", desc: "Bold · Geometric", bg: "bg-surface-container-low", font: "font-headline-md font-black" },
    slate: { name: "Slate", desc: "Corporate · Clean", bg: "bg-[#e2e8f0]", font: "font-body-lg font-bold" }
  };

  return (
    <>
      <Navbar />
      
      <main className="bg-background min-h-screen">
        <section className="py-24 px-margin-desktop border-b-[4px] border-on-background flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-16 h-16 bg-[#e6ccff] border-[4px] border-on-background flex items-center justify-center mb-8 neo-brutal-shadow">
                <Palette size={32} />
              </div>
              <h1 className="font-display-lg text-6xl md:text-7xl uppercase font-black leading-none mb-6">
                Brand it once.<br/>Use it forever.
              </h1>
              <p className="font-body-lg text-xl text-on-surface-variant max-w-xl border-l-[4px] border-[#a64dff] pl-6 mb-12">
                Stop sending generic PDFs. Select a theme, upload your logo, and instantly generate world-class invoices that command respect.
              </p>
              
              <div className="flex flex-col gap-4">
                {Object.entries(themes).map(([key, data]) => (
                  <div 
                    key={key}
                    onClick={() => setActiveTheme(key)}
                    className={`border-[4px] border-on-background p-6 flex justify-between items-center cursor-pointer transition-all ${
                      activeTheme === key 
                        ? "bg-on-background text-white shadow-[8px_8px_0_0_#a64dff] translate-x-[-2px] translate-y-[-2px]" 
                        : "bg-white neo-brutal-shadow hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px]"
                    }`}
                  >
                    <div>
                      <span className="font-headline-md text-2xl uppercase font-black block">{data.name}</span>
                      <span className="font-data-md opacity-80">{data.desc}</span>
                    </div>
                    {activeTheme === key && <CheckCircle2 className="text-[#a64dff]" size={32} />}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
          <div className="lg:w-1/2 w-full h-[600px] bg-surface-container border-[4px] border-on-background p-8 flex items-center justify-center pattern-grid relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTheme}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                transition={{ duration: 0.4 }}
                className={`w-full max-w-md border-[4px] border-on-background p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)] ${themes[activeTheme as keyof typeof themes].bg}`}
              >
                <div className={`flex justify-between items-start border-b-[4px] border-on-background pb-8 mb-8 ${activeTheme === 'studio' ? 'flex-col gap-6' : ''}`}>
                  <div className={`w-16 h-16 bg-on-background flex items-center justify-center text-white text-3xl font-black ${activeTheme === 'ledger' ? 'rounded-full' : ''}`}>
                    V
                  </div>
                  <div className={activeTheme === 'studio' ? 'text-left' : 'text-right'}>
                    <h2 className={`${themes[activeTheme as keyof typeof themes].font} text-4xl uppercase`}>INVOICE</h2>
                    <p className="font-data-md mt-2">INV-0192</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-12">
                  <div className="flex justify-between font-data-md">
                    <span>Brand identity package</span>
                    <span>Rs 85,000</span>
                  </div>
                  <div className="flex justify-between font-data-md">
                    <span>Website design</span>
                    <span>Rs 120,000</span>
                  </div>
                </div>
                
                <div className={`border-[3px] border-on-background p-4 text-xl uppercase ${activeTheme === 'studio' ? 'bg-[#a64dff] text-white font-black' : 'bg-primary-container font-bold'} flex justify-between`}>
                  <span>Total</span>
                  <span>Rs 205,000</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

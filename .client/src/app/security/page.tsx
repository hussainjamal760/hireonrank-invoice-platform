"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Lock, FileKey, EyeOff } from "lucide-react";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Security() {
  return (
    <>
      <Navbar />
      
      <main className="bg-background min-h-screen">
        <section className="py-24 px-margin-desktop bg-surface-container-low border-b-[4px] border-on-background relative overflow-hidden">
          <div className="absolute inset-0 pattern-grid opacity-20 pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <FadeIn>
              <div className="w-24 h-24 bg-on-background text-primary-container rounded-full flex items-center justify-center mx-auto mb-10 shadow-[8px_8px_0_0_#FACC15]">
                <Shield size={48} />
              </div>
              <h1 className="font-display-lg text-6xl md:text-8xl uppercase font-black leading-none mb-8">
                Ironclad.
              </h1>
              <p className="font-body-lg text-2xl text-on-surface-variant font-bold max-w-3xl mx-auto">
                We treat your financial data like weapons-grade intelligence. Encrypted at rest, in transit, and during execution.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-24 px-margin-desktop border-b-[4px] border-on-background">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeIn delay={0.1}>
              <div className="bg-white border-[4px] border-on-background p-10 h-full neo-brutal-shadow hover:translate-x-[4px] hover:translate-y-[4px] transition-transform">
                <Lock size={40} className="text-[#008A00] mb-8" />
                <h3 className="font-headline-md text-2xl uppercase font-black mb-4 border-b-[4px] border-on-background pb-4">Encryption Standard</h3>
                <p className="font-body-lg text-on-surface-variant font-bold">
                  All ledger entries are encrypted using AES-256 at rest and TLS 1.3 in transit. Cryptographic keys are rotated automatically every 30 days.
                </p>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <div className="bg-primary-container border-[4px] border-on-background p-10 h-full neo-brutal-shadow hover:translate-x-[4px] hover:translate-y-[4px] transition-transform">
                <FileKey size={40} className="text-on-background mb-8" />
                <h3 className="font-headline-md text-2xl uppercase font-black mb-4 border-b-[4px] border-on-background pb-4">Compliance Audits</h3>
                <p className="font-body-lg font-bold">
                  Fully compliant with PCI-DSS Level 1, ISO 27001, and SOC 2 Type II. We actively map our schema to RBI and State Bank guidelines.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="bg-on-background text-white border-[4px] border-on-background p-10 h-full shadow-[8px_8px_0_0_#FACC15] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0_0_#FACC15] transition-all">
                <EyeOff size={40} className="text-white mb-8" />
                <h3 className="font-headline-md text-2xl uppercase font-black mb-4 border-b-[4px] border-white pb-4">Zero Knowledge</h3>
                <p className="font-body-lg opacity-80 font-bold">
                  Our core routing engines process batch runs without ever exposing raw PII to the execution layer. Your salary logic is invisible to us.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="py-24 px-margin-desktop bg-surface-container-highest flex justify-center text-center">
          <FadeIn>
            <h2 className="font-headline-lg text-4xl uppercase font-black mb-6">Need our full SOC 2 Report?</h2>
            <p className="font-body-lg text-on-surface-variant mb-10 max-w-xl mx-auto">Enterprise clients under NDA can request our complete compliance breakdown and penetration test results.</p>
            <button className="bg-white text-on-background border-[4px] border-on-background px-8 py-4 font-label-caps text-lg uppercase font-black neo-brutal-shadow hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              Request Security Pack
            </button>
          </FadeIn>
        </section>
      </main>

      <Footer />
    </>
  );
}

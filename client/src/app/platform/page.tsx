"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Zap, FileText, LayoutTemplate, Users, DollarSign, PieChart, Database, Network, Lock } from "lucide-react";

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

export default function Platform() {
  return (
    <>
      <Navbar />
      
      <main className="bg-surface-container-low min-h-screen">
        {/* Header */}
        <section className="py-24 px-margin-desktop border-b-[4px] border-on-background relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-1/2 h-full pattern-grid opacity-20 pointer-events-none"></div>
          <div className="max-w-5xl relative z-10">
            <FadeIn>
              <span className="font-label-caps uppercase bg-primary-container border-[2px] border-on-background px-3 py-1 mb-6 inline-block">The Platform</span>
              <h1 className="font-display-lg text-6xl md:text-8xl uppercase font-black leading-none mb-8">
                Your back office,<br/>rebuilt for <span className="underline decoration-8 decoration-primary-container">speed.</span>
              </h1>
              <p className="font-body-lg text-2xl text-on-surface-variant max-w-2xl font-bold border-l-[4px] border-on-background pl-6">
                Replace your fragile web of spreadsheets, word docs, and single-purpose tools with a unified financial engine.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Modules Grid */}
        <section className="py-24 px-margin-desktop border-b-[4px] border-on-background bg-surface-container-highest">
          <FadeIn>
            <h2 className="font-headline-lg text-5xl uppercase font-black mb-16 text-center">Five Core Modules</h2>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FadeIn delay={0.1}>
              <div className="bg-white border-[4px] border-on-background p-8 h-full neo-brutal-shadow hover:-translate-y-2 transition-transform flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-[#e6ccff] border-[3px] border-on-background flex items-center justify-center mb-8 neo-brutal-shadow">
                    <LayoutTemplate size={32} />
                  </div>
                  <h3 className="font-headline-md text-3xl uppercase font-black mb-4">Invoice Designer</h3>
                  <p className="font-body-lg text-on-surface-variant mb-6">Drop in your logo, pick your brand color, choose a layout. Every invoice you send looks like it came from a company twice your size.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-primary-container border-[4px] border-on-background p-8 h-full neo-brutal-shadow hover:-translate-y-2 transition-transform flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-white border-[3px] border-on-background flex items-center justify-center mb-8 neo-brutal-shadow">
                    <FileText size={32} />
                  </div>
                  <h3 className="font-headline-md text-3xl uppercase font-black mb-4">Invoicing</h3>
                  <p className="font-body-lg text-on-background font-bold mb-6">Create, send, and track invoices with live status — Draft, Sent, Paid, Overdue — so you always know what's outstanding.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="bg-white border-[4px] border-on-background p-8 h-full neo-brutal-shadow hover:-translate-y-2 transition-transform flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-[#cce6ff] border-[3px] border-on-background flex items-center justify-center mb-8 neo-brutal-shadow">
                    <Users size={32} />
                  </div>
                  <h3 className="font-headline-md text-3xl uppercase font-black mb-4">Employee Records</h3>
                  <p className="font-body-lg text-on-surface-variant mb-6">One profile per employee — department, designation, salary structure, bank details. No more "which spreadsheet is current."</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.4} className="lg:col-span-2">
              <div className="bg-on-background text-white border-[4px] border-on-background p-8 h-full neo-brutal-shadow shadow-[8px_8px_0_0_#FACC15] hover:-translate-y-2 transition-transform flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="w-16 h-16 bg-[#ffcccc] border-[3px] border-white flex items-center justify-center mb-8 shadow-[4px_4px_0_0_#ffffff]">
                    <DollarSign size={32} className="text-on-background" />
                  </div>
                  <h3 className="font-headline-md text-3xl uppercase font-black mb-4">Payroll Engine</h3>
                  <p className="font-body-lg opacity-90 mb-6">Run payroll for everyone in a few clicks. Allowances, deductions, and net pay calculated automatically, with a full history you can audit anytime.</p>
                </div>
                <div className="flex-1 bg-surface-container-highest text-on-background border-[3px] border-white p-6 flex flex-col justify-center">
                   <div className="flex justify-between items-center border-b-[2px] border-on-background pb-4 mb-4">
                     <span className="font-headline-md uppercase font-black">Batch Process</span>
                     <span className="bg-[#E5F6E5] text-[#008A00] border-[2px] border-on-background px-2 font-label-caps">SUCCESS</span>
                   </div>
                   <div className="font-data-lg text-2xl font-black mb-1">42 Employees Processed</div>
                   <div className="font-data-md text-on-surface-variant">0.42s execution time</div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="bg-white border-[4px] border-on-background p-8 h-full neo-brutal-shadow hover:-translate-y-2 transition-transform flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-surface-dim border-[3px] border-on-background flex items-center justify-center mb-8 neo-brutal-shadow">
                    <PieChart size={32} />
                  </div>
                  <h3 className="font-headline-md text-3xl uppercase font-black mb-4">Reporting</h3>
                  <p className="font-body-lg text-on-surface-variant mb-6">Revenue, outstanding payments, and payroll expense in one dashboard — updated the moment something changes.</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Infrastructure */}
        <section className="py-24 px-margin-desktop bg-on-background text-white">
          <div className="max-w-4xl mb-16">
            <FadeIn>
              <h2 className="font-headline-lg text-5xl md:text-6xl uppercase font-black mb-6">Infrastructure you can trust.</h2>
              <p className="font-body-lg text-2xl opacity-80">Built on global standards with bank-grade encryption.</p>
            </FadeIn>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-8 border-t-[4px] border-white pt-12">
            <FadeIn delay={0.1}>
              <Database size={48} className="text-primary-container mb-6" />
              <h4 className="font-headline-md text-2xl uppercase font-black mb-3">Immutable Ledger</h4>
              <p className="font-body-md opacity-70">Hash-linked architecture ensures that once data is written, it is permanent. No overrides.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Lock size={48} className="text-primary-container mb-6" />
              <h4 className="font-headline-md text-2xl uppercase font-black mb-3">Compliance Engine</h4>
              <p className="font-body-md opacity-70">Fully mapped to State Bank and RBI regulatory frameworks. Automated reporting modules.</p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <Network size={48} className="text-primary-container mb-6" />
              <h4 className="font-headline-md text-2xl uppercase font-black mb-3">99.99% Uptime</h4>
              <p className="font-body-md opacity-70">Distributed node architecture guarantees your financial data is accessible the exact second you need it.</p>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

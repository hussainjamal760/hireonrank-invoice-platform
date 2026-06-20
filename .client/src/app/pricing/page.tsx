"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Check } from "lucide-react";

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

export default function Pricing() {
  return (
    <>
      <Navbar />
      
      <main className="bg-background min-h-screen">
        <section className="py-24 px-margin-desktop bg-on-background text-white relative overflow-hidden border-b-[4px] border-on-background">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-container opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <FadeIn>
              <h1 className="font-display-lg text-6xl md:text-8xl uppercase font-black mb-6 leading-none">
                Priced for the size<br/>you are now.
              </h1>
              <p className="font-body-lg text-2xl text-surface-variant max-w-3xl mx-auto mb-16">
                Start free. Upgrade only once your team or client list outgrows it. No hidden fees, no enterprise sales tactics.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end text-left">
              <FadeIn delay={0.1}>
                <div className="bg-background text-on-background border-[4px] border-white p-8 flex flex-col h-full neo-brutal-shadow hover:-translate-y-2 transition-transform">
                  <h3 className="font-headline-md text-3xl uppercase font-black border-b-[4px] border-on-background pb-4 mb-4">Starter</h3>
                  <p className="font-body-md text-on-surface-variant font-bold h-12 mb-6">For freelancers and solo operators</p>
                  <div className="mb-8">
                    <span className="font-display-lg text-6xl font-black">Free</span>
                    <span className="font-label-caps block mt-2 text-on-surface-variant">FOREVER</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1 font-body-lg font-bold">
                    <li className="flex items-center gap-3"><Check size={24} className="text-primary flex-shrink-0" /> Up to 10 invoices / month</li>
                    <li className="flex items-center gap-3"><Check size={24} className="text-primary flex-shrink-0" /> 1 invoice template</li>
                    <li className="flex items-center gap-3"><Check size={24} className="text-primary flex-shrink-0" /> Up to 3 employees</li>
                    <li className="flex items-center gap-3"><Check size={24} className="text-primary flex-shrink-0" /> Basic dashboard</li>
                  </ul>
                  <button className="w-full py-4 font-label-caps text-xl border-[4px] border-on-background bg-white hover:bg-surface-container-highest neo-brutal-shadow hover:neo-brutal-shadow-active transition-all uppercase font-black">
                    Deploy Free
                  </button>
                </div>
              </FadeIn>

              <FadeIn delay={0.2} className="relative z-10">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-on-background text-primary-container px-6 py-2 font-label-caps text-lg uppercase border-[3px] border-white whitespace-nowrap z-20 font-black">MOST POPULAR</div>
                <div className="bg-primary-container text-on-background border-[4px] border-white p-8 pt-12 flex flex-col h-[105%] shadow-[16px_16px_0_0_#ffffff] scale-105 md:scale-110 mb-4 md:mb-0 transform hover:-translate-y-2 transition-transform">
                  <h3 className="font-headline-md text-3xl uppercase font-black border-b-[4px] border-on-background pb-4 mb-4">Growth</h3>
                  <p className="font-body-md font-bold h-12 mb-6 text-on-background opacity-80">For small businesses scaling up</p>
                  <div className="mb-8">
                    <span className="font-display-lg text-6xl font-black">Rs 4,500</span>
                    <span className="font-label-caps block mt-2">BILLED MONTHLY</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1 font-body-lg font-bold">
                    <li className="flex items-center gap-3"><Check size={24} className="text-on-background flex-shrink-0" /> Unlimited invoices</li>
                    <li className="flex items-center gap-3"><Check size={24} className="text-on-background flex-shrink-0" /> All invoice templates</li>
                    <li className="flex items-center gap-3"><Check size={24} className="text-on-background flex-shrink-0" /> Up to 50 employees</li>
                    <li className="flex items-center gap-3"><Check size={24} className="text-on-background flex-shrink-0" /> Full payroll & salary slips</li>
                    <li className="flex items-center gap-3"><Check size={24} className="text-on-background flex-shrink-0" /> Analytics dashboard</li>
                  </ul>
                  <button className="w-full py-4 font-label-caps text-xl border-[4px] border-white bg-on-background text-white shadow-[8px_8px_0_0_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#ffffff] transition-all uppercase font-black">
                    Start free trial
                  </button>
                </div>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="bg-background text-on-background border-[4px] border-white p-8 flex flex-col h-full neo-brutal-shadow hover:-translate-y-2 transition-transform">
                  <h3 className="font-headline-md text-3xl uppercase font-black border-b-[4px] border-on-background pb-4 mb-4">Business</h3>
                  <p className="font-body-md text-on-surface-variant font-bold h-12 mb-6">For multi-team, multi-company ops</p>
                  <div className="mb-8">
                    <span className="font-display-lg text-6xl font-black">Custom</span>
                    <span className="font-label-caps block mt-2 text-on-surface-variant">TALK TO US</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1 font-body-lg font-bold">
                    <li className="flex items-center gap-3"><Check size={24} className="text-primary flex-shrink-0" /> Everything in Growth</li>
                    <li className="flex items-center gap-3"><Check size={24} className="text-primary flex-shrink-0" /> Unlimited employees</li>
                    <li className="flex items-center gap-3"><Check size={24} className="text-primary flex-shrink-0" /> Multi-company support</li>
                    <li className="flex items-center gap-3"><Check size={24} className="text-primary flex-shrink-0" /> Role-based access control</li>
                    <li className="flex items-center gap-3"><Check size={24} className="text-primary flex-shrink-0" /> Priority support</li>
                  </ul>
                  <button className="w-full py-4 font-label-caps text-xl border-[4px] border-on-background bg-white hover:bg-surface-container-highest neo-brutal-shadow hover:neo-brutal-shadow-active transition-all uppercase font-black">
                    Contact sales
                  </button>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

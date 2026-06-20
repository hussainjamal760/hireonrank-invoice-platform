"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowRight, MapPin, Mail, Phone } from "lucide-react";

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

export default function Contact() {
  return (
    <>
      <Navbar />
      
      <main className="bg-background min-h-screen">
        <section className="py-24 px-margin-desktop border-b-[4px] border-on-background relative overflow-hidden bg-primary-container">
          <div className="absolute inset-0 pattern-grid opacity-20 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 relative z-10">
            <div className="lg:w-1/2">
              <FadeIn>
                <h1 className="font-display-lg text-6xl md:text-8xl uppercase font-black leading-none mb-8">
                  Open<br/>Channel.
                </h1>
                <p className="font-body-lg text-2xl font-bold text-on-background border-l-[4px] border-on-background pl-6 mb-12 max-w-lg">
                  Need custom enterprise routing? Found a vulnerability? Just want to talk ledger architecture? Drop us a packet.
                </p>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4 bg-white border-[4px] border-on-background p-4 neo-brutal-shadow w-fit">
                    <Mail size={24} />
                    <span className="font-data-md text-xl uppercase font-black">hello@voicy.com</span>
                  </div>
                  <div className="flex items-center gap-4 bg-white border-[4px] border-on-background p-4 neo-brutal-shadow w-fit">
                    <Phone size={24} />
                    <span className="font-data-md text-xl uppercase font-black">+1 (800) 555-0199</span>
                  </div>
                  <div className="flex items-center gap-4 bg-white border-[4px] border-on-background p-4 neo-brutal-shadow w-fit">
                    <MapPin size={24} />
                    <span className="font-data-md text-xl uppercase font-black">40.7128° N, 74.0060° W</span>
                  </div>
                </div>
              </FadeIn>
            </div>
            
            <div className="lg:w-1/2">
              <FadeIn delay={0.2}>
                <form className="bg-white border-[4px] border-on-background p-8 md:p-12 neo-brutal-shadow-lg flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="font-label-caps uppercase text-on-background">Name</label>
                      <input type="text" className="w-full bg-surface-container-low border-[3px] border-on-background px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-label-caps uppercase text-on-background">Company</label>
                      <input type="text" className="w-full bg-surface-container-low border-[3px] border-on-background px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps uppercase text-on-background">Email</label>
                    <input type="email" className="w-full bg-surface-container-low border-[3px] border-on-background px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps uppercase text-on-background">Message</label>
                    <textarea rows={4} className="w-full bg-surface-container-low border-[3px] border-on-background px-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-primary-container focus:translate-x-[2px] focus:translate-y-[2px] transition-all resize-none"></textarea>
                  </div>

                  <button type="submit" className="w-full bg-on-background text-primary-container py-5 font-label-caps text-lg border-[4px] border-on-background neo-brutal-shadow hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase font-black flex items-center justify-center gap-3 mt-4">
                    Transmit Message <ArrowRight size={24} />
                  </button>
                </form>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowRight, Terminal } from "lucide-react";

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

export default function Careers() {
  const roles = [
    { title: "Senior Rust Engineer", team: "Core Infrastructure", loc: "Remote", type: "Full-time" },
    { title: "Product Designer", team: "User Experience", loc: "New York / Remote", type: "Full-time" },
    { title: "Systems Architect", team: "Data Integrity", loc: "Remote", type: "Full-time" },
    { title: "Growth Marketing Lead", team: "Go-to-market", loc: "London / Remote", type: "Full-time" }
  ];

  return (
    <>
      <Navbar />
      
      <main className="bg-background min-h-screen">
        <section className="py-24 px-margin-desktop bg-on-background text-white border-b-[4px] border-on-background">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <FadeIn>
                <div className="inline-block bg-primary-container text-on-background border-[3px] border-primary-container px-4 py-2 font-label-caps uppercase font-black mb-8">
                  We are hiring
                </div>
                <h1 className="font-display-lg text-6xl md:text-8xl uppercase font-black leading-none mb-6">
                  Build the<br/>new standard.
                </h1>
                <p className="font-body-lg text-2xl opacity-80 max-w-xl">
                  We're looking for obsessive builders who care about extreme reliability and pixel-perfect execution.
                </p>
              </FadeIn>
            </div>
            <FadeIn delay={0.2} className="hidden md:flex w-64 h-64 border-[4px] border-white p-8 items-center justify-center shadow-[12px_12px_0_0_#FACC15]">
              <Terminal size={100} className="text-primary-container animate-pulse" />
            </FadeIn>
          </div>
        </section>

        <section className="py-24 px-margin-desktop bg-surface-container-low">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <h2 className="font-headline-lg text-5xl uppercase font-black mb-12 border-b-[4px] border-on-background pb-6">Open Positions</h2>
            </FadeIn>
            
            <div className="flex flex-col gap-6">
              {roles.map((role, idx) => (
                <FadeIn key={idx} delay={0.1 * idx}>
                  <div className="bg-white border-[4px] border-on-background p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 neo-brutal-shadow hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer group">
                    <div>
                      <h3 className="font-headline-md text-2xl uppercase font-black mb-2 group-hover:underline decoration-4 underline-offset-4">{role.title}</h3>
                      <div className="flex gap-4 font-data-md text-on-surface-variant font-bold uppercase tracking-widest text-sm">
                        <span>{role.team}</span>
                        <span>•</span>
                        <span>{role.loc}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <span className="bg-surface-container-highest border-[2px] border-on-background px-3 py-1 font-label-caps uppercase">{role.type}</span>
                      <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
            
            <FadeIn delay={0.5} className="mt-16 text-center">
              <p className="font-body-md font-bold text-xl">
                Don't see a fit? Send your terminal output to <a href="mailto:careers@voicy.com" className="text-primary underline underline-offset-4 uppercase font-black">careers@voicy.com</a>
              </p>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

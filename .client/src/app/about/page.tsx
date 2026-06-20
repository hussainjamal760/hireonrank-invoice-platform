"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Zap, Target, Crosshair } from "lucide-react";

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

export default function About() {
  return (
    <>
      <Navbar />
      
      <main className="bg-background min-h-screen">
        <section className="py-24 px-margin-desktop bg-surface-container-highest border-b-[4px] border-on-background relative overflow-hidden">
          <div className="absolute inset-0 pattern-grid opacity-20 pointer-events-none"></div>
          
          <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center">
            <FadeIn>
              <div className="w-20 h-20 bg-primary-container border-[4px] border-on-background flex items-center justify-center mb-10 mx-auto neo-brutal-shadow">
                <Zap size={40} className="text-on-background" />
              </div>
              <h1 className="font-display-lg text-6xl md:text-8xl uppercase font-black mb-8 leading-none">
                We hate<br/>spreadsheets.
              </h1>
              <p className="font-body-lg text-2xl text-on-surface-variant font-bold max-w-3xl mx-auto">
                Voicy was built because the world's financial backbone is running on fragile Excel formulas and copy-pasted Word documents. We decided to fix that.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-24 px-margin-desktop border-b-[4px] border-on-background">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="bg-white border-[4px] border-on-background p-12 neo-brutal-shadow-lg shadow-[16px_16px_0_0_#FACC15]">
                <h3 className="font-headline-md text-3xl uppercase font-black mb-6 border-b-[4px] border-on-background pb-4">The Mission</h3>
                <p className="font-body-lg text-xl leading-relaxed font-bold opacity-90">
                  To eliminate ambiguity in back-office operations. We believe financial software shouldn't require a master's degree to operate, but it should possess the mathematical rigor of an enterprise ledger.
                </p>
                <p className="font-body-lg text-xl leading-relaxed font-bold opacity-90 mt-4">
                  No fluff. Just extreme precision.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 gap-8">
              <FadeIn delay={0.2}>
                <div className="bg-on-background text-white border-[4px] border-on-background p-8 flex items-start gap-6 hover:translate-x-[4px] hover:translate-y-[4px] transition-transform">
                  <Target size={32} className="text-primary-container flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-headline-md text-2xl uppercase font-black mb-2">Built for speed</h4>
                    <p className="font-body-md opacity-80">Every interaction in Voicy is designed to take the fewest possible clicks.</p>
                  </div>
                </div>
              </FadeIn>
              
              <FadeIn delay={0.3}>
                <div className="bg-surface-container-low border-[4px] border-on-background p-8 flex items-start gap-6 neo-brutal-shadow hover:translate-x-[4px] hover:translate-y-[4px] transition-transform">
                  <Crosshair size={32} className="text-on-background flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-headline-md text-2xl uppercase font-black mb-2">Absolute Accuracy</h4>
                    <p className="font-body-md text-on-surface-variant font-bold">Rounding errors are unacceptable. Our ledger architecture guarantees precision down to the fraction.</p>
                  </div>
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

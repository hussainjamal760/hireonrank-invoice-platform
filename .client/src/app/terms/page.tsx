"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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

export default function Terms() {
  const lastUpdated = "June 20, 2026";

  return (
    <>
      <Navbar />
      
      <main className="bg-background min-h-screen">
        <section className="py-24 px-margin-desktop bg-surface-container-highest border-b-[4px] border-on-background relative overflow-hidden">
          <div className="absolute inset-0 pattern-grid opacity-20 pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <FadeIn>
              <div className="inline-block bg-white text-on-background border-[3px] border-on-background px-4 py-2 font-label-caps uppercase font-black mb-8 neo-brutal-shadow">
                Legal Protocol
              </div>
              <h1 className="font-display-lg text-6xl md:text-8xl uppercase font-black mb-8 leading-none">
                Terms of<br/>Service.
              </h1>
              <p className="font-body-lg text-2xl text-on-surface-variant font-bold max-w-2xl">
                The rules of engagement for using the Voicy infrastructure. Read carefully.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-24 px-margin-desktop">
          <div className="max-w-4xl mx-auto flex flex-col gap-12">
            <FadeIn>
              <div className="font-label-caps uppercase font-black text-on-surface-variant mb-4">Last Updated: {lastUpdated}</div>
              
              <div className="bg-white border-[4px] border-on-background p-8 neo-brutal-shadow mb-8">
                <h2 className="font-headline-md text-3xl uppercase font-black mb-4 border-b-[4px] border-on-background pb-4">1. Acceptance of Protocol</h2>
                <p className="font-body-lg leading-relaxed font-bold opacity-90">
                  By executing the deployment of an account or utilizing the Voicy API, you agree to be bound by these terms. If you do not agree to these terms, you must immediately terminate your connection and cease all usage of the software.
                </p>
              </div>

              <div className="bg-white border-[4px] border-on-background p-8 neo-brutal-shadow mb-8">
                <h2 className="font-headline-md text-3xl uppercase font-black mb-4 border-b-[4px] border-on-background pb-4">2. Financial Accountability</h2>
                <p className="font-body-lg leading-relaxed font-bold opacity-90">
                  While our mathematical execution is guaranteed to be absolute, Voicy acts as an execution engine, not a licensed accounting firm. You remain solely responsible for the tax compliance, legal standing, and accuracy of the inputs you provide to the ledger.
                </p>
              </div>

              <div className="bg-white border-[4px] border-on-background p-8 neo-brutal-shadow mb-8">
                <h2 className="font-headline-md text-3xl uppercase font-black mb-4 border-b-[4px] border-on-background pb-4">3. Prohibited Usage</h2>
                <p className="font-body-lg leading-relaxed font-bold opacity-90 mb-4">
                  The infrastructure may not be utilized to execute or facilitate:
                </p>
                <ul className="list-disc pl-6 space-y-2 font-body-lg font-bold opacity-90">
                  <li>Money laundering or routing of illicit funds.</li>
                  <li>Generation of fraudulent invoices for shell entities.</li>
                  <li>Reverse engineering of the core billing engine.</li>
                </ul>
              </div>

              <div className="bg-white border-[4px] border-on-background p-8 neo-brutal-shadow">
                <h2 className="font-headline-md text-3xl uppercase font-black mb-4 border-b-[4px] border-on-background pb-4">4. Uptime & SLA</h2>
                <p className="font-body-lg leading-relaxed font-bold opacity-90">
                  We guarantee 99.99% uptime for enterprise tiers. However, in the event of catastrophic global network failure, our liability is strictly limited to the refund of your current billing cycle.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

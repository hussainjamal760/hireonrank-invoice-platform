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

export default function Privacy() {
  const lastUpdated = "June 20, 2026";

  return (
    <>
      <Navbar />
      
      <main className="bg-background min-h-screen">
        <section className="py-24 px-margin-desktop bg-on-background text-white border-b-[4px] border-on-background relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full pattern-grid opacity-10 pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <FadeIn>
              <div className="inline-block bg-primary-container text-on-background border-[3px] border-primary-container px-4 py-2 font-label-caps uppercase font-black mb-8">
                Data Protocol
              </div>
              <h1 className="font-display-lg text-6xl md:text-8xl uppercase font-black mb-8 leading-none">
                Privacy<br/>Policy.
              </h1>
              <p className="font-body-lg text-2xl text-surface-variant font-bold max-w-2xl border-l-[4px] border-primary-container pl-6">
                Your data is encrypted. Your clients are yours. Here is exactly how we handle the telemetry.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-24 px-margin-desktop">
          <div className="max-w-4xl mx-auto flex flex-col gap-12">
            <FadeIn>
              <div className="font-label-caps uppercase font-black text-on-surface-variant mb-4">Last Updated: {lastUpdated}</div>
              
              <div className="bg-surface-container-low border-[4px] border-on-background p-8 neo-brutal-shadow mb-8">
                <h2 className="font-headline-md text-3xl uppercase font-black mb-4 border-b-[4px] border-on-background pb-4">Zero Knowledge Execution</h2>
                <p className="font-body-lg leading-relaxed font-bold opacity-90">
                  We process salaries and invoice amounts without exposing raw Personal Identifiable Information (PII) to our execution layer. Your financial metrics are mathematically sealed; we cannot read your exact cash flow.
                </p>
              </div>

              <div className="bg-surface-container-low border-[4px] border-on-background p-8 neo-brutal-shadow mb-8">
                <h2 className="font-headline-md text-3xl uppercase font-black mb-4 border-b-[4px] border-on-background pb-4">Data Collection</h2>
                <p className="font-body-lg leading-relaxed font-bold opacity-90 mb-4">
                  We collect only what is strictly necessary to maintain server uptime and route traffic:
                </p>
                <ul className="list-disc pl-6 space-y-2 font-body-lg font-bold opacity-90">
                  <li>Connection IP addresses and user-agent strings.</li>
                  <li>Account email and secure hash passwords.</li>
                  <li>Billing details for your Voicy subscription (handled via secure tokenization).</li>
                </ul>
              </div>

              <div className="bg-surface-container-low border-[4px] border-on-background p-8 neo-brutal-shadow mb-8">
                <h2 className="font-headline-md text-3xl uppercase font-black mb-4 border-b-[4px] border-on-background pb-4">Third-Party Subprocessors</h2>
                <p className="font-body-lg leading-relaxed font-bold opacity-90">
                  We do not sell telemetry. Period. We use standard enterprise infrastructure (AWS, Cloudflare) strictly to host and deliver the application securely.
                </p>
              </div>

              <div className="bg-primary-container border-[4px] border-on-background p-8 neo-brutal-shadow">
                <h2 className="font-headline-md text-3xl uppercase font-black mb-4 border-b-[4px] border-on-background pb-4">Data Deletion</h2>
                <p className="font-body-lg leading-relaxed font-bold opacity-90">
                  If you close your account, your entire ledger history is purged from our active clusters within 7 days, and overwritten on cold backups within 30 days.
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

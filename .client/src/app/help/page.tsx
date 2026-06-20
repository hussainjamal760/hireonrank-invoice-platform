"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Search, ChevronRight, Book, MessageSquare } from "lucide-react";

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

export default function HelpCenter() {
  const categories = [
    { title: "Getting Started", count: "12 articles" },
    { title: "Invoice Engine", count: "24 articles" },
    { title: "Payroll Batching", count: "18 articles" },
    { title: "Account & Billing", count: "9 articles" },
  ];

  const faqs = [
    { q: "How do I process a massive batch payroll run?", a: "Navigate to the Payroll terminal, upload your CSV map or select employees from the UI, and execute the 'Run Batch' command. Validation takes under 2 seconds." },
    { q: "Can I use custom fonts in the Invoice Designer?", a: "The Studio and Slate themes support injecting custom Google Fonts via your brand settings panel." },
    { q: "What happens to unpaid invoices?", a: "The protocol automatically flags them as OVERDUE on day T+1, triggering your pre-configured reminder webhooks." },
  ];

  return (
    <>
      <Navbar />
      
      <main className="bg-background min-h-screen">
        <section className="py-24 px-margin-desktop bg-surface-container-highest border-b-[4px] border-on-background relative">
          <div className="absolute inset-0 pattern-grid opacity-20 pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <FadeIn>
              <h1 className="font-display-lg text-6xl md:text-8xl uppercase font-black mb-8 leading-none">
                Knowledge<br/>Base.
              </h1>
              <div className="relative max-w-2xl mx-auto flex items-center neo-brutal-shadow-lg">
                <Search size={28} className="absolute left-6 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Search the protocol documentation..." 
                  className="w-full bg-white border-[4px] border-on-background py-5 pl-16 pr-6 font-body-lg focus:outline-none focus:ring-0 focus:border-primary transition-colors"
                />
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="py-24 px-margin-desktop border-b-[4px] border-on-background">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="md:col-span-1">
              <FadeIn>
                <h3 className="font-headline-md text-3xl uppercase font-black mb-8 border-b-[4px] border-on-background pb-4">Categories</h3>
                <div className="flex flex-col gap-4">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="bg-white border-[3px] border-on-background p-4 flex justify-between items-center cursor-pointer neo-brutal-shadow hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px] transition-all group">
                      <div>
                        <h4 className="font-headline-md text-xl font-black uppercase">{cat.title}</h4>
                        <span className="font-data-md opacity-70">{cat.count}</span>
                      </div>
                      <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
            
            <div className="md:col-span-2">
              <FadeIn delay={0.2}>
                <h3 className="font-headline-md text-3xl uppercase font-black mb-8 border-b-[4px] border-on-background pb-4">Frequently Asked</h3>
                <div className="flex flex-col gap-8">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-surface-container-low border-[4px] border-on-background p-8">
                      <h4 className="font-headline-md text-2xl uppercase font-black mb-4 flex items-start gap-4">
                        <span className="text-primary-container drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">Q.</span> {faq.q}
                      </h4>
                      <p className="font-body-lg text-on-surface-variant font-bold border-l-[4px] border-on-background pl-4">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <section className="py-24 px-margin-desktop bg-on-background text-white text-center">
          <FadeIn>
            <h2 className="font-headline-lg text-5xl uppercase font-black mb-8">Still stuck?</h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="bg-white text-on-background border-[4px] border-white px-8 py-4 font-label-caps text-lg uppercase font-black shadow-[8px_8px_0_0_#FACC15] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#FACC15] transition-all flex items-center justify-center gap-3">
                <Book size={24} /> Read Full Docs
              </button>
              <button className="bg-primary-container text-on-background border-[4px] border-primary-container px-8 py-4 font-label-caps text-lg uppercase font-black hover:bg-white hover:border-white transition-all flex items-center justify-center gap-3">
                <MessageSquare size={24} /> Open Support Ticket
              </button>
            </div>
          </FadeIn>
        </section>
      </main>

      <Footer />
    </>
  );
}

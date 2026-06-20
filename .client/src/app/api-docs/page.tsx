"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Terminal, Copy, Key } from "lucide-react";

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

export default function ApiDocs() {
  return (
    <>
      <Navbar />
      
      <main className="bg-on-background min-h-screen text-white">
        <section className="py-24 px-margin-desktop border-b-[4px] border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
            <div className="flex-1">
              <FadeIn>
                <div className="flex items-center gap-4 mb-8">
                  <Terminal size={40} className="text-primary-container" />
                  <span className="font-data-lg text-2xl uppercase tracking-widest text-primary-container">v7.0.0 Stable</span>
                </div>
                <h1 className="font-display-lg text-6xl md:text-8xl uppercase font-black leading-none mb-6">
                  Voicy API.
                </h1>
                <p className="font-body-lg text-2xl opacity-80 max-w-xl border-l-[4px] border-primary-container pl-6">
                  Integrate brutal financial precision directly into your own infrastructure using our REST architecture.
                </p>
              </FadeIn>
            </div>
            
            <div className="flex-1 w-full">
              <FadeIn delay={0.2}>
                <div className="bg-black border-[4px] border-white p-6 shadow-[12px_12px_0_0_#FACC15]">
                  <div className="flex justify-between items-center border-b-[2px] border-[#333] pb-4 mb-4">
                    <span className="font-label-caps uppercase text-surface-variant tracking-widest">Authentication</span>
                    <Key size={16} className="text-primary-container" />
                  </div>
                  <pre className="font-data-md text-[#A6E22E] overflow-x-auto">
{`curl -X POST https://api.voicy.com/v1/auth \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id": "YOUR_ID",
    "client_secret": "YOUR_SECRET"
  }'`}
                  </pre>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <section className="py-24 px-margin-desktop bg-black border-b-[4px] border-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            <div className="lg:col-span-1 hidden lg:block">
              <FadeIn>
                <div className="sticky top-32 flex flex-col gap-4 font-label-caps text-lg uppercase font-black tracking-widest">
                  <a href="#" className="text-primary-container border-l-[4px] border-primary-container pl-4">Introduction</a>
                  <a href="#" className="text-surface-variant hover:text-white transition-colors pl-5">Authentication</a>
                  <a href="#" className="text-surface-variant hover:text-white transition-colors pl-5">Pagination</a>
                  <a href="#" className="text-surface-variant hover:text-white transition-colors pl-5">Errors</a>
                  
                  <span className="text-surface-variant mt-8 block border-b-[2px] border-[#333] pb-2">Endpoints</span>
                  <a href="#" className="text-surface-variant hover:text-white transition-colors pl-5">Invoices</a>
                  <a href="#" className="text-surface-variant hover:text-white transition-colors pl-5">Employees</a>
                  <a href="#" className="text-surface-variant hover:text-white transition-colors pl-5">Payroll Batches</a>
                </div>
              </FadeIn>
            </div>
            
            <div className="lg:col-span-3">
              <FadeIn delay={0.1}>
                <h2 className="font-headline-lg text-5xl uppercase font-black mb-12 border-b-[4px] border-[#333] pb-6">Create Invoice</h2>
                
                <div className="flex items-center gap-4 mb-8">
                  <span className="bg-[#A6E22E] text-black px-3 py-1 font-data-md font-black">POST</span>
                  <span className="font-data-lg text-xl tracking-wider opacity-90">/v1/invoices</span>
                </div>
                
                <p className="font-body-lg opacity-80 mb-12 max-w-2xl">
                  Generates a new invoice object. If the `auto_send` parameter is set to true, the protocol will immediately dispatch the invoice link to the specified client email.
                </p>

                <div className="bg-[#111] border-[4px] border-[#333] mb-12">
                  <div className="border-b-[4px] border-[#333] p-4 flex justify-between items-center bg-[#222]">
                    <span className="font-label-caps uppercase tracking-widest">Request Body</span>
                    <Copy size={20} className="text-surface-variant cursor-pointer hover:text-white transition-colors" />
                  </div>
                  <div className="p-6">
                    <pre className="font-data-md text-[#66D9EF] overflow-x-auto leading-relaxed">
{`{
  "client_email": "billing@acmecorp.com",
  "due_date": "2026-07-01",
  "currency": "PKR",
  "line_items": [
    {
      "description": "API Integration Retainer",
      "amount": 250000,
      "quantity": 1
    }
  ],
  "theme": "studio",
  "auto_send": true
}`}
                    </pre>
                  </div>
                </div>

                <div className="bg-[#111] border-[4px] border-[#333]">
                  <div className="border-b-[4px] border-[#333] p-4 flex justify-between items-center bg-[#222]">
                    <span className="font-label-caps uppercase tracking-widest">Response <span className="text-[#A6E22E] ml-2">201 Created</span></span>
                  </div>
                  <div className="p-6">
                    <pre className="font-data-md text-[#E6DB74] overflow-x-auto leading-relaxed">
{`{
  "id": "inv_01H8X...",
  "status": "sent",
  "total_amount": 250000,
  "secure_link": "https://voicy.com/pay/inv_01H8X..."
}`}
                    </pre>
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

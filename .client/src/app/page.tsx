"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Check, Star, Shield, Zap, FileText, Users, DollarSign, LayoutTemplate, Briefcase, FileSignature, PieChart, Menu, X, ArrowRight, ArrowDown } from "lucide-react";

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

const StaggerContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.15,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

const StaggerItem = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroImageRef.current) {
        const moveX = (e.clientX - window.innerWidth / 2) / 80;
        const moveY = (e.clientY - window.innerHeight / 2) / 80;
        heroImageRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <nav className="sticky top-0 w-full z-50 bg-background border-b-[3px] border-on-background flex justify-between items-center px-margin-desktop py-4">
        <div className="font-headline-md text-headline-md font-black italic text-on-background flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-container border-[3px] border-on-background flex items-center justify-center">
            <Zap size={20} className="text-on-background" />
          </div>
          Voicy
        </div>
        <div className="hidden md:flex gap-8">
          <Link className="font-body-md text-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors duration-200" href="#">Platform</Link>
          <Link className="font-body-md text-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors duration-200" href="#">Design</Link>
          <Link className="font-body-md text-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors duration-200" href="#">Payroll</Link>
          <Link className="font-body-md text-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors duration-200" href="#">Pricing</Link>
        </div>
        <div className="hidden md:flex gap-4 items-center">
          <Link className="font-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors" href="#">Log in</Link>
          <button className="bg-primary-container text-on-primary-container px-6 py-2 font-label-caps text-label-caps border-[3px] border-on-background neo-brutal-shadow hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            Start Free
          </button>
        </div>
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b-[3px] border-on-background bg-surface-container overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              <Link className="font-headline-md text-2xl uppercase font-black" href="#">Platform</Link>
              <Link className="font-headline-md text-2xl uppercase font-black" href="#">Design</Link>
              <Link className="font-headline-md text-2xl uppercase font-black" href="#">Payroll</Link>
              <Link className="font-headline-md text-2xl uppercase font-black" href="#">Pricing</Link>
              <button className="bg-primary-container text-on-background w-full py-4 font-label-caps text-lg border-[3px] border-on-background neo-brutal-shadow uppercase font-black">
                Start Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <section className="min-h-[90vh] flex flex-col lg:flex-row items-center border-b-[3px] border-on-background overflow-hidden relative bg-surface-container-low">
          <div className="w-full lg:w-1/2 p-margin-mobile md:p-margin-desktop flex flex-col gap-8 lg:border-r-[3px] border-on-background h-full z-10 bg-surface-container-low relative">
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-white border-[2px] border-on-background px-3 py-1 font-label-caps uppercase">
                <CheckCircle2 size={16} className="text-primary" /> Built for small & growing businesses
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="font-display-lg text-[13vw] sm:text-display-lg-mobile lg:text-display-lg leading-[0.9] uppercase">
                Invoices that look <span className="bg-primary-container px-2 border-[3px] border-on-background inline-block transform -rotate-1">sharp.</span> <br />
                Payroll that runs <span className="underline decoration-8 decoration-on-background underline-offset-4">itself.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="font-body-lg text-body-lg md:text-xl max-w-xl text-on-surface-variant border-l-[4px] border-primary pl-6">
                Stop stitching together spreadsheets and Word templates. Design branded invoices, run monthly payroll, and generate salary slips — all from one place, in minutes instead of days.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-6 mt-4">
                <button className="bg-on-background text-background px-8 py-5 font-label-caps text-[18px] border-[3px] border-on-background neo-brutal-shadow-lg hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider flex items-center justify-center gap-3">
                  Start free <span className="text-sm opacity-70">— no card needed</span> <ArrowRight size={20} />
                </button>
                <button className="bg-white text-on-background px-8 py-5 font-label-caps text-[18px] border-[3px] border-on-background neo-brutal-shadow hover:bg-surface-container-highest hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider flex items-center justify-center gap-2">
                  <span className="w-4 h-4 bg-primary-container rounded-full animate-pulse border-[2px] border-on-background"></span> Watch a 2 min demo
                </button>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="flex items-center gap-4 mt-8 pt-8 border-t-[3px] border-on-background">
                <div className="flex text-primary-container drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
                  <Star size={24} fill="currentColor" />
                  <Star size={24} fill="currentColor" />
                  <Star size={24} fill="currentColor" />
                  <Star size={24} fill="currentColor" />
                  <Star size={24} fill="currentColor" />
                </div>
                <p className="font-data-md uppercase max-w-[280px]">
                  Trusted by 200+ businesses to send invoices and pay 4,000+ employees monthly
                </p>
              </div>
            </FadeIn>
          </div>
          
          <div className="w-full lg:w-1/2 h-full min-h-[600px] lg:absolute right-0 top-0 bottom-0 bg-primary-container flex items-center justify-center p-8 relative overflow-hidden border-t-[3px] lg:border-t-0 border-on-background pattern-grid">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <motion.div 
              ref={heroImageRef}
              style={{ y: yParallax }}
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 2 }}
              transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 100 }}
              className="w-full max-w-lg neo-brutal-shadow-lg border-[4px] border-on-background bg-white flex flex-col z-20 relative"
            >
              <div className="border-b-[3px] border-on-background p-4 flex justify-between items-center bg-surface-container-highest">
                <span className="font-label-caps uppercase flex items-center gap-2"><FileText size={16}/> Northwind Studio</span>
                <div className="flex gap-2">
                  <span className="bg-primary-container px-2 py-1 font-label-caps text-[10px] border-[2px] border-on-background">PAID</span>
                </div>
              </div>
              <div className="p-8 flex flex-col gap-8 bg-[#fafafa]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline-md uppercase font-black">INV-0192</h3>
                    <p className="font-data-md text-on-surface-variant">Due 28 Jun 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="font-label-caps text-on-surface-variant">DESIGN & BRANDING</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b-[2px] border-on-background pb-4">
                    <span className="font-body-md font-bold">Brand identity package</span>
                    <span className="font-data-lg">Rs 85,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b-[2px] border-on-background pb-4">
                    <span className="font-body-md font-bold">Website design (5 pages)</span>
                    <span className="font-data-lg">Rs 120,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b-[2px] border-on-background pb-4">
                    <span className="font-body-md font-bold">Logo revisions ×3</span>
                    <span className="font-data-lg">Rs 15,000</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <span className="font-headline-md uppercase font-black">Total</span>
                  <span className="font-headline-lg font-black text-primary">Rs 220,000</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -50, rotate: -10 }}
              animate={{ opacity: 1, x: 0, rotate: -6 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute bottom-12 left-8 md:left-24 bg-white border-[3px] border-on-background p-4 neo-brutal-shadow z-30 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#E5F6E5] border-[2px] border-on-background flex items-center justify-center">
                <Check size={24} className="text-[#008A00]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps uppercase">Payment received</span>
                <span className="font-data-md text-on-surface-variant">2 min ago</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50, rotate: 10 }}
              animate={{ opacity: 1, x: 0, rotate: 6 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="absolute top-24 right-8 bg-on-background text-white border-[3px] border-on-background p-4 neo-brutal-shadow z-30 flex items-center gap-4"
            >
              <ArrowUpRight size={24} className="text-primary-container" />
              <div className="flex flex-col">
                <span className="font-label-caps uppercase text-primary-container">Sent to client</span>
                <span className="font-data-md">via secure link</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-b-[3px] border-on-background bg-on-background py-8 overflow-hidden flex flex-col md:flex-row items-center">
          <div className="px-margin-desktop mb-4 md:mb-0 md:border-r-[3px] border-surface-variant md:pr-8 flex-shrink-0">
            <span className="font-label-caps text-surface-variant uppercase tracking-widest opacity-80">Used by finance teams at</span>
          </div>
          <div className="flex flex-1 overflow-hidden relative">
            <motion.div 
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="flex gap-16 items-center px-16 whitespace-nowrap"
            >
              <span className="font-headline-md text-white opacity-90 uppercase">Northwind</span>
              <span className="font-headline-md text-white opacity-90 uppercase">Cedarline</span>
              <span className="font-headline-md text-white opacity-90 uppercase">Verafield</span>
              <span className="font-headline-md text-white opacity-90 uppercase">Postmark Co.</span>
              <span className="font-headline-md text-white opacity-90 uppercase">Almeida Group</span>
              <span className="font-headline-md text-white opacity-90 uppercase">Northwind</span>
              <span className="font-headline-md text-white opacity-90 uppercase">Cedarline</span>
              <span className="font-headline-md text-white opacity-90 uppercase">Verafield</span>
            </motion.div>
          </div>
        </section>

        <section className="bg-surface-bright border-b-[3px] border-on-background">
          <div className="p-margin-desktop border-b-[3px] border-on-background flex flex-col lg:flex-row justify-between items-end gap-8 bg-primary-container">
            <div className="max-w-3xl">
              <span className="font-label-caps uppercase text-on-surface-variant bg-white border-[2px] border-on-background px-3 py-1 mb-6 inline-block">The Platform</span>
              <h2 className="font-headline-lg text-4xl md:text-6xl uppercase font-black leading-none mt-4">
                Everything your back office needs,<br/>nothing it doesn't.
              </h2>
            </div>
            <p className="font-body-lg text-xl max-w-md bg-white p-6 border-[3px] border-on-background neo-brutal-shadow">
              Five modules that replace your spreadsheets, your Word templates, and the three different tools you currently use to get paid and pay people.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[3px] bg-on-background border-b-[3px] border-on-background">
            <StaggerItem className="bg-white p-10 flex flex-col justify-between group hover:bg-surface-container-low transition-colors min-h-[320px]">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-primary-container border-[3px] border-on-background flex items-center justify-center neo-brutal-shadow group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:neo-brutal-shadow-active transition-all">
                  <FileText size={32} />
                </div>
                <span className="font-data-lg text-4xl text-surface-dim font-black group-hover:text-primary transition-colors">01</span>
              </div>
              <div>
                <h3 className="font-headline-md text-2xl uppercase font-black mb-4 group-hover:underline decoration-4 underline-offset-4">Invoicing</h3>
                <p className="font-body-md text-on-surface-variant">
                  Create, send, and track invoices with live status — Draft, Sent, Paid, Overdue — so you always know what's outstanding. Share a secure link, get paid faster.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem className="bg-white p-10 flex flex-col justify-between group hover:bg-surface-container-low transition-colors min-h-[320px]">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-[#e6ccff] border-[3px] border-on-background flex items-center justify-center neo-brutal-shadow group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:neo-brutal-shadow-active transition-all">
                  <LayoutTemplate size={32} />
                </div>
                <span className="font-data-lg text-4xl text-surface-dim font-black group-hover:text-[#a64dff] transition-colors">02</span>
              </div>
              <div>
                <h3 className="font-headline-md text-2xl uppercase font-black mb-4 group-hover:underline decoration-4 underline-offset-4 decoration-[#a64dff]">Invoice designer</h3>
                <p className="font-body-md text-on-surface-variant">
                  Drop in your logo, pick your brand color, choose a layout. Every invoice you send looks like it came from a company twice your size.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem className="bg-white p-10 flex flex-col justify-between group hover:bg-surface-container-low transition-colors min-h-[320px]">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-[#cce6ff] border-[3px] border-on-background flex items-center justify-center neo-brutal-shadow group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:neo-brutal-shadow-active transition-all">
                  <Users size={32} />
                </div>
                <span className="font-data-lg text-4xl text-surface-dim font-black group-hover:text-[#0080ff] transition-colors">03</span>
              </div>
              <div>
                <h3 className="font-headline-md text-2xl uppercase font-black mb-4 group-hover:underline decoration-4 underline-offset-4 decoration-[#0080ff]">Employee records</h3>
                <p className="font-body-md text-on-surface-variant">
                  One profile per employee — department, designation, salary structure, bank details. No more "which spreadsheet is current."
                </p>
              </div>
            </StaggerItem>

            <StaggerItem className="bg-white p-10 flex flex-col justify-between group hover:bg-surface-container-low transition-colors min-h-[320px] lg:col-span-2">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-[#ffcccc] border-[3px] border-on-background flex items-center justify-center neo-brutal-shadow group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:neo-brutal-shadow-active transition-all">
                  <DollarSign size={32} />
                </div>
                <span className="font-data-lg text-4xl text-surface-dim font-black group-hover:text-[#ff3333] transition-colors">04</span>
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <h3 className="font-headline-md text-2xl uppercase font-black mb-4 group-hover:underline decoration-4 underline-offset-4 decoration-[#ff3333]">Payroll</h3>
                  <p className="font-body-md text-on-surface-variant text-lg">
                    Run payroll for everyone in a few clicks. Allowances, deductions, and net pay calculated automatically, with a full history you can audit anytime.
                  </p>
                </div>
                <div className="flex-1 w-full bg-surface-container border-[3px] border-on-background p-4 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff3333] opacity-10 rounded-bl-full"></div>
                   <div className="flex justify-between border-b-[2px] border-on-background pb-2 mb-2">
                     <span className="font-label-caps uppercase">Batch Run</span>
                     <span className="font-label-caps uppercase bg-[#E5F6E5] border-[2px] border-on-background px-2 text-[#008A00]">SUCCESS</span>
                   </div>
                   <div className="font-data-lg text-2xl font-black">42 Employees</div>
                   <div className="font-data-md text-on-surface-variant">Rs 6,240,000 Disbursed</div>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem className="bg-white p-10 flex flex-col justify-between group hover:bg-surface-container-low transition-colors min-h-[320px]">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-surface-dim border-[3px] border-on-background flex items-center justify-center neo-brutal-shadow group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:neo-brutal-shadow-active transition-all">
                  <PieChart size={32} />
                </div>
                <span className="font-data-lg text-4xl text-surface-dim font-black group-hover:text-on-background transition-colors">05</span>
              </div>
              <div>
                <h3 className="font-headline-md text-2xl uppercase font-black mb-4 group-hover:underline decoration-4 underline-offset-4">Reporting</h3>
                <p className="font-body-md text-on-surface-variant">
                  Revenue, outstanding payments, and payroll expense in one dashboard — updated the moment something changes, not at month-end.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        <section className="bg-surface-container py-24 border-b-[3px] border-on-background">
          <div className="px-margin-desktop max-w-6xl mx-auto">
            <FadeIn>
              <div className="flex flex-col items-center text-center mb-20">
                <span className="font-label-caps uppercase text-on-surface-variant bg-white border-[2px] border-on-background px-3 py-1 mb-6 inline-block">How It Works</span>
                <h2 className="font-headline-lg text-4xl md:text-5xl uppercase font-black">From blank page to<br/>paid invoice in four steps.</h2>
              </div>
            </FadeIn>

            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[4px] bg-on-background -translate-x-1/2"></div>
              
              <div className="flex flex-col gap-16 md:gap-0">
                <FadeIn delay={0.1}>
                  <div className="md:grid grid-cols-2 gap-16 items-center">
                    <div className="md:text-right flex flex-col items-start md:items-end mb-8 md:mb-0 relative">
                      <div className="md:hidden w-12 h-12 bg-primary-container border-[3px] border-on-background flex items-center justify-center font-data-lg font-black mb-4 neo-brutal-shadow">1</div>
                      <h3 className="font-headline-md text-2xl uppercase font-black mb-4 bg-white px-4 border-[3px] border-on-background inline-block">Add your client</h3>
                      <p className="font-body-lg text-on-surface-variant max-w-sm">Name, contact, billing details — saved once, reused on every future invoice.</p>
                      <div className="hidden md:flex absolute -right-[46px] top-1/2 -translate-y-1/2 w-12 h-12 bg-primary-container border-[4px] border-on-background items-center justify-center font-data-lg font-black z-10">1</div>
                    </div>
                    <div className="bg-white border-[4px] border-on-background p-6 neo-brutal-shadow-lg rotate-1 hover:rotate-0 transition-transform">
                      <div className="flex flex-col gap-3">
                        <div className="h-4 bg-surface-dim w-1/3"></div>
                        <div className="h-10 border-[2px] border-on-background px-3 flex items-center"><span className="font-data-md">Acme Corp</span></div>
                        <div className="h-10 border-[2px] border-on-background px-3 flex items-center"><span className="font-data-md">billing@acme.com</span></div>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn delay={0.2}>
                  <div className="md:grid grid-cols-2 gap-16 items-center md:mt-24">
                    <div className="order-2 md:order-1 bg-white border-[4px] border-on-background p-6 neo-brutal-shadow-lg -rotate-1 hover:rotate-0 transition-transform flex gap-4 mt-8 md:mt-0">
                      <div className="w-1/3 aspect-[3/4] border-[3px] border-primary bg-primary-container opacity-50 cursor-pointer"></div>
                      <div className="w-1/3 aspect-[3/4] border-[2px] border-on-background border-dashed hover:border-solid hover:bg-surface-dim cursor-pointer"></div>
                      <div className="w-1/3 aspect-[3/4] border-[2px] border-on-background border-dashed hover:border-solid hover:bg-surface-dim cursor-pointer"></div>
                    </div>
                    <div className="order-1 md:order-2 flex flex-col items-start relative">
                      <div className="md:hidden w-12 h-12 bg-primary-container border-[3px] border-on-background flex items-center justify-center font-data-lg font-black mb-4 neo-brutal-shadow">2</div>
                      <h3 className="font-headline-md text-2xl uppercase font-black mb-4 bg-white px-4 border-[3px] border-on-background inline-block">Pick a template</h3>
                      <p className="font-body-lg text-on-surface-variant max-w-sm">Choose a theme, drop in your logo, set your brand color. Takes under a minute.</p>
                      <div className="hidden md:flex absolute -left-[46px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white border-[4px] border-on-background items-center justify-center font-data-lg font-black z-10">2</div>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn delay={0.3}>
                  <div className="md:grid grid-cols-2 gap-16 items-center md:mt-24">
                    <div className="md:text-right flex flex-col items-start md:items-end mb-8 md:mb-0 relative">
                      <div className="md:hidden w-12 h-12 bg-primary-container border-[3px] border-on-background flex items-center justify-center font-data-lg font-black mb-4 neo-brutal-shadow">3</div>
                      <h3 className="font-headline-md text-2xl uppercase font-black mb-4 bg-white px-4 border-[3px] border-on-background inline-block">Send the link</h3>
                      <p className="font-body-lg text-on-surface-variant max-w-sm">Your client gets a clean, branded invoice page — no PDF attachments required.</p>
                      <div className="hidden md:flex absolute -right-[46px] top-1/2 -translate-y-1/2 w-12 h-12 bg-primary-container border-[4px] border-on-background items-center justify-center font-data-lg font-black z-10">3</div>
                    </div>
                    <div className="bg-white border-[4px] border-on-background p-2 neo-brutal-shadow-lg rotate-1 hover:rotate-0 transition-transform">
                      <div className="bg-surface-container border-[2px] border-on-background flex items-center p-3 gap-3">
                        <div className="w-4 h-4 rounded-full border-[2px] border-on-background bg-error"></div>
                        <div className="w-4 h-4 rounded-full border-[2px] border-on-background bg-primary-container"></div>
                        <div className="w-4 h-4 rounded-full border-[2px] border-on-background bg-[#008A00]"></div>
                        <div className="flex-1 bg-white border-[2px] border-on-background h-8 flex items-center px-3 font-data-md truncate">
                          voicy.com/pay/inv-0192-x7f
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn delay={0.4}>
                  <div className="md:grid grid-cols-2 gap-16 items-center md:mt-24">
                    <div className="order-2 md:order-1 bg-on-background text-white border-[4px] border-on-background p-8 neo-brutal-shadow-lg -rotate-1 hover:rotate-0 transition-transform flex flex-col items-center justify-center mt-8 md:mt-0 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #FACC15 0, #FACC15 2px, transparent 2px, transparent 8px)' }}></div>
                      <div className="w-20 h-20 bg-primary-container rounded-full border-[4px] border-on-background flex items-center justify-center text-on-background z-10 mb-4 animate-bounce">
                        <DollarSign size={40} />
                      </div>
                      <span className="font-headline-md uppercase font-black z-10 text-center">Paid<br/>Successfully</span>
                    </div>
                    <div className="order-1 md:order-2 flex flex-col items-start relative">
                      <div className="md:hidden w-12 h-12 bg-primary-container border-[3px] border-on-background flex items-center justify-center font-data-lg font-black mb-4 neo-brutal-shadow">4</div>
                      <h3 className="font-headline-md text-2xl uppercase font-black mb-4 bg-white px-4 border-[3px] border-on-background inline-block">Get paid, get notified</h3>
                      <p className="font-body-lg text-on-surface-variant max-w-sm">Status flips to Paid automatically. Your dashboard updates in real time.</p>
                      <div className="hidden md:flex absolute -left-[46px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white border-[4px] border-on-background items-center justify-center font-data-lg font-black z-10">4</div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b-[3px] border-on-background flex flex-col lg:flex-row bg-background">
          <div className="lg:w-1/2 p-margin-desktop border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-on-background flex flex-col justify-center">
            <FadeIn>
              <span className="font-label-caps uppercase text-primary border-[2px] border-primary px-3 py-1 mb-6 inline-block">Invoice Designer</span>
              <h2 className="font-headline-lg text-4xl uppercase font-black mb-6">Brand it once. It carries through every invoice you send.</h2>
              <p className="font-body-lg text-on-surface-variant mb-10 max-w-md">
                Three starting themes, full control over color, font, and layout — saved as a template so your whole team sends invoices that match.
              </p>
              
              <div className="flex flex-col gap-4">
                <div className="border-[3px] border-on-background p-4 flex justify-between items-center group hover:bg-primary-container transition-colors cursor-pointer neo-brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:neo-brutal-shadow-active">
                  <div>
                    <span className="font-headline-md text-xl block uppercase font-black">Ledger</span>
                    <span className="font-data-md opacity-70">Minimal · serif</span>
                  </div>
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </div>
                <div className="border-[3px] border-on-background p-4 flex justify-between items-center bg-on-background text-white group cursor-pointer neo-brutal-shadow">
                  <div>
                    <span className="font-headline-md text-xl block uppercase font-black">Studio</span>
                    <span className="font-data-md opacity-70">Bold · geometric</span>
                  </div>
                  <CheckCircle2 className="text-primary-container" />
                </div>
                <div className="border-[3px] border-on-background p-4 flex justify-between items-center group hover:bg-surface-dim transition-colors cursor-pointer neo-brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:neo-brutal-shadow-active">
                  <div>
                    <span className="font-headline-md text-xl block uppercase font-black">Slate</span>
                    <span className="font-data-md opacity-70">Corporate · clean</span>
                  </div>
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </FadeIn>
          </div>
          <div className="lg:w-1/2 p-margin-desktop bg-[#f0f0f0] flex items-center justify-center pattern-grid relative overflow-hidden">
             <motion.div 
               whileHover={{ scale: 1.05, rotate: 1 }}
               className="w-full max-w-md bg-white border-[4px] border-on-background p-8 neo-brutal-shadow-lg"
             >
               <div className="flex justify-between items-center border-b-[4px] border-on-background pb-6 mb-6">
                 <div className="w-16 h-16 bg-on-background rounded-full flex items-center justify-center text-white font-headline-lg">S</div>
                 <div className="text-right">
                   <h2 className="font-headline-lg text-3xl font-black uppercase">INVOICE</h2>
                   <p className="font-data-md">#0042</p>
                 </div>
               </div>
               <div className="space-y-4 mb-8">
                 <div className="h-4 bg-surface-dim w-3/4"></div>
                 <div className="h-4 bg-surface-dim w-1/2"></div>
               </div>
               <div className="border-[2px] border-on-background p-4 bg-primary-container font-headline-md text-xl text-center uppercase font-black">
                 Total: Rs 150,000
               </div>
             </motion.div>
          </div>
        </section>

        <section className="border-b-[3px] border-on-background flex flex-col-reverse lg:flex-row bg-background">
          <div className="lg:w-1/2 bg-surface-dim p-margin-desktop flex items-center justify-center relative overflow-hidden border-r-0 lg:border-r-[3px] border-on-background">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="w-full max-w-md bg-white border-[4px] border-on-background neo-brutal-shadow-lg"
            >
              <div className="border-b-[3px] border-on-background bg-on-background text-white p-4">
                <span className="font-headline-md text-xl uppercase font-black block">Salary slip</span>
                <span className="font-data-md opacity-80">June 2026 · Employee #0412</span>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 pb-2 border-b-[2px] border-on-background border-dashed">
                  <span className="font-label-caps uppercase bg-[#E5F6E5] text-[#008A00] border-[2px] border-on-background px-2">PROCESSED</span>
                </div>
                <div className="space-y-4 font-data-md">
                  <div className="flex justify-between">
                    <span>Base salary</span>
                    <span className="font-bold">Rs 145,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport allowance</span>
                    <span>Rs 8,000</span>
                  </div>
                  <div className="flex justify-between border-b-[2px] border-on-background pb-4">
                    <span>Performance bonus</span>
                    <span>Rs 12,000</span>
                  </div>
                  <div className="flex justify-between text-error pt-2">
                    <span>Tax withheld</span>
                    <span>− Rs 14,200</span>
                  </div>
                  <div className="flex justify-between text-error border-b-[3px] border-on-background pb-4">
                    <span>Provident fund</span>
                    <span>− Rs 7,250</span>
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-center bg-primary-container border-[3px] border-on-background p-4">
                  <span className="font-headline-md text-xl uppercase font-black">NET PAY</span>
                  <span className="font-data-lg text-2xl font-black">Rs 143,550</span>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="lg:w-1/2 p-margin-desktop flex flex-col justify-center bg-primary-container">
            <FadeIn>
              <h2 className="font-headline-lg text-4xl uppercase font-black mb-6 border-b-[4px] border-on-background pb-6 inline-block">PAYROLL &<br/>SALARY SLIPS</h2>
              <p className="font-headline-md text-2xl mb-10 max-w-md italic">
                Payroll day shouldn't take three days.
              </p>
              
              <div className="flex flex-col gap-6">
                <div className="flex gap-4 items-start bg-white p-4 border-[3px] border-on-background neo-brutal-shadow">
                  <div className="mt-1"><CheckCircle2 className="text-[#008A00] fill-[#E5F6E5]" size={24}/></div>
                  <div>
                    <h4 className="font-headline-md text-lg uppercase font-black">Run payroll in one batch</h4>
                    <p className="font-body-md text-on-surface-variant">Process every employee's salary for the month with a single action.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-white p-4 border-[3px] border-on-background neo-brutal-shadow">
                  <div className="mt-1"><CheckCircle2 className="text-[#008A00] fill-[#E5F6E5]" size={24}/></div>
                  <div>
                    <h4 className="font-headline-md text-lg uppercase font-black">Allowances and deductions handled</h4>
                    <p className="font-body-md text-on-surface-variant">Set rules once — overtime, tax, loans — and they apply automatically each cycle.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-white p-4 border-[3px] border-on-background neo-brutal-shadow">
                  <div className="mt-1"><CheckCircle2 className="text-[#008A00] fill-[#E5F6E5]" size={24}/></div>
                  <div>
                    <h4 className="font-headline-md text-lg uppercase font-black">Salary slips, generated and ready</h4>
                    <p className="font-body-md text-on-surface-variant">Every employee gets a clean, downloadable PDF slip the moment payroll runs.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-white p-4 border-[3px] border-on-background neo-brutal-shadow">
                  <div className="mt-1"><CheckCircle2 className="text-[#008A00] fill-[#E5F6E5]" size={24}/></div>
                  <div>
                    <h4 className="font-headline-md text-lg uppercase font-black">A full history, always auditable</h4>
                    <p className="font-body-md text-on-surface-variant">Every past payroll run and slip stays on record — searchable by employee or month.</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="border-b-[3px] border-on-background">
          <div className="grid grid-cols-2 md:grid-cols-4 border-b-[3px] border-on-background bg-on-background gap-[3px]">
            <div className="bg-white p-8 flex flex-col gap-4 items-center text-center">
              <span className="font-display-lg text-5xl md:text-6xl text-primary font-black">200+</span>
              <span className="font-body-md uppercase font-bold text-on-surface-variant max-w-[150px]">businesses running invoicing & payroll</span>
            </div>
            <div className="bg-white p-8 flex flex-col gap-4 items-center text-center">
              <span className="font-display-lg text-5xl md:text-6xl text-primary font-black">4,000+</span>
              <span className="font-body-md uppercase font-bold text-on-surface-variant max-w-[150px]">employees paid every month</span>
            </div>
            <div className="bg-white p-8 flex flex-col gap-4 items-center text-center">
              <span className="font-display-lg text-5xl md:text-6xl text-primary font-black">11m</span>
              <span className="font-body-md uppercase font-bold text-on-surface-variant max-w-[150px]">average time saved per invoice</span>
            </div>
            <div className="bg-white p-8 flex flex-col gap-4 items-center text-center">
              <span className="font-display-lg text-5xl md:text-6xl text-primary font-black">98%</span>
              <span className="font-body-md uppercase font-bold text-on-surface-variant max-w-[150px]">payroll runs without correction</span>
            </div>
          </div>
          
          <div className="bg-surface-container-low p-margin-desktop flex justify-center py-24">
            <FadeIn className="max-w-4xl w-full">
              <div className="bg-white border-[4px] border-on-background p-10 md:p-16 neo-brutal-shadow-lg relative">
                <div className="absolute -top-10 -left-6 text-[120px] font-display-lg text-primary-container leading-none select-none">"</div>
                <p className="font-headline-md text-2xl md:text-4xl leading-relaxed relative z-10 font-black mb-12">
                  We used to lose half a day every month formatting salary slips in Word. Now payroll runs before lunch, and our invoices finally look like we know what we're doing.
                </p>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-on-background rounded-full flex items-center justify-center border-[3px] border-primary-container">
                    <span className="font-headline-md text-white">SA</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-xl uppercase font-black">Sara Ahmed</h4>
                    <p className="font-data-md text-on-surface-variant">Finance Lead, Cedarline Apparel</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="bg-background py-24 border-b-[3px] border-on-background relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-container opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="px-margin-desktop max-w-7xl mx-auto relative z-10">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="font-headline-lg text-5xl md:text-6xl uppercase font-black mb-4">Priced for the size you are now.</h2>
                <p className="font-body-lg text-xl text-on-surface-variant max-w-2xl mx-auto">Start free. Upgrade only once your team or client list outgrows it.</p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              <FadeIn delay={0.1}>
                <div className="bg-white border-[4px] border-on-background p-8 flex flex-col h-full neo-brutal-shadow hover:-translate-y-2 transition-transform">
                  <h3 className="font-headline-md text-2xl uppercase font-black border-b-[3px] border-on-background pb-4 mb-4">Starter</h3>
                  <p className="font-body-md text-on-surface-variant h-12 mb-6">For freelancers and solo operators</p>
                  <div className="mb-8">
                    <span className="font-display-lg text-5xl font-black">Free</span>
                    <span className="font-label-caps block mt-2 text-on-surface-variant">FOREVER</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1 font-body-md font-bold">
                    <li className="flex items-center gap-3"><Check size={20} className="text-primary" /> Up to 10 invoices / month</li>
                    <li className="flex items-center gap-3"><Check size={20} className="text-primary" /> 1 invoice template</li>
                    <li className="flex items-center gap-3"><Check size={20} className="text-primary" /> Up to 3 employees</li>
                    <li className="flex items-center gap-3"><Check size={20} className="text-primary" /> Basic dashboard</li>
                  </ul>
                  <button className="w-full py-4 font-label-caps text-lg border-[3px] border-on-background bg-white hover:bg-surface-container-highest neo-brutal-shadow hover:neo-brutal-shadow-active transition-all uppercase font-black">
                    Get started
                  </button>
                </div>
              </FadeIn>

              <FadeIn delay={0.2} className="relative z-10">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-on-background text-primary-container px-4 py-1 font-label-caps uppercase border-[2px] border-on-background whitespace-nowrap z-20">MOST POPULAR</div>
                <div className="bg-primary-container border-[4px] border-on-background p-8 pt-10 flex flex-col h-[105%] neo-brutal-shadow-lg scale-105 md:scale-110 mb-2 md:mb-0 transform hover:-translate-y-2 transition-transform">
                  <h3 className="font-headline-md text-2xl uppercase font-black border-b-[3px] border-on-background pb-4 mb-4">Growth</h3>
                  <p className="font-body-md text-on-surface-variant h-12 mb-6 text-on-background font-bold">For small businesses scaling up</p>
                  <div className="mb-8">
                    <span className="font-display-lg text-5xl font-black">Rs 4,500</span>
                    <span className="font-label-caps block mt-2">BILLED MONTHLY</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1 font-body-md font-bold">
                    <li className="flex items-center gap-3"><Check size={20} className="text-on-background" /> Unlimited invoices</li>
                    <li className="flex items-center gap-3"><Check size={20} className="text-on-background" /> All invoice templates</li>
                    <li className="flex items-center gap-3"><Check size={20} className="text-on-background" /> Up to 50 employees</li>
                    <li className="flex items-center gap-3"><Check size={20} className="text-on-background" /> Full payroll & salary slips</li>
                    <li className="flex items-center gap-3"><Check size={20} className="text-on-background" /> Analytics dashboard</li>
                  </ul>
                  <button className="w-full py-4 font-label-caps text-lg border-[3px] border-on-background bg-on-background text-white neo-brutal-shadow-lg hover:neo-brutal-shadow-active transition-all uppercase font-black">
                    Start free trial
                  </button>
                </div>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="bg-white border-[4px] border-on-background p-8 flex flex-col h-full neo-brutal-shadow hover:-translate-y-2 transition-transform">
                  <h3 className="font-headline-md text-2xl uppercase font-black border-b-[3px] border-on-background pb-4 mb-4">Business</h3>
                  <p className="font-body-md text-on-surface-variant h-12 mb-6">For multi-team, multi-company ops</p>
                  <div className="mb-8">
                    <span className="font-display-lg text-5xl font-black">Custom</span>
                    <span className="font-label-caps block mt-2 text-on-surface-variant">TALK TO US</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1 font-body-md font-bold">
                    <li className="flex items-center gap-3"><Check size={20} className="text-primary" /> Everything in Growth</li>
                    <li className="flex items-center gap-3"><Check size={20} className="text-primary" /> Unlimited employees</li>
                    <li className="flex items-center gap-3"><Check size={20} className="text-primary" /> Multi-company support</li>
                    <li className="flex items-center gap-3"><Check size={20} className="text-primary" /> Role-based access control</li>
                    <li className="flex items-center gap-3"><Check size={20} className="text-primary" /> Priority support</li>
                  </ul>
                  <button className="w-full py-4 font-label-caps text-lg border-[3px] border-on-background bg-white hover:bg-surface-container-highest neo-brutal-shadow hover:neo-brutal-shadow-active transition-all uppercase font-black">
                    Contact sales
                  </button>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <section className="py-24 px-margin-desktop flex flex-col items-center text-center bg-on-background text-background relative overflow-hidden border-b-[3px] border-on-background">
          <div className="absolute inset-0 pattern-grid opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="font-display-lg text-5xl md:text-7xl mb-8 max-w-4xl uppercase font-black leading-none">
              Send your next invoice in under two minutes.
            </h2>
            <p className="font-body-lg text-xl mb-12 max-w-2xl text-surface-variant border-l-[4px] border-primary-container pl-6 text-left">
              No credit card. No setup call. Just a cleaner way to run your back office.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
              <button className="bg-primary-container text-on-background px-12 py-5 font-label-caps text-[20px] border-[4px] border-primary-container hover:bg-white hover:border-white transition-all uppercase font-black w-full sm:w-auto shadow-[8px_8px_0_0_#FACC15] hover:shadow-[4px_4px_0_0_#ffffff] hover:translate-x-[4px] hover:translate-y-[4px]">
                Start free
              </button>
              <button className="bg-transparent text-white px-12 py-5 font-label-caps text-[20px] border-[4px] border-white hover:bg-surface-variant hover:text-on-background transition-all uppercase font-black w-full sm:w-auto">
                Book a demo
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-background flex flex-col px-margin-desktop py-16 gap-16">
        <div className="flex flex-col lg:flex-row justify-between gap-16">
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="font-headline-lg text-5xl font-black text-on-background flex items-center gap-2">
              <div className="w-12 h-12 bg-primary-container border-[4px] border-on-background flex items-center justify-center">
                <Zap size={28} className="text-on-background" />
              </div>
              Voicy
            </div>
            <p className="font-body-md text-on-surface-variant font-bold max-w-sm">
              Invoicing and payroll, built for the businesses that outgrew spreadsheets but aren't ready for enterprise software.
            </p>
          </div>
          
          <div className="lg:w-2/3 flex flex-wrap justify-between gap-10 lg:gap-20">
            <div className="flex flex-col gap-6">
              <h4 className="font-label-caps uppercase text-on-surface-variant">Product</h4>
              <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="#">Invoicing</Link>
              <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="#">Invoice designer</Link>
              <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="#">Payroll</Link>
              <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="#">Pricing</Link>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="font-label-caps uppercase text-on-surface-variant">Company</h4>
              <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="#">About</Link>
              <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="#">Careers</Link>
              <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="#">Contact</Link>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="font-label-caps uppercase text-on-surface-variant">Resources</h4>
              <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="#">Help center</Link>
              <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="#">API docs</Link>
              <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="#">Security</Link>
            </div>
          </div>
        </div>
        
        <div className="border-t-[3px] border-on-background pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-label-caps text-on-surface-variant uppercase font-bold">
            © 2026 Voicy. Built for precision.
          </div>
          <div className="flex gap-6">
            <Link className="font-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors font-bold" href="#">Terms</Link>
            <Link className="font-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors font-bold" href="#">Privacy</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

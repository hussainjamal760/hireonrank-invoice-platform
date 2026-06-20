"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 w-full z-50 bg-background border-b-[3px] border-on-background flex justify-between items-center px-margin-desktop py-4">
        <Link href="/" className="font-headline-md text-headline-md font-black italic text-on-background flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-container border-[3px] border-on-background flex items-center justify-center">
            <Zap size={20} className="text-on-background" />
          </div>
          Voicy
        </Link>
        <div className="hidden md:flex gap-8">
          <Link className="font-body-md text-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors duration-200" href="/platform">Platform</Link>
          <Link className="font-body-md text-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors duration-200" href="/design">Design</Link>
          <Link className="font-body-md text-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors duration-200" href="/payroll">Payroll</Link>
          <Link className="font-body-md text-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors duration-200" href="/pricing">Pricing</Link>
        </div>
        <div className="hidden md:flex gap-4 items-center">
          <Link className="font-body-md uppercase font-bold tracking-tighter text-on-background hover:text-primary transition-colors" href="/login">Log in</Link>
          <Link href="/signup" className="bg-primary-container text-on-primary-container px-6 py-2 font-label-caps text-label-caps border-[3px] border-on-background neo-brutal-shadow hover:neo-brutal-shadow-active hover:translate-x-[2px] hover:translate-y-[2px] transition-all inline-block">
            Start Free
          </Link>
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
              <Link onClick={() => setIsMenuOpen(false)} className="font-headline-md text-2xl uppercase font-black" href="/platform">Platform</Link>
              <Link onClick={() => setIsMenuOpen(false)} className="font-headline-md text-2xl uppercase font-black" href="/design">Design</Link>
              <Link onClick={() => setIsMenuOpen(false)} className="font-headline-md text-2xl uppercase font-black" href="/payroll">Payroll</Link>
              <Link onClick={() => setIsMenuOpen(false)} className="font-headline-md text-2xl uppercase font-black" href="/pricing">Pricing</Link>
              <div className="flex flex-col gap-4 mt-4 border-t-[3px] border-on-background pt-6">
                <Link onClick={() => setIsMenuOpen(false)} className="font-headline-md text-xl uppercase font-black text-center" href="/login">Log in</Link>
                <Link onClick={() => setIsMenuOpen(false)} href="/signup" className="bg-primary-container text-on-background w-full py-4 font-label-caps text-lg border-[3px] border-on-background neo-brutal-shadow uppercase font-black text-center block">
                  Start Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

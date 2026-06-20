import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-background flex flex-col px-margin-desktop py-16 gap-16">
      <div className="flex flex-col lg:flex-row justify-between gap-16">
        <div className="lg:w-1/3 flex flex-col gap-6">
          <Link href="/" className="font-headline-lg text-5xl font-black text-on-background flex items-center gap-2">
            <div className="w-12 h-12 bg-primary-container border-[4px] border-on-background flex items-center justify-center">
              <Zap size={28} className="text-on-background" />
            </div>
            Voicy
          </Link>
          <p className="font-body-md text-on-surface-variant font-bold max-w-sm">
            Invoicing and payroll, built for the businesses that outgrew spreadsheets but aren't ready for enterprise software.
          </p>
        </div>
        
        <div className="lg:w-2/3 flex flex-wrap justify-between gap-10 lg:gap-20">
          <div className="flex flex-col gap-6">
            <h4 className="font-label-caps uppercase text-on-surface-variant">Product</h4>
            <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="/platform">Platform</Link>
            <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="/design">Invoice designer</Link>
            <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="/payroll">Payroll</Link>
            <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="/pricing">Pricing</Link>
          </div>
          <div className="flex flex-col gap-6">
            <h4 className="font-label-caps uppercase text-on-surface-variant">Company</h4>
            <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="/about">About</Link>
            <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="/careers">Careers</Link>
            <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="/contact">Contact</Link>
          </div>
          <div className="flex flex-col gap-6">
            <h4 className="font-label-caps uppercase text-on-surface-variant">Resources</h4>
            <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="/help">Help center</Link>
            <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="/api-docs">API docs</Link>
            <Link className="font-body-md font-bold uppercase hover:text-primary transition-colors" href="/security">Security</Link>
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
  );
}

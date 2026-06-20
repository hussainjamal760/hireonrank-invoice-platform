"use client";

import { motion } from "framer-motion";
import { DollarSign, FileText, Calendar } from "lucide-react";

export default function EmployeeDashboard() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b-[4px] border-black pb-4">
        <div>
          <h1 className="font-headline-lg text-4xl uppercase font-black tracking-tighter">My Dashboard</h1>
          <p className="font-body-md text-black/60 font-bold uppercase mt-1">Welcome to Voicy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ x: 4, y: 4, boxShadow: "0px 0px 0px 0px #000000" }}
          className="bg-[#f6f3ec] border-[4px] border-black p-6 shadow-[6px_6px_0_0_#000000] transition-all flex flex-col justify-between h-40"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-caps uppercase font-black text-sm tracking-wider">Salary Slips</span>
            <FileText size={24} className="text-black" />
          </div>
          <div className="font-display-md text-3xl font-black">View Slips</div>
        </motion.div>

        <motion.div 
          whileHover={{ x: 4, y: 4, boxShadow: "0px 0px 0px 0px #000000" }}
          className="bg-[#E5F6E5] border-[4px] border-black p-6 shadow-[6px_6px_0_0_#000000] transition-all flex flex-col justify-between h-40"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-caps uppercase font-black text-sm tracking-wider">Upcoming Payroll</span>
            <Calendar size={24} className="text-[#008A00]" />
          </div>
          <div className="font-display-md text-3xl font-black text-[#008A00]">Processing</div>
        </motion.div>

        <motion.div 
          whileHover={{ x: 4, y: 4, boxShadow: "0px 0px 0px 0px #000000" }}
          className="bg-[#FACC15] border-[4px] border-black p-6 shadow-[6px_6px_0_0_#000000] transition-all flex flex-col justify-between h-40"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-caps uppercase font-black text-sm tracking-wider">YTD Earnings</span>
            <DollarSign size={24} className="text-black" />
          </div>
          <div className="font-display-md text-3xl font-black">$0.00</div>
        </motion.div>
      </div>
    </div>
  );
}

import React from "react";
import { FileText, Zap } from "lucide-react";

export const BrutalistLoader = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden z-[9999] p-4 font-body-md">
      {/* Brutalist Pattern Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(black 2px, transparent 2px)', 
          backgroundSize: '30px 30px' 
        }}
      ></div>
      
      {/* Loader Container */}
      <div className="relative z-10 bg-[#FACC15] border-[6px] border-black p-8 sm:p-12 shadow-[12px_12px_0_0_#000000] flex flex-col items-center max-w-sm w-full mx-4 animate-pulse">
        
        {/* Giant Floating Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-white border-[4px] border-black shadow-[4px_4px_0_0_#000000] translate-x-3 translate-y-3"></div>
          <div className="relative bg-black text-[#FACC15] p-6 border-[4px] border-black flex items-center justify-center">
            <FileText size={64} strokeWidth={1.5} />
            <div className="absolute -bottom-4 -right-4 bg-[#FACC15] border-[3px] border-black p-1 shadow-[2px_2px_0_0_#000000]">
              <Zap size={24} className="text-black" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="font-display-lg text-3xl sm:text-4xl font-black uppercase tracking-tighter text-black text-center leading-none mb-4">
          Loading Data
        </h1>
        <p className="font-mono text-sm font-bold text-black/80 uppercase tracking-widest text-center border-t-[3px] border-black pt-4 w-full">
          Please wait...
        </p>
        
        {/* Loading Bar */}
        <div className="w-full h-4 border-[3px] border-black bg-white mt-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 bg-black animate-[pulse_1s_ease-in-out_infinite] w-full origin-left"></div>
        </div>
      </div>
    </div>
  );
};

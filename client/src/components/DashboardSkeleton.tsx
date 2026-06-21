import React from "react";

export const DashboardSkeleton = ({ 
  kpiCount = 4, 
  layout = "default" 
}: { 
  kpiCount?: number;
  layout?: "default" | "admin" | "employee" | "accountant";
}) => {
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-12 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[4px] border-black pb-6">
        <div className="flex flex-col gap-3 w-full">
          <div className="w-32 h-6 bg-black/10 border-[2px] border-black"></div>
          <div className="w-64 md:w-96 h-12 md:h-16 bg-black/10 border-[3px] border-black"></div>
        </div>
        <div className="w-32 h-12 bg-black/10 border-[3px] border-black shadow-[4px_4px_0_0_#e5e7eb] shrink-0"></div>
      </div>

      {/* KPI Stats Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${kpiCount > 4 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
        {Array.from({ length: kpiCount }).map((_, i) => (
          <div key={i} className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#e5e7eb] flex flex-col justify-between h-40">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-black/10 border-[2px] border-black"></div>
              <div className="w-16 h-6 bg-black/10 border-[2px] border-black"></div>
            </div>
            <div>
              <div className="w-24 h-4 bg-black/10 mb-2"></div>
              <div className="w-32 h-8 bg-black/10"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Lower Sections depending on layout */}
      {layout === "accountant" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#e5e7eb] flex flex-col h-[400px]">
                <div className="w-48 h-8 bg-black/10 mb-6"></div>
                <div className="flex-1 bg-black/5 border-[2px] border-black/10 border-dashed"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#e5e7eb] h-[300px]">
               <div className="w-48 h-8 bg-black/10 mb-6"></div>
               <div className="flex flex-col gap-4">
                 <div className="w-full h-12 bg-black/5 border-[2px] border-black/10"></div>
                 <div className="w-full h-12 bg-black/5 border-[2px] border-black/10"></div>
                 <div className="w-full h-12 bg-black/5 border-[2px] border-black/10"></div>
               </div>
            </div>
            <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#e5e7eb] h-[300px]">
               <div className="w-32 h-8 bg-black/10 mb-6"></div>
               <div className="w-full h-32 bg-black/5 border-[2px] border-black/10"></div>
            </div>
          </div>
        </>
      )}

      {layout === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#e5e7eb] h-[300px]">
               <div className="w-48 h-8 bg-black/10 mb-6"></div>
               <div className="flex-1 h-48 bg-black/5 border-[2px] border-black/10 border-dashed"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#e5e7eb] h-[200px]"></div>
              <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#e5e7eb] h-[200px]"></div>
            </div>
          </div>
          <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#e5e7eb] h-[525px]">
            <div className="w-32 h-8 bg-black/10 mb-6"></div>
            <div className="flex flex-col gap-4">
              <div className="w-full h-16 bg-black/5 border-[2px] border-black/10"></div>
              <div className="w-full h-16 bg-black/5 border-[2px] border-black/10"></div>
              <div className="w-full h-16 bg-black/5 border-[2px] border-black/10"></div>
            </div>
          </div>
        </div>
      )}

      {layout === "employee" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white border-[4px] border-black p-8 shadow-[8px_8px_0_0_#e5e7eb] h-48 flex flex-col justify-between">
              <div className="w-12 h-12 bg-black/10 border-[3px] border-black mb-6"></div>
              <div className="w-32 h-6 bg-black/10 mb-2"></div>
              <div className="w-full h-4 bg-black/5"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

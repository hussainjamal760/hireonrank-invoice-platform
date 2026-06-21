import React from "react";

export const TableSkeleton = ({ 
  rows = 5, 
  columns = 5 
}: { 
  rows?: number; 
  columns?: number;
}) => {
  return (
    <div className="w-full overflow-x-auto animate-pulse">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-black/5 border-b-[3px] border-black">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-4 border-r-[2px] border-black last:border-r-0">
                <div className="w-24 h-4 bg-black/10"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-[1px] divide-black">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="bg-white">
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="p-4 border-r-[2px] border-black last:border-r-0">
                  <div className="w-full max-w-[150px] h-4 bg-black/10"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

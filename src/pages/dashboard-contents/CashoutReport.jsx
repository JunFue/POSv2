import React from "react";

export function CashoutReport() {
  return (
    <div className="w-full h-full flex justify-around items-center">
      <div className="text-center">
        <p className="text-2xl font-bold">152</p>
        <p className="text-xs text-gray-400">Sales Today</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold">$4,560</p>
        <p className="text-xs text-gray-400">Revenue Today</p>
      </div>
    </div>
  );
}

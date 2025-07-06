import React from "react";

export function CashoutReport() {
  const recentCashouts = [
    { user: "Alice", amount: "$150.00" },
    { user: "Bob", amount: "$75.50" },
    { user: "Charlie", amount: "$220.10" },
    { user: "David", amount: "$99.00" },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between text-white">
      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center bg-white/5 p-3 rounded-lg">
          <p className="text-2xl font-bold">152</p>
          <p className="text-xs text-gray-400">Sales Today</p>
        </div>
        <div className="text-center bg-white/5 p-3 rounded-lg">
          <p className="text-2xl font-bold">$4,560</p>
          <p className="text-xs text-gray-400">Revenue Today</p>
        </div>
        <div className="text-center bg-white/5 p-3 rounded-lg">
          <p className="text-2xl font-bold">23</p>
          <p className="text-xs text-gray-400">Cashouts</p>
        </div>
        <div className="text-center bg-white/5 p-3 rounded-lg">
          <p className="text-2xl font-bold">$1,890</p>
          <p className="text-xs text-gray-400">Total Cashed Out</p>
        </div>
      </div>

      {/* Recent Cashouts List */}
      <div>
        <h4 className="text-md font-semibold mb-2 border-b border-white/10 pb-1">
          Recent Cashouts
        </h4>
        <ul className="space-y-2">
          {recentCashouts.map((cashout, index) => (
            <li key={index} className="flex justify-between text-sm">
              <span>{cashout.user}</span>
              <span className="font-mono">{cashout.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

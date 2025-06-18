import React from "react";

export function MonthlyTable() {
  const rows = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return {
      date: `2023-10-${day.toString().padStart(2, "0")}`,
      forwarded: (Math.random() * 1000).toFixed(2),
      cashIn: (Math.random() * 1000).toFixed(2),
      cashOut: (Math.random() * 500).toFixed(2),
      balance: (Math.random() * 2000).toFixed(2),
    };
  });

  return (
    <div className="w-full h-full p-4 custom-gradient rounded-lg border border-accent-800 shadow-md text-accent-50 font-info-text!">
      <h2 className="text-3xl mb-2">Monthly Transactions</h2>
      <div className="overflow-auto bg-white/40 backdrop-blur-md p-2 rounded">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Forwarded</th>
              <th className="border px-4 py-2">Cash-in</th>
              <th className="border px-4 py-2">Cash-out</th>
              <th className="border px-4 py-2">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{row.date}</td>
                <td className="border px-4 py-2">{row.forwarded}</td>
                <td className="border px-4 py-2">{row.cashIn}</td>
                <td className="border px-4 py-2">{row.cashOut}</td>
                <td className="border px-4 py-2">{row.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from "react";

// Helper function to generate dummy data for the table
const generateDummyData = (numRows) => {
  const data = [];
  const statuses = ["Completed", "Pending", "Failed"];
  const descriptions = [
    "Online Sale",
    "Supplier Payment",
    "Ad Spend",
    "Refund",
    "Salary",
  ];
  for (let i = 1; i <= numRows; i++) {
    data.push({
      date: `2025-07-${String(i).padStart(2, "0")}`,
      description:
        descriptions[Math.floor(Math.random() * descriptions.length)],
      amount: (Math.random() * 500 * (Math.random() > 0.5 ? 1 : -1)).toFixed(2),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  return data;
};

export function CashFlow() {
  const tableData = generateDummyData(31);

  return (
    <div className="w-full h-full flex flex-col text-body-text">
      {/* This style block hides the scrollbar on Webkit and Firefox browsers */}
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>
      {/* Mini Header Cards */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-green-500/20 p-2 rounded-lg">
          <p className="text-xs text-head-text">Inflow</p>
          <p className="font-bold text-md">$12,450.78</p>
        </div>
        <div className="bg-red-500/20 p-2 rounded-lg">
          <p className="text-xs text-head-text">Outflow</p>
          <p className="font-bold text-md">$8,231.45</p>
        </div>
        <div className="bg-blue-500/20 p-2 rounded-lg">
          <p className="text-xs text-head-text">Net Flow</p>
          <p className="font-bold text-md">$4,219.33</p>
        </div>
      </div>

      {/* Table - Added 'scrollbar-hide' to the scrollable container */}
      <div className="flex-grow overflow-auto scrollbar-hide">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 bg-white/10 backdrop-blur-sm">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Description</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {tableData.map((row, index) => (
              <tr key={index}>
                <td className="p-2 font-mono text-xs">{row.date}</td>
                <td className="p-2">{row.description}</td>
                <td
                  className={`p-2 font-mono ${
                    row.amount > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {row.amount > 0 ? `+${row.amount}` : row.amount}
                </td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      row.status === "Completed"
                        ? "bg-green-500/30 text-green-300"
                        : row.status === "Pending"
                        ? "bg-yellow-500/30 text-yellow-300"
                        : "bg-red-500/30 text-red-300"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

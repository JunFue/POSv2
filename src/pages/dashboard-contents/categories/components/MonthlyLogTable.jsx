import React from "react";

export function MonthlyLogTable({ data }) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Monthly Log</h2>
      <div className="overflow-x-auto rounded-lg shadow max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Forwarded
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cash-in
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cash-out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap">{log.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₱{log.forwarded.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600">
                  + ₱{log.cashIn.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600">
                  - ₱{log.cashOut.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  ₱{log.balance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from "react";
import LineChart from "./LineChart";
import { useCurrencyFormatter } from "./useCurrencyFormatter";

const MonthlyLog = ({ dailyData, startingBalance }) => {
  let currentBalance = startingBalance;

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-700 mt-8 mb-2">
        Monthly Log
      </h3>
      <div className="overflow-x-auto mb-4 border rounded-lg">
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-2 text-left">Date</th>
              <th className="py-2 px-2 text-right">Forwarded</th>
              <th className="py-2 px-2 text-right">Cash-In</th>
              <th className="py-2 px-2 text-right">Cash-Out</th>
              <th className="py-2 px-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {dailyData.map((data) => {
              const forwarded = currentBalance;
              const balance = forwarded + data.cashIn - data.cashOut;
              currentBalance = balance; // update for next row
              return (
                <tr
                  key={data.day}
                  className="border-b hover:bg-gray-50 last:border-0"
                >
                  <td className="py-2 px-2 text-gray-800 font-medium">{`Aug ${data.day}, 2025`}</td>
                  <td className="py-2 px-2 text-right text-gray-600">
                    {useCurrencyFormatter.format(forwarded)}
                  </td>
                  <td className="py-2 px-2 text-right text-green-600">
                    + {useCurrencyFormatter.format(data.cashIn)}
                  </td>
                  <td className="py-2 px-2 text-right text-red-600">
                    - {useCurrencyFormatter.format(data.cashOut)}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold text-blue-600">
                    {useCurrencyFormatter.format(balance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <LineChart
        dailyData={dailyData}
        label1="Cash-In"
        label2="Cash-Out"
        color1="#3b82f6"
        color2="#ef4444"
      />
    </>
  );
};

export default MonthlyLog;

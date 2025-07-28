import React from "react";

export function ItemsSoldTable({ data }) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Items Sold Today</h2>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-head-text">
          <thead className="bg-background [&>*]:text-head-text">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-head-text uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-head-text uppercase tracking-wider">
                Units Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-head-text uppercase tracking-wider">
                Total Sales
              </th>
            </tr>
          </thead>
          <tbody className="bg-background traditional-input divide-y [&>*]:text-body-text divide-head-text">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.item}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.unitsSold}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₱{item.totalSales.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

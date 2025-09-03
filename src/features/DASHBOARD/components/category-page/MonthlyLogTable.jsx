import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useMonthlyLogData } from "./hooks/useMonthlyLogData"; // Import the new hook

// Helper for currency formatting
const formatCurrency = (value) => {
  return `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function MonthlyLogTable() {
  // Get processed data directly from the new hook
  const dailyLogs = useMonthlyLogData();

  // --- ADDED CONSOLE LOG ---
  // This will show you the final computed data from the hook in your browser's developer console.
  console.log("Computed data from useMonthlyLogData:", dailyLogs);

  // Define columns (This part remains the same)
  const columns = useMemo(
    () => [
      {
        header: "Date",
        accessorKey: "date",
      },
      {
        header: "Forwarded",
        accessorKey: "forwarded",
        cell: (info) => formatCurrency(info.getValue()),
      },
      {
        header: "Cash-in",
        accessorKey: "cashIn",
        cell: (info) => (
          <span className="text-green-600">
            + {formatCurrency(info.getValue())}
          </span>
        ),
      },
      {
        header: "Cash-out",
        accessorKey: "cashOut",
        cell: (info) => (
          <span className="text-red-600">
            - {formatCurrency(info.getValue())}
          </span>
        ),
      },
      {
        header: "Balance",
        accessorKey: "balance",
        cell: (info) => (
          <span className="font-medium">{formatCurrency(info.getValue())}</span>
        ),
      },
    ],
    []
  );

  // Use the useReactTable hook (This part remains the same)
  const table = useReactTable({
    columns,
    data: dailyLogs,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Monthly Log</h2>
      <div className="overflow-x-auto rounded-lg shadow max-h-96">
        <table className="min-w-full divide-y divide-head-text">
          <thead className="bg-background sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-head-text uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-background divide-y divide-head-text traditional-input overflow-auto no-scrollbar">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-500"
                >
                  Select a date range in the settings to view the log.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useMonthlyLogData } from "./hooks/useMonthlyLogData";
import { format } from "date-fns";

// Helper for currency formatting
const formatCurrency = (value) => {
  const numberValue = parseFloat(value) || 0;
  return `₱${numberValue.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Helper for date formatting
const formatDate = (dateString) => {
  if (!dateString) return "";
  // Handles the ISO string with 'Z' from the database
  return format(new Date(dateString), "MMMM d, yyyy");
};

export function MonthlyLogTable() {
  const { dailyLogs, loading, error } = useMonthlyLogData();

  // Define columns for the table
  const columns = useMemo(
    () => [
      {
        header: "Date",
        accessorKey: "log_date",
        cell: (info) => formatDate(info.getValue()),
      },
      {
        header: "Forwarded",
        accessorKey: "forwarded",
        cell: (info) => formatCurrency(info.getValue()),
      },
      {
        header: "Cash-in",
        accessorKey: "cash_in",
        cell: (info) => (
          <span className="text-green-600">
            + {formatCurrency(info.getValue())}
          </span>
        ),
      },
      {
        header: "Cash-out",
        accessorKey: "cash_out",
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

  const table = useReactTable({
    columns,
    data: dailyLogs || [],
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="mt-8 text-center p-10">
        <p className="text-gray-500">Loading monthly logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 text-center p-10 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">Error loading data</p>
        <p className="text-red-500 text-sm mt-1">
          {error.message || "Something went wrong."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Monthly Log</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-500"
                >
                  No data available for the selected range.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
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

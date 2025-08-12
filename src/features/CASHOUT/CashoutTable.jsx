import React, { useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";
import { VirtualizedTable } from "../../components/VirtualizedTable";

// Skeleton loader component for a more polished loading state
const SkeletonRow = ({ columns }) => (
  <tr className="flex w-full">
    {columns.map((column) => (
      <td
        key={column.id || column.accessorKey}
        className="border-b border-gray-200 px-4 py-2 flex items-center"
        style={{ width: `${column.size}px` }}
      >
        <div className="h-4 bg-gray-200 rounded-md animate-pulse w-full"></div>
      </td>
    ))}
  </tr>
);

// Consistent status icon component
const StatusIcon = ({ status }) => {
  switch (status) {
    case "pending":
      return (
        <FaSpinner className="animate-spin text-gray-500" title="Sending..." />
      );
    case "synced":
      return <FaCheckCircle className="text-green-500" title="Synced" />;
    case "failed":
      return (
        <FaExclamationTriangle
          className="text-red-500"
          title="Failed to save"
        />
      );
    default:
      return null;
  }
};

export function CashoutTable({ data, loading, onDelete }) {
  const [sorting, setSorting] = React.useState([]);

  const columns = useMemo(
    () => [
      { accessorKey: "category", header: "Category", size: 150 },
      {
        accessorKey: "amount",
        header: "Amount",
        // Use Intl.NumberFormat for robust currency formatting
        cell: (info) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(info.getValue()),
        size: 120,
      },
      { accessorKey: "notes", header: "Notes", size: 250 },
      { accessorKey: "receipt_no", header: "Receipt No.", size: 120 },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <StatusIcon status={row.original.status} />
            <button
              onClick={() => onDelete(row.original.id)}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Delete"
            >
              {/* Use a consistent icon library */}
              <FaTrash />
            </button>
          </div>
        ),
        size: 100,
      },
    ],
    [onDelete]
  );

  const table = useReactTable({
    // Ensure data is always an array to prevent crashes
    data: data || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tableContainerRef = useRef(null);
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40, // Row height in pixels
    overscan: 5,
  });

  // Improved loading state with skeleton rows
  if (loading) {
    return (
      <div className="overflow-auto rounded-lg bg-white shadow-md h-[500px]">
        <table className="w-full" style={{ tableLayout: "fixed" }}>
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-4 py-3 font-medium text-gray-500 uppercase tracking-wider text-sm"
                    style={{ width: `${header.getSize()}px` }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <SkeletonRow key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Clearer empty state
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-md h-[500px] flex items-center justify-center">
        <p className="text-gray-500">
          No cashout records for the selected date(s).
        </p>
      </div>
    );
  }

  // Render the virtualized table
  return (
    <VirtualizedTable
      table={table}
      tableContainerRef={tableContainerRef}
      rowVirtualizer={rowVirtualizer}
    />
  );
}

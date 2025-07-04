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
} from "react-icons/fa";

export function CashoutTable({ data, loading, onDelete }) {
  const [sorting, setSorting] = React.useState([]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "category",
        header: ({ column }) => (
          <SortableHeader column={column}>Category</SortableHeader>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <SortableHeader column={column}>Amount</SortableHeader>
        ),
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      },
      {
        accessorKey: "notes",
        header: "Notes",
      },
      {
        accessorKey: "receiptNo",
        header: ({ column }) => (
          <SortableHeader column={column}>Receipt No.</SortableHeader>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <StatusIcon status={row.original.status} />
            <button
              onClick={() => onDelete(row.original.id)}
              className="text-red-500 hover:text-red-700"
            >
              &#x274C;
            </button>
          </div>
        ),
      },
    ],
    [onDelete]
  );

  const table = useReactTable({
    data,
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
    estimateSize: () => 40,
    overscan: 5,
  });

  if (loading) {
    return <div className="text-center p-4">Loading data...</div>;
  }

  if (!loading && data.length === 0) {
    return (
      <div className="text-center p-4 bg-background rounded-lg shadow-md">
        No cashout made on this day.
      </div>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      className="h-[500px] overflow-auto border rounded-lg"
    >
      <table className="w-full">
        <thead className="sticky top-0 bg-gray-100 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="p-2 text-left text-sm font-semibold border-b"
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
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="absolute w-full hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 border-b text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Helper component for sortable headers
const SortableHeader = ({ column, children }) => (
  <div
    onClick={column.getToggleSortingHandler()}
    className="flex items-center cursor-pointer"
  >
    {children}
    <span className="ml-2">
      {{ asc: "🔼", desc: "🔽" }[column.getIsSorted()] ?? "⇅"}
    </span>
  </div>
);

// Helper component for status icons
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

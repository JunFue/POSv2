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
        size: 150,
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <SortableHeader column={column}>Amount</SortableHeader>
        ),
        cell: (info) => {
          const value = parseFloat(info.getValue());
          return isNaN(value) ? "N/A" : `$${value.toFixed(2)}`;
        },
        size: 120,
      },
      {
        accessorKey: "notes",
        header: "Notes",
        size: 250,
      },
      {
        // --- FIX: Change accessorKey to match the database column name ---
        accessorKey: "receipt_no",
        header: ({ column }) => (
          <SortableHeader column={column}>Receipt No.</SortableHeader>
        ),
        size: 120,
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
        size: 100,
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
      className="overflow-auto rounded-lg bg-background shadow-input h-[500px]"
    >
      <table
        className="w-full text-[0.8vw] rounded-2xl"
        style={{ tableLayout: "fixed" }}
      >
        <thead className="bg-background shadow-neumorphic sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-left px-4 py-2 font-semibold text-head-text"
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
        <tbody
          className="shadow-input bg-background rounded-2xl"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: "flex",
                }}
                className="hover:bg-gray-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-b border-gray-300 px-4 py-2 truncate flex items-center"
                    style={{ width: `${cell.column.getSize()}px` }}
                  >
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

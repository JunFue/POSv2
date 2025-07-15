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

// --- NEW: Skeleton loader component ---
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

export function CashoutTable({ data, loading, onDelete }) {
  const [sorting, setSorting] = React.useState([]);

  const columns = useMemo(
    () => [
      { accessorKey: "category", header: "Category", size: 150 },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: (info) => `$${parseFloat(info.getValue()).toFixed(2)}`,
        size: 120,
      },
      { accessorKey: "notes", header: "Notes", size: 250 },
      { accessorKey: "receipt_no", header: "Receipt No.", size: 120 },
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

  // --- UPDATED: Loading state now shows a skeleton loader ---
  if (loading) {
    return (
      <div
        ref={tableContainerRef}
        className="overflow-auto rounded-lg bg-background shadow-input h-[500px]"
      >
        <table className="w-full text-[0.8vw]" style={{ tableLayout: "fixed" }}>
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
          <tbody>
            {[...Array(10)].map((_, i) => (
              <SkeletonRow key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    );
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
      <table className="w-full text-[0.8vw]" style={{ tableLayout: "fixed" }}>
        <thead className="bg-background shadow-neumorphic sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-left px-4 py-2 font-semibold text-head-text"
                  style={{ width: `${header.getSize()}px` }}
                >
                  <div
                    onClick={header.column.getToggleSortingHandler()}
                    className="flex items-center cursor-pointer"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <span className="ml-2">
                      {{ asc: "🔼", desc: "🔽" }[header.column.getIsSorted()] ??
                        "⇅"}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
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

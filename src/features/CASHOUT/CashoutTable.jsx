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
      // FIX: Added a new "Sync" column for the status indicator
      {
        id: "sync",
        header: "Sync",
        cell: ({ row }) => (
          <div className="flex justify-center items-center h-full">
            <StatusIcon status={row.original.status} />
          </div>
        ),
        size: 60,
      },
      { accessorKey: "category", header: "Category", size: 150 },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: (info) =>
          new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
          }).format(info.getValue()),
        size: 120,
      },
      { accessorKey: "notes", header: "Notes", size: 250 },
      { accessorKey: "receiptNo", header: "Receipt No.", size: 120 },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {/* FIX: Removed StatusIcon from this column */}
            <button
              onClick={() => onDelete(row.original.id)}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Delete"
            >
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

  if (loading) {
    return (
      <div className="overflow-auto shadow-input h-[500px]">
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

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-10 shadow-input h-[500px] flex items-center justify-center">
        <p className="text-head-text">
          No cashout records for the selected date(s).
        </p>
      </div>
    );
  }

  return (
    <VirtualizedTable
      table={table}
      tableContainerRef={tableContainerRef}
      rowVirtualizer={rowVirtualizer}
    />
  );
}

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaCog,
} from "react-icons/fa";
import { useState, useMemo } from "react";

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

export function StocksTable({
  stockRecords,
  onEdit,
  onDelete,
  editingRecordId,
}) {
  const [activeMenu, setActiveMenu] = useState(null); // To control which action menu is open

  const columns = useMemo(
    () => [
      {
        accessorKey: "status",
        header: "Sync",
        cell: (props) => <StatusIcon status={props.row.original.status} />,
        size: 40,
      },
      {
        accessorKey: "item",
        header: "Item",
      },
      {
        accessorKey: "packaging",
        header: "Packaging",
      },
      {
        accessorKey: "stockFlow",
        header: "Stock Flow",
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
      },
      {
        accessorKey: "notes",
        header: "Notes",
      },
      {
        accessorKey: "date",
        header: "Date",
      },
      {
        accessorKey: "isOriginal",
        header: "Row Status",
        cell: (props) =>
          props.getValue() ? (
            <span className="text-body-text">Original</span>
          ) : (
            <span className="text-head-text">Edited</span>
          ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="relative">
            <button
              onClick={() =>
                setActiveMenu(activeMenu === row.id ? null : row.id)
              }
            >
              <FaCog className="text-head-text hover:text-body-text" />
            </button>
            {activeMenu === row.id && (
              <div className="absolute right-0 z-10 w-24 bg-background border rounded">
                <button
                  onClick={() => {
                    onEdit(row.original);
                    setActiveMenu(null);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-body-text hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(row.original.id);
                    setActiveMenu(null);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ),
        size: 60,
      },
    ],
    [onEdit, onDelete, activeMenu]
  );

  const table = useReactTable({
    data: stockRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-4 p-2 bg-background rounded-xl shadow-input">
      <div className="overflow-x-auto max-w-full">
        <table className="min-w-full table-auto text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left font-semibold text-head-text uppercase tracking-wider"
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
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-500/10 rounded-lg ${
                  row.original.id === editingRecordId ? "text-head-text " : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap border-t border-gray-200/50"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

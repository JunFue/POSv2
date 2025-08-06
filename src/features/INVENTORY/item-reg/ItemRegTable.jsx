import { useState, useContext } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { FaSpinner } from "react-icons/fa";
import { ItemRegData } from "../../../context/ItemRegContext";
import { StatusIcon } from "./itemregforms-components/StatusIcon"; // Adjusted path based on common structures

export function ItemRegTable() {
  // --- MODIFIED: Get `isSyncing` from the context ---
  // The `loading` state is now only for the initial page load.
  // The `isSyncing` state is for non-blocking background refreshes.
  const { items, loading, isSyncing, deleteItem } = useContext(ItemRegData);
  const [sorting, setSorting] = useState([]);

  const columns = [
    {
      id: "status",
      header: "Sync",
      // The StatusIcon component already handles the "pending" state for optimistic updates
      cell: ({ row }) => <StatusIcon status={row.original.status} />,
      enableSorting: false,
    },
    {
      accessorKey: "barcode",
      header: "Barcode",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: (props) => <p>₱{props.getValue()}</p>,
    },
    {
      accessorKey: "packaging",
      header: "Packaging",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      id: "remove",
      header: "Remove",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          onClick={() => {
            // Using a simple confirm dialog for now.
            // Consider replacing with a custom modal for better UX.
            if (
              window.confirm(
                `Are you sure you want to delete ${row.original.name}?`
              )
            ) {
              // This calls the optimistic delete function from the hook.
              deleteItem(row.original.barcode);
            }
          }}
          className="text-red-500 hover:text-red-700"
          title="Delete Row"
        >
          ❌
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    // --- MODIFIED: Added `relative` positioning for the sync indicator ---
    <div className="flex flex-col bg-background rounded-lg p-4 relative">
      {/* --- NEW: Non-blocking sync indicator --- */}
      {/* This appears in the top-right corner without hiding the table */}
      {isSyncing && (
        <div className="absolute top-2 right-4 flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full z-10 shadow">
          <FaSpinner className="animate-spin" />
          <span>Syncing...</span>
        </div>
      )}

      {/* --- MODIFIED: Main loading state only for initial load --- */}
      {/* This ensures the table is always visible during optimistic updates */}
      {loading ? (
        <div className="text-center text-body-text text-lg py-10">
          Loading initial data...
        </div>
      ) : (
        <div className="w-full overflow-auto max-h-[70vh] grow">
          <table className="w-full text-left border-collapse table-auto text-sm">
            <thead className="sticky top-0 bg-background z-0">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-head-text cursor-pointer p-2 border-b-2 border-gray-200"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span>
                          {header.column.getIsSorted() === "asc" ? "🔼" : "🔽"}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-100">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="border-b border-gray-200 p-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

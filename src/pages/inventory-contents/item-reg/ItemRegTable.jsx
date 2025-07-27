import { useState, useContext, useMemo } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import { ItemRegData } from "../../../context/ItemRegContext";
import { supabase } from "../../../utils/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper component for status icons, similar to StocksTable
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
      // You might want to render nothing or a default state if status is not set
      return null;
  }
};

export function ItemRegTable() {
  const { items, refreshItems, loading } = useContext(ItemRegData);
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(
    () => [
      // --- 1. Add the Status column ---
      {
        accessorKey: "status",
        header: "Sync",
        cell: (props) => <StatusIcon status={props.row.original.status} />,
        size: 40,
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
        cell: (props) => <p>{`₱${props.getValue()}`}</p>,
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
        accessorKey: "remove",
        header: "Remove",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            onClick={async () => {
              // Prevent deleting items that are still pending
              if (row.original.status === "pending") {
                alert(
                  "Please wait for the item to finish syncing before deleting."
                );
                return;
              }
              try {
                const {
                  data: { session },
                } = await supabase.auth.getSession();
                if (!session) {
                  alert("You must be logged in to delete an item.");
                  return;
                }
                const token = session.access_token;

                // Use the correct ID for deletion
                const idToDelete = row.original.barcode;

                await fetch(`${BACKEND_URL}/api/item-delete/${idToDelete}`, {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                refreshItems();
              } catch (error) {
                alert(error.message);
              }
            }}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "1vw",
              color: "red",
            }}
            title="Delete Row"
          >
            ❌
          </button>
        ),
      },
    ],
    [refreshItems]
  ); // Dependency array for useMemo

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Make sure row IDs are unique, especially with temp IDs
    getRowId: (row) => row.id,
  });

  return (
    <div className="flex flex-col bg-background rounded-lg p-4">
      {loading && items.length === 0 ? (
        <div className="text-center text-body-text text-[1vw] py-4">
          Loading...
        </div>
      ) : (
        <div className="w-full overflow-auto max-h-[100vh] grow">
          <table className="w-full text-left border-collapse table-auto text-[0.8vw]">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-head-text sticky top-0 cursor-pointer bg-background p-2"
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.id !== "remove" &&
                            header.column.getCanSort() && (
                              <span className="ml-1 text-[0.8vw] text-gray-500">
                                ⇅
                              </span>
                            )}
                          {header.column.id !== "remove" &&
                            (header.column.getIsSorted() === "asc"
                              ? " 🔼"
                              : header.column.getIsSorted() === "desc"
                              ? " 🔽"
                              : "")}
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-100">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="border-b border-gray-300 p-2">
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

import { useState, useContext } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { ItemRegData } from "../../../context/ItemRegContext";
// --- 1. Import the Supabase client ---
import { supabase } from "../../../utils/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function ItemRegTable() {
  const { items, refreshItems, loading } = useContext(ItemRegData);
  const [sorting, setSorting] = useState([]);

  const columns = [
    // ... (other columns are unchanged) ...
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
      cell: (props) => <p>{props.getValue()}</p>,
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
            try {
              // --- 2. Get the user's session token ---
              const {
                data: { session },
              } = await supabase.auth.getSession();
              if (!session) {
                alert("You must be logged in to delete an item.");
                return;
              }
              const token = session.access_token;

              // --- 3. Add the Authorization header to the fetch request ---
              await fetch(
                `${BACKEND_URL}/api/item-delete/${row.original.barcode}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
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
  ];

  // ... (useReactTable hook and JSX table remain the same) ...
  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col bg-background rounded-lg p-4">
      {loading ? (
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
                      className="text-head-text sticky top-0 cursor-pointer bg-background"
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
                    <td key={cell.id} className="border-b border-gray-300">
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

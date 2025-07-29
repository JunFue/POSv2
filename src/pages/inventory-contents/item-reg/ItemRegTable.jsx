import { useState, useContext } from "react";
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
import { deleteItem } from "../../../api/itemService";

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
      // Render nothing if status is not one of the above
      return null;
  }
};

export function ItemRegTable() {
  const { items, refreshItems, loading } = useContext(ItemRegData);
  const [sorting, setSorting] = useState([]);

  const columns = [
    // --- NEW: Sync status column ---
    {
      id: "status",
      header: "Sync",
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
      accessorKey: "remove",
      header: "Remove",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          onClick={async () => {
            if (
              window.confirm(
                `Are you sure you want to delete ${row.original.name}?`
              )
            ) {
              try {
                await deleteItem(row.original.barcode);
                refreshItems();
              } catch (error) {
                alert(error.message);
              }
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
                      className="text-head-text sticky top-0 cursor-pointer bg-background p-2"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <span>
                          {header.column.getIsSorted() === "asc"
                            ? " 🔼"
                            : " 🔽"}
                        </span>
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

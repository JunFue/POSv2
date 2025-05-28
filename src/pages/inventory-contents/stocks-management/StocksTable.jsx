import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useContext } from "react";
import { StocksMgtContext } from "../../../context/StocksManagement";

export function StocksTable() {
  const stocksMgt = useContext(StocksMgtContext);
  if (!stocksMgt) {
    throw new Error("StocksTable must be used within a StocksMgtProvider");
  }
  const { stockRecords } = stocksMgt;

  const columns = [
    {
      accessorKey: "item",
      header: "Item",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "packaging",
      header: "Packaging",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "stockFlow",
      header: "Stock Flow",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: (props) => <p>{props.getValue()}</p>,
    },
  ];

  const table = useReactTable({
    data: stockRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-4 overflow-x-auto max-w-full">
      <table className="min-w-full border-collapse table-auto text-[0.8vw]">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border-b border-gray-300 bg-gray-100 px-4 py-2 text-left"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
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
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border-b border-gray-300 px-4 py-2"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

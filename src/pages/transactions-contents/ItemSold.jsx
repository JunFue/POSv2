import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useContext } from "react";
import { ItemSoldContext } from "../../context/ItemSoldContext";

export function ItemSold() {
  const columns = [
    {
      accessorKey: "barcode",
      header: "Barcode No.",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "itemName",
      header: "Item Name",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "price",
      header: "Unit Price",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "totalPrice",
      header: "Total Price",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "transactionDate",
      header: "Transaction Date",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "transactionNo",
      header: "Transaction No.",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "inCharge",
      header: "In Charge",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "costumer",
      header: "Costumer Name",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "classification",
      header: "Classification",
      cell: (props) => <p>{props.getValue()}</p>,
    },
  ];
  const { itemSold } = useContext(ItemSoldContext);
  const table = useReactTable({
    data: itemSold,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 text-[0.8vw]">
        <thead className="bg-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border-b border-gray-300 px-4 py-2 text-left"
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
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => {
                const accessor = cell.column.columnDef.accessorKey;
                const cellClass =
                  "border-b border-gray-300 px-4 py-2" +
                  ([
                    "price",
                    "quantity",
                    "totalPrice",
                    "classification",
                  ].includes(accessor)
                    ? " text-center"
                    : "");
                return (
                  <td key={cell.id} className={cellClass}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

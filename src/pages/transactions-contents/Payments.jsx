import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PaymentContext } from "../../context/PaymentContext";
import { useContext } from "react";

export function Payments() {
  const data = useContext(PaymentContext).paymentData;
  const columns = [
    {
      accessorKey: "transactionDate",
      header: "Transaction Date",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "transactionNumber",
      header: "Transaction No.",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "costumerName",
      header: "Costumer Name",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "amountToPay",
      header: "Amount To Pay",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "amountRendered",
      header: "Amount Rendered",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "change",
      header: "Change",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "inCharge",
      header: "In Charge",
      cell: (info) => info.getValue(),
    },
  ];

  const table = useReactTable({
    data,
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

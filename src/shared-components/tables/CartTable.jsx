import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";

export function CartTable() {
  const { cartData, setCartData } = useContext(CartContext);
  const columns = [
    {
      accessorKey: "barcode",
      header: "Barcode",
      cell: (props) => <p>{props.getValue()}</p>,
    },
    {
      accessorKey: "item",
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
      accessorKey: "total",
      header: "Total",
      cell: (props) => <p>{props.row.original.total()}</p>,
    },
    {
      accessorKey: "remove",
      header: "Remove",
      cell: ({ row }) => (
        <button
          onClick={() => {
            setCartData((prev) => prev.filter((_, i) => i !== row.index));
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
  const table = useReactTable({
    data: cartData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="flex flex-col mt-[0.5vw] bg-[#e0e0e0] rounded-lg shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] p-4">
      <div className="w-full overflow-auto max-h-96">
        <table className="w-full text-left border-collapse table-auto text-[0.8vw]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-gray-300 text-gray-700 bg-white sticky top-0"
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
              <tr key={row.id} className="hover:bg-gray-100">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border-b border-gray-300">
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

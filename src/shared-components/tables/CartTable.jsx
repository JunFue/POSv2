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
    <div className="flex flex-col mt-[0.5vw] bg-background rounded-lg shadow-neumorphic p-4">
      <div className="w-full overflow-auto max-h-96">
        <table className="w-full text-left border-collapse table-auto text-[1.3vw]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-head-text bg-[#f3f4f6] sticky top-0 px-4"
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
          <tbody className="shadow-input bg-[#eeeff0] rounded-2xl">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-200">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4">
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

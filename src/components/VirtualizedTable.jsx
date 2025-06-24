import { flexRender } from "@tanstack/react-table";

export function VirtualizedTable({ table, tableContainerRef, rowVirtualizer }) {
  return (
    <div
      ref={tableContainerRef}
      className="overflow-auto rounded-lg bg-background shadow-input"
      style={{ height: "600px" }}
    >
      <table
        className="w-full text-[0.8vw] rounded-2xl"
        style={{ tableLayout: "fixed" }}
      >
        <thead className="bg-background shadow-neumorphic sticky top-0 z-1">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-left px-4 py-2 font-semibold text-head-text w-[150px]"
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
        <tbody
          className="shadow-input bg-background rounded-2xl"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: "flex",
                }}
                className="hover:bg-gray-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-b border-gray-300 px-4 py-2 truncate grow-1 w-full"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

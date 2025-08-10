import { useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

export function useTableSetup(data, columns) {
  const table = useReactTable({
    data: Array.isArray(data) ? data : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [data]);

  return table;
}

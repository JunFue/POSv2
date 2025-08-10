import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

// Key for storing the user's preference in localStorage
const ROWS_PER_PAGE_KEY = "itemSold_rowsPerPage";

export function useTableSetup(data, columns, options = {}) {
  const { isManualPagination = false, pageCount = -1 } = options;

  // --- State and Persistence for Pagination ---
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    // Read the initial page size from localStorage, or default to 10
    pageSize: parseInt(localStorage.getItem(ROWS_PER_PAGE_KEY) || "10", 10),
  });

  // Effect to save the page size to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(ROWS_PER_PAGE_KEY, String(pagination.pageSize));
  }, [pagination.pageSize]);

  const table = useReactTable({
    data: Array.isArray(data) ? data : [],
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination, // Let react-table manage our pagination state
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: isManualPagination,
    pageCount: isManualPagination ? pageCount : undefined,
    autoResetPageIndex: false,
  });

  // Effect to reset to the first page when the underlying data changes
  useEffect(() => {
    table.setPageIndex(0);
  }, [data, table]);

  return table;
}

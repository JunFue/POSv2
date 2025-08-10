import React, {
  useContext,
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import { ItemSoldContext } from "../../../../context/ItemSoldContext";
import { useAuth } from "../../../AUTHENTICATION/hooks/useAuth";
import { useFetchTransactions } from "./useFetchTransactions";
import { useFilterState } from "./hooks/useFilterState";
import { useFilterWorker } from "../../../../hooks/useFilterWorker";
import { useTransactionSubscription } from "./hooks/useTransactionSubscription";

import { Filters } from "./Filters";
import { VirtualizedTable } from "../../../../components/VirtualizedTable";
import { MemoizedColumnFilterDropdown } from "./components/ColumnFilterDropdown";

// FilterableHeader component remains unchanged.
const FilterableHeader = ({
  title,
  toggleDropdown,
  isVisible,
  uniqueValues,
  filter,
  setFilter,
  closeDropdown,
}) => (
  <div className="relative">
    <span>{title}</span>
    <button onClick={toggleDropdown} className="ml-1 text-blue-500">
      &#x25BC;
    </button>
    {isVisible && (
      <MemoizedColumnFilterDropdown
        uniqueValues={uniqueValues}
        filter={filter}
        setFilter={setFilter}
        closeDropdown={closeDropdown}
      />
    )}
  </div>
);

export function ItemSold() {
  const { itemSold, setItemSold, serverOnline, setServerOnline } =
    useContext(ItemSoldContext);
  const { session } = useAuth();
  const tableContainerRef = useRef(null);

  // State Management
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [transactionNo, setTransactionNo] = useState("");
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [dateRange, setDateRange] = useState({ from: today, to: today });
  const [totalItems, setTotalItems] = useState(0);

  const { fetchTransactions, loading } = useFetchTransactions(session);

  // --- 1. Update performFetch to pass the options object directly ---
  const performFetch = useCallback(
    (fetchOptions) => {
      fetchTransactions(fetchOptions).then((response) => {
        if (response) {
          setServerOnline(true);
          setItemSold(response.data || []);
          setTotalItems(response.totalCount || 0);
        } else {
          setServerOnline(false);
        }
      });
    },
    [fetchTransactions, setItemSold, setServerOnline]
  );

  // --- 2. Make the initial background fetch SILENT ---
  useEffect(() => {
    if (session) {
      performFetch({
        page: 1,
        limit: rowsPerPage,
        startDate: today,
        endDate: today,
        transNo: "",
        isSilent: true, // This ensures no loading indicator on page load
      });
    }
  }, [session, performFetch, today, rowsPerPage]);

  // --- 3. User-driven actions are NOT silent ---
  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1);
    performFetch({
      page: 1,
      limit: rowsPerPage,
      startDate: dateRange.from,
      endDate: dateRange.to,
      transNo: transactionNo.trim(),
      // isSilent is omitted, so it defaults to false, showing the loader.
    });
  }, [performFetch, rowsPerPage, dateRange, transactionNo]);

  const handlePageChange = useCallback(
    (newPage) => {
      setCurrentPage(newPage);
      performFetch({
        page: newPage,
        limit: rowsPerPage,
        startDate: dateRange.from,
        endDate: dateRange.to,
        transNo: transactionNo.trim(),
      });
    },
    [performFetch, rowsPerPage, dateRange, transactionNo]
  );

  const handleRowsPerPageChange = useCallback(
    (newRows) => {
      setRowsPerPage(newRows);
      setCurrentPage(1);
      performFetch({
        page: 1,
        limit: newRows,
        startDate: dateRange.from,
        endDate: dateRange.to,
        transNo: transactionNo.trim(),
      });
    },
    [performFetch, dateRange, transactionNo]
  );

  const handleReset = useCallback(() => {
    const newDateRange = { from: today, to: today };
    setTransactionNo("");
    setDateRange(newDateRange);
  }, [today]);

  // --- 4. Real-time updates should also be silent ---
  const handleSubscriptionChange = useCallback(() => {
    performFetch({
      page: currentPage, // refetch the current page to see changes
      limit: rowsPerPage,
      startDate: dateRange.from,
      endDate: dateRange.to,
      transNo: transactionNo.trim(),
      isSilent: true, // Keep the update silent to avoid flashing the loader
    });
  }, [performFetch, currentPage, rowsPerPage, dateRange, transactionNo]);

  useTransactionSubscription(handleSubscriptionChange);

  // Client-side filtering & Table setup (no changes)
  const totalPages = useMemo(
    () => Math.ceil(totalItems / rowsPerPage),
    [totalItems, rowsPerPage]
  );
  const itemNameFilter = useFilterState();
  const classificationFilter = useFilterState();
  const uniqueItemNames = useMemo(
    () => Array.from(new Set((itemSold || []).map((d) => d.itemName))),
    [itemSold]
  );
  const uniqueClassifications = useMemo(
    () => Array.from(new Set((itemSold || []).map((d) => d.classification))),
    [itemSold]
  );
  const filteredData = useFilterWorker(
    itemSold,
    itemNameFilter.filter,
    classificationFilter.filter
  );

  const columns = useMemo(
    () => [
      { accessorKey: "barcode", header: "Barcode No.", size: 120 },
      {
        accessorKey: "itemName",
        header: () => (
          <FilterableHeader
            title="Item Name"
            toggleDropdown={itemNameFilter.toggleDropdown}
            isVisible={itemNameFilter.isDropdownVisible}
            uniqueValues={uniqueItemNames}
            filter={itemNameFilter.filter}
            setFilter={itemNameFilter.setFilter}
            closeDropdown={itemNameFilter.closeDropdown}
          />
        ),
        size: 250,
      },
      { accessorKey: "price", header: "Unit Price", size: 100 },
      { accessorKey: "quantity", header: "Quantity", size: 80 },
      { accessorKey: "totalPrice", header: "Total Price", size: 100 },
      { accessorKey: "transactionDate", header: "Transaction Date", size: 180 },
      { accessorKey: "transactionNo", header: "Transaction No.", size: 150 },
      { accessorKey: "inCharge", header: "In Charge", size: 150 },
      { accessorKey: "costumer", header: "Costumer Name", size: 150 },
      {
        accessorKey: "classification",
        header: () => (
          <FilterableHeader
            title="Classification"
            toggleDropdown={classificationFilter.toggleDropdown}
            isVisible={classificationFilter.isDropdownVisible}
            uniqueValues={uniqueClassifications}
            filter={classificationFilter.filter}
            setFilter={classificationFilter.setFilter}
            closeDropdown={classificationFilter.closeDropdown}
          />
        ),
        size: 120,
      },
    ],
    [
      uniqueItemNames,
      uniqueClassifications,
      itemNameFilter,
      classificationFilter,
    ]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: { cell: (props) => <p>{props.getValue()}</p> },
  });
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });
  const closeAllDropdowns = () => {
    itemNameFilter.closeDropdown();
    classificationFilter.closeDropdown();
  };

  // JSX Rendering (updated loading text)
  return (
    <div onClick={closeAllDropdowns} className="bg-background">
      {!serverOnline && (
        <div className="text-red-500 font-bold p-2 text-center">
          SERVER IS OFFLINE. DISPLAYING CACHED DATA.
        </div>
      )}
      <Filters
        onApplyFilters={handleApplyFilters}
        onReset={handleReset}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onTransactionNoChange={setTransactionNo}
        onDateRangeChange={setDateRange}
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        loading={loading}
        transactionNo={transactionNo}
        dateRange={dateRange}
      />
      <div className="relative">
        <VirtualizedTable
          table={table}
          tableContainerRef={tableContainerRef}
          rowVirtualizer={rowVirtualizer}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-50">
            <p>Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}

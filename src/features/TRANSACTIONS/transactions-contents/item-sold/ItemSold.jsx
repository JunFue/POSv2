import React, {
  useContext,
  useRef,
  useCallback,
  useState,
  useEffect,
} from "react";

// Modular hooks
import { useQueryState } from "./hooks/useQuerryState";
import { useFetchData } from "./hooks/useFetchData";
import { useFilters } from "./hooks/useFilters";
import { useColumns } from "./hooks/useColumns";
import { useTableSetup } from "./hooks/useTableSetup";
import { useVirtualRows } from "./hooks/useVirtualRows";

// UI
import { ItemSoldContext } from "../../../../context/ItemSoldContext";
import { useAuth } from "../../../AUTHENTICATION/hooks/useAuth";
import { useTodaysItemsSold } from "./hooks/useTodaysItemSold";
import { useNormalizedItems } from "./hooks/useNormalizedItem";
import { Filters } from "./Filters";
import { VirtualizedTable } from "../../../../components/VirtualizedTable";

export function ItemSold() {
  const ctx = useContext(ItemSoldContext);
  if (!ctx)
    throw new Error("ItemSoldContext.Provider is missing above <ItemSold>");

  const {
    itemSold = [],
    setItemSold,
    todaysItemSold = {},
    serverOnline,
    setServerOnline,
  } = ctx;

  const { session } = useAuth();
  const tableContainerRef = useRef(null);

  useTodaysItemsSold(); // Preload cached items

  const [readySource, setReadySource] = useState([]);

  const {
    today,
    dateRange,
    setDateRange,
    transactionNo,
    setTransactionNo,
    isViewingToday,
    resetQuery,
  } = useQueryState();

  const [totalItems, setTotalItems] = useState(0);
  const { performFetch, loading } = useFetchData(
    session,
    setItemSold,
    setServerOnline,
    setTotalItems
  );

  useEffect(() => {
    const itemsToday = todaysItemSold?.data;
    const newSource =
      isViewingToday && Array.isArray(itemsToday) && itemsToday.length > 0
        ? itemsToday
        : itemSold;

    if (newSource.length > 0) {
      setReadySource(newSource);
    } else {
      setReadySource([]);
    }
  }, [todaysItemSold, itemSold, isViewingToday]);

  const normalizedBase = useNormalizedItems({
    source: readySource,
    today,
  });

  const {
    filteredData,
    itemNameFilter,
    classificationFilter,
    uniqueItemNames,
    uniqueClassifications,
    closeAllDropdowns,
  } = useFilters(normalizedBase);

  const columns = useColumns(
    itemNameFilter,
    uniqueItemNames,
    classificationFilter,
    uniqueClassifications
  );
  const table = useTableSetup(filteredData, columns);
  const { rowVirtualizer } = useVirtualRows(table, tableContainerRef);

  const handleApplyFilters = useCallback(() => {
    if (!isViewingToday) {
      table.setPageIndex(0);
      performFetch({
        page: 1,
        limit: table.getState().pagination.pageSize,
        startDate: dateRange.from,
        endDate: dateRange.to,
        transNo: transactionNo.trim(),
      });
    }
  }, [isViewingToday, performFetch, dateRange, transactionNo, table]);

  const handleReset = useCallback(() => {
    resetQuery();
    setItemSold([]);
    table.setPageIndex(0);
  }, [resetQuery, setItemSold, table]);

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
        onPageChange={(page) => table.setPageIndex(page - 1)}
        onRowsPerPageChange={(rows) => table.setPageSize(rows)}
        onTransactionNoChange={setTransactionNo}
        onDateRangeChange={setDateRange}
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={
          isViewingToday
            ? table.getPageCount()
            : Math.ceil(totalItems / table.getState().pagination.pageSize || 1)
        }
        rowsPerPage={table.getState().pagination.pageSize}
        loading={loading && !isViewingToday}
        transactionNo={transactionNo}
        dateRange={dateRange}
      />

      <div className="relative h-[600px] overflow-auto" ref={tableContainerRef}>
        <VirtualizedTable
          table={table}
          tableContainerRef={tableContainerRef}
          rowVirtualizer={rowVirtualizer}
        />
        {loading && !isViewingToday && (
          <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-50">
            <p>Loading Historical Data...</p>
          </div>
        )}
      </div>
    </div>
  );
}

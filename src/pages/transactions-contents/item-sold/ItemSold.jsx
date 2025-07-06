import { useContext, useState, useMemo, useRef } from "react";
import { ItemSoldContext } from "../../../context/ItemSoldContext";
import { Filters } from "./Filters";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useFilterWorker } from "../../../hooks/useFilterWorker";
import { useFilterState } from "./hooks/useFilterState";
import { VirtualizedTable } from "../../../components/VirtualizedTable";
import { MemoizedColumnFilterDropdown } from "./components/ColumnFilterDropdown";

// A small component to render the filterable header, further cleaning up the column definitions.
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
  const { itemSold, setItemSold, serverOnline } = useContext(ItemSoldContext);
  const tableContainerRef = useRef(null);

  // State for pagination and loading
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Use the custom hook to manage filter state and dropdown visibility
  const itemNameFilter = useFilterState();
  const classificationFilter = useFilterState();

  // Memoize unique values for dropdowns
  const uniqueItemNames = useMemo(
    () => Array.from(new Set((itemSold || []).map((d) => d.itemName))),
    [itemSold]
  );
  const uniqueClassifications = useMemo(
    () => Array.from(new Set((itemSold || []).map((d) => d.classification))),
    [itemSold]
  );

  // Get filtered data using the worker hook
  const filteredData = useFilterWorker(
    itemSold,
    itemNameFilter.filter,
    classificationFilter.filter
  );

  const handleServerData = (response) => {
    setItemSold(response.data);
    setTotalItems(response.totalCount);
  };

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
    // Simple cells are now default, so we don't need to define them unless they're special.
    defaultColumn: {
      cell: (props) => <p>{props.getValue()}</p>,
    },
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

  return (
    <div onClick={closeAllDropdowns} className="bg-background">
      {!serverOnline && (
        <div className="text-red-500 font-bold p-2">SERVER IS OFFLINE</div>
      )}
      <Filters
        onFilter={handleServerData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        loading={loading}
        setLoading={setLoading}
      />
      <div className="relative">
        <VirtualizedTable
          table={table}
          tableContainerRef={tableContainerRef}
          rowVirtualizer={rowVirtualizer}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background shadow-input bg-opacity-50">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}

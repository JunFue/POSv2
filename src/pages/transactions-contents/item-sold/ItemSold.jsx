import {
  useContext,
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  memo,
} from "react";
import { ItemSoldContext } from "../../../context/ItemSoldContext";
import { Filters } from "./Filters";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useFilterWorker } from "../../../hooks/useFilterWorker";
import { VirtualizedTable } from "../../../components/VirtualizedTable";
import { useDebounce } from "../../../hooks/useDebounce";

// Memoized ColumnFilterDropdown remains here for now.
const MemoizedColumnFilterDropdown = memo(ColumnFilterDropdown);

export function ItemSold() {
  const { itemSold, setItemSold, serverOnline } = useContext(ItemSoldContext);
  const [showItemNameDropdown, setShowItemNameDropdown] = useState(false);
  const [itemNameFilter, setItemNameFilter] = useState({
    search: "",
    selected: [],
    sort: null,
  });
  const [classificationFilter, setClassificationFilter] = useState({
    search: "",
    selected: [],
    sort: null,
  });
  const [showClassificationDropdown, setShowClassificationDropdown] =
    useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Obtain filtered data using the custom hook.
  const filteredData = useFilterWorker(
    itemSold,
    itemNameFilter,
    classificationFilter
  );
  const tableContainerRef = useRef(null);

  const handleServerData = (response) => {
    setItemSold(response.data);
    setTotalItems(response.totalCount);
  };

  // Memoize unique values for dropdowns.
  const uniqueItemNames = useMemo(() => {
    return Array.from(new Set((itemSold || []).map((d) => d.itemName)));
  }, [itemSold]);
  const uniqueClassifications = useMemo(() => {
    return Array.from(new Set((itemSold || []).map((d) => d.classification)));
  }, [itemSold]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "barcode",
        header: "Barcode No.",
        cell: (props) => <p>{props.getValue()}</p>,
        size: 120,
      },
      {
        accessorKey: "itemName",
        header: () => (
          <div className="relative">
            <span>Item Name</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowItemNameDropdown((prev) => !prev);
              }}
              className="ml-1 text-blue-500"
            >
              &#x25BC;
            </button>
            {showItemNameDropdown && (
              <MemoizedColumnFilterDropdown
                uniqueValues={uniqueItemNames}
                filter={itemNameFilter}
                setFilter={setItemNameFilter}
                closeDropdown={() => setShowItemNameDropdown(false)}
              />
            )}
          </div>
        ),
        cell: (props) => <p>{props.getValue()}</p>,
        size: 250,
      },
      {
        accessorKey: "price",
        header: "Unit Price",
        cell: (props) => <p>{props.getValue()}</p>,
        size: 100,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: (props) => <p>{props.getValue()}</p>,
        size: 80,
      },
      {
        accessorKey: "totalPrice",
        header: "Total Price",
        cell: (props) => <p>{props.getValue()}</p>,
        size: 100,
      },
      {
        accessorKey: "transactionDate",
        header: "Transaction Date",
        cell: (props) => <p>{props.getValue()}</p>,
        size: 180,
      },
      {
        accessorKey: "transactionNo",
        header: "Transaction No.",
        cell: (props) => <p>{props.getValue()}</p>,
        size: 150,
      },
      {
        accessorKey: "inCharge",
        header: "In Charge",
        cell: (props) => <p>{props.getValue()}</p>,
        size: 150,
      },
      {
        accessorKey: "costumer",
        header: "Costumer Name",
        cell: (props) => <p>{props.getValue()}</p>,
        size: 150,
      },
      {
        accessorKey: "classification",
        header: () => (
          <div className="relative">
            <span>Classification</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowClassificationDropdown((prev) => !prev);
              }}
              className="ml-1 text-blue-500"
            >
              &#x25BC;
            </button>
            {showClassificationDropdown && (
              <MemoizedColumnFilterDropdown
                uniqueValues={uniqueClassifications}
                filter={classificationFilter}
                setFilter={setClassificationFilter}
                closeDropdown={() => setShowClassificationDropdown(false)}
              />
            )}
          </div>
        ),
        cell: (props) => <p>{props.getValue()}</p>,
        size: 120,
      },
    ],
    [
      uniqueItemNames,
      uniqueClassifications,
      itemNameFilter,
      classificationFilter,
      showItemNameDropdown,
      showClassificationDropdown,
    ]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  return (
    <div
      onClick={() => {
        setShowItemNameDropdown(false);
        setShowClassificationDropdown(false);
      }}
      className="bg-background"
    >
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

function ColumnFilterDropdown({
  uniqueValues,
  filter,
  setFilter,
  closeDropdown,
}) {
  const [tempFilter, setTempFilter] = useState(filter);
  const debouncedSearch = useDebounce(tempFilter.search, 300);
  const dropdownRef = useRef(null);

  const filteredOptions = useMemo(
    () =>
      uniqueValues.filter((val) =>
        String(val).toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [uniqueValues, debouncedSearch]
  );

  const toggleSelection = useCallback(
    (value) => {
      const { selected } = tempFilter;
      const newSelected = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      setTempFilter({ ...tempFilter, selected: newSelected });
    },
    [tempFilter]
  );

  const selectAll = () =>
    setTempFilter({ ...tempFilter, selected: [...uniqueValues] });
  const clearSelection = () => setTempFilter({ ...tempFilter, selected: [] });

  const handleApply = () => {
    setFilter(tempFilter);
    closeDropdown();
  };

  const handleCancel = () => {
    closeDropdown();
  };

  const handleSort = (direction) => {
    setTempFilter({ ...tempFilter, sort: direction });
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDropdown]);

  return (
    <div
      ref={dropdownRef}
      className="absolute z-20 w-56 p-3 bg-white border rounded shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between mb-2">
        <button
          onClick={() => handleSort("asc")}
          className={`text-sm p-1 rounded w-full text-center ${
            tempFilter.sort === "asc"
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-100"
          }`}
        >
          Sort A-Z
        </button>
        <button
          onClick={() => handleSort("desc")}
          className={`text-sm p-1 rounded w-full text-center ml-1 ${
            tempFilter.sort === "desc"
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-100"
          }`}
        >
          Sort Z-A
        </button>
      </div>
      <input
        type="text"
        placeholder="Search..."
        value={tempFilter.search}
        onChange={(e) =>
          setTempFilter({ ...tempFilter, search: e.target.value })
        }
        className="mb-2 p-1 border rounded text-sm w-full"
      />
      <div className="flex justify-between mb-2">
        <button onClick={selectAll} className="text-sm text-blue-500">
          Select All
        </button>
        <button onClick={clearSelection} className="text-sm text-blue-500">
          Clear
        </button>
      </div>
      <div className="max-h-40 overflow-y-auto mb-2 border-t border-b py-1">
        {filteredOptions.map((val) => (
          <label
            key={val}
            className="flex items-center text-sm p-1 rounded hover:bg-gray-100"
          >
            <input
              type="checkbox"
              checked={tempFilter.selected.includes(val)}
              onChange={() => toggleSelection(val)}
              className="mr-2"
            />
            <span>{val || "(Blanks)"}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end mt-2">
        <button
          onClick={handleCancel}
          className="mr-2 text-sm text-gray-600 px-3 py-1 rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="text-sm text-white bg-green-600 px-3 py-1 rounded hover:bg-green-700"
        >
          OK
        </button>
      </div>
    </div>
  );
}

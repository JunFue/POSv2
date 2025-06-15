import {
  useContext,
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  memo,
} from "react";
import { ItemSoldContext } from "../../context/ItemSoldContext";
import { Filters } from "./Filters";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDebounce } from "../../hooks/useDebounce";

// Define the worker code as a string. This code will run in a separate thread.
const workerCode = `
  self.onmessage = function(e) {
    const { data, itemNameFilter, classificationFilter } = e.data;

    // Helper function to apply the item name filter and sorting
    const applyItemNameFilter = (d) => {
      let filtered = d;
      if (itemNameFilter.selected.length > 0) {
        filtered = filtered.filter((item) =>
          itemNameFilter.selected.includes(item.itemName)
        );
      }
      if (itemNameFilter.sort === "asc") {
        filtered = [...filtered].sort((a, b) =>
          String(a.itemName).localeCompare(String(b.itemName))
        );
      } else if (itemNameFilter.sort === "desc") {
        filtered = [...filtered].sort((a, b) =>
          String(b.itemName).localeCompare(String(a.itemName))
        );
      }
      return filtered;
    };

    // Helper function to apply the classification filter and sorting
    const applyClassificationFilter = (d) => {
      let filtered = d;
      if (classificationFilter.selected.length > 0) {
        filtered = filtered.filter((item) =>
          classificationFilter.selected.includes(item.classification)
        );
      }
      if (classificationFilter.sort === "asc") {
        filtered = [...filtered].sort((a, b) =>
          String(a.classification).localeCompare(String(b.classification))
        );
      } else if (classificationFilter.sort === "desc") {
        filtered = [...filtered].sort((a, b) =>
          String(b.classification).localeCompare(String(a.classification))
        );
      }
      return filtered;
    };

    // Apply filters sequentially and post the result back to the main thread
    let result = applyItemNameFilter(data || []);
    result = applyClassificationFilter(result);
    self.postMessage(result);
  };
`;

// Memoized ColumnFilterDropdown for performance
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

  // State for the data that will be displayed in the table. Initialize as empty.
  const [filteredData, setFilteredData] = useState([]);
  const tableContainerRef = useRef(null);

  // This effect handles all data and filter changes.
  useEffect(() => {
    // Create a new worker for each filtering task.
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));

    // Listen for messages (the filtered data) from the worker.
    worker.onmessage = (e) => {
      setFilteredData(e.data);
    };

    // Post the raw data and current filters to the worker to start the job.
    worker.postMessage({
      data: itemSold || [],
      itemNameFilter,
      classificationFilter,
    });

    // Cleanup: Terminate the worker when the effect re-runs or the component unmounts.
    return () => {
      worker.terminate();
    };
  }, [itemSold, itemNameFilter, classificationFilter]); // Re-run whenever data or filters change.

  // Memoize unique values for dropdowns to prevent recalculation on every render.
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
    estimateSize: () => 40, // Adjust this to your average row height
    overscan: 5,
  });

  return (
    <div
      onClick={() => {
        setShowItemNameDropdown(false);
        setShowClassificationDropdown(false);
      }}
    >
      {!serverOnline && (
        <div className="text-red-500 font-bold p-2">SERVER IS OFFLINE</div>
      )}
      <Filters onFilter={setItemSold} />

      <div
        ref={tableContainerRef}
        className="overflow-auto rounded-lg shadow border"
        style={{ height: "600px" }}
      >
        <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
          <thead className="bg-gray-100 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-gray-300 text-left px-4 py-2 font-semibold text-gray-700"
                    style={{ width: header.getSize() }}
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
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
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
                  }}
                  className="hover:bg-gray-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border-b border-gray-300 px-4 py-2 truncate"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
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

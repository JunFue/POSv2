import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  memo,
} from "react";
import { useDebounce } from "../hooks/useDebounce";

// This is the component that was moved
export const FilterableHeader = ({
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

  const handleCancel = () => closeDropdown();
  const handleSort = (direction) =>
    setTempFilter({ ...tempFilter, sort: direction });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
              ? "bg-blue-500 text-body-text"
              : "hover:bg-gray-100"
          }`}
        >
          Sort A-Z
        </button>
        <button
          onClick={() => handleSort("desc")}
          className={`text-sm p-1 rounded w-full text-center ml-1 ${
            tempFilter.sort === "desc"
              ? "bg-blue-500 text-body-text"
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
          className="mr-2 text-sm text-head-text px-3 py-1 rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="text-sm text-body-text bg-green-600 px-3 py-1 rounded hover:bg-green-700"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export const MemoizedColumnFilterDropdown = memo(ColumnFilterDropdown);

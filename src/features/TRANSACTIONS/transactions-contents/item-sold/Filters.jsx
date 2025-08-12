import React, { useRef, useEffect } from "react";
import { TransactionNoFilter } from "./TransactionNoFilter";
import { PaginationButtons } from "./PaginationButtons";
import { Calendar } from "../../../../components/Calendar";

// This function now formats the date based on its local calendar values, not UTC.
const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function Filters({
  onApplyFilters,
  onReset,
  onPageChange,
  onRowsPerPageChange,
  onTransactionNoChange,
  onDateRangeChange,
  currentPage,
  totalPages,
  rowsPerPage,
  loading,
  transactionNo,
  dateRange,
  showCalendar,
  setShowCalendar,
}) {
  const handleTransactionNoChange = (e) => {
    onTransactionNoChange(e.target.value);
  };

  const calendarRef = useRef(null);

  // Effect to close the calendar when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarRef, setShowCalendar]);

  const handleDateChange = (selection) => {
    if (!selection) return;
    let newFrom, newTo;
    if (selection.range && selection.range.from && selection.range.to) {
      newFrom = toLocalDateString(selection.range.from);
      newTo = toLocalDateString(selection.range.to);
    } else if (selection.date) {
      newFrom = toLocalDateString(selection.date);
      newTo = newFrom;
    } else {
      return;
    }

    const formattedDateRange = { from: newFrom, to: newTo };
    onDateRangeChange(formattedDateRange);
    setShowCalendar(false); // Close calendar after selection
  };

  const handleRowsPerPage = (e) => {
    onRowsPerPageChange(Number(e.target.value));
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-background rounded-lg shadow-md max-w-sm">
      {/* Date Range Input and Calendar Pop-up */}
      <div className="relative" ref={calendarRef}>
        <label
          htmlFor="dateRange"
          className="block text-sm font-medium text-body-text"
        >
          Date Range
        </label>
        <div className="relative mt-1">
          <input
            type="text"
            id="dateRange"
            value={
              dateRange.from === dateRange.to
                ? dateRange.from
                : `${dateRange.from} to ${dateRange.to}`
            }
            onFocus={() => setShowCalendar(true)}
            readOnly
            className="mt-1 block w-full traditional-input sm:text-sm cursor-pointer p-2 pr-10"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm10 5H4v8h12V7z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {showCalendar && (
          <div className="absolute top-full mt-2 z-10 bg-white rounded-lg shadow-lg border border-gray-200">
            <Calendar
              value={{
                from: new Date(dateRange.from + "T00:00:00"),
                to: new Date(dateRange.to + "T00:00:00"),
              }}
              onChange={handleDateChange}
            />
          </div>
        )}
      </div>

      <TransactionNoFilter
        transactionNo={transactionNo}
        onTransactionNoChange={handleTransactionNoChange}
      />

      <div className="flex gap-4">
        <button
          onClick={onApplyFilters}
          disabled={loading}
          className="traditional-button sm:text-[9px] md:text-[12px] lg:text-[15px]"
        >
          {loading ? "Loading..." : "Apply Filters"}
        </button>
        <button
          onClick={onReset}
          disabled={loading}
          className="traditional-button sm:text-[9px] md:text-[12px] lg:text-[15px]"
        >
          Reset
        </button>
      </div>

      <PaginationButtons
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loading}
        onNext={() => onPageChange(currentPage + 1)}
        onPrev={() => onPageChange(currentPage - 1)}
      />

      <div className="flex items-center gap-2">
        <label
          htmlFor="rowsPerPage"
          className="block text-sm font-medium text-body-text"
        >
          Rows:
        </label>
        <select
          id="rowsPerPage"
          value={rowsPerPage}
          onChange={handleRowsPerPage}
          disabled={loading}
          className="traditional-input"
        >
          {[10, 25, 50, 100, 500, 1000].map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

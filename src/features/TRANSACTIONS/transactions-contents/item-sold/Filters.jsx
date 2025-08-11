import React from "react";
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
}) {
  const handleTransactionNoChange = (e) => {
    onTransactionNoChange(e.target.value);
  };

  // This handler now uses the new local date formatting function.
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
  };

  const handleRowsPerPage = (e) => {
    onRowsPerPageChange(Number(e.target.value));
  };

  return (
    <div className="flex flex-row flex-wrap gap-4 p-4 bg-background rounded-lg shadow-md">
      <div className="w-60 h-100">
        {/*
          IMPORTANT: We remove the 'Z' here.
          By creating the date like `new Date('2025-08-08T00:00:00')`, we are telling
          JavaScript to interpret the string in the browser's local timezone, which
          prevents the off-by-one display error.
        */}
        <Calendar
          value={{
            from: new Date(dateRange.from + "T00:00:00"),
            to: new Date(dateRange.to + "T00:00:00"),
          }}
          onChange={handleDateChange}
          className="w-full h-full"
        />
      </div>
      <div className="flex flex-col gap-4">
        <TransactionNoFilter
          transactionNo={transactionNo}
          onTransactionNoChange={handleTransactionNoChange}
        />

        <div className="flex gap-4">
          <button
            onClick={onApplyFilters}
            disabled={loading}
            className="traditional-button"
          >
            {loading ? "Loading..." : "Filter"}
          </button>
          <button
            onClick={onReset}
            disabled={loading}
            className="traditional-button"
          >
            Reset fields only
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
    </div>
  );
}

import React from "react";

export function DateFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}) {
  return (
    <div className="flex items-center gap-4">
      <div>
        <label
          htmlFor="fromDate"
          className="block text-sm font-medium text-body-text"
        >
          From:
        </label>
        <input
          type="date"
          id="fromDate"
          value={fromDate}
          onChange={onFromDateChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="toDate"
          className="block text-sm font-medium text-body-text"
        >
          To:
        </label>
        <input
          type="date"
          id="toDate"
          value={toDate}
          onChange={onToDateChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </div>
  );
}

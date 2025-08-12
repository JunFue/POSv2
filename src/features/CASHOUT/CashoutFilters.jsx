import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "../../components/Calendar";

// Helper to format date object to 'YYYY-MM-DD' string
const toLocalDateString = (date) => {
  if (!date) return "";
  // Use local date parts to prevent timezone shifts
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function CashoutFilters({ selection, onFilter }) {
  const [showCalendar, setShowCalendar] = useState(false);
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
  }, []);

  const handleDateChange = (newSelection) => {
    // Standardize the output to always be { from, to }
    if (newSelection.range) {
      onFilter({ from: newSelection.range.from, to: newSelection.range.to });
    } else if (newSelection.date) {
      onFilter({ from: newSelection.date, to: newSelection.date });
    }
    setShowCalendar(false); // Close calendar after a date is selected
  };

  // Create a display string for the input field
  const displayValue =
    toLocalDateString(selection.from) === toLocalDateString(selection.to)
      ? toLocalDateString(selection.from)
      : `${toLocalDateString(selection.from)} to ${toLocalDateString(
          selection.to
        )}`;

  return (
    <div className="bg-background p-4 rounded-lg shadow-md">
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
            value={displayValue}
            onFocus={() => setShowCalendar(true)}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm cursor-pointer p-2 pr-10"
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
              value={{ from: selection.from, to: selection.to }}
              onChange={handleDateChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

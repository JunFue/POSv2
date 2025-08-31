import React, { useState, useEffect, useRef } from "react";

import { CashoutCalendar } from "./CashoutCalendar";
import { FaCalendarDay } from "react-icons/fa";
import { format } from "date-fns";
import { useCashout } from "../../context/CashoutProvider";

// Helper to format date objects to 'YYYY-MM-DD'
const toLocalDateString = (date) => {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
};

/**
 * CashoutFilters
 * - Fetches selection and fetch function from context.
 * - Manages the visibility of the calendar popup.
 */
export function CashoutFilters() {
  const { selection, fetchCashouts } = useCashout();
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateChange = (newSelection) => {
    if (newSelection.range) {
      fetchCashouts({
        from: newSelection.range.from,
        to: newSelection.range.to,
      });
    } else if (newSelection.date) {
      fetchCashouts({ from: newSelection.date, to: newSelection.date });
    }
    setShowCalendar(false);
  };

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
          className="block text-sm font-medium text-head-text"
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
            className="w-full bg-background border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 cursor-pointer"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <FaCalendarDay className="h-5 w-5 text-head-text" />
          </div>
        </div>
        {showCalendar && (
          <div className="absolute top-full mt-2 z-20 w-full sm:w-auto">
            <CashoutCalendar onFilter={handleDateChange} />
          </div>
        )}
      </div>
    </div>
  );
}

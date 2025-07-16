import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isAfter,
  startOfDay,
} from "date-fns";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export function ReportCalendar({ onSet, initialRange, closeCalendar }) {
  const [currentMonth, setCurrentMonth] = useState(
    initialRange.from || new Date()
  );
  const [range, setRange] = useState(initialRange);
  const [hoveredDate, setHoveredDate] = useState(null);

  const handleDayClick = (day) => {
    if (!range.from || (range.from && range.to)) {
      setRange({ from: startOfDay(day), to: null });
      setHoveredDate(null);
    } else {
      const newRange = isAfter(day, range.from)
        ? { from: range.from, to: startOfDay(day) }
        : { from: startOfDay(day), to: range.from };
      setRange(newRange);
      setHoveredDate(null);
    }
  };

  const handleSetClick = () => {
    onSet(range);
    closeCalendar();
  };

  // --- FIX: Added the missing rendering functions ---

  const renderHeader = () => (
    <div className="flex justify-between items-center py-2 px-1">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="p-2 rounded-full hover:bg-gray-700"
      >
        <FaArrowLeft size={12} />
      </button>
      <span className="text-sm font-bold">
        {format(currentMonth, "MMMM yyyy")}
      </span>
      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="p-2 rounded-full hover:bg-gray-700"
      >
        <FaArrowRight size={12} />
      </button>
    </div>
  );

  const renderDaysOfWeek = () => (
    <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-semibold my-2">
      {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
        <div key={index}>{day}</div>
      ))}
    </div>
  );

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        let cellClasses =
          "p-1 text-center h-8 w-8 flex items-center justify-center text-xs cursor-pointer transition-colors duration-200 rounded-full";

        if (!isSameMonth(day, monthStart)) {
          cellClasses += " text-gray-600"; // Dim days not in the current month
        } else {
          const { from, to } = range;
          const isFrom = from && isSameDay(day, from);
          const isTo = to && isSameDay(day, to);
          let inRange =
            from && to && isWithinInterval(day, { start: from, end: to });
          let inHoverRange =
            from &&
            !to &&
            hoveredDate &&
            isWithinInterval(day, { start: from, end: hoveredDate });
          if (from && !to && hoveredDate && isAfter(from, hoveredDate)) {
            inHoverRange = isWithinInterval(day, {
              start: hoveredDate,
              end: from,
            });
          }

          if (isFrom || isTo) {
            cellClasses += " bg-blue-500 text-white";
          } else if (inRange) {
            cellClasses += " bg-blue-400 bg-opacity-40";
          } else if (inHoverRange) {
            cellClasses += " bg-gray-700";
          } else {
            cellClasses += " hover:bg-gray-700";
          }
        }

        days.push(
          <div
            key={day.toString()}
            className="flex justify-center items-center"
          >
            <div
              className={cellClasses}
              onClick={() =>
                isSameMonth(cloneDay, monthStart) && handleDayClick(cloneDay)
              }
              onMouseEnter={() =>
                range.from && !range.to && setHoveredDate(cloneDay)
              }
            >
              <span>{format(cloneDay, "d")}</span>
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="absolute top-0 right-0 z-30 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-4 w-72 text-white">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
      <button
        onClick={handleSetClick}
        disabled={!range.from || !range.to}
        className="w-full mt-4 py-2 text-sm font-bold bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        Set Date Range
      </button>
    </div>
  );
}

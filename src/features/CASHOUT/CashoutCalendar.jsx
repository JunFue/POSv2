import React, { useState, useEffect, useRef } from "react";
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
import { FaCalendarDay, FaCalendarWeek, FaUndo } from "react-icons/fa";

export function CashoutCalendar({ onFilter }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [mode, setMode] = useState("single");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [range, setRange] = useState({ from: null, to: null });
  const [hoveredDate, setHoveredDate] = useState(null);

  // Ref to track the initial mount and prevent the useEffect from running on the first render.
  const isInitialMount = useRef(true);

  useEffect(() => {
    // This check ensures the effect only runs when 'mode' is changed by the user,
    // not during the initial component mount. This prevents the infinite loop.
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleDayClick = (day) => {
    if (mode === "single") {
      setSelectedDate(day);
    } else {
      if (!range.from || (range.from && range.to)) {
        setRange({ from: startOfDay(day), to: null });
        setHoveredDate(null);
      } else {
        // Determine the correct start and end of the range
        const newRange = isAfter(day, range.from)
          ? { from: range.from, to: startOfDay(day) }
          : { from: startOfDay(day), to: range.from };
        setRange(newRange);
        setHoveredDate(null);
      }
    }
  };

  const handleFilterClick = () => {
    if (mode === "single") {
      onFilter({ date: selectedDate });
    } else if (range.from && range.to) {
      onFilter({ range });
    } else {
      // Notify user if the range selection is incomplete
      console.warn("Please select a complete date range.");
    }
  };

  const handleReset = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
    setRange({ from: null, to: null });
    // The call to onFilter() was removed from here as it was the source of the loop.
    // The parent now controls when to filter based on user interaction.
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center py-2 px-1">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="p-2 rounded-full hover:bg-background"
        aria-label="Previous month"
      >
        &lt;
      </button>
      <span className="text-lg font-semibold">
        {format(currentMonth, "MMMM yyyy")}
      </span>
      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="p-2 rounded-full hover:bg-background"
        aria-label="Next month"
      >
        &gt;
      </button>
    </div>
  );

  const renderDays = () => (
    <div className="grid grid-cols-7 text-center font-semibold text-xs text-head-text my-2">
      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
        <div key={day}>{day}</div>
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
          "h-9 w-9 flex items-center justify-center text-sm cursor-pointer transition-colors duration-200 rounded-full";

        if (!isSameMonth(day, monthStart)) {
          cellClasses += " text-gray-300";
        } else {
          cellClasses += " hover:bg-blue-100";
        }

        if (mode === "single" && isSameDay(day, selectedDate)) {
          cellClasses += " bg-blue-600 text-white";
        } else if (mode === "range") {
          const { from, to } = range;
          const isFrom = from && isSameDay(day, from);
          const isTo = to && isSameDay(day, to);
          let inRange =
            from && to && isWithinInterval(day, { start: from, end: to });

          let inHoverRange = false;
          if (from && !to && hoveredDate) {
            if (isAfter(hoveredDate, from)) {
              inHoverRange = isWithinInterval(day, {
                start: from,
                end: hoveredDate,
              });
            } else {
              inHoverRange = isWithinInterval(day, {
                start: hoveredDate,
                end: from,
              });
            }
          }

          if (isFrom || isTo) {
            cellClasses += " bg-blue-600 text-white";
          } else if (inRange) {
            cellClasses += " bg-blue-200 rounded-none";
          } else if (inHoverRange) {
            cellClasses += " bg-blue-100 rounded-none";
          }
        }

        days.push(
          <div
            key={day.toString()}
            className="flex justify-center items-center"
          >
            <div
              className={cellClasses}
              onClick={() => handleDayClick(cloneDay)}
              onMouseEnter={() =>
                mode === "range" &&
                range.from &&
                !range.to &&
                setHoveredDate(cloneDay)
              }
            >
              <span>{format(day, "d")}</span>
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
    <div className="bg-background rounded-lg shadow-lg p-4 flex flex-col border border-gray-200 w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 bg-background rounded-full p-1">
          <button
            onClick={() => setMode("single")}
            className={`px-3 py-1 text-sm rounded-full ${
              mode === "single" ? "bg-background shadow" : ""
            }`}
            title="Single Day"
          >
            <FaCalendarDay />
          </button>
          <button
            onClick={() => setMode("range")}
            className={`px-3 py-1 text-sm rounded-full ${
              mode === "range" ? "bg-background shadow" : ""
            }`}
            title="Date Range"
          >
            <FaCalendarWeek />
          </button>
        </div>
        <button
          onClick={handleReset}
          className="p-2 rounded-full hover:bg-background"
          title="Reset"
        >
          <FaUndo />
        </button>
      </div>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      <button
        onClick={handleFilterClick}
        className="w-full mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Apply Filter
      </button>
    </div>
  );
}

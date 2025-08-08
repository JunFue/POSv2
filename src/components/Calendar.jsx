import React, { useState, useEffect } from "react";
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

export function Calendar({ onFilter }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [mode, setMode] = useState("single"); // 'single' or 'range'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [range, setRange] = useState({ from: null, to: null });
  const [hoveredDate, setHoveredDate] = useState(null);

  useEffect(() => {
    handleReset();
  }, [mode]);

  const handleDayClick = (day) => {
    if (mode === "single") {
      setSelectedDate(day);
    } else {
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
    }
  };

  const handleFilterClick = () => {
    if (mode === "single") {
      onFilter({ date: selectedDate });
    } else if (range.from && range.to) {
      onFilter({ range: range });
    } else {
      alert("Please select a complete date range.");
    }
  };

  const handleReset = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
    setRange({ from: null, to: null });
    onFilter({ date: today });
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center py-2 px-4">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        &lt;
      </button>
      <span className="text-lg font-bold">
        {format(currentMonth, "MMMM yyyy")}
      </span>
      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        &gt;
      </button>
    </div>
  );

  const renderDays = () => (
    <div className="grid grid-cols-7 text-center font-semibold text-sm text-head-text">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
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
          "p-2 text-center h-10 flex items-center justify-center text-sm cursor-pointer transition-colors duration-200";

        if (!isSameMonth(day, monthStart)) cellClasses += " text-head-text";
        else cellClasses += " hover:bg-blue-100";

        if (mode === "single" && isSameDay(day, selectedDate)) {
          cellClasses += " bg-blue-500 text-body-text rounded-full";
        } else if (mode === "range") {
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
            cellClasses += " bg-blue-500 text-body-text rounded-full";
          } else if (inRange) {
            cellClasses += " bg-blue-200";
          } else if (inHoverRange) {
            cellClasses += " bg-blue-100";
          }
        }

        days.push(
          <div
            className={cellClasses}
            key={day.toString()}
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
    <div className="bg-background rounded-lg shadow-md p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("single")}
            className={`p-2 rounded-full ${
              mode === "single"
                ? "bg-blue-500 text-body-text"
                : "hover:bg-gray-200"
            }`}
            title="Single Day Mode"
          >
            <FaCalendarDay />
          </button>
          <button
            onClick={() => setMode("range")}
            className={`p-2 rounded-full ${
              mode === "range"
                ? "bg-blue-500 text-body-text"
                : "hover:bg-gray-200"
            }`}
            title="Date Range Mode"
          >
            <FaCalendarWeek />
          </button>
        </div>
        <button
          onClick={handleReset}
          className="p-2 rounded-full hover:bg-gray-200"
          title="Reset to Today"
        >
          <FaUndo />
        </button>
      </div>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      <button
        onClick={handleFilterClick}
        className="traditional-button mt-4 w-full"
      >
        Filter
      </button>
    </div>
  );
}

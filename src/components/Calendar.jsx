// src/components/Calendar.jsx

import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
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

// --- CHANGE 1: Add `initialMode` and `allowedModes` to props with default values ---
export const Calendar = forwardRef(
  (
    {
      className,
      value,
      onChange,
      initialMode = "range",
      allowedModes = ["single", "range"],
    },
    ref
  ) => {
    const [range, setRange] = useState(() => {
      const today = new Date();
      if (value && value.from) {
        return {
          from: startOfDay(value.from),
          to: value.to ? startOfDay(value.to) : startOfDay(value.from),
        };
      }
      return { from: today, to: today };
    });

    const [selectedDate, setSelectedDate] = useState(range.from);
    const [currentMonth, setCurrentMonth] = useState(range.from);

    // --- CHANGE 2: Use the `initialMode` prop to set the starting mode ---
    const [mode, setMode] = useState(initialMode);
    const [hoveredDate, setHoveredDate] = useState(null);

    useEffect(() => {
      if (value && value.from) {
        const newRange = {
          from: startOfDay(value.from),
          to: value.to ? startOfDay(value.to) : startOfDay(value.from),
        };
        setRange(newRange);
        setSelectedDate(newRange.from);
        setCurrentMonth(newRange.from);
        // Do not override the mode if it's locked by the parent
        // setMode(isSameDay(newRange.from, newRange.to) ? "single" : "range");
      }
    }, [value]);

    const handleDayClick = (day) => {
      // ... (rest of the function is unchanged)
      const dayStart = startOfDay(day);
      if (mode === "single") {
        setSelectedDate(dayStart);
        setRange({ from: dayStart, to: dayStart });
        if (onChange) onChange({ date: dayStart });
      } else {
        if (!range.from || (range.from && range.to)) {
          setRange({ from: dayStart, to: null });
          // Don't call onChange yet, wait for the second date.
        } else {
          const newRange = isAfter(dayStart, range.from)
            ? { from: range.from, to: dayStart }
            : { from: dayStart, to: range.from };
          setRange(newRange);
          if (onChange) onChange({ range: newRange });
        }
        setHoveredDate(null);
      }
    };

    const handleReset = () => {
      // ... (rest of the function is unchanged)
      const today = new Date();
      const todayStart = startOfDay(today);
      setSelectedDate(todayStart);
      setCurrentMonth(todayStart);
      setRange({ from: todayStart, to: todayStart });
      if (onChange) {
        onChange({ date: todayStart });
      }
    };

    useImperativeHandle(ref, () => ({
      // ... (rest of the function is unchanged)
      getSelection: () => {
        if (mode === "single") {
          return { date: selectedDate };
        } else if (range.from && range.to) {
          return { range };
        }
        return null;
      },
    }));

    const renderHeader = () => (
      // ... (this function is unchanged)
      <div className="flex justify-between items-center py-2 px-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          &lt;
        </button>
        <span className="font-bold text-head-text text-sm">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          &gt;
        </button>
      </div>
    );

    const renderDays = () => (
      // ... (this function is unchanged)
      <div className="grid grid-cols-7 text-center text-[50%] font-semibold text-head-text">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
          <div key={index}>{day}</div>
        ))}
      </div>
    );

    const renderCells = () => {
      // ... (this function is unchanged)
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
            "p-1 text-center h-10 flex items-center justify-center cursor-pointer transition-colors duration-200 text-[50%]";

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
      <div
        className={`bg-background rounded-lg shadow-md p-4 flex flex-col w-full h-full ${
          className || ""
        }`}
      >
        <div className="flex justify-between items-center">
          {/* --- CHANGE 3: Conditionally render mode toggle buttons --- */}
          {/* The container will only show if more than one mode is allowed */}
          {allowedModes.length > 1 ? (
            <div className="flex items-center">
              {allowedModes.includes("single") && (
                <button
                  onClick={() => setMode("single")}
                  className={`p-1 rounded-full ${
                    mode === "single"
                      ? "bg-blue-500 text-body-text"
                      : "hover:bg-gray-200"
                  }`}
                  title="Single Day Mode"
                >
                  <FaCalendarDay className="text-sm" />
                </button>
              )}
              {allowedModes.includes("range") && (
                <button
                  onClick={() => setMode("range")}
                  className={`p-1 rounded-full ${
                    mode === "range"
                      ? "bg-blue-500 text-body-text"
                      : "hover:bg-gray-200"
                  }`}
                  title="Date Range Mode"
                >
                  <FaCalendarWeek className="text-sm" />
                </button>
              )}
            </div>
          ) : (
            <div /> // Render an empty div to maintain layout with justify-between
          )}
          <button
            onClick={handleReset}
            className="p-1 rounded-full hover:bg-gray-200 text-sm"
            title="Reset to Today"
          >
            <FaUndo />
          </button>
        </div>
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
    );
  }
);

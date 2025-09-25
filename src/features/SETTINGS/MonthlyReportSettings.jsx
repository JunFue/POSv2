import { format } from "date-fns";
import React, { useEffect, useState, useRef } from "react";
import { useMonthlyReport } from "../../context/MonthlyReportContext";
import { Calendar } from "../../components/Calendar";

const toLocalDateString = (date) => (date ? format(date, "yyyy-MM-dd") : "");

export function MonthlyReportSettings({ onClose }) {
  const { dateRange, setAndSaveDateRange } = useMonthlyReport();

  const [selectedRange, setSelectedRange] = useState(dateRange);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const calendarRef = useRef(null);

  useEffect(() => {
    setSelectedRange(dateRange);
  }, [dateRange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => {
        setIsSaved(false);
        if (onClose) onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaved, onClose]);

  const handleCalendarChange = (selection) => {
    if (selection.range) {
      setSelectedRange(selection.range);
      if (selection.range.from && selection.range.to) {
        setIsCalendarOpen(false);
        setError("");
      }
    }
  };

  const handleSaveChanges = () => {
    if (selectedRange.from && selectedRange.to) {
      setAndSaveDateRange(selectedRange);
      setError("");
      setIsSaved(true);
    } else {
      setError("Please select a complete date range.");
    }
  };

  const displayValue =
    selectedRange.from && selectedRange.to
      ? `${toLocalDateString(selectedRange.from)} to ${toLocalDateString(
          selectedRange.to
        )}`
      : "Select a date range...";

  return (
    <div className="pt-6 border-t border-gray-300/50 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Monthly Report</h2>
      <p className="text-sm text-gray-600 mb-4">
        Set the default date range for your monthly financial reports.
      </p>
      <div className="space-y-4">
        <div className="relative" ref={calendarRef}>
          <label
            htmlFor="reportRange"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Selected Range
          </label>
          <input
            type="text"
            id="reportRange"
            value={displayValue}
            readOnly
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="w-full bg-white border-2 border-gray-300 text-gray-800 text-md rounded-lg p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {isCalendarOpen && (
            <div className="absolute top-full mt-2 w-full z-20">
              <Calendar
                value={selectedRange}
                onChange={handleCalendarChange}
                initialMode="range"
                allowedModes={["range"]}
              />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSaveChanges}
          disabled={isSaved}
          className={`w-full text-white font-bold py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isSaved
              ? "bg-green-500 focus:ring-green-500"
              : "bg-teal-600 hover:bg-teal-700 focus:ring-teal-500"
          }`}
        >
          {isSaved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

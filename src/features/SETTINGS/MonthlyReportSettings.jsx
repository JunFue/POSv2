import { format } from "date-fns";

import { useEffect, useState, useRef } from "react";

import { useMonthlyReport } from "../../context/MonthlyReportContext";
import { Calendar } from "../../components/Calendar";

const toLocalDateString = (date) => (date ? format(date, "yyyy-MM-dd") : "");

export function MonthlyReportSettings({ onClose }) {
  // --- CHANGE: The context now provides `setAndSaveDateRange` ---
  const { dateRange, setAndSaveDateRange } = useMonthlyReport();
  const [selectedRange, setSelectedRange] = useState(dateRange);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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

  const handleCalendarChange = (selection) => {
    if (selection.range) {
      setSelectedRange(selection.range);
      if (selection.range.from && selection.range.to) {
        setIsCalendarOpen(false);
      }
    }
  };

  // --- CHANGE: This function no longer fetches data ---
  const handleSaveChanges = () => {
    if (selectedRange.from && selectedRange.to) {
      setAndSaveDateRange(selectedRange);
      onClose(); // Close the settings dialog
    } else {
      alert("Please select a complete date range.");
    }
  };

  const displayValue =
    selectedRange.from && selectedRange.to
      ? `${toLocalDateString(selectedRange.from)} to ${toLocalDateString(
          selectedRange.to
        )}`
      : "Select a date range...";

  return (
    <div className="pt-6 border-t border-gray-300/50">
      <h2 className="text-2xl font-bold text-head-text mb-2">Monthly Report</h2>
      <p className="text-sm text-body-text/80 mb-4">
        Set the default date range for your monthly financial reports.
      </p>
      <div className="space-y-4">
        <div className="relative" ref={calendarRef}>
          <label
            htmlFor="reportRange"
            className="block text-sm font-medium text-head-text mb-2"
          >
            Selected Range
          </label>
          <input
            type="text"
            id="reportRange"
            value={displayValue}
            readOnly
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="w-full bg-background border-2 border-gray-300/50 text-body-text text-md rounded-lg p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
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
        <button
          onClick={handleSaveChanges}
          className="w-full bg-teal-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../AUTHENTICATION/hooks/useAuth";

import { FaCalendarAlt } from "react-icons/fa"; // Import an icon for the button
import { Calendar } from "../../../../components/Calendar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to format Date objects into YYYY-MM-DD strings
const formatDate = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function PaymentsFilter({
  onFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
  loading,
  setLoading,
}) {
  const { user, session } = useAuth();
  const [transactionNo, setTransactionNo] = useState("");

  // State to manage the date range object required by the Calendar component
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });

  // State to control the visibility of the calendar popover
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  // Close the calendar popover if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBackendFetch = async (page, limit, range, transNo = "") => {
    if (!session) return;
    setLoading(true);
    try {
      const startDate = formatDate(range.from);
      const endDate = formatDate(range.to);

      const params = new URLSearchParams({ page, limit, startDate, endDate });
      if (transNo) {
        params.set("transactionNo", transNo);
      }

      const url = `${BACKEND_URL}/api/payments?${params.toString()}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const filteredData = await response.json();
        onFilter(filteredData);
      } else {
        console.error("Failed to fetch payments from the server.");
      }
    } catch (error) {
      console.error(`Error fetching payments: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on first load
  useEffect(() => {
    if (user) {
      handleBackendFetch(1, rowsPerPage, dateRange);
    }
  }, [user]);

  // Handler for when the calendar selection changes
  const handleDateChange = (selection) => {
    const newRange = selection.range || {
      from: selection.date,
      to: selection.date,
    };
    setDateRange(newRange);
    setShowCalendar(false); // Close the calendar after selection
    // Trigger a new fetch with the updated date range
    handleBackendFetch(1, rowsPerPage, newRange, transactionNo.trim());
    setCurrentPage(1);
  };

  const handleFilter = () => {
    setCurrentPage(1);
    handleBackendFetch(1, rowsPerPage, dateRange, transactionNo.trim());
  };

  const handleReset = () => {
    setTransactionNo("");
    const todayRange = { from: new Date(), to: new Date() };
    setDateRange(todayRange);
    setCurrentPage(1);
    handleBackendFetch(1, rowsPerPage, todayRange);
  };

  // Pagination handlers now correctly pass the current dateRange
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      handleBackendFetch(
        nextPage,
        rowsPerPage,
        dateRange,
        transactionNo.trim()
      );
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      handleBackendFetch(
        prevPage,
        rowsPerPage,
        dateRange,
        transactionNo.trim()
      );
    }
  };

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = Number(e.target.value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    handleBackendFetch(1, newRowsPerPage, dateRange, transactionNo.trim());
  };

  // Function to display the selected date range nicely
  const displayDateRange = () => {
    const from = formatDate(dateRange.from);
    const to = formatDate(dateRange.to);
    return from === to ? from : `${from} to ${to}`;
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-background rounded-lg shadow-md">
      <div className="flex flex-wrap items-end gap-4">
        {/* Calendar Popover Section */}
        <div className="relative" ref={calendarRef}>
          <label className="block sm:text-[9px] md:text-[12px] lg:text-[15px] font-medium text-body-text">
            Date Range
          </label>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="mt-1 flex items-center justify-between w-64 p-2 sm:text-[9px] md:text-[12px] lg:text-[15px] bg-background border border-gray-300 rounded-md shadow-sm text-left"
          >
            <span>{displayDateRange()}</span>
            <FaCalendarAlt className="text-gray-500" />
          </button>
          {showCalendar && (
            <div className="absolute z-10 mt-2 w-80 bg-background rounded-lg shadow-lg">
              <Calendar value={dateRange} onChange={handleDateChange} />
            </div>
          )}
        </div>

        {/* Transaction Number Input */}
        <div className="flex-grow">
          <label
            htmlFor="transactionNo"
            className="block text-y font-medium text-body-text"
          >
            Transaction No:
          </label>
          <input
            type="text"
            id="transactionNo"
            value={transactionNo}
            onChange={(e) => setTransactionNo(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter transaction number"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleFilter}
          disabled={loading}
          className={`traditional-button sm:text-[9px] md:text-[12px] lg:text-[15px] ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Loading..." : "Apply Filters"}
        </button>
        <button
          onClick={handleReset}
          className="traditional-button sm:text-[9px] md:text-[12px] lg:text-[15px]"
        >
          Reset
        </button>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage <= 1 || loading}
          className="traditional-button sm:text-[9px] md:text-[12px] lg:text-[15px]"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages || loading}
          className="traditional-button sm:text-[9px] md:text-[12px] lg:text-[15px]"
        >
          Next
        </button>
        <select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          disabled={loading}
          className="traditional-input"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}

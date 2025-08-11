import { useState, useEffect, useRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { Calendar } from "../../../../components/Calendar";
import { usePaymentsFetcher } from "./hooks/usePaymentsFetcher";
import { useAuth } from "../../../AUTHENTICATION/hooks/useAuth";

export function PaymentsFilter({
  onFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
  loading,
  setLoading,
  setDateRange,
  dateRange,
}) {
  const { user } = useAuth();
  const [transactionNo, setTransactionNo] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);
  // --- FIX: Add a ref to track if the initial fetch has been made ---
  const initialFetchDone = useRef(false);

  const { fetchPayments } = usePaymentsFetcher({ setLoading });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initial data fetch on component mount
  useEffect(() => {
    // --- FIX: Check the ref before fetching ---
    // Only run the fetch if the user is authenticated and the fetch hasn't happened yet.
    if (user && !initialFetchDone.current) {
      fetchPayments(1, rowsPerPage, dateRange).then(onFilter);
      // Set the ref to true to prevent this effect from running again on re-mount.
      initialFetchDone.current = true;
    }
  }, [user, fetchPayments, onFilter, dateRange, rowsPerPage]);

  const handleFetchAndFilter = (page, limit, range, transNo) => {
    fetchPayments(page, limit, range, transNo).then(onFilter);
  };

  const handleDateChange = (selection) => {
    const newRange = selection.range || {
      from: selection.date,
      to: selection.date,
    };
    setDateRange(newRange);
    setShowCalendar(false);
  };

  const handleFilter = () => {
    setCurrentPage(1);
    handleFetchAndFilter(1, rowsPerPage, dateRange, transactionNo.trim());
  };

  const handleReset = () => {
    setTransactionNo("");
    const todayRange = { from: new Date(), to: new Date() };
    setDateRange(todayRange);
    setCurrentPage(1);
    handleFetchAndFilter(1, rowsPerPage, todayRange);
  };

  // Pagination handlers
  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    handleFetchAndFilter(
      nextPage,
      rowsPerPage,
      dateRange,
      transactionNo.trim()
    );
  };

  const handlePreviousPage = () => {
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    handleFetchAndFilter(
      prevPage,
      rowsPerPage,
      dateRange,
      transactionNo.trim()
    );
  };

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = Number(e.target.value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    handleFetchAndFilter(1, newRowsPerPage, dateRange, transactionNo.trim());
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const displayDateRange = () => {
    const from = formatDate(dateRange.from);
    const to = formatDate(dateRange.to);
    return from === to ? from : `${from} to ${to}`;
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-background rounded-lg shadow-md">
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
          className="block text-y font-medium text-body-text sm:text-[9px] md:text-[12px] lg:text-[15px]"
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

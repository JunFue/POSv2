import { useState, useEffect, useRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { Calendar } from "../../../../components/Calendar";
import { usePaymentsFetcher } from "./hooks/usePaymentsFetcher"; // 1. Import the new hook
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
}) {
  const { user } = useAuth();
  const [transactionNo, setTransactionNo] = useState("");
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  // 2. Use the custom hook to get the fetch function
  const { fetchPayments } = usePaymentsFetcher({ onFilter, setLoading });

  // Effect to close the calendar when clicking outside
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

  // 3. Effect for the initial data fetch on component mount
  useEffect(() => {
    // This effect runs once when the component mounts and the user is authenticated.
    if (user && fetchPayments) {
      fetchPayments(1, rowsPerPage, dateRange);
    }
    // We only want this to run on mount, so we disable the exhaustive-deps warning.
    // The dependencies `dateRange` and `rowsPerPage` are intentionally omitted
    // because other event handlers take care of re-fetching when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fetchPayments]);

  // 4. All handlers now use the `fetchPayments` function from the hook
  const handleDateChange = (selection) => {
    const newRange = selection.range || {
      from: selection.date,
      to: selection.date,
    };
    setDateRange(newRange);
    setShowCalendar(false);
    fetchPayments(1, rowsPerPage, newRange, transactionNo.trim());
    setCurrentPage(1);
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchPayments(1, rowsPerPage, dateRange, transactionNo.trim());
  };

  const handleReset = () => {
    setTransactionNo("");
    const todayRange = { from: new Date(), to: new Date() };
    setDateRange(todayRange);
    setCurrentPage(1);
    fetchPayments(1, rowsPerPage, todayRange);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPayments(nextPage, rowsPerPage, dateRange, transactionNo.trim());
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchPayments(prevPage, rowsPerPage, dateRange, transactionNo.trim());
    }
  };

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = Number(e.target.value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchPayments(1, newRowsPerPage, dateRange, transactionNo.trim());
  };

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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

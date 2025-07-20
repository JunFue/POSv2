import { useState, useEffect } from "react";
import { useAuth } from "../../features/pos-features/authentication/hooks/useAuth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactionNo, setTransactionNo] = useState("");

  const initializeFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    setToDate(today);
    handleBackendFetch(1, rowsPerPage, today, today, "");
  };

  useEffect(() => {
    if (user) {
      initializeFilters();
    }
  }, [user]);

  const handleBackendFetch = async (
    page,
    limit,
    startDate,
    endDate,
    transNo = ""
  ) => {
    if (!session) return;
    const token = session.access_token;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        startDate,
        endDate,
      });
      if (transNo) {
        params.set("transactionNo", transNo);
      }

      const url = `${BACKEND_URL}/api/payments?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const handleFilter = () => {
    setCurrentPage(1);
    handleBackendFetch(1, rowsPerPage, fromDate, toDate, transactionNo.trim());
  };

  const handleReset = () => {
    setTransactionNo("");
    setCurrentPage(1);
    handleBackendFetch(1, rowsPerPage, fromDate, toDate);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      handleBackendFetch(
        nextPage,
        rowsPerPage,
        fromDate,
        toDate,
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
        fromDate,
        toDate,
        transactionNo.trim()
      );
    }
  };

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = Number(e.target.value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    handleBackendFetch(
      1,
      newRowsPerPage,
      fromDate,
      toDate,
      transactionNo.trim()
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-background rounded-lg shadow-md">
      <div className="flex items-center gap-4">
        <div>
          <label
            htmlFor="fromDate"
            className="block text-sm font-medium text-gray-700"
          >
            From:
          </label>
          <input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="toDate"
            className="block text-sm font-medium text-gray-700"
          >
            To:
          </label>
          <input
            type="date"
            id="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="transactionNo"
          className="block text-sm font-medium text-gray-700"
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
      <div className="flex gap-4">
        <button
          onClick={handleFilter}
          disabled={loading}
          className={`traditional-button ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Loading..." : "Filter"}
        </button>
        <button onClick={handleReset} className="traditional-button">
          Reset
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage <= 1 || loading}
          className="traditional-button"
        >
          Previous
        </button>
        <span className="text-[1vw]">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages || loading}
          className="traditional-button"
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

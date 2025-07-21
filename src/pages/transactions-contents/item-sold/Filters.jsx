import { useState, useEffect } from "react";
import { useAuth } from "../../../features/pos-features/authentication/hooks/useAuth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function Filters({
  onFilter,
  onLocalFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
  loading,
  setLoading,
}) {
  // --- Step 2: Get user and session from the auth context ---
  const { user, session } = useAuth();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactionNo, setTransactionNo] = useState("");
  const [itemName, setItemName] = useState("");

  const initializeFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    setToDate(today);
    handleBackendFetch(1, rowsPerPage, today, today, "");
  };

  useEffect(() => {
    // --- Step 3: Make the initial fetch dependent on the user ---
    // This effect now only runs when a user is successfully logged in.
    if (user) {
      initializeFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleBackendFetch = async (
    page,
    limit,
    startDate,
    endDate,
    transNo = ""
  ) => {
    // --- Step 4: Add the authentication token to every backend request ---
    if (!session) {
      // Don't fetch if there's no active session
      return;
    }
    const token = session.access_token;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (transNo) {
        params.append("transactionNo", transNo);
      } else if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      }
      params.append("page", page);
      params.append("limit", limit);

      const url = `${BACKEND_URL}/api/transactions?${params.toString()}`;
      // Add the Authorization header to the fetch options
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const filteredData = await response.json();
        if (onFilter) {
          onFilter(filteredData);
        }
      } else {
        console.error("Failed to fetch filtered data from the server.");
      }
    } catch (error) {
      console.error(`Error fetching data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- No changes are needed for the functions below ---
  // They all call handleBackendFetch, which is now secure.

  const handleFilter = () => {
    if (itemName.trim() !== "") {
      if (onLocalFilter) {
        onLocalFilter(itemName);
      }
      return;
    }
    setCurrentPage(1);
    handleBackendFetch(1, rowsPerPage, fromDate, toDate, transactionNo.trim());
  };

  const handleReset = () => {
    setTransactionNo("");
    setItemName("");
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

  // --- No changes needed for the JSX below ---

  return (
    <div className="flex flex-col gap-4 p-4 bg-background rounded-lg shadow-md">
      <div className="flex items-center gap-4">
        <div>
          <label
            htmlFor="fromDate"
            className="block text-sm font-medium text-body-text"
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
            className="block text-sm font-medium text-body-text"
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
          className="block text-sm font-medium text-body-text"
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
      <div>
        <label
          htmlFor="itemName"
          className="block text-sm font-medium text-body-text"
        >
          Item Name:
        </label>
        <input
          type="text"
          id="itemName"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter item name for local search"
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
          <option value={500}>500</option>
          <option value={1000}>1000</option>
        </select>
      </div>
    </div>
  );
}

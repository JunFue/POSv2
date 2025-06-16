import { useState, useEffect } from "react";

export function Filters({
  onFilter,
  onLocalFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
  loading, // added prop
  setLoading, // added prop
}) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactionNo, setTransactionNo] = useState("");
  const [itemName, setItemName] = useState("");

  // Renamed to be more descriptive for the initial load.
  const initializeFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    setToDate(today);
    // Fetch data for the initial date range.
    handleBackendFetch(1, rowsPerPage, today, today, "");
  };

  useEffect(() => {
    // This effect runs once on component mount to set initial dates and load data.
    initializeFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackendFetch = async (
    page,
    limit,
    startDate,
    endDate,
    transNo = ""
  ) => {
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

      const url = `http://localhost:3000/api/transactions?${params.toString()}`;
      const response = await fetch(url);

      if (response.ok) {
        const filteredData = await response.json();
        if (onFilter) {
          onFilter(filteredData);
        }
      } else {
        alert("Failed to fetch filtered data from the server.");
      }
    } catch (error) {
      alert(`Error fetching data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    // If item name is used, filter locally.
    if (itemName.trim() !== "") {
      if (onLocalFilter) {
        onLocalFilter(itemName);
      }
      return;
    }
    setCurrentPage(1);
    // Otherwise, fetch from the backend with current filter values.
    handleBackendFetch(1, rowsPerPage, fromDate, toDate, transactionNo.trim());
  };

  const handleReset = () => {
    // Clear only the transaction number and item name fields.
    setTransactionNo("");
    setItemName("");
    setCurrentPage(1);
    // Re-fetch data using the *existing* date range.
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
    setCurrentPage(1); // Reset to page 1
    handleBackendFetch(
      1,
      newRowsPerPage,
      fromDate,
      toDate,
      transactionNo.trim()
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-100 rounded-lg shadow-md">
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
      <div>
        <label
          htmlFor="itemName"
          className="block text-sm font-medium text-gray-700"
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
          className={`px-4 py-2 bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Loading..." : "Filter"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
        >
          Reset
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage <= 1 || loading}
          className="bg-blue-500 text-white text-[1.2vw] px-3 py-2 rounded disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <span className="text-[1vw]">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages || loading}
          className="text-[1.2vw] bg-blue-500 text-white px-3 py-2 rounded disabled:opacity-50 transition-colors"
        >
          Next
        </button>
        <select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          disabled={loading}
          className="text-[1.2vw] bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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

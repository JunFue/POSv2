import React, { useState, useEffect } from "react";
import { useAuth } from "../../../AUTHENTICATION/hooks/useAuth";

import { TransactionNoFilter } from "./TransactionNoFilter";
import { PaginationButtons } from "./PaginationButtons";
import { useFetchTransactions } from "./useFetchTransactions";
import { Calendar } from "../../../../components/Calendar";

export function Filters({
  onFilter,
  onLocalFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
}) {
  const { user, session } = useAuth();
  // Removed: const [fromDate, setFromDate] = useState("");
  // Removed: const [toDate, setToDate] = useState("");
  const [transactionNo, setTransactionNo] = useState("");
  const [itemName, setItemName] = useState("");

  // Initialize filterParams with today's date.
  const today = new Date().toISOString().split("T")[0];
  const [filterParams, setFilterParams] = useState({ from: today, to: today });

  const { fetchTransactions, loading } = useFetchTransactions(session);

  useEffect(() => {
    if (user) {
      setCurrentPage(1);
      fetchTransactions(
        1,
        rowsPerPage,
        filterParams.from,
        filterParams.to,
        ""
      ).then((data) => {
        if (data && onFilter) onFilter(data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // New callback to handle calendar selection.
  const handleCalendarFilter = (filter) => {
    let newFrom, newTo;
    if (filter.date) {
      newFrom = filter.date.toISOString().split("T")[0];
      newTo = newFrom;
    } else if (filter.range) {
      newFrom = filter.range.from.toISOString().split("T")[0];
      newTo = filter.range.to.toISOString().split("T")[0];
    }
    setFilterParams({ from: newFrom, to: newTo });
    setCurrentPage(1);
    fetchTransactions(
      1,
      rowsPerPage,
      newFrom,
      newTo,
      transactionNo.trim()
    ).then((data) => {
      if (data && onFilter) onFilter(data);
    });
  };

  const handleFilter = () => {
    if (itemName.trim() !== "") {
      if (onLocalFilter) onLocalFilter(itemName);
      return;
    }
    setCurrentPage(1);
    fetchTransactions(
      1,
      rowsPerPage,
      filterParams.from,
      filterParams.to,
      transactionNo.trim()
    ).then((data) => {
      if (data && onFilter) onFilter(data);
    });
  };

  const handleReset = () => {
    setTransactionNo("");
    setItemName("");
    setCurrentPage(1);
    // Reset filterParams to today's date.
    setFilterParams({ from: today, to: today });
    fetchTransactions(1, rowsPerPage, today, today, "").then((data) => {
      if (data && onFilter) onFilter(data);
    });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchTransactions(
        nextPage,
        rowsPerPage,
        filterParams.from,
        filterParams.to,
        transactionNo.trim()
      ).then((data) => {
        if (data && onFilter) onFilter(data);
      });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchTransactions(
        prevPage,
        rowsPerPage,
        filterParams.from,
        filterParams.to,
        transactionNo.trim()
      ).then((data) => {
        if (data && onFilter) onFilter(data);
      });
    }
  };

  const handleRowsPerPageChange = (e) => {
    const newRows = Number(e.target.value);
    setRowsPerPage(newRows);
    setCurrentPage(1);
    fetchTransactions(
      1,
      newRows,
      filterParams.from,
      filterParams.to,
      transactionNo.trim()
    ).then((data) => {
      if (data && onFilter) onFilter(data);
    });
  };

  return (
    <div className="flex flex-row gap-4 p-4 bg-background rounded-lg shadow-md">
      {/* Replace DateFilter with reusable Calendar */}
      <div className="w-[50%] h-[25%]">
        <Calendar onFilter={handleCalendarFilter} />
      </div>
      <div>
        {/* Transaction Number Filter */}
        <TransactionNoFilter
          transactionNo={transactionNo}
          onTransactionNoChange={(e) => setTransactionNo(e.target.value)}
        />

        {/* Filter and Reset Buttons */}
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

        {/* Pagination Buttons */}
        <PaginationButtons
          currentPage={currentPage}
          totalPages={totalPages}
          loading={loading}
          onNext={handleNextPage}
          onPrev={handlePreviousPage}
        />

        {/* Rows Per Page Selection */}
        <div className="flex items-center gap-4">
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
    </div>
  );
}

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useState, useRef, useMemo, useContext } from "react";
import { PaymentsFilter } from "./PaymentsFilter";
import { useVirtualizer } from "@tanstack/react-virtual";
import { VirtualizedTable } from "../../../../components/VirtualizedTable";
import { PaymentContext } from "../../../../context/PaymentContext";

const getTodaysDateString = () => new Date().toISOString().split("T")[0];

export function Payments() {
  const { todaysPayments, paymentData } = useContext(PaymentContext);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // --- FIX: Initialize loading state to false ---
  // We trust the PaymentContext to provide either cached or fresh data instantly.
  // Loading will only be true when a user action (like filtering) triggers it.
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const tableContainerRef = useRef(null);

  const handleServerData = (response) => {
    if (response) {
      setTotalItems(response.totalCount);
    }
  };

  const paymentsToDisplay = useMemo(() => {
    const fromDate = dateRange.from.toISOString().split("T")[0];
    const toDate = dateRange.to.toISOString().split("T")[0];
    const today = getTodaysDateString();

    return fromDate === today && toDate === today
      ? todaysPayments
      : paymentData;
  }, [todaysPayments, paymentData, dateRange]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "transaction_date",
        header: "Transaction Date",
        size: 180,
      },
      {
        accessorKey: "transaction_number",
        header: "Transaction No.",
        size: 150,
      },
      { accessorKey: "customer_name", header: "Customer Name", size: 150 },
      { accessorKey: "amount_to_pay", header: "Amount To Pay", size: 120 },
      { accessorKey: "amount_rendered", header: "Amount Rendered", size: 120 },
      { accessorKey: "discount", header: "Discount", size: 100 },
      { accessorKey: "change", header: "Change", size: 100 },
      { accessorKey: "in_charge", header: "In Charge", size: 150 },
    ],
    []
  );

  const table = useReactTable({
    data: paymentsToDisplay,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  return (
    <div className="bg-background p-4">
      <PaymentsFilter
        onFilter={handleServerData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        loading={loading}
        setLoading={setLoading}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      <div className="relative mt-4">
        {/* This rendering logic will now work correctly */}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background shadow-input bg-opacity-50">
            Loading...
          </div>
        ) : paymentsToDisplay.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No recorded payments</p>
          </div>
        ) : (
          <VirtualizedTable
            table={table}
            tableContainerRef={tableContainerRef}
            rowVirtualizer={rowVirtualizer}
          />
        )}
      </div>
    </div>
  );
}

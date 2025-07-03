import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useState, useRef, useMemo } from "react";
import { PaymentsFilter } from "./PaymentsFilter";

// --- 1. Import the virtualizer hook and the shared table component ---
import { useVirtualizer } from "@tanstack/react-virtual";
import { VirtualizedTable } from "../../components/VirtualizedTable";

export function Payments() {
  const [payments, setPayments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // --- 2. Create a ref for the table container ---
  const tableContainerRef = useRef(null);

  const handleServerData = (response) => {
    setPayments(response.data);
    setTotalItems(response.totalCount);
  };

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
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // --- 3. Set up the row virtualizer ---
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40, // Or your average row height
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
      />
      {/* --- 4. Replace the old table with the VirtualizedTable component --- */}
      <div className="relative mt-4">
        <VirtualizedTable
          table={table}
          tableContainerRef={tableContainerRef}
          rowVirtualizer={rowVirtualizer}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background shadow-input bg-opacity-50">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}

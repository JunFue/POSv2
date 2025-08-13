import React from "react";
import { useCashout } from "../../context/CashoutProvider";
import { CashoutForm } from "./CashoutForm";
import { CashoutTable } from "./CashoutTable";
import { CashoutFilters } from "./CashoutFilters";

/**
 * Cashout (Main Component)
 * - This is a simple, clean layout component.
 * - All logic is handled by the context and child components.
 * - It wraps the feature in the CashoutProvider.
 */
export function Cashout() {
  // FIX: Consume the context here to get the data and functions.
  const { cashouts, loading, deleteCashout } = useCashout();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <CashoutFilters />
        <CashoutForm />
      </div>
      <div className="lg:col-span-2">
        {/* FIX: Pass the consumed data and functions as props to the table. */}
        <CashoutTable
          data={cashouts}
          loading={loading}
          onDelete={deleteCashout}
        />
      </div>
    </div>
  );
}

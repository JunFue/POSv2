import React from "react";

import { CashoutForm } from "./CashoutForm";
import { CashoutTable } from "./CashoutTable";
import { CashoutFilters } from "./CashoutFIlters";

/**
 * Cashout (Main Component)
 * - This is a simple, clean layout component.
 * - All logic is handled by the context and child components.
 * - It wraps the feature in the CashoutProvider.
 */
export function Cashout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <CashoutFilters />
        <CashoutForm />
      </div>
      <div className="lg:col-span-2">
        <CashoutTable />
      </div>
    </div>
  );
}

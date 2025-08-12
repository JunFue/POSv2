import React from "react";

export function TransactionNoFilter({ transactionNo, onTransactionNoChange }) {
  return (
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
        onChange={onTransactionNoChange}
        className="mt-1 block w-full traditional-input sm:text-sm"
        placeholder="Enter transaction number"
      />
    </div>
  );
}

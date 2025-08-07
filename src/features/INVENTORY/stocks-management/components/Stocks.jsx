import { StocksForm } from "./form/StocksForm";
import { StocksTable } from "./StocksTable";
import { useStocksSync } from "../hooks/useStocksSync"; // Corrected import name

export function Stocks() {
  // All logic is now handled by the new, more powerful hook.
  const {
    stockRecords,
    editingRecord,
    loading,
    isSyncing, // Use the new isSyncing state for background updates
    addRecord,
    updateRecord,
    deleteRecord,
    handleSetEditing,
    cancelEditing,
  } = useStocksSync(); // Corrected function call

  return (
    <div className="flex flex-col gap-[1vw] p-[1vw] bg-background rounded-lg h-fit relative">
      {/* Optional: Add a syncing indicator like in the items table */}
      {isSyncing && (
        <div className="absolute top-2 right-12 text-xs text-gray-500 animate-pulse">
          Syncing...
        </div>
      )}
      <StocksForm
        onAddRecord={addRecord}
        onUpdateRecord={updateRecord}
        editingRecord={editingRecord}
        onCancelEdit={cancelEditing}
      />
      {loading ? (
        <div className="text-center p-4">Loading stock records...</div>
      ) : (
        <StocksTable
          stockRecords={stockRecords}
          onEdit={handleSetEditing}
          onDelete={deleteRecord}
          editingRecordId={editingRecord?.id}
        />
      )}
    </div>
  );
}

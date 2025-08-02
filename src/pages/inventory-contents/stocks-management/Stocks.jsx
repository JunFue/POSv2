import { StocksForm } from "./StocksForm";
import { StocksTable } from "./StocksTable";
import { useStocks } from "./hooks/useStocks"; // Import the new custom hook

export function Stocks() {
  // All complex logic is now handled by the custom hook.
  const {
    stockRecords,
    editingRecord,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
    handleSetEditing,
    cancelEditing,
  } = useStocks();

  return (
    <div className="flex flex-col gap-[1vw] p-[1vw] bg-background rounded-lg h-fit">
      <StocksForm
        onAddRecord={addRecord}
        onUpdateRecord={updateRecord}
        editingRecord={editingRecord}
        onCancelEdit={cancelEditing}
      />
      {/* The UI remains the same, but the component is much cleaner. */}
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

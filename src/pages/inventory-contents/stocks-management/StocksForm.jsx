import { useForm } from "react-hook-form";
import { useState, useRef, useEffect, useContext } from "react";
import dayjs from "dayjs";
import { ItemRegData } from "../../../context/ItemRegContext";

export function StocksForm({
  onAddRecord,
  onUpdateRecord,
  editingRecord,
  onCancelEdit,
}) {
  const { items } = useContext(ItemRegData);
  // Unused 'setFocus' has been removed.
  const { register, handleSubmit, setValue, reset } = useForm();

  // Unused 'index' and 'setIndex' state has been removed.
  const [results, setResults] = useState([]);
  const itemInputRef = useRef(null);

  const isEditing = !!editingRecord;

  // Populate form when an editingRecord is passed in
  useEffect(() => {
    if (isEditing) {
      reset(editingRecord); // Use reset to populate all fields
    } else {
      reset({ item: "", stockFlow: "Stock In", quantity: "", notes: "" });
    }
  }, [editingRecord, reset, isEditing]);

  // Handle Escape key to cancel editing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancelEdit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancelEdit]);

  const onSubmit = (data) => {
    if (!data.item || data.item.trim() === "")
      return alert("Item field is required.");
    if (
      !data.quantity ||
      isNaN(parseInt(data.quantity)) ||
      parseInt(data.quantity) <= 0
    )
      return alert("Quantity must be a positive number.");

    const selectedItem = items.find(
      (item) => item.name.toLowerCase() === data.item.toLowerCase()
    );
    if (!selectedItem) return alert("Item not found in the inventory.");

    const recordData = {
      ...data,
      id: isEditing ? editingRecord.id : undefined, // Keep ID for updates
      packaging: selectedItem.packaging || "N/A",
      quantity: parseInt(data.quantity),
      date: isEditing
        ? editingRecord.date
        : dayjs().format("MM/DD/YYYY HH:mm:ss"),
    };

    if (isEditing) {
      onUpdateRecord(recordData);
    } else {
      onAddRecord(recordData);
    }
    reset();
    setResults([]);
  };

  const handleItemChange = (e) => {
    const input = e.target.value;
    if (input) {
      const filteredResults = items.filter((item) =>
        item.name.toLowerCase().startsWith(input.toLowerCase())
      );
      setResults(filteredResults);
    } else {
      setResults([]);
    }
  };

  const handleSelectSuggestion = (item) => {
    setValue("item", item.name, { shouldValidate: true, shouldDirty: true });
    setResults([]);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-[1vw] items-center bg-background shadow-neumorphic rounded-[5px] p-2"
    >
      {/* Item Input */}
      <div className="relative flex flex-col gap-1 items-center">
        <label className="text-[1vw] font-medium">Item</label>
        <input
          {...register("item")}
          onChange={handleItemChange}
          autoComplete="off"
          ref={itemInputRef}
          className="text-[1vw] h-[1.5vw] w-full max-w-[150px] shadow-input rounded-2xl p-2"
        />
        {results.length > 0 && (
          <div className="text-[1vw] absolute top-full z-10 bg-white border border-gray-300 rounded shadow-md max-h-40 overflow-y-auto w-full">
            {results.map((item) => (
              // The highlighting logic based on 'index' has been removed for simplicity.
              <div
                key={item.barcode}
                className="px-2 py-1 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSelectSuggestion(item)}
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Stock Flow */}
      <div className="relative flex flex-col gap-1 items-center">
        <label className="text-[1vw] font-medium">Stock Flow</label>
        <select
          {...register("stockFlow")}
          className="text-[1vw] h-[1.5vw] w-full max-w-[150px] shadow-input rounded-2xl"
        >
          <option value="Stock In">Stock In</option>
          <option value="Stock Out">Stock Out</option>
        </select>
      </div>
      {/* Quantity */}
      <div className="relative flex flex-col gap-1 items-center">
        <label className="text-[1vw] font-medium">Quantity</label>
        <input
          type="number"
          {...register("quantity")}
          min={1}
          autoComplete="off"
          className="text-[1vw] h-[1.5vw] w-full max-w-[150px] shadow-input rounded-2xl p-2"
        />
      </div>
      {/* Notes */}
      <div className="relative flex flex-col gap-1 items-center">
        <label className="text-[1vw] font-medium">Notes</label>
        <input
          type="text"
          {...register("notes")}
          autoComplete="off"
          className="text-[1vw] h-[1.5vw] w-full max-w-[150px] shadow-input rounded-2xl p-2"
        />
      </div>
      {/* Submit Button */}
      <button
        type="submit"
        className="shadow-button px-4 py-2 rounded-[5px] h-fit"
      >
        {isEditing ? "Update" : "Record"}
      </button>
      {isEditing && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="text-xs text-gray-500 ml-2"
        >
          Cancel (Esc)
        </button>
      )}
    </form>
  );
}

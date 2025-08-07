import { useForm } from "react-hook-form";
import { useEffect, useContext } from "react";
import dayjs from "dayjs";

import { ItemInputController } from "./ItemInputController"; // Updated import
import { FormInput, FormSelect } from "./FormInputs";
import { ItemRegData } from "../../../../../context/ItemRegContext";

/**
 * The main form component, now with enhanced keyboard navigation.
 */
export function StocksForm({
  onAddRecord,
  onUpdateRecord,
  editingRecord,
  onCancelEdit,
}) {
  const { items } = useContext(ItemRegData);
  // --- MODIFICATION: Get setFocus from useForm ---
  const { register, handleSubmit, setValue, reset, setFocus } = useForm();

  const isEditing = !!editingRecord;

  // An array defining the tab order of the form fields
  const fieldOrder = ["item", "stockFlow", "quantity", "notes"];

  // Populates the form with data when editing begins.
  useEffect(() => {
    if (isEditing) {
      reset(editingRecord);
    } else {
      reset({ item: "", stockFlow: "Stock In", quantity: "", notes: "" });
    }
  }, [editingRecord, reset]);

  // Allows canceling an edit by pressing the Escape key.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancelEdit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancelEdit]);

  // --- NEW: Handles all keyboard navigation within the form ---
  const handleFormKeyDown = (e) => {
    // On Shift+Enter, trigger form submission
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
      return;
    }

    // On Enter (without Shift), move focus to the next field
    if (e.key === "Enter") {
      // Let the ItemInputController handle Enter if its suggestion list is active
      if (
        e.target.name === "item" &&
        document.querySelector('[role="listbox"]')
      ) {
        // The suggestion list's own onKeyDown will handle selection.
        // After it runs, this code will proceed to move focus.
      }

      e.preventDefault(); // Prevent default form submission

      const activeElement = document.activeElement;
      if (!activeElement) return;

      const currentFieldIndex = fieldOrder.indexOf(activeElement.name);

      // If the current field is found and it's not the last one, focus the next one
      if (currentFieldIndex > -1 && currentFieldIndex < fieldOrder.length - 1) {
        const nextFieldName = fieldOrder[currentFieldIndex + 1];
        setFocus(nextFieldName);
      }
      // If it's the last field, loop back to the first one
      else if (currentFieldIndex === fieldOrder.length - 1) {
        setFocus(fieldOrder[0]);
      }
    }
  };

  // Handles form submission, validation, and data formatting.
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
      id: isEditing ? editingRecord.id : undefined,
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
  };

  return (
    <form
      // --- MODIFICATION: Add the onKeyDown handler to the form ---
      onKeyDown={handleFormKeyDown}
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-[1vw] items-end bg-background shadow-neumorphic rounded-[5px] p-2"
    >
      <ItemInputController
        name="item"
        register={register}
        setValue={setValue}
        isEditing={isEditing}
      />

      <FormSelect name="stockFlow" label="Stock Flow" register={register}>
        <option value="Stock In">Stock In</option>
        <option value="Stock Out">Stock Out</option>
      </FormSelect>

      <FormInput
        name="quantity"
        label="Quantity"
        type="number"
        register={register}
        min={1}
      />

      <FormInput name="notes" label="Notes" type="text" register={register} />

      <div className="flex items-center">
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
      </div>
    </form>
  );
}

import { useForm } from "react-hook-form";
import { useEffect, useContext } from "react";
import dayjs from "dayjs";

import { ItemInputController } from "./form/ItemInputController"; // Updated import
import { FormInput, FormSelect } from "./form/FormInputs";
import { ItemRegData } from "../../../context/ItemRegContext";

/**
 * The main form component, now using the ItemInputController.
 */
export function StocksForm({
  onAddRecord,
  onUpdateRecord,
  editingRecord,
  onCancelEdit,
}) {
  const { items } = useContext(ItemRegData);
  const { register, handleSubmit, setValue, reset } = useForm();

  const isEditing = !!editingRecord;

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

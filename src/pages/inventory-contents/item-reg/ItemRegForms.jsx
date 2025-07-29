import { useForm } from "react-hook-form";
import { useContext, useState, useCallback } from "react";
import { ItemRegData } from "../../../context/ItemRegContext";
import { registerItem } from "../../../api/itemService";
import { CategoryManager } from "./itemregforms-components/CategoryManager";
import { RegistrationFormFields } from "./itemregforms-components/RegistrationFormField";

// Helper to generate a temporary ID, still needed for optimistic updates
const generateTemporaryId = () =>
  `temp_${Math.random().toString(36).substr(2, 9)}`;

export const ItemRegForm = () => {
  const { serverOnline, items, addOptimisticItem, updateItemStatus } =
    useContext(ItemRegData);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [categories, setCategories] = useState([]);

  // Callback to receive the category list from the CategoryManager child
  const handleCategoriesChange = useCallback((loadedCategories) => {
    setCategories(loadedCategories);
  }, []);

  // --- MODIFIED: Form submission handler to use optimistic update correctly ---
  const addToRegistry = async (data) => {
    if (
      items.find(
        (item) =>
          item.barcode === data.barcode ||
          item.name.toLowerCase() === data.name.toLowerCase()
      )
    ) {
      alert("An item with the same barcode or name already exists.");
      return;
    }

    const tempId = generateTemporaryId();
    // 1. Optimistically add the new item to the UI with a 'pending' status.
    addOptimisticItem({ ...data, id: tempId, status: "pending" });
    reset();
    setTimeout(() => document.getElementById("barcode")?.focus(), 0);

    try {
      // 2. Attempt to save the item to the server. We assume `registerItem` returns the saved item with its final ID.
      const savedItem = await registerItem(data);

      // 3. Instead of refreshing the whole table, just update the single item we added.
      updateItemStatus(tempId, { ...savedItem, status: "synced" });
    } catch (error) {
      alert(error.message);
      // 4. If the save fails, update the item's status to 'failed'.
      updateItemStatus(tempId, { ...data, id: tempId, status: "failed" });
    }
  };

  // Event handler to manage 'Enter' key presses
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const target = e.target;
      const fieldOrder = ["barcode", "name", "price", "packaging", "category"];

      if (fieldOrder.includes(target.id)) {
        e.preventDefault();
        const currentFieldIndex = fieldOrder.indexOf(target.id);
        const nextFieldIndex = currentFieldIndex + 1;

        if (nextFieldIndex < fieldOrder.length) {
          const nextFieldName = fieldOrder[nextFieldIndex];
          const form = target.form;
          const nextField = form.querySelector(`#${nextFieldName}`);
          if (nextField) {
            nextField.focus();
          }
        } else {
          const form = target.form;
          const submitButton = form.querySelector('button[type="submit"]');
          if (submitButton) {
            submitButton.focus();
          }
        }
      }
    }
  };

  return (
    <div className="bg-background p-4 rounded-lg shadow-neumorphic">
      {!serverOnline && (
        <div className="text-red-500 font-bold mb-4">SERVER IS OFFLINE</div>
      )}

      <form
        onSubmit={handleSubmit(addToRegistry)}
        onKeyDown={handleKeyDown}
        noValidate
      >
        <RegistrationFormFields
          register={register}
          errors={errors}
          categories={categories}
          serverOnline={serverOnline}
          onReset={() => reset()}
        />
      </form>

      <CategoryManager onCategoriesChange={handleCategoriesChange} />
    </div>
  );
};

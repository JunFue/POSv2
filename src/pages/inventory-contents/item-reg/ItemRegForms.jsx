import { useForm } from "react-hook-form";
import { useContext, useState, useCallback } from "react";
import { ItemRegData } from "../../../context/ItemRegContext";
// We no longer need to import registerItem here, the hook handles it.
import { CategoryManager } from "./itemregforms-components/CategoryManager";
import { RegistrationFormFields } from "./itemregforms-components/RegistrationFormField";

export const ItemRegForm = () => {
  // --- Step 1: Get the correct `addItem` function from the context ---
  // Replaced `addOptimisticItem` and `updateItemStatus` with `addItem`.
  const { serverOnline, items, addItem } = useContext(ItemRegData);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [categories, setCategories] = useState([]);

  const handleCategoriesChange = useCallback((loadedCategories) => {
    setCategories(loadedCategories);
  }, []);

  // --- Step 2: Simplify the form submission handler ---
  // This function is now much cleaner. It only worries about form-level logic.
  const addToRegistry = async (data) => {
    // The duplicate check is still good to have here to provide immediate feedback.
    if (
      items.find(
        (item) =>
          item.barcode === data.barcode ||
          item.name.toLowerCase() === data.name.toLowerCase()
      )
    ) {
      // Note: alert() can be disruptive. Consider a more modern UI notification.
      alert("An item with the same barcode or name already exists.");
      return;
    }

    // --- THE FIX ---
    // Create a copy of the data object before passing it to addItem.
    // This prevents the `reset()` call from clearing the data for the new row.
    addItem({ ...data });

    // Reset the form for the next entry.
    reset();
    setTimeout(() => document.getElementById("barcode")?.focus(), 0);
  };

  // The handleKeyDown logic for form navigation remains unchanged.
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

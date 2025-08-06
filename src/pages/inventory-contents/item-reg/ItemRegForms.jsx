import { useForm } from "react-hook-form";
import { useContext, useState, useCallback } from "react";
import { ItemRegData } from "../../../context/ItemRegContext";
import { CategoryManager } from "./itemregforms-components/CategoryManager";
import { RegistrationFormFields } from "./itemregforms-components/RegistrationFormField";

export const ItemRegForm = () => {
  const { serverOnline, items, addItem } = useContext(ItemRegData);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // This local state is used to pass the categories to the form fields.
  const [categories, setCategories] = useState([]);

  // --- FIX: Wrap the handler in useCallback ---
  // This ensures that the function reference is stable across re-renders,
  // preventing the useEffect hook in CategoryManager from running in a loop.
  // The dependency array is empty because `setCategories` is a stable function.
  const handleCategoriesChange = useCallback((loadedCategories) => {
    setCategories(loadedCategories);
  }, []);

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

    addItem({ ...data });
    reset();
    setTimeout(() => document.getElementById("barcode")?.focus(), 0);
  };

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

      {/* The stable handleCategoriesChange function is passed here */}
      <CategoryManager onCategoriesChange={handleCategoriesChange} />
    </div>
  );
};

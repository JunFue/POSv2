import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { CategoryDropdown } from "./CategoryDropdown"; // Adjust path as needed
import { useCashoutApi } from "./useCashoutApi"; // Adjust path as needed

export function CashoutForm({
  selection,
  onAddOptimistic,
  onSubmissionSuccess,
  onSubmissionFailure,
}) {
  const defaultCategories = [
    "Food",
    "Rent",
    "Suppliers",
    "Supplies",
    "Bills",
    "Miscellaneous",
    "Salary/Shares",
    "Gas",
  ];

  const [categories, setCategories] = useState(defaultCategories);
  const { addCashout } = useCashoutApi({
    onAddOptimistic,
    onSubmissionSuccess,
    onSubmissionFailure,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: defaultCategories[0],
      amount: "",
      notes: "",
      receiptNo: "",
    },
  });

  // Refs for programmatically focusing inputs
  const amountRef = useRef(null);
  const notesRef = useRef(null);
  const receiptNoRef = useRef(null);

  // --- FIX: Combine react-hook-form's ref with our manual ref ---
  // We get the ref from the register function and assign it to both
  // react-hook-form's internal handler and our own `amountRef`.
  const amountFieldRegistration = register("amount", {
    required: "Amount is required.",
    valueAsNumber: true,
  });
  const notesFieldRegistration = register("notes");
  const receiptNoFieldRegistration = register("receiptNo");
  // --- END FIX ---

  const handleAddNewCategory = useCallback(
    (newCategory) => {
      setCategories((prev) => [...prev, newCategory]);
      setValue("category", newCategory, { shouldValidate: true });
    },
    [setValue]
  );

  const handleDeleteCategory = useCallback(
    (categoryToDelete) => {
      setCategories((prev) => {
        const newCategories = prev.filter((cat) => cat !== categoryToDelete);
        if (control._getWatch("category") === categoryToDelete) {
          setValue("category", newCategories[0] || "", {
            shouldValidate: true,
          });
        }
        return newCategories;
      });
    },
    [control, setValue]
  );

  const onSubmit = useCallback(
    (data) => {
      addCashout(data, selection).then(() => {
        reset();
      });
    },
    [addCashout, selection, reset]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit, onSubmit]);

  return (
    <div className="bg-background p-4 rounded-lg shadow-md">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
        autoComplete="off"
      >
        <Controller
          name="category"
          control={control}
          rules={{ required: "Category is required." }}
          render={({ field }) => (
            <CategoryDropdown
              categories={categories}
              selectedCategory={field.value}
              onSelectCategory={(category) => {
                field.onChange(category);
                amountRef.current?.focus();
              }}
              onAddCategory={handleAddNewCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}
        />

        <div>
          <label htmlFor="amount" className="block text-sm font-medium">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            className="traditional-input"
            {...amountFieldRegistration}
            ref={(e) => {
              amountFieldRegistration.ref(e);
              amountRef.current = e; // Assign to your own ref
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                notesRef.current?.focus();
              }
            }}
          />
          {errors.amount && (
            <span className="text-red-500 text-xs">
              {errors.amount.message}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            className="traditional-input min-h-[60px]"
            {...notesFieldRegistration}
            ref={(e) => {
              notesFieldRegistration.ref(e);
              notesRef.current = e;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                receiptNoRef.current?.focus();
              }
            }}
          />
        </div>

        <div>
          <label htmlFor="receiptNo" className="block text-sm font-medium">
            Receipt No.
          </label>
          <input
            id="receiptNo"
            type="text"
            className="traditional-input"
            {...receiptNoFieldRegistration}
            ref={(e) => {
              receiptNoFieldRegistration.ref(e);
              receiptNoRef.current = e;
            }}
          />
        </div>

        <div className="flex gap-4">
          <button type="submit" className="traditional-button flex-1">
            Record
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="traditional-button flex-1 bg-gray-400"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

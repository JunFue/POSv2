import React, { useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { ClassificationDropdown } from "./ClassificationDropdown";
import { CategoryDropdown } from "./CategoryDropdown"; // 1. Import the new dropdown
import { useCashout } from "../../context/CashoutProvider";

/**
 * CashoutForm
 * - Enhanced with keyboard navigation for rapid data entry.
 * - Focus shifts sequentially using the 'Enter' key.
 * - Submission is triggered by 'Shift+Enter' on the final field.
 */
export function CashoutForm() {
  const { addCashout } = useCashout();
  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      classification: "Food",
      category: "", // 2. Add category to form state
      amount: "",
      notes: "",
      receiptNo: "",
    },
  });

  // Refs for all focusable form elements
  const classificationButtonRef = useRef(null);
  const categoryButtonRef = useRef(null); // 3. Add ref for the new dropdown
  const amountRef = useRef(null);
  const notesRef = useRef(null);
  const receiptNoRef = useRef(null);

  // FIX: Destructure the ref from the register function to avoid collision
  const { ref: amountFormRef, ...amountRegister } = register("amount", {
    required: "Amount is required.",
  });
  const { ref: notesFormRef, ...notesRegister } = register("notes");
  const { ref: receiptNoFormRef, ...receiptNoRegister } = register("receiptNo");

  // Focuses the next element in the form
  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      nextFieldRef.current?.focus();
    }
  };

  // Special handler for the last field to allow submission
  const handleReceiptKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)(); // Manually trigger form submission
    }
  };

  const onSubmit = useCallback(
    (data) => {
      const payload = {
        ...data,
        amount: parseFloat(data.amount) || 0,
      };

      addCashout(payload).then(() => {
        reset();
        clearErrors();
        classificationButtonRef.current?.focus();
      });
    },
    [addCashout, reset, clearErrors]
  );

  return (
    <div className="bg-background p-4 rounded-lg shadow-md">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          New Entry
        </h3>
        <Controller
          name="classification"
          control={control}
          rules={{ required: "Classification is required." }}
          render={({ field }) => (
            <ClassificationDropdown
              buttonRef={classificationButtonRef}
              selectedClassification={field.value}
              onSelectClassification={(classification) => {
                field.onChange(classification);
                categoryButtonRef.current?.focus(); // 4. Focus next dropdown
              }}
            />
          )}
        />

        {/* --- 5. Add the new CategoryDropdown to the form --- */}
        <Controller
          name="category"
          control={control}
          rules={{ required: "Category is required." }}
          render={({ field }) => (
            <CategoryDropdown
              buttonRef={categoryButtonRef}
              selectedCategory={field.value}
              onSelectCategory={(category) => {
                field.onChange(category);
                amountRef.current?.focus();
              }}
            />
          )}
        />
        {/* --- End of new dropdown section --- */}

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-head-text"
          >
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            {...amountRegister}
            // FIX: This correctly merges the two refs
            ref={(e) => {
              amountFormRef(e);
              amountRef.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, notesRef)}
          />
          {errors.amount && (
            <span className="text-red-500 text-xs">
              {errors.amount.message}
            </span>
          )}
        </div>
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-head-text"
          >
            Notes
          </label>
          <textarea
            id="notes"
            rows="2"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            {...notesRegister}
            ref={(e) => {
              notesFormRef(e);
              notesRef.current = e;
            }}
            onKeyDown={(e) => handleKeyDown(e, receiptNoRef)}
          />
        </div>
        <div>
          <label
            htmlFor="receiptNo"
            className="block text-sm font-medium text-head-text"
          >
            Receipt No.
          </label>
          <input
            id="receiptNo"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            {...receiptNoRegister}
            ref={(e) => {
              receiptNoFormRef(e);
              receiptNoRef.current = e;
            }}
            onKeyDown={handleReceiptKeyDown}
          />
        </div>
        <div className="flex gap-4 pt-2">
          <button type="submit" className="w-full traditional-buttonc">
            Record
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              clearErrors();
            }}
            className="w-full traditional-button"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { CategoryDropdown } from "./CategoryDropdown";
import { useCashout } from "../../context/CashoutProvider";

/**
 * CashoutForm
 * - Uses react-hook-form for efficient form state management.
 * - Gets `addCashout` function from the context.
 */
export function CashoutForm() {
  const { addCashout } = useCashout();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: { category: "Food", amount: "", notes: "", receiptNo: "" },
  });

  const amountRef = useRef(null);

  const onSubmit = useCallback(
    (data) => {
      addCashout(data).then(() => reset());
    },
    [addCashout, reset]
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          New Entry
        </h3>
        <Controller
          name="category"
          control={control}
          rules={{ required: "Category is required." }}
          render={({ field }) => (
            <CategoryDropdown
              selectedCategory={field.value}
              onSelectCategory={(category) => {
                field.onChange(category);
                amountRef.current?.focus();
              }}
            />
          )}
        />
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            {...register("amount", {
              required: "Amount is required.",
              valueAsNumber: true,
            })}
            ref={amountRef}
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
            className="block text-sm font-medium text-gray-700"
          >
            Notes
          </label>
          <textarea
            id="notes"
            rows="2"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            {...register("notes")}
          />
        </div>
        <div>
          <label
            htmlFor="receiptNo"
            className="block text-sm font-medium text-gray-700"
          >
            Receipt No.
          </label>
          <input
            id="receiptNo"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            {...register("receiptNo")}
          />
        </div>
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Record
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

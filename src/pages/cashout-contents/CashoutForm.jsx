import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../features/pos-features/authentication/hooks/Useauth";
import { FaPlus, FaTrash } from "react-icons/fa";

export function CashoutForm({
  onAddCashout,
  updateCashoutStatus,
  setCashoutFailed,
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const dropdownListRef = useRef(null);
  const amountRef = useRef(null);
  // --- 1. Add refs for the next input fields ---
  const notesRef = useRef(null);
  const receiptNoRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const amountRegistration = register("amount", {
    required: true,
    valueAsNumber: true,
  });
  // --- 2. Get registration props for the new fields ---
  const notesRegistration = register("notes");
  const receiptNoRegistration = register("receiptNo");

  const selectedCategory = watch("category");
  const { session } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    register("category", { required: true });
    if (!selectedCategory && categories.length > 0) {
      setValue("category", categories[0]);
    }
  }, [register, setValue, categories, selectedCategory]);

  useEffect(() => {
    if (isDropdownOpen && highlightedIndex >= 0 && dropdownListRef.current) {
      const itemElement = dropdownListRef.current.children[highlightedIndex];
      if (itemElement) {
        itemElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isDropdownOpen]);

  const handleAddCategory = () => {
    const newCategory = prompt("Enter the name for the new category:");
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
      setValue("category", newCategory);
    }
    setIsDropdownOpen(false);
  };

  const handleDeleteCategory = (e, categoryToDelete) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete the category "${categoryToDelete}"?`
      )
    ) {
      setCategories((prev) => {
        const newCategories = prev.filter((cat) => cat !== categoryToDelete);
        if (selectedCategory === categoryToDelete) {
          setValue("category", newCategories[0] || "");
        }
        return newCategories;
      });
    }
  };

  const handleSelectCategory = (category) => {
    setValue("category", category);
    setIsDropdownOpen(false);
    amountRef.current?.focus();
  };

  const handleDropdownKeyDown = (e) => {
    if (!isDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setIsDropdownOpen(true);
      }
      return;
    }

    const optionsCount = categories.length + 1;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % optionsCount);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + optionsCount) % optionsCount);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < categories.length) {
          handleSelectCategory(categories[highlightedIndex]);
        } else if (highlightedIndex === categories.length) {
          handleAddCategory();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsDropdownOpen(false);
        break;
      default:
        break;
    }
  };

  const onSubmit = useCallback(
    async (data) => {
      const tempId = `temp-${Date.now()}`;
      const newCashout = { ...data, id: tempId, status: "pending" };

      onAddCashout(newCashout);
      reset();
      setValue("category", categories[0]);

      try {
        if (!session) throw new Error("Not authenticated");
        const response = await fetch("http://localhost:3000/api/cashouts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Server responded with an error");
        const savedRecord = await response.json();
        updateCashoutStatus(tempId, savedRecord);
      } catch (error) {
        console.error("Failed to save cashout:", error);
        setCashoutFailed(tempId);
      }
    },
    [
      categories,
      onAddCashout,
      reset,
      session,
      setCashoutFailed,
      setValue,
      updateCashoutStatus,
    ]
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
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Category
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onKeyDown={handleDropdownKeyDown}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="traditional-input text-left w-full flex justify-between items-center"
            >
              <span>{selectedCategory || "Select a category..."}</span>
              <span>&#x25BC;</span>
            </button>
            {isDropdownOpen && (
              <div
                ref={dropdownListRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                {categories.map((cat, idx) => (
                  <div
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className={`flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer ${
                      highlightedIndex === idx ? "bg-blue-100" : ""
                    }`}
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCategory(e, cat)}
                      className="p-1 hover:bg-red-200 rounded-full"
                    >
                      <FaTrash className="text-red-500" />
                    </button>
                  </div>
                ))}
                <div
                  onClick={handleAddCategory}
                  className={`flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 cursor-pointer border-t ${
                    highlightedIndex === categories.length ? "bg-blue-100" : ""
                  }`}
                >
                  <FaPlus />
                  <span>Add New Category</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            className="traditional-input"
            {...amountRegistration}
            ref={(e) => {
              amountRegistration.ref(e);
              amountRef.current = e;
            }}
            // --- 3. Add onKeyDown handler to jump focus ---
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                notesRef.current?.focus();
              }
            }}
          />
          {errors.amount && (
            <span className="text-red-500 text-xs">Amount is required.</span>
          )}
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            className="traditional-input min-h-[60px]"
            {...notesRegistration}
            ref={(e) => {
              notesRegistration.ref(e);
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
            {...receiptNoRegistration}
            ref={(e) => {
              receiptNoRegistration.ref(e);
              receiptNoRef.current = e;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Prevent submission but do nothing else
              }
            }}
          />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="traditional-button flex-1">
            Record
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setValue("category", categories[0]);
            }}
            className="traditional-button flex-1 bg-gray-400"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

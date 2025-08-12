import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

/**
 * CategoryDropdown
 * - A reusable dropdown component for selecting a category.
 * - NOTE: In a real app, category management (add/delete) should be
 * handled via API calls and managed in a central state/context.
 */
export function CategoryDropdown({ selectedCategory, onSelectCategory }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Hardcoded categories for this example.
  const categories = [
    "Food",
    "Rent",
    "Suppliers",
    "Supplies",
    "Bills",
    "Miscellaneous",
    "Salary/Shares",
    "Gas",
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (category) => {
    onSelectCategory(category);
    setIsOpen(false);
  };

  const handleAddCategory = (newCategory) => {
    if (newCategory) {
      // In a real app, you would call a function from context
      // to add the category to the database and update the state.
      console.log("Add category:", newCategory);
      alert(`"${newCategory}" would be added here.`);
    }
  };

  const handleDeleteCategory = (category) => {
    // In a real app, you would call a function from context
    // to delete the category.
    console.log("Delete category:", category);
    alert(`"${category}" would be deleted here.`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        htmlFor="category"
        className="block text-sm font-medium text-gray-700"
      >
        Category
      </label>
      <button
        id="category"
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white text-left flex justify-between items-center"
      >
        <span>{selectedCategory || "Select..."}</span>
        <span className="text-gray-400">&#x25BC;</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => handleSelect(cat)}
              className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
            >
              <span>{cat}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(cat);
                }}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <div
            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 cursor-pointer border-t"
            onClick={() => handleAddCategory(prompt("New category name:"))}
          >
            <FaPlus />
            <span>Add New</span>
          </div>
        </div>
      )}
    </div>
  );
}

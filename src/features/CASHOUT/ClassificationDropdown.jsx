// src/features/cashout/components/ClassificationDropdown.jsx

import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

/**
 * ClassificationDropdown
 * - Now accepts a `buttonRef` to allow its button to be focused from the parent.
 */
export function ClassificationDropdown({
  selectedClassification,
  onSelectClassification,
  buttonRef, // Accept a ref from the parent
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Hardcoded classifications for this example.
  const classifications = [
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

  const handleSelect = (classification) => {
    onSelectClassification(classification);
    setIsOpen(false);
  };

  const handleAddClassification = (newClassification) => {
    if (newClassification) {
      alert(`"${newClassification}" would be added here.`);
    }
  };

  const handleDeleteClassification = (classification) => {
    alert(`"${classification}" would be deleted here.`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        htmlFor="classification"
        className="block text-sm font-medium text-head-text"
      >
        Classification
      </label>
      <button
        id="classification"
        type="button"
        ref={buttonRef} // Attach the passed ref to the button element
        onClick={() => setIsOpen((p) => !p)}
        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-background text-left flex justify-between items-center"
      >
        <span>{selectedClassification || "Select..."}</span>
        <span className="text-gray-400">&#x25BC;</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {classifications.map((cat) => (
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
                  handleDeleteClassification(cat);
                }}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <div
            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 cursor-pointer border-t"
            onClick={() =>
              handleAddClassification(prompt("New classification name:"))
            }
          >
            <FaPlus />
            <span>Add New</span>
          </div>
        </div>
      )}
    </div>
  );
}

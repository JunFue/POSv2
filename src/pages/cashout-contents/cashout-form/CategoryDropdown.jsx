import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

export function CategoryDropdown({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to highlighted item
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const itemElement = listRef.current.children[highlightedIndex];
      itemElement?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (category) => {
    onSelectCategory(category);
    setIsOpen(false);
  };

  const handleAdd = () => {
    const newCategory = prompt("Enter the name for the new category:");
    if (newCategory && !categories.includes(newCategory)) {
      onAddCategory(newCategory);
    }
    setIsOpen(false);
  };

  const handleDelete = (e, category) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${category}"?`)) {
      onDeleteCategory(category);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    const optionsCount = categories.length + 1; // +1 for "Add New"
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
          handleSelect(categories[highlightedIndex]);
        } else if (highlightedIndex === categories.length) {
          handleAdd();
        }
        setIsOpen(false);
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label htmlFor="category" className="block text-sm font-medium">
        Category
      </label>
      <button
        id="category"
        type="button"
        onKeyDown={handleKeyDown}
        onClick={() => setIsOpen((prev) => !prev)}
        className="traditional-input text-left w-full flex justify-between items-center"
      >
        <span>{selectedCategory || "Select a category..."}</span>
        <span>&#x25BC;</span>
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {categories.map((cat, idx) => (
            <div
              key={cat}
              onClick={() => handleSelect(cat)}
              className={`flex justify-between items-center px-4 py-2 text-sm text-body-text hover:bg-gray-100 cursor-pointer ${
                highlightedIndex === idx ? "bg-blue-100" : ""
              }`}
            >
              <span>{cat}</span>
              <button
                type="button"
                onClick={(e) => handleDelete(e, cat)}
                className="p-1 hover:bg-red-200 rounded-full"
              >
                <FaTrash className="text-red-500" />
              </button>
            </div>
          ))}
          <div
            onClick={handleAdd}
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
  );
}

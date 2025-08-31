import React, { useState, useEffect, useRef } from "react";
import { getCategories } from "../../api/categoryService";

const CACHE_KEY = "user_categories";

export function CategoryDropdown({
  selectedCategory,
  onSelectCategory,
  buttonRef,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState(() => {
    // Load initial categories from local storage
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  const dropdownRef = useRef(null);

  // Fetch and update categories on component mount
  useEffect(() => {
    const fetchAndCacheCategories = async () => {
      try {
        const freshCategories = await getCategories();
        setCategories(freshCategories);
        localStorage.setItem(CACHE_KEY, JSON.stringify(freshCategories));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchAndCacheCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (category) => {
    onSelectCategory(category.name);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        htmlFor="category"
        className="block text-sm font-medium text-head-text"
      >
        Category
      </label>
      <button
        id="category"
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-background text-left flex justify-between items-center"
      >
        <span>{selectedCategory || "Select..."}</span>
        <span className="text-gray-400">&#x25BC;</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleSelect(cat)}
              className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
            >
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

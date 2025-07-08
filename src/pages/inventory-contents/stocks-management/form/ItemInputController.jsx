import React, { useState, useRef, useEffect, useContext } from "react";

import { ItemRegData } from "../../../../context/ItemRegContext";
import { SuggestionList } from "../../../../shared-components/forms/SuggestionList";

/**
 * A controller component that wraps a text input to provide autocomplete functionality.
 * It now correctly merges its own logic with props from react-hook-form.
 */
export function ItemInputController({ register, setValue, name, isEditing }) {
  const { items } = useContext(ItemRegData);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Get all props from react-hook-form's register function
  const {
    ref: formRef,
    onChange: formOnChange,
    ...restRegister
  } = register(name);
  const ownRef = useRef(null);

  // Handles user input to filter items and show suggestions.
  const handleChange = (e) => {
    // First, call the library's onChange handler to keep it in sync.
    formOnChange(e);

    // Then, run our custom suggestion logic.
    const value = e.target.value;
    if (value && document.activeElement === ownRef.current) {
      const filtered = items.filter((item) =>
        item.name.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handles selecting a suggestion from the list.
  const handleSelect = (item) => {
    setValue(name, item.name, { shouldValidate: true });
    setShowSuggestions(false);
  };

  // Handles keyboard navigation (ArrowUp, ArrowDown, Enter).
  const handleKeyDown = (e) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && highlightedIndex > -1) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    }
  };

  // Hides suggestions when editing starts or when clicking outside.
  useEffect(() => {
    if (isEditing) setShowSuggestions(false);
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ownRef.current && !ownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col gap-1 items-center w-full">
      <label className="text-[1vw] font-medium">Item</label>
      <input
        {...restRegister}
        // Correctly merge the refs
        ref={(e) => {
          formRef(e);
          ownRef.current = e;
        }}
        // Use our combined onChange handler
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleChange}
        autoComplete="off"
        className="text-[1vw] h-[1.5vw] w-full max-w-[150px] shadow-input rounded-2xl p-2"
      />
      {showSuggestions && suggestions.length > 0 && (
        <SuggestionList
          suggestions={suggestions}
          highlightedIndex={highlightedIndex}
          onSelect={handleSelect}
          // Pass custom classes for this specific context.
          // For example, a light theme for this form.
          className="absolute top-full left-0 w-full mt-1 bg-background shadow-neumorphic rounded max-h-40 overflow-y-auto no-scrollbar z-10"
        />
      )}
    </div>
  );
}

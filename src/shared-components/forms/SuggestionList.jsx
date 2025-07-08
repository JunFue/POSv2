import React, { useEffect, useRef } from "react";

/**
 * A reusable list component for showing suggestions.
 * @param {string} [className=""] - Allows passing additional CSS classes from the parent for custom styling.
 */
export function SuggestionList({
  suggestions,
  highlightedIndex,
  onSelect,
  className = "", // Accept a className prop with a default empty string
}) {
  const scrollContainerRef = useRef(null);

  // This effect ensures the highlighted item is always visible within the list.
  useEffect(() => {
    if (highlightedIndex < 0 || !scrollContainerRef.current) {
      return;
    }
    const highlightedItem =
      scrollContainerRef.current.children[highlightedIndex];
    if (highlightedItem) {
      highlightedItem.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  // Combine the default classes with any custom classes passed in the `className` prop.

  return (
    <div ref={scrollContainerRef} className={className}>
      {suggestions.map((item, idx) => (
        <p
          key={item.id || item.barcode || idx}
          className={`text-[1vw] px-2 py-1 cursor-pointer ${
            highlightedIndex === idx
              ? "bg-cyan-600 text-white"
              : "hover:bg-gray-500/20"
          }`}
          onMouseDown={() => onSelect(item)}
        >
          {item.name}
        </p>
      ))}
    </div>
  );
}

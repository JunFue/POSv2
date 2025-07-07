import React, { useEffect, useRef } from "react";

export function SuggestionList({ suggestions, highlightedIndex, onSelect }) {
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

  return (
    // The className has been updated for more robust, relative positioning.
    <div
      ref={scrollContainerRef}
      className="absolute top-full left-0 w-full mt-1 bg-background shadow-neumorphic rounded max-h-40 overflow-y-auto no-scrollbar z-10"
    >
      {suggestions.map((item, idx) => (
        <p
          key={item.id || item.barcode || idx}
          className={`text-[1vw] px-2 py-1 cursor-pointer ${
            highlightedIndex === idx
              ? "bg-cyan-600 text-white"
              : "hover:bg-gray-500/20"
          }`}
          // The key fix: using onMouseDown instead of onClick.
          // This prevents the input's blur event from interfering with the selection.
          onMouseDown={() => onSelect(item)}
        >
          {item.name}
        </p>
      ))}
    </div>
  );
}

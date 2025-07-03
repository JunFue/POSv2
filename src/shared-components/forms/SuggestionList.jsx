import React, { useEffect, useRef } from "react";

export function SuggestionList({ suggestions, highlightedIndex, onSelect }) {
  // 1. Create a ref for the scrollable container.
  const scrollContainerRef = useRef(null);

  // 2. Create an effect that runs whenever the highlighted item changes.
  useEffect(() => {
    if (highlightedIndex < 0 || !scrollContainerRef.current) {
      return;
    }

    // Find the currently highlighted list item element.
    const highlightedItem =
      scrollContainerRef.current.children[highlightedIndex];

    if (highlightedItem) {
      // 3. If the item exists, scroll it into view.
      highlightedItem.scrollIntoView({
        block: "nearest", // Prevents unnecessary scrolling if the item is already visible.
        behavior: "smooth", // Provides a smooth scrolling animation.
      });
    }
  }, [highlightedIndex]);

  return (
    // 4. Attach the ref to the scrollable div.
    <div
      ref={scrollContainerRef}
      className="w-fit px-1 absolute z-1 top-[60%] left-[19%] md:top-[60%] md:left-[18%] lg:top-[60%] lg:left-[17%] xl:top-[60%] xl:left-[18%] bg-background shadow-neumorphic rounded max-h-40 overflow-y-auto no-scrollbar"
    >
      {suggestions.map((item, idx) => (
        <p
          key={item.id || item.barcode || idx}
          className={`text-[1vw] px-1 ${
            highlightedIndex === idx ? "bg-cyan-600 " : ""
          }`}
          onClick={() => onSelect(item)}
          style={{ cursor: "pointer" }}
        >
          {item.name}
        </p>
      ))}
    </div>
  );
}

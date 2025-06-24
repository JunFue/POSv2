import React from "react";

export function SuggestionList({ suggestions, highlightedIndex, onSelect }) {
  return (
    <div className="w-fit px-1 absolute z-1 top-[29%] left-[19.5%] bg-background/30 backdrop-blur-lg border border-background/40 shadow-[0_8px_32px_0_cyan] rounded max-h-40 overflow-y-auto">
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

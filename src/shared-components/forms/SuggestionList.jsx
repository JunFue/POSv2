import React from "react";

export function SuggestionList({ suggestions, highlightedIndex, onSelect }) {
  return (
    <div className="w-fit absolute z-1 top-[11vw] left-[9vw] bg-white border border-gray-300 rounded shadow-md max-h-40 overflow-y-auto">
      {suggestions.map((item, idx) => (
        <p
          key={item.id || item.barcode || idx}
          className={`text-[1vw] ${
            highlightedIndex === idx ? "bg-gray-200" : ""
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

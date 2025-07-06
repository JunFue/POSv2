import React from "react";
import { FaTimes } from "react-icons/fa";

export function MiniCard({ title, value, onHide, ...props }) {
  const { className, style, children } = props;

  return (
    <div
      {...props}
      className={`${className} bg-white/5 backdrop-blur-md rounded-lg p-3 flex flex-col justify-between relative`}
      style={{ ...style, overflow: "hidden" }}
    >
      {/* Added 'mini-drag-handle' class to make this the draggable area */}
      <div className="mini-drag-handle cursor-grab">
        <h4 className="text-xs text-gray-300 font-semibold">{title}</h4>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
      {children}
      <button
        onClick={onHide}
        className="absolute top-1 right-1 p-1 text-gray-400 hover:text-white"
        title="Hide Card"
      >
        <FaTimes size={12} />
      </button>
    </div>
  );
}

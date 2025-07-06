import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaSearchPlus } from "react-icons/fa"; // Import the zoom icon

export function DashboardCard({
  children,
  title,
  id,
  width,
  height,
  handleZoom,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  // Add a smooth transition for size changes
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "width 0.2s ease-in-out, height 0.2s ease-in-out",
    width: `${width}px`,
    height: `${height}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-1 relative flex flex-col"
    >
      {/* Card Header - Draggable Handle */}
      <div
        {...listeners}
        className="flex justify-between items-center p-4 text-white cursor-grab touch-none"
      >
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent drag from starting when clicking the menu
              setIsDropdownOpen((prev) => !prev);
            }}
            className="p-1 rounded-full hover:bg-white/20"
          >
            <BsThreeDotsVertical />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-xl rounded-md shadow-xl z-10 text-gray-800">
              <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-200">
                Option 1
              </a>
              <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-200">
                Option 2
              </a>
              <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-200">
                Settings
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-grow overflow-auto text-white px-4 pb-4">
        {children}
      </div>

      {/* Zoom Icon */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent drag from starting
          handleZoom(id);
        }}
        className="absolute bottom-2 right-2 p-2 text-white/50 hover:text-white"
      >
        <FaSearchPlus />
      </button>
    </div>
  );
}

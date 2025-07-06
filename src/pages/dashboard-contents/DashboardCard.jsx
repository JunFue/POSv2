import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

export function DashboardCard({ children, title, ...props }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // The props from react-grid-layout (style, className, event handlers)
  // must be passed directly to the root element.
  return (
    <div
      {...props} // This spreads style, className, AND the necessary event handlers
      className={`${props.className} bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-1 !overflow-hidden flex flex-col`}
    >
      {/* Card Header */}
      <div className="flex justify-between items-center p-4 text-white cursor-grab">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
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
    </div>
  );
}

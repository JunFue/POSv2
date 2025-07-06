import React, { useState } from "react";
import { ResizableBox } from "react-resizable";
import { BsThreeDotsVertical } from "react-icons/bs";
import "react-resizable/css/styles.css"; // Required for resize handles

export function DashboardCard({
  children,
  title,
  initialHeight = 300,
  initialWidth = 400,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    // The ResizableBox component wraps our card to make it resizable.
    <ResizableBox
      width={initialWidth}
      height={initialHeight}
      minConstraints={[200, 150]} // Minimum size
      maxConstraints={[1000, 800]} // Maximum size
      className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-1 relative"
      resizeHandles={["se"]} // Show resize handle only on the south-east corner
    >
      <div className="w-full h-full flex flex-col p-4">
        {/* Card Header */}
        <div className="flex justify-between items-center mb-4 text-white">
          <h3 className="font-bold text-lg">{title}</h3>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="p-1 rounded-full hover:bg-white/20"
            >
              <BsThreeDotsVertical />
            </button>
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-xl rounded-md shadow-xl z-10 text-gray-800">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm hover:bg-gray-200"
                >
                  Option 1
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm hover:bg-gray-200"
                >
                  Option 2
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm hover:bg-gray-200"
                >
                  Settings
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="flex-grow overflow-auto text-white">{children}</div>
      </div>
    </ResizableBox>
  );
}

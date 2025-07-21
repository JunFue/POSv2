import React from "react";
// BsThreeDotsVertical is no longer needed and has been removed.

export function DashboardCard({ children, title, ...props }) {
  // The state for the dropdown menu has been removed.

  return (
    <div
      {...props}
      className={`${props.className} bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-1 !overflow-hidden flex flex-col`}
    >
      {/* Card Header */}
      <div className="drag-handle flex justify-between items-center p-4 text-body-text cursor-grab">
        <h3 className="font-bold text-lg">{title}</h3>
        {/* The entire div for the three-dots menu has been removed from here. */}
      </div>

      {/* Card Content */}
      <div className="flex-grow text-body-text px-4 pb-4 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

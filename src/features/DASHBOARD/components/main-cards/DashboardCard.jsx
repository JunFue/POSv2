// ./components/main-cards/DashboardCard.jsx

import React from "react";
import { FaTimes } from "react-icons/fa";

export const DashboardCard = React.memo(function DashboardCard({
  children,
  title,
  onHide,
  ...props
}) {
  return (
    // ❗ THE FIX IS HERE:
    // Ensure there are NO padding classes (like "p-1") on this root div.
    // This element has the background, so it must fill the entire container.
    <div
      {...props}
      className={`${props.className} bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl !overflow-hidden flex flex-col`}
    >
      {/* Card Header */}
      <div className="drag-handle flex justify-between items-center p-4 text-body-text cursor-grab">
        <h3 className="font-bold text-lg">{title}</h3>
        <button
          onClick={onHide}
          className="cancel-drag text-gray-400 hover:text-white transition-colors p-1"
          aria-label={`Hide ${title} card`}
        >
          <FaTimes />
        </button>
      </div>

      {/* Card Content Wrapper */}
      {/* The padding for the content belongs inside the card, not on the card itself. */}
      <div className="flex-grow text-body-text overflow-hidden p-4">
        {children}
      </div>
    </div>
  );
});

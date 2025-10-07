import React, { useState } from "react";
import { FaCog } from "react-icons/fa";

const SettingsDropdown = ({ cards, onToggleVisibility }) => (
  <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-30">
    <p className="p-3 text-sm font-bold text-body-text border-b border-gray-700">
      Show/Hide Cards
    </p>
    <ul className="p-1 max-h-60 overflow-y-auto">
      {cards.map((card) => (
        <li
          key={card.id}
          className="flex items-center p-2 text-sm text-body-text rounded hover:bg-gray-700"
        >
          <input
            type="checkbox"
            id={`toggle-dashboard-${card.id}`}
            checked={card.isVisible}
            onChange={() => onToggleVisibility(card.id)}
            className="mr-3 h-4 w-4 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-600"
          />
          <label
            htmlFor={`toggle-dashboard-${card.id}`}
            className="cursor-pointer flex-grow"
          >
            {card.title}
          </label>
        </li>
      ))}
    </ul>
  </div>
);

export const DashboardHeader = ({
  cards,
  onToggleVisibility,
  currentView,
  onSwitchView,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="p-4 flex justify-end items-center gap-4 bg-background border-b-3">
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-3 bg-gray-600 text-body-text font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-all"
          aria-label="Customize Dashboard Cards"
        >
          <FaCog />
        </button>
        {isDropdownOpen && (
          <SettingsDropdown
            cards={cards}
            onToggleVisibility={onToggleVisibility}
          />
        )}
      </div>

      <button
        onClick={onSwitchView}
        className="px-4 py-2 bg-blue-600 text-body-text font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all"
      >
        Switch to{" "}
        {currentView === "dashboard" ? "Report View" : "Dashboard View"}
      </button>
    </div>
  );
};

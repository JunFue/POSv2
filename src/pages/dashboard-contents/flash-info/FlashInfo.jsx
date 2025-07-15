import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { FaCog } from "react-icons/fa";

// 1. Import the new, individual card components
import { TodaysGrossSalesCard } from "./cards/TodaysGrossSalesCard";
import { DailyIncomeCard } from "./cards/DailyIncomeCard";
import { MonthlyIncomeCard } from "./cards/MonthlyIncomeCard";
// ... import other card components as you create them

const ResponsiveGridLayout = WidthProvider(Responsive);

// 2. The state now only defines the metadata for each card
const initialCards = [
  {
    id: "todays-gross-sales",
    title: "Today's Gross Sales",
    isVisible: true,
    layout: { x: 0, y: 0, w: 2, h: 1 },
  },
  {
    id: "daily-income",
    title: "Daily Income",
    isVisible: true,
    layout: { x: 2, y: 0, w: 2, h: 1 },
  },
  {
    id: "monthly-income",
    title: "Monthly Income",
    isVisible: true,
    layout: { x: 4, y: 0, w: 2, h: 1 },
  },
  // ... add other card metadata here
];

// 3. A map to easily link a card ID to its component
const cardComponentMap = {
  "todays-gross-sales": TodaysGrossSalesCard,
  "daily-income": DailyIncomeCard,
  "monthly-income": MonthlyIncomeCard,
  // ... add other card components here
};

const generateLayouts = (cards) => {
  const layouts = {};
  ["lg", "md", "sm", "xs", "xxs"].forEach((bp) => {
    layouts[bp] = cards.map((card) => ({ i: card.id, ...card.layout }));
  });
  return layouts;
};

export function FlashInfo() {
  const [cards, setCards] = useState(initialCards);
  const [layouts, setLayouts] = useState(generateLayouts(initialCards));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleToggleVisibility = (cardId) => {
    setCards(
      cards.map((card) =>
        card.id === cardId ? { ...card, isVisible: !card.isVisible } : card
      )
    );
  };

  const onLayoutChange = (layout, newLayouts) => {
    setLayouts(newLayouts);
  };

  const visibleCards = cards.filter((card) => card.isVisible);

  return (
    <div className="w-full h-full flex flex-col">
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
      <div className="absolute top-4 right-3 z-20">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-2 text-gray-300 hover:text-white"
        >
          <FaCog />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
            <p className="p-3 text-sm font-bold text-white border-b border-gray-700">
              Show/Hide Cards
            </p>
            <ul className="p-1 max-h-48 overflow-y-auto scrollbar-hide">
              {cards.map((card) => (
                <li
                  key={card.id}
                  className="flex items-center p-2 text-sm text-white rounded hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    id={`toggle-${card.id}`}
                    checked={card.isVisible}
                    onChange={() => handleToggleVisibility(card.id)}
                    className="mr-3 h-4 w-4 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-600"
                  />
                  <label htmlFor={`toggle-${card.id}`}>{card.title}</label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="w-full h-full overflow-y-auto scrollbar-hide">
        <ResponsiveGridLayout
          layouts={layouts}
          onLayoutChange={onLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 6, md: 4, sm: 4, xs: 2, xxs: 2 }}
          rowHeight={80}
          margin={[10, 10]}
          draggableHandle=".mini-drag-handle"
        >
          {visibleCards.map((card) => {
            const CardComponent = cardComponentMap[card.id];
            if (!CardComponent) return null;

            return (
              // --- FIX: Removed the problematic data-grid prop ---
              // The library will now correctly handle the layout based on the key.
              <div key={card.id}>
                <CardComponent onHide={() => handleToggleVisibility(card.id)} />
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}

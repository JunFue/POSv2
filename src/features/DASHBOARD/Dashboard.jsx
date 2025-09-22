import React, { useState, useMemo, lazy, Suspense, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { DashboardCard } from "./components/main-cards/DashboardCard";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Report from "./components/report-generator/Report";
import { FaCog } from "react-icons/fa";

const ResponsiveGridLayout = WidthProvider(Responsive);

// LocalStorage keys for persisting layout and card visibility
const LAYOUT_STORAGE_KEY = "dashboard-layouts-v1";
const CARDS_STORAGE_KEY = "dashboard-cards-v1";

// Lazy-load the dashboard components to improve initial load time
const FlashInfo = lazy(() =>
  import("./components/main-cards/FlashInfo").then((module) => ({
    default: module.FlashInfo,
  }))
);
const DailyReport = lazy(() =>
  import("./components/main-cards/DailyReport").then((module) => ({
    default: module.DailyReport,
  }))
);
const CashoutReport = lazy(() =>
  import("./components/main-cards/CashoutReport").then((module) => ({
    default: module.CashoutReport,
  }))
);
const CashFlow = lazy(() =>
  import("./components/main-cards/CashFlow").then((module) => ({
    default: module.CashFlow,
  }))
);

// A simple spinner for the Suspense fallback
const CardSpinner = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-white/50"></div>
  </div>
);

// Base definitions for the cards
const initialCardData = [
  { id: "1", title: "Flash Info", component: FlashInfo },
  { id: "2", title: "Daily Report", component: DailyReport },
  { id: "3", title: "Cashout Report", component: CashoutReport },
  { id: "4", title: "Cash Flow", component: CashFlow },
];

// Generates the default layout for the cards
const generateLayout = () => {
  return initialCardData.map((card, index) => ({
    i: card.id,
    x: (index * 4) % 12,
    y: Math.floor(index / 3) * 4,
    w: 4,
    h: 5,
  }));
};

export function Dashboard() {
  const [view, setView] = useState("dashboard");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State for card visibility, loaded from localStorage
  const [cards, setCards] = useState(() => {
    let storedCardsConfig = {};
    try {
      const storedData = localStorage.getItem(CARDS_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        parsedData.forEach((card) => {
          storedCardsConfig[card.id] = { isVisible: card.isVisible };
        });
      }
    } catch (error) {
      console.error("Error parsing cards from localStorage", error);
    }
    // Merge base card data with stored visibility preferences
    return initialCardData.map((card) => ({
      ...card,
      isVisible: storedCardsConfig[card.id]?.isVisible ?? true,
    }));
  });

  // State for grid layout, loaded from localStorage
  const [layouts, setLayouts] = useState(() => {
    try {
      const savedLayouts = localStorage.getItem(LAYOUT_STORAGE_KEY);
      return savedLayouts ? JSON.parse(savedLayouts) : { lg: generateLayout() };
    } catch (error) {
      console.error("Error loading layout from localStorage:", error);
      return { lg: generateLayout() };
    }
  });

  // Save card visibility to localStorage whenever it changes
  useEffect(() => {
    try {
      const cardsToStore = cards.map(({ id, isVisible }) => ({
        id,
        isVisible,
      }));
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cardsToStore));
    } catch (error) {
      console.error("Error saving cards to localStorage", error);
    }
  }, [cards]);

  // Handler for saving layout changes
  const handleLayoutChange = (layout, allLayouts) => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(allLayouts));
      setLayouts(allLayouts);
    } catch (error) {
      console.error("Error saving layout to localStorage:", error);
    }
  };

  // Handler for toggling the visibility of a card
  const handleToggleVisibility = (cardId) => {
    setCards(
      cards.map((card) =>
        card.id === cardId ? { ...card, isVisible: !card.isVisible } : card
      )
    );
  };

  // Memoized list of card components to render
  const memoizedCards = useMemo(
    () =>
      cards
        .filter((card) => card.isVisible)
        .map((card) => {
          const Component = card.component;
          return (
            <DashboardCard
              key={card.id}
              title={card.title}
              onHide={() => handleToggleVisibility(card.id)}
            >
              <Suspense fallback={<CardSpinner />}>
                <Component />
              </Suspense>
            </DashboardCard>
          );
        }),
    [cards]
  );

  return (
    <div>
      <div className="p-4 flex justify-end items-center gap-4 bg-gray-100">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-all"
            aria-label="Customize Dashboard Cards"
          >
            <FaCog />
          </button>
          {isDropdownOpen && (
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
                      onChange={() => handleToggleVisibility(card.id)}
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
          )}
        </div>

        <button
          onClick={() => setView(view === "dashboard" ? "report" : "dashboard")}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all"
        >
          Switch to {view === "dashboard" ? "Report View" : "Dashboard View"}
        </button>
      </div>

      {view === "dashboard" ? (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={70}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          draggableCancel=".cancel-drag"
        >
          {memoizedCards}
        </ResponsiveGridLayout>
      ) : (
        <Suspense
          fallback={<div className="p-8 text-center">Loading Report...</div>}
        >
          <Report />
        </Suspense>
      )}
    </div>
  );
}

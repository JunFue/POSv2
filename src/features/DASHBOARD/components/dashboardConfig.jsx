import { lazy } from "react";
import { CategoryPage } from "./CategoryPage";

// Lazy-load the dashboard components to improve initial load time
const FlashInfo = lazy(() =>
  import("./main-cards/FlashInfo").then((module) => ({
    default: module.FlashInfo,
  }))
);
const DailyReport = lazy(() =>
  import("./main-cards/DailyReport").then((module) => ({
    default: module.DailyReport,
  }))
);
const CashoutReport = lazy(() =>
  import("./main-cards/CashoutReport").then((module) => ({
    default: module.CashoutReport,
  }))
);
const CashFlow = lazy(() =>
  import("./main-cards/CashFlow").then((module) => ({
    default: module.CashFlow,
  }))
);

// Base definitions for the cards
export const initialCardData = [
  { id: "1", title: "Flash Info", component: FlashInfo },
  { id: "2", title: "Daily Report", component: DailyReport },
  { id: "3", title: "Cashout Report", component: CashoutReport },
  { id: "4", title: "Cash Flow", component: CashFlow },
];

/**
 * Generates the initial card configuration by combining static and dynamic (category) cards.
 * @param {Array} categoryData - The data for the categories.
 * @returns {Array} A combined list of all card configurations.
 */
export const generateInitialCards = (categoryData) => {
  const categoryCards = categoryData.map((cat) => ({
    id: `category-${cat.id}`,
    title: `${cat.name} Overview`,
    component: () => <CategoryPage categoryName={cat.name} isWidget={true} />,
  }));
  return [...initialCardData, ...categoryCards];
};

/**
 * Generates the default layout for a given set of cards.
 * @param {Array} allCards - An array of card objects, each with an 'id'.
 * @returns {Array} The layout configuration for react-grid-layout.
 */
export const generateLayout = (allCards) => {
  return allCards.map((card, index) => ({
    i: card.id,
    x: (index * 4) % 12,
    y: Math.floor(index / 3) * 4,
    w: 4,
    h: 5,
  }));
};

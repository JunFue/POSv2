import React, { useState, useMemo, lazy, Suspense } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { DashboardCard } from "./components/main-cards/DashboardCard";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);
const LAYOUT_STORAGE_key = "dashboard-layouts-v1";

// Lazy-load the dashboard components to improve initial load time.
// Correctly handle the `default` export for each module.
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

const initialCards = [
  { id: "1", title: "Flash Info", component: FlashInfo },
  { id: "2", title: "Daily Report", component: DailyReport },
  { id: "3", title: "Cashout Report", component: CashoutReport },
  { id: "4", title: "Cash Flow", component: CashFlow },
];

const generateLayout = () => {
  return initialCards.map((card, index) => ({
    i: card.id,
    x: (index * 4) % 12,
    y: Math.floor(index / 3) * 4,
    w: 4,
    h: 5,
  }));
};

export function Dashboard() {
  const [layouts, setLayouts] = useState(() => {
    try {
      const savedLayouts = localStorage.getItem(LAYOUT_STORAGE_key);
      return savedLayouts ? JSON.parse(savedLayouts) : { lg: generateLayout() };
    } catch (error) {
      console.error("Error loading layout from localStorage:", error);
      return { lg: generateLayout() };
    }
  });

  const handleLayoutChange = (layout, allLayouts) => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_key, JSON.stringify(allLayouts));
      setLayouts(allLayouts);
    } catch (error) {
      console.error("Error saving layout to localStorage:", error);
    }
  };

  // useMemo will prevent the card elements from being recreated on every render.
  const memoizedCards = useMemo(
    () =>
      initialCards.map((card) => {
        // Here we render the component reference, not a new instance.
        const Component = card.component;
        return (
          <DashboardCard key={card.id} title={card.title}>
            <Suspense fallback={<CardSpinner />}>
              <Component />
            </Suspense>
          </DashboardCard>
        );
      }),
    [] // Empty dependency array means this only runs once.
  );

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={70}
      onLayoutChange={handleLayoutChange}
      draggableHandle=".drag-handle"
    >
      {memoizedCards}
    </ResponsiveGridLayout>
  );
}

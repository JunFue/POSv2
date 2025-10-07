import React, { useState, useMemo, Suspense } from "react";
import { useCategoryContext } from "../../components/NAVIGATION/CategoryContext";
import {
  generateInitialCards,
  generateLayout,
} from "./components/dashboardConfig";
import { useDashboardCards } from "./hooks/useDashboardCards";
import { DashboardHeader } from "./components/DashboardHeader";
import { GridLayout } from "./components/GridLayout";
import { DashboardCard } from "./components/main-cards/DashboardCard";
import Report from "./components/report-generator/Report";

const CardSpinner = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-white/50"></div>
  </div>
);

export function Dashboard() {
  const { categories: categoryData } = useCategoryContext();
  const [view, setView] = useState("dashboard");

  const allInitialCards = useMemo(
    () => generateInitialCards(categoryData),
    [categoryData]
  );

  const { cards, handleToggleVisibility } = useDashboardCards(allInitialCards);

  const memoizedCards = useMemo(
    () =>
      cards
        .filter((card) => card.isVisible)
        .map((card) => {
          const Component = card.component;
          return (
            <div key={card.id} data-grid={generateLayout([card])[0]}>
              <DashboardCard
                title={card.title}
                onHide={() => handleToggleVisibility(card.id)}
              >
                <Suspense fallback={<CardSpinner />}>
                  <Component />
                </Suspense>
              </DashboardCard>
            </div>
          );
        }),
    [cards, handleToggleVisibility]
  );

  const handleSwitchView = () => {
    setView(view === "dashboard" ? "report" : "dashboard");
  };

  return (
    <div>
      <DashboardHeader
        cards={cards}
        onToggleVisibility={handleToggleVisibility}
        currentView={view}
        onSwitchView={handleSwitchView}
      />

      {view === "dashboard" ? (
        <GridLayout>{memoizedCards}</GridLayout>
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

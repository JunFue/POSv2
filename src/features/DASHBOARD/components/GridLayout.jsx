import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const LAYOUT_STORAGE_KEY = "dashboard-layouts-v1";

export const GridLayout = ({ children }) => {
  const handleLayoutChange = (layout, allLayouts) => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(allLayouts));
    } catch (error) {
      console.error("Error saving layout to localStorage:", error);
    }
  };

  const getInitialLayouts = () => {
    try {
      const savedLayouts = localStorage.getItem(LAYOUT_STORAGE_KEY);
      return savedLayouts ? JSON.parse(savedLayouts) : { lg: [] };
    } catch (error) {
      console.error("Error loading layout from localStorage:", error);
      return { lg: [] };
    }
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={getInitialLayouts()}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={70}
      onLayoutChange={handleLayoutChange}
      draggableHandle=".drag-handle"
      draggableCancel=".cancel-drag"
    >
      {children}
    </ResponsiveGridLayout>
  );
};

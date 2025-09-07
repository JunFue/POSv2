import "./index.css";

import { Nav } from "./components/NAVIGATION/Nav.jsx";
import { Cashout } from "./features/CASHOUT/Cashout.jsx";
import { Inventory } from "./features/INVENTORY/Inventory.jsx";
import { Transactions } from "./features/TRANSACTIONS/Transactions.jsx";
import { Routes, Route } from "react-router";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { AppProviders } from "./context/Provider.jsx";
import { CategoryPage } from "./features/DASHBOARD/components/CategoryPage.jsx";
import { Dashboard } from "./features/DASHBOARD/Dashboard.jsx";
import { POS } from "./features/SALES_TERMINAL/POS.jsx";

const POS_PANEL_WIDTH_KEY = "posPanelWidth";

function App() {
  // State to hold the width of the POS panel.
  // It now lazily initializes by reading from localStorage first.
  const [posWidth, setPosWidth] = useState(() => {
    try {
      const savedWidth = localStorage.getItem(POS_PANEL_WIDTH_KEY);
      // If a saved width exists, parse and use it.
      if (savedWidth) {
        return JSON.parse(savedWidth);
      }
    } catch (error) {
      console.error("Error reading panel width from localStorage", error);
    }
    // Otherwise, default to 1/3 of the screen width.
    return window.innerWidth / 3;
  });

  // A ref to track whether the user is currently dragging the resizer.
  const isResizing = useRef(false);

  // Mouse down event handler for the resizer handle.
  const handleMouseDown = useCallback((e) => {
    // Prevent text selection while dragging
    e.preventDefault();
    isResizing.current = true;
  }, []);

  // Mouse up event handler to stop resizing.
  // When resizing stops, we save the current width to localStorage.
  const handleMouseUp = useCallback(() => {
    if (isResizing.current) {
      isResizing.current = false;
      try {
        localStorage.setItem(POS_PANEL_WIDTH_KEY, JSON.stringify(posWidth));
      } catch (error) {
        console.error("Error saving panel width to localStorage", error);
      }
    }
  }, [posWidth]);

  // Mouse move event handler to calculate and set the new panel width.
  const handleMouseMove = useCallback((e) => {
    if (isResizing.current) {
      // Define constraints for the panel width.
      const minWidth = 350; // Minimum width in pixels
      const maxWidth = window.innerWidth * 0.7; // Maximum 70% of the screen width

      // Constrain the new width between min and max values.
      const newWidth = Math.max(minWidth, Math.min(e.clientX, maxWidth));
      setPosWidth(newWidth);
    }
  }, []);

  // Effect to add and clean up global event listeners for mouse movement and release.
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Cleanup function to remove listeners when the component unmounts.
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <AppProviders>
      <div className="flex w-screen h-screen bg-background text-body-text overflow-hidden">
        {/* POS Panel */}
        <div
          className="h-full flex-shrink-0" // flex-shrink-0 prevents this panel from shrinking
          style={{ width: `${posWidth}px` }}
        >
          {/* The POS component no longer needs props for positioning */}
          <POS />
        </div>

        {/* Resizer Handle */}
        <div
          role="separator"
          aria-orientation="vertical"
          className="w-2 h-full cursor-col-resize bg-gray-700/40 hover:bg-teal-500 transition-colors duration-200"
          onMouseDown={handleMouseDown}
        />

        {/* Main Content Panel */}
        <div className="flex flex-col flex-grow h-full min-w-0 p-2 gap-2">
          <Nav />
          <div className="shadow-neumorphic overflow-y-auto flex-grow rounded-xl">
            <Routes>
              {/* Default route */}
              <Route path="/*" element={<Dashboard />} />

              {/* Specific Dashboard Routes */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route
                path="dashboard/category/:categoryName"
                element={<CategoryPage />}
              />

              {/* Specific Cashout Route */}
              <Route path="cashout" element={<Cashout />} />

              {/* Other top-level routes */}
              <Route path="transactions/*" element={<Transactions />} />
              <Route path="inventory/*" element={<Inventory />} />
            </Routes>
          </div>
        </div>
      </div>
    </AppProviders>
  );
}

export default App;

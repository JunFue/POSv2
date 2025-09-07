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
import { FaAnglesRight } from "react-icons/fa6";

const POS_PANEL_WIDTH_KEY = "posPanelWidth";

function App() {
  // State to hold the width of the POS panel.
  const [posWidth, setPosWidth] = useState(() => {
    try {
      const savedWidth = localStorage.getItem(POS_PANEL_WIDTH_KEY);
      if (savedWidth) {
        return JSON.parse(savedWidth);
      }
    } catch (error) {
      console.error("Error reading panel width from localStorage", error);
    }
    return window.innerWidth / 3;
  });

  // New state to manage the visibility of the POS panel.
  const [isPosVisible, setIsPosVisible] = useState(true);

  const isResizing = useRef(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isResizing.current) {
      isResizing.current = false;
      // Only save the width if the panel is visible upon mouse release.
      if (isPosVisible) {
        try {
          localStorage.setItem(POS_PANEL_WIDTH_KEY, JSON.stringify(posWidth));
        } catch (error) {
          console.error("Error saving panel width to localStorage", error);
        }
      }
    }
  }, [posWidth, isPosVisible]);

  const handleMouseMove = useCallback(
    (e) => {
      if (isResizing.current) {
        const minWidth = 350;
        const hideThreshold = 200; // Dragging left past this point hides the panel.
        const maxWidth = window.innerWidth * 0.7;

        // If the user drags past the threshold, hide the panel.
        // If they drag back to the right, show it again.
        if (e.clientX < hideThreshold) {
          setIsPosVisible(false);
        } else {
          setIsPosVisible(true);
        }

        // We still calculate the width, but it will only be applied if the panel is visible.
        const newWidth = Math.max(minWidth, Math.min(e.clientX, maxWidth));
        setPosWidth(newWidth);
      }
    },
    [] // Setter functions from useState are stable and don't need to be dependencies.
  );

  // New handler to show the POS panel when the floating button is clicked.
  const handleShowPos = useCallback(() => {
    setIsPosVisible(true);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <AppProviders>
      <div className="flex w-screen h-screen bg-background text-body-text overflow-hidden">
        {/* Floating button to unhide the POS panel */}
        {!isPosVisible && (
          <button
            onClick={handleShowPos}
            className="absolute z-20 top-4 left-4 p-2 bg-gray-700/50 rounded-full text-white hover:bg-teal-500 transition-all"
            aria-label="Show Point of Sale"
          >
            <FaAnglesRight size={20} />
          </button>
        )}

        {/* The POS Panel and its resizer are now conditionally rendered */}
        {isPosVisible && (
          <>
            {/* POS Panel */}
            <div
              className="h-full flex-shrink-0"
              style={{ width: `${posWidth}px` }}
            >
              <POS />
            </div>

            {/* Resizer Handle */}
            <div
              role="separator"
              aria-orientation="vertical"
              className="w-2 h-full cursor-col-resize bg-gray-700/40 hover:bg-teal-500 transition-colors duration-200"
              onMouseDown={handleMouseDown}
            />
          </>
        )}

        {/* Main Content Panel */}
        <div className="flex flex-col flex-grow h-full min-w-0 p-2 gap-2">
          <Nav />
          <div className="shadow-neumorphic overflow-y-auto flex-grow rounded-xl">
            <Routes>
              <Route path="/*" element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route
                path="dashboard/category/:categoryName"
                element={<CategoryPage />}
              />
              <Route path="cashout" element={<Cashout />} />
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

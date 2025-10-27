import "./index.css";
import { Nav } from "./components/NAVIGATION/Nav.jsx";
import { Routes, Route } from "react-router";
import React, { Suspense, useState } from "react";
import {
  Dashboard,
  Cashout,
  Inventory,
  Transactions,
} from "./components/loaders/lazyComponents.js";
import { AppProviders } from "./context/Provider.jsx";
import { POS } from "./features/SALES_TERMINAL/POS.jsx";
import { CenteredSpinner } from "./components/loaders/CenteredSpinner.jsx";
import { ViewPanel } from "./components/ViewPanel.jsx";

const IconDashboard = ({ active }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-5 h-5 transition-colors ${
      active ? "text-white" : "text-gray-600"
    }`}
  >
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

// Icon for 'split' state
const IconSplit = ({ active }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-5 h-5 transition-colors ${
      active ? "text-white" : "text-gray-600"
    }`}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="12" y1="3" x2="12" y2="21"></line>
  </svg>
);

// Icon for 'full' state (POS view)
const IconPOS = ({ active }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-5 h-5 transition-colors ${
      active ? "text-white" : "text-gray-600"
    }`}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="3" x2="16" y2="21"></line>
    <line x1="8" y1="3" x2="8" y2="21"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// --- NEW: SwitchSlider Component ---
const SwitchSlider = ({ viewMode, onToggle }) => {
  const getSliderTransform = () => {
    switch (viewMode) {
      case "full":
        return "translate-x-0";
      case "split":
        return "translate-x-full"; // Moves 100% of its *own* width
      case "hidden":
        return "translate-x-[200%]"; // Moves 200% of its *own* width
      default:
        return "translate-x-0";
    }
  };

  return (
    <button
      onClick={onToggle}
      className="top-4 left-4 z-50 fixed flex items-center bg-gray-200 shadow-lg p-1 rounded-full transition-all"
      aria-label="Cycle View Mode"
    >
      {/* Sliding Thumb */}
      <span
        className={`absolute top-1 left-1 h-8 w-8 bg-teal-600 rounded-full shadow transition-transform duration-300 ease-in-out ${getSliderTransform()}`}
        aria-hidden="true"
      />

      {/* Icons (on top of the thumb) */}
      <span className="z-10 relative p-1.5" aria-label="Dashboard View">
        <IconDashboard active={viewMode === "hidden"} />
      </span>
      <span className="z-10 relative p-1.5" aria-label="Split View">
        <IconSplit active={viewMode === "split"} />
      </span>
      <span className="z-10 relative p-1.5" aria-label="POS View">
        <IconPOS active={viewMode === "full"} />
      </span>
    </button>
  );
};

// --- Main App Component ---
function App() {
  // 'hidden': POS hidden (default), 'split': 50/50, 'full': POS full screen
  const [viewMode, setViewMode] = useState("full");

  const cycleViewMode = () => {
    setViewMode((currentMode) => {
      if (currentMode === "full") return "split";
      if (currentMode === "split") return "hidden";
      return "full"; // 'full' maps back to 'hidden'
    });
  };

  const getMainContentWidth = () => {
    switch (viewMode) {
      case "hidden":
        return "w-full"; // Main content takes full width
      case "split":
        return "w-1/2"; // Main content takes half width
      case "full":
        return "w-0 p-0"; // Main content is hidden
      default:
        return "w-full";
    }
  };

  return (
    <AppProviders>
      {/* Replaced the old button with the new SwitchSlider */}
      <SwitchSlider viewMode={viewMode} onToggle={cycleViewMode} />

      {/* UPDATED: Removed pt-16 from this div */}
      <div className="flex bg-background w-screen h-screen overflow-hidden text-body-text">
        <ViewPanel viewMode={viewMode}>
          <POS />
        </ViewPanel>

        <div
          className={`flex flex-col flex-grow h-full min-w-0 p-2 gap-2 transition-all duration-300 ease-in-out ${getMainContentWidth()}`}
        >
          {viewMode !== "full" && (
            <>
              <Nav />
              <div className="flex-grow bg-background shadow-neumorphic rounded-xl overflow-y-auto">
                <Suspense fallback={<CenteredSpinner />}>
                  <Routes>
                    <Route path="/*" element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="cashout" element={<Cashout />} />
                    <Route path="transactions/*" element={<Transactions />} />
                    <Route path="inventory/*" element={<Inventory />} />
                  </Routes>
                </Suspense>
              </div>
            </>
          )}
          {viewMode === "full" && (
            <div className="w-full h-full overflow-hidden"></div>
          )}
        </div>
      </div>
    </AppProviders>
  );
}

export default App;

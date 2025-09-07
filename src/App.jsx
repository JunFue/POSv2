import "./index.css";
import { Nav } from "./components/NAVIGATION/Nav.jsx";
import { Routes, Route } from "react-router";
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  lazy,
  Suspense,
} from "react";
import { AppProviders } from "./context/Provider.jsx";
import { POS } from "./features/SALES_TERMINAL/POS.jsx";
import { FaAnglesRight } from "react-icons/fa6";

// --- LAZY-LOADED ROUTE COMPONENTS ---
const Dashboard = lazy(() =>
  import("./features/DASHBOARD/Dashboard.jsx").then((module) => ({
    default: module.Dashboard,
  }))
);
const CategoryPage = lazy(() =>
  import("./features/DASHBOARD/components/CategoryPage.jsx").then((module) => ({
    default: module.CategoryPage,
  }))
);
const Cashout = lazy(() =>
  import("./features/CASHOUT/Cashout.jsx").then((module) => ({
    default: module.Cashout,
  }))
);
const Transactions = lazy(() =>
  import("./features/TRANSACTIONS/Transactions.jsx").then((module) => ({
    default: module.Transactions,
  }))
);
const Inventory = lazy(() =>
  import("./features/INVENTORY/Inventory.jsx").then((module) => ({
    default: module.Inventory,
  }))
);

const CenteredSpinner = () => (
  <div className="w-full h-full flex items-center justify-center p-10">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-500"></div>
  </div>
);

const POS_PANEL_WIDTH_KEY = "posPanelWidth";

function App() {
  const [posWidth, setPosWidth] = useState(() => {
    try {
      const savedWidth = localStorage.getItem(POS_PANEL_WIDTH_KEY);
      return savedWidth ? JSON.parse(savedWidth) : window.innerWidth / 3;
    } catch (error) {
      alert(error);
      return window.innerWidth / 3;
    }
  });

  const [isPosVisible, setIsPosVisible] = useState(true);
  const isResizing = useRef(false);
  const animationFrameId = useRef(null);

  // Renamed to handle both mouse and touch start events
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
  }, []);

  // Renamed to handle both mouse and touch end events
  const handleDragEnd = useCallback(() => {
    if (isResizing.current) {
      isResizing.current = false;
      if (isPosVisible) {
        try {
          localStorage.setItem(POS_PANEL_WIDTH_KEY, JSON.stringify(posWidth));
        } catch (error) {
          console.error("Error saving panel width to localStorage", error);
        }
      }
    }
  }, [posWidth, isPosVisible]);

  // Renamed and updated to handle both mouse and touch move events
  const handleDragMove = useCallback((e) => {
    if (isResizing.current) {
      // Get the horizontal position from either the mouse or touch event
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = requestAnimationFrame(() => {
        const minWidth = 350;
        const hideThreshold = 200;
        const maxWidth = window.innerWidth * 0.7;

        if (clientX < hideThreshold) {
          setIsPosVisible(false);
        } else {
          setIsPosVisible(true);
        }
        const newWidth = Math.max(minWidth, Math.min(clientX, maxWidth));
        setPosWidth(newWidth);
      });
    }
  }, []);

  const handleShowPos = useCallback(() => {
    setIsPosVisible(true);
  }, []);

  // Updated to include event listeners for both mouse and touch events
  useEffect(() => {
    // Add listeners for mouse events
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    // Add listeners for touch events
    window.addEventListener("touchmove", handleDragMove);
    window.addEventListener("touchend", handleDragEnd);

    return () => {
      // Clean up mouse event listeners
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      // Clean up touch event listeners
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleDragMove, handleDragEnd]);

  return (
    <AppProviders>
      <div className="flex w-screen h-screen bg-background text-body-text overflow-hidden">
        {!isPosVisible && (
          <button
            onClick={handleShowPos}
            className="absolute z-20 top-4 left-4 p-2 bg-gray-700/50 rounded-full text-white hover:bg-teal-500 transition-all"
            aria-label="Show Point of Sale"
          >
            <FaAnglesRight size={20} />
          </button>
        )}

        <div
          className="h-full flex-shrink-0 transition-all duration-500 ease-in-out"
          style={{ width: isPosVisible ? `${posWidth}px` : "0px" }}
        >
          <div
            className="w-full h-full transition-opacity duration-300 ease-in-out overflow-hidden"
            style={{ opacity: isPosVisible ? 1 : 0 }}
          >
            <POS />
          </div>
        </div>

        {/* Resizer Handle now listens for both mouse and touch events */}
        <div
          role="separator"
          aria-orientation="vertical"
          className={`w-2 h-full cursor-col-resize bg-gray-700/40 hover:bg-teal-500 transition-opacity duration-300 ${
            !isPosVisible && "opacity-0 pointer-events-none"
          }`}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        />

        <div className="flex flex-col flex-grow h-full min-w-0 p-2 gap-2">
          <Nav />
          <div className="shadow-neumorphic overflow-y-auto flex-grow rounded-xl">
            <Suspense fallback={<CenteredSpinner />}>
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
            </Suspense>
          </div>
        </div>
      </div>
    </AppProviders>
  );
}

export default App;

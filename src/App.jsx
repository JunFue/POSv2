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

// --- LAZY-LOADED COMPONENTS ---
// Correctly handle the `default` export from the dynamically imported modules.
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

// A reusable loading spinner component for the Suspense fallback.
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
      if (savedWidth) {
        return JSON.parse(savedWidth);
      }
    } catch (error) {
      console.error("Error reading panel width from localStorage", error);
    }
    return window.innerWidth / 3;
  });

  const [isPosVisible, setIsPosVisible] = useState(true);

  const isResizing = useRef(false);
  const animationFrameId = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
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

  const handleMouseMove = useCallback((e) => {
    if (isResizing.current) {
      const clientX = e.clientX;
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

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleMouseMove, handleMouseUp]);

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

        {isPosVisible && (
          <>
            <div
              className="h-full flex-shrink-0"
              style={{ width: `${posWidth}px` }}
            >
              <POS />
            </div>
            <div
              role="separator"
              aria-orientation="vertical"
              className="w-2 h-full cursor-col-resize bg-gray-700/40 hover:bg-teal-500 transition-colors duration-200"
              onMouseDown={handleMouseDown}
            />
          </>
        )}

        <div className="flex flex-col flex-grow h-full min-w-0 p-2 gap-2">
          <Nav />
          <div className="shadow-neumorphic overflow-y-auto flex-grow rounded-xl">
            {/* --- SUSPENSE WRAPPER --- */}
            {/* This will show the spinner while a lazy-loaded component is being fetched. */}
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

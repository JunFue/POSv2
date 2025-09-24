import "./index.css";
import { Nav } from "./components/NAVIGATION/Nav.jsx";
import { Routes, Route } from "react-router";
import React, { Suspense } from "react";
import {
  Dashboard,
  Cashout,
  CategoryPage,
  Inventory,
  Transactions,
} from "./components/loaders/lazyComponents.js";
import { AppProviders } from "./context/Provider.jsx";
import { POS } from "./features/SALES_TERMINAL/POS.jsx";
import { CenteredSpinner } from "./components/loaders/CenteredSpinner.jsx";
import { ResizablePanel } from "./components/ResizablePanel.jsx";

function App() {
  return (
    <AppProviders>
      <div className="flex w-screen h-screen bg-background text-body-text overflow-hidden">
        <ResizablePanel>
          <POS />
        </ResizablePanel>

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

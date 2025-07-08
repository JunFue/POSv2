import "./index.css";
import { POS } from "./components/POS/POS.jsx";
import { Nav } from "./shared-components/nav/Nav";

import { Cashout } from "./pages/cashout-contents/Cashout.jsx";
import { Inventory } from "./pages/Inventory";
import { Transactions } from "./pages/Transactions";
import { Routes, Route } from "react-router";
import React from "react";
import { AppProviders } from "./context/Provider.jsx";
import { Dashboard } from "./pages/dashboard-contents/Dashboard.jsx";

function App() {
  return (
    <AppProviders>
      <div className="flex flex-col lg:flex-row w-screen h-screen bg-background text-body-text gap-[0.3vw] p-[0.5vw] overflow-hidden">
        <POS></POS>
        <div className="flex flex-col gap-[0.3vw] flex-grow p-[0.2vw] rounded-2xl basis-0 min-w-0 mb-[10px]">
          <Nav />
          <div className="shadow-neumorphic overflow-y-scroll">
            <Routes>
              <Route path="/*" element={<Dashboard />} />
              <Route path="dashboard/*" element={<Dashboard />} />
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

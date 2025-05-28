import "./index.css";
import "./App.css";
import { POS } from "./POS/POS";
import { Nav } from "./shared-components/nav/Nav";
import { Dashboard } from "./pages/Dashboard";
import { Cashout } from "./pages/Cashout";
import { Inventory } from "./pages/Inventory";
import { Transactions } from "./pages/Transactions";
import { Routes, Route } from "react-router-dom";
import React from "react";
import { AppProviders } from "./context/Provider.jsx";

function App() {
  return (
    <AppProviders>
      <div className="flex flex-row w-screen h-screen bg-[#FAF9F3] gap-[0.3vw] p-[0.5vw] overflow-hidden">
        <POS />
        <div className="flex flex-col gap-[0.3vw] flex-grow p-[0.2vw] rounded-2xl basis-0 min-w-0">
          <Nav />
          <div className="shadow-[inset_2px_2px_6px_#bfbfbf,inset_-2px_-2px_6px_#ffffff] overflow-y-scroll">
            <Routes>
              <Route index element={<Dashboard />} />
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

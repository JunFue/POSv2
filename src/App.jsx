import "./index.css";
import "./App.css";
import { POS } from "./POS/POS";
import { Nav } from "./shared-components/nav/Nav";
import { Dashboard } from "./pages/Dashboard";
import { Routes, Route } from "react-router";
import { Cashout } from "./pages/Cashout";
import { Inventory } from "./pages/Inventory";
import { Transactions } from "./pages/Transactions";

function App() {
  return (
    <>
      <div className="flex flex-row w-screen h-screen border border-black gap-[0.3vw] p-[0.5vw]">
        <POS />
        <div className="flex flex-col gap-[0.3vw] flex-grow border border-amber-500 p-[0.2vw] basis-0">
          <Nav />
          <Routes>
            <Route index element={<Dashboard />}></Route>
            <Route path="cashout" element={<Cashout />}></Route>
            <Route path="transactions" element={<Transactions />}></Route>
            <Route path="inventory" element={<Inventory />}></Route>
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;

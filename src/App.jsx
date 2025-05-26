import "./index.css";
import "./App.css";
import { POS } from "./POS/POS";
import { Nav } from "./shared-components/nav/Nav";
import { Dashboard } from "./pages/Dashboard";
import { Routes, Route } from "react-router";
import { Cashout } from "./pages/Cashout";
import { Inventory } from "./pages/Inventory";
import { Transactions } from "./pages/Transactions";
import { useEffect, useState } from "react";

function App() {
  const [items, setItems] = useState(() => {
    const storedItems = localStorage.getItem("inventoryItems");
    return storedItems ? JSON.parse(storedItems) : [];
  });
  useEffect(() => {
    localStorage.setItem("inventoryItems", JSON.stringify(items));
  }, [items]);
  //Product-Data
  const [productData, setProductData] = useState({
    cashierName: "",
    payment: "",
    costumerName: "",
    discount: "",
    barcode: "",
    quantity: "",
  });

  return (
    <>
      <div className="flex flex-row w-screen h-screen bg-[#FAF9F3] gap-[0.3vw] p-[0.5vw] overflow-hidden">
        <POS
          productData={productData}
          setProductData={setProductData}
          items={items}
          setItems={setItems}
        />
        <div className="flex flex-col gap-[0.3vw] flex-grow p-[0.2vw] rounded-2xl basis-0 min-w-0">
          <Nav />
          <div className="shadow-[inset_2px_2px_6px_#bfbfbf,inset_-2px_-2px_6px_#ffffff] overflow-y-scroll">
            <Routes>
              <Route index element={<Dashboard />}></Route>
              <Route path="cashout" element={<Cashout />}></Route>
              <Route path="transactions" element={<Transactions />}></Route>
              <Route
                path="inventory"
                element={<Inventory items={items} setItems={setItems} />}
              ></Route>
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

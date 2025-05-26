import { useState } from "react";
import { ItemRegForm } from "./inventory-contents/item-reg/ItemRegForms";
import { ItemRegTable } from "./inventory-contents/item-reg/ItemRegTable";
import { Stocks } from "./inventory-contents/stocks-management/Stocks";

export function Inventory({ items, setItems }) {
  const [toggle, setToggle] = useState(false);
  function regSwitch() {
    setToggle((prev) => !prev);
  }

  return (
    <>
      <div className="w-full h-full rounded-lg border border-gray-400 shadow-inner p-[0.3vw] text-[2vw]">
        <div className="flex text-[1.7vw] flex-row w-full justify-between px-[2vw] h-[4vw] rounded-lg border border-gray-400 shadow-inner p-[0.3vw]">
          <div>Item Registration</div>
          <button
            className="text-[1vw] h-fit bg-emerald-700 border-[none] outline-[none] font-bold text-[#fff]! rounded-[0.3vw] px-[0.4vw] [transition:all_ease_0.1s] [box-shadow:0px_0.6vw_0px_0px_#50C878] hover:bg-emerald-500 active:translate-y-[0.6vw] active:[box-shadow:0px_0px_0px_0px_#a29bfe]"
            onClick={regSwitch}
          >
            Register New Item
          </button>
        </div>
        <div className="flex flex-col w-full h-full gap-[1vw]">
          {toggle ? <></> : <ItemRegForm items={items} setItems={setItems} />}
          <ItemRegTable items={items} setItems={setItems} />
        </div>
        <div className="w-full h-[100vh] border border-gray-400">
          <Stocks items={items} />{" "}
          {/* Stocks now uses the separated Form and Table */}
        </div>
      </div>
    </>
  );
}

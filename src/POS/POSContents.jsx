import { useState } from "react";
import { CartTable } from "../shared-components/tables/CartTable";
import { CounterForm } from "../shared-components/forms/CounterForm";

export function POSContents({ items, setItems }) {
  const [cartData, setCartData] = useState([]);

  return (
    <>
      <div
        id="pos-header-container"
        className="relative flex flex-row h-fit items-center"
      >
        <img
          src="logo.png"
          alt=""
          className="absolute top-1 left-1 w-[4vw] aspect-auto"
        />
        <div className="flex flex-col w-full items-center">
          <h1 className="text-[2vw]">POINT OF SALE</h1>
          <p className="text-[1vw]">made for: GREEN SECRETS</p>
          <p className="italic text-[0.5vw]">Property of JunFue</p>
        </div>
      </div>

      <CounterForm
        cartData={cartData}
        setCartData={setCartData}
        items={items}
        setItems={setItems}
      ></CounterForm>

      <div id="item-description" className="text-center text-[1.2vw]">
        NO PRODUCTS AVAILABLE
      </div>
      <div
        id="buttons-container"
        className="mb-[1vh] grid grid-cols-6 h-7 gap-2 [&>*]:text-[0.75vw] [&>*]:bg-emerald-900 [&>*]:text-white [&>*]:p-2 [&>*]:rounded-md [&>*]:hover:bg-emerald-500 [&>*]:transition"
      >
        <button className="bg-emerald-700 border-[none] outline-[none] px-[1vw] py-[0.3vw]  font-bold text-[#fff]! rounded-[5px] [transition:all_ease_0.1s] [box-shadow:0px_5px_0px_0px_#50C878] active:translate-y-[5px] active:[box-shadow:0px_0px_0px_0px_#a29bfe]">
          NEW COSTUMER
        </button>
        <button className="bg-emerald-700 border-[none] outline-[none] px-[1vw] py-[0.3vw]  font-bold text-[#fff]! rounded-[5px] [transition:all_ease_0.1s] [box-shadow:0px_5px_0px_0px_#50C878] active:translate-y-[5px] active:[box-shadow:0px_0px_0px_0px_#a29bfe]">
          ADD TO CART
        </button>
        <button className="bg-emerald-700 border-[none] outline-[none] px-[1vw] py-[0.3vw]  font-bold text-[#fff]! rounded-[5px] [transition:all_ease_0.1s] [box-shadow:0px_5px_0px_0px_#50C878] active:translate-y-[5px] active:[box-shadow:0px_0px_0px_0px_#a29bfe]">
          DONE
        </button>
        <button
          className="bg-emerald-700 border-[none] outline-[none] px-[1vw] py-[0.3vw]  font-bold text-[#fff]! rounded-[5px] [transition:all_ease_0.1s] [box-shadow:0px_5px_0px_0px_#50C878] active:translate-y-[5px] active:[box-shadow:0px_0px_0px_0px_#a29bfe]"
          onClick={() => setCartData("")}
        >
          CLEAR
        </button>
        <button className="bg-emerald-700 border-[none] outline-[none] px-[1vw] py-[0.3vw]  font-bold text-[#fff]! rounded-[5px] [transition:all_ease_0.1s] [box-shadow:0px_5px_0px_0px_#50C878] active:translate-y-[5px] active:[box-shadow:0px_0px_0px_0px_#a29bfe]">
          SETTINGS
        </button>
        <button className="bg-emerald-700 border-[none] outline-[none] px-[1vw] py-[0.3vw]  font-bold text-[#fff]! rounded-[5px] [transition:all_ease_0.1s] [box-shadow:0px_5px_0px_0px_#50C878] active:translate-y-[5px] active:[box-shadow:0px_0px_0px_0px_#a29bfe]">
          LOGIN
        </button>
      </div>

      <CartTable cartData={cartData} setCartData={setCartData}></CartTable>
    </>
  );
}

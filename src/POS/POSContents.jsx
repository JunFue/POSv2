import { useState } from "react";
import { CartTable } from "../shared-components/tables/CartTable";
import { CounterForm } from "../shared-components/forms/CounterForm";

const generateUniqueTransactionNo = () => {
  const randomLetters = () =>
    String.fromCharCode(
      65 + Math.floor(Math.random() * 26),
      65 + Math.floor(Math.random() * 26),
      65 + Math.floor(Math.random() * 26)
    );
  const randomNumbers = () => Math.floor(10000 + Math.random() * 90000);
  const randomSuffix = () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
    Math.floor(Math.random() * 10);
  return `${randomLetters()}-${randomNumbers()}-${randomSuffix()}`;
};

export function POSContents({ items, setItems }) {
  const [cartData, setCartData] = useState([]);
  const [transactionNo, setTransactionNo] = useState(() =>
    generateUniqueTransactionNo()
  );

  const generateTransactionNo = () => {
    setTransactionNo(generateUniqueTransactionNo());
  };

  return (
    <>
      <div>
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
          transactionNo={transactionNo}
        ></CounterForm>

        <div
          id="buttons-container"
          className="grid grid-cols-6 h-[2.6vw] gap-[1vw] bg-white/30 backdrop-blur-md rounded-[0.4vw] shadow-inner p-[0.4vw] [&>*]:text-[0.75vw] [&>*]:px-[0.6vw] [&>*]:py-[0.2vw] [&>*]:whitespace-nowrap [&>*]:transition-all"
        >
          <button
            className="bg-emerald-700 border-[none] outline-[none] font-bold text-[#fff]! rounded-[0.2vw] [transition:all_ease_0.1s] [box-shadow:0px_0.6vw_0px_0px_#50C878] active:translate-y-[0.6vw] active:[box-shadow:0px_0px_0px_0px_#a29bfe]"
            onClick={generateTransactionNo}
          >
            NEW COSTUMER
          </button>
          <button className="bg-emerald-700 border-[none] outline-[none] font-bold text-[#fff]! rounded-[0.2vw] [transition:all_ease_0.1s] [box-shadow:0px_0.6vw_0px_0px_#50C878] active:translate-y-[0.6vw] active:[box-shadow:0px_0px_0px_0px_#a29bfe]">
            ADD TO CART
          </button>
          <button
            className="bg-emerald-700 border-[none] outline-[none] font-bold text-[#fff]! rounded-[0.2vw] [transition:all_ease_0.1s] [box-shadow:0px_0.6vw_0px_0px_#50C878] active:translate-y-[0.6vw] active:[box-shadow:0px_0px_0px_0px_#a29bfe]"
            onClick={() => {
              setCartData("");
              generateTransactionNo();
            }}
          >
            DONE
          </button>
          <button
            className="bg-emerald-700 border-[none] outline-[none] font-bold text-[#fff]! rounded-[0.2vw] [transition:all_ease_0.1s] [box-shadow:0px_0.6vw_0px_0px_#50C878] active:translate-y-[0.6vw] active:[box-shadow:0px_0px_0px_0px_#a29bfe]"
            onClick={() => setCartData("")}
          >
            CLEAR
          </button>
          <button className="bg-emerald-700 border-[none] outline-[none] font-bold text-[#fff]! rounded-[0.2vw] [transition:all_ease_0.1s] [box-shadow:0px_0.6vw_0px_0px_#50C878] active:translate-y-[0.6vw] active:[box-shadow:0px_0px_0px_0px_#a29bfe]">
            SETTINGS
          </button>
          <button className="bg-emerald-700 border-[none] outline-[none] font-bold text-[#fff]! rounded-[0.2vw] [transition:all_ease_0.1s] [box-shadow:0px_0.6vw_0px_0px_#50C878] active:translate-y-[0.6vw] active:[box-shadow:0px_0px_0px_0px_#a29bfe]">
            LOGIN
          </button>
        </div>
      </div>

      <CartTable cartData={cartData} setCartData={setCartData}></CartTable>
    </>
  );
}

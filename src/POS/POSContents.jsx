import { useState } from "react";
import { CartTable } from "../shared-components/tables/CartTable";
import { CounterForm } from "../shared-components/forms/CounterForm";

export function POSContents({ productData, setProductData }) {
  const [cartData, setCartData] = useState([]);

  return (
    <>
      <div
        id="pos-header-container"
        className="relative flex flex-row border border-amber-400 h-fit items-center"
      >
        <img
          src="logo.png"
          alt=""
          className="absolute top-1 left-1 w-[4vw] aspect-auto border border-amber-400"
        />
        <div className="flex flex-col w-full border border-amber-400 items-center">
          <h1 className="text-[2vw]">POINT OF SALE</h1>
          <p className="text-[1vw]">made for: GREEN SECRETS</p>
          <p className="italic text-[0.5vw]">Property of JunFue</p>
        </div>
      </div>

      <CounterForm
        productData={productData}
        setProductData={setProductData}
      ></CounterForm>

      <div id="item-description" className="text-center text-[1.2vw]">
        NO PRODUCTS AVAILABLE
      </div>
      <div
        id="buttons-container"
        className="grid grid-cols-6 gap-[0.3vw] [&>*]:hover:cursor-pointer [&>*]:text-[0.9vw] [&>*]:border [&>*]:border-green-300"
      >
        <button>NEW COSTUMER</button>
        <button>ADD TO CART</button>
        <button>DONE</button>
        <button onClick={() => setCartData("")}>CLEAR</button>
        <button>SETTINGS</button>
        <button>LOGIN</button>
      </div>
      <div>
        <CartTable cartData={cartData} setCartData={setCartData}></CartTable>
      </div>
    </>
  );
}

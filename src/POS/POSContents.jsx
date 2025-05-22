import { useEffect, useRef, useState } from "react";
import { CartTable } from "../shared-components/tables/CartTable";
import dayjs from "dayjs";

export function POSContents({ productData, setProductData }) {
  const [transTime, setTransTime] = useState(
    dayjs().format("YYYY-MM-DD HH:mm:ss")
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTransTime(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  /* For Reference to the props

const [productData, setProductData] = useState({
    cashierName: "",
    amountRendered: "",
    costumerName: "",
    discount: "",
    barcode: "",
    quantity: "",
  });

*/

  //Table Data

  const [cartData, setCartData] = useState([]);

  const costumerNameRef = useRef(null);
  const quantityRef = useRef(null);
  const barcodeRef = useRef(null);
  const discountRef = useRef(null);

  function inputCapture(e) {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value,
      cashierName: "Junel F. Fuentes",
    });
    console.log(productData);
  }

  function addToCart(event) {
    const isEnter = event?.key === "Enter";
    const isClick = event?.type === "click";
    if (isEnter || isClick) {
      barcodeRef.current?.focus();
      setCartData((prev) => [
        ...prev,
        {
          barcode: productData.barcode,
          item: "",
          price: 30,
          quantity: productData.quantity,
          total() {
            return this.price * this.quantity;
          },
          remove: null,
        },
      ]);
    }
  }

  function done() {
    costumerNameRef.current?.focus();
  }

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
      <div
        id="cashier-info"
        className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] [&>*]:border [&>*]:border-green-300 [&>*]:text-[0.8vw] text-nowrap"
      >
        <div>Cashier Name:</div>
        <input
          type="text"
          placeholder="e.g. Junel F. Fuentes"
          autoComplete="off"
        />
        <div>Transaction Time:</div>
        <div className="min-w-0">{transTime}</div>
        <div>Payment:</div>
        <input
          type="number"
          placeholder="₱0.00"
          autoComplete="off"
          name="payment"
          value={productData.payment}
          onChange={inputCapture}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              discountRef.current?.focus();
            }
          }}
        />
        <div>Costumer Name:</div>
        <input
          type="text"
          placeholder="e.g. Maribeth G. Fuentes"
          autoComplete="off"
          name="costumerName"
          value={productData.costumerName}
          onChange={inputCapture}
          ref={costumerNameRef}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              barcodeRef.current?.focus();
            }
          }}
        />
        <div>Transaction No:</div>
        <div>ABC123-0012</div>
        <div>Discount:</div>
        <input
          type="number"
          placeholder="₱0.00"
          autoComplete="off"
          name="discount"
          value={productData.discount}
          onChange={inputCapture}
          ref={discountRef}
        />
        <div>Barcode:</div>
        <input
          type="text"
          placeholder="123000"
          autoComplete="off"
          name="barcode"
          value={productData.barcode}
          onChange={inputCapture}
          ref={barcodeRef}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              quantityRef.current?.focus();
            }
          }}
        />
        <div>Available Stocks:</div>
        <div>1000</div>
        <div>Change: </div>
        <div>₱0.00</div>
        <div>Quantity: </div>
        <input
          type="number"
          placeholder="0"
          autoComplete="off"
          name="quantity"
          value={productData.quantity}
          onChange={inputCapture}
          ref={quantityRef}
          onKeyDown={addToCart}
        />
        <div>Additional Info</div>
        <div>Additional Info</div>
        <div>Grand Total:</div>
        <div>₱0.00</div>
      </div>
      <div id="item-description" className="text-center text-[1.2vw]">
        NO PRODUCTS AVAILABLE
      </div>
      <div
        id="buttons-container"
        className="grid grid-cols-6 gap-[0.3vw] [&>*]:hover:cursor-pointer [&>*]:text-[0.9vw] [&>*]:border [&>*]:border-green-300"
      >
        <button>NEW COSTUMER</button>
        <button onClick={addToCart}>ADD TO CART</button>
        <button onClick={done}>DONE</button>
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

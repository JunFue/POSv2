import { useContext, useRef } from "react";
import { CartTable } from "../shared-components/tables/CartTable";
import { CounterForm } from "../shared-components/forms/CounterForm";
import { CartContext } from "../context/CartContext";

export function POSContents() {
  const { cartData, setCartData } = useContext(CartContext);
  const counterFormRef = useRef(null);

  // Play click sound on pointer down (works for mouse and touch)
  const playButtonSound = {
    onPointerDown: () => {
      try {
        const audio = new Audio("/sounds/click.mp3");
        audio.play().catch((err) => {
          // For debugging: log why it failed
          console.warn("Audio play failed:", err);
        });
      } catch (err) {
        console.warn("Audio error:", err);
      }
    },
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
            <h1 className="text-[2vw] font-bold">POINT OF SALE</h1>
            <p className="text-[1vw]">made for: GREEN SECRETS</p>
            <p className="italic text-[0.5vw]">Property of JunFue</p>
          </div>
        </div>

        <CounterForm
          cartData={cartData}
          setCartData={setCartData}
          ref={counterFormRef}
        ></CounterForm>

        <div
          id="buttons-container"
          className="grid grid-cols-6 h-[2.6vw] gap-[1vw] [&>*]:text-[0.8vw] backdrop-blur-md rounded-[0.4vw] shadow-inner p-[0.4vw] [&>*]:whitespace-nowrap [&>*]:transition-all"
        >
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            onClick={() => {
              setCartData([]);
              counterFormRef.current?.regenerateTransactionNo();
            }}
            {...playButtonSound}
          >
            NEW COSTUMER
          </button>
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            {...playButtonSound}
          >
            ADD TO CART
          </button>
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            onClick={() => counterFormRef.current?.completeTransaction()}
            {...playButtonSound}
          >
            DONE
          </button>
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            onClick={() => setCartData([])}
            {...playButtonSound}
          >
            CLEAR
          </button>
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            {...playButtonSound}
          >
            SETTINGS
          </button>
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            {...playButtonSound}
          >
            LOGIN
          </button>
        </div>
      </div>

      <CartTable></CartTable>
    </>
  );
}

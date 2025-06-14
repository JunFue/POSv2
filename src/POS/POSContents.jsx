import { useContext, useRef } from "react";
import { CartTable } from "../shared-components/tables/CartTable";
import { CounterForm } from "../shared-components/forms/CounterForm";
import { CartContext } from "../context/CartContext";

export function POSContents() {
  const { cartData, setCartData } = useContext(CartContext);
  const counterFormRef = useRef(null);

  const handleDone = async () => {
    try {
      const transactionData = counterFormRef.current?.getTransactionData();
      console.log(transactionData);
      if (!transactionData || transactionData.length === 0) {
        alert("No transaction data found.");
        return;
      }

      let offline = false;
      for (const transaction of transactionData) {
        try {
          const response = await fetch(
            "http://localhost:3000/api/transactions",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(transaction),
            }
          );

          if (!response.ok) {
            offline = true;
            const errorText = await response.text();
            let errorMessage = "Unknown error";
            try {
              const errorData = errorText ? JSON.parse(errorText) : {};
              errorMessage = errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
            alert(`Transaction failed: ${errorMessage}`);
          }
        } catch (error) {
          offline = true;
          console.error("Transaction error:", error);
        }
      }

      if (!offline) {
        alert("Transaction completed successfully.");
        setCartData([]);
      } else {
        alert("Some transactions failed. Server might be offline.");
      }
    } catch (error) {
      alert(`Transaction error: ${error.message}`);
    }
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
          >
            NEW COSTUMER
          </button>
          <button className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95">
            ADD TO CART
          </button>
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            onClick={handleDone}
          >
            DONE
          </button>
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            onClick={() => setCartData([])}
          >
            CLEAR
          </button>
          <button className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95">
            SYNC
          </button>
          <button className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95">
            DOWNLOAD DATA
          </button>
        </div>
      </div>

      <CartTable></CartTable>
    </>
  );
}

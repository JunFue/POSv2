import { useContext, useRef, useState } from "react";
import { CartTable } from "../shared-components/tables/CartTable";
import { CounterForm } from "../shared-components/forms/CounterForm";
import { CartContext } from "../context/CartContext";

export function POSContents() {
  const { cartData, setCartData } = useContext(CartContext);
  const counterFormRef = useRef(null);
  const [toggleTheme, setToggleTheme] = useState(false);

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
    <div className="rounded-[20px] bg-background shadow-neumorphic p-3">
      <header className="flex flex-col items-center mb-1">
        <h1 className="text-4xl font-bold text-head-text">POINT OF SALE</h1>
        <p className="text-sm text-body-text">Made for: GREEN SECRETS</p>
        <p className="text-xs italic text-body-text">Property of JunFue</p>
      </header>

      <CounterForm
        cartData={cartData}
        setCartData={setCartData}
        ref={counterFormRef}
      />

      <div className="grid grid-cols-3 gap-4 mt-6">
        <button
          className="font-info-text! text-2xl text-body-text bg-[#f3f4f6] hover:bg-primary-700 rounded-md px-4 shadow-[4px_4px_8px_#d1d9e6,_-4px_-4px_8px_#ffffff] 
         active:shadow-[inset_4px_4px_8px_#d1d9e6,_inset_-4px_-4px_8px_#ffffff] 
         border-2 border-[#f3f4f6] hover:border-2 transition-all duration-300 ease-in-out hover:border-teal-300"
          onClick={() => {
            setCartData([]);
            counterFormRef.current?.regenerateTransactionNo();
          }}
        >
          New Customer
        </button>
        <button
          className="font-info-text! text-2xl text-body-text bg-[#f3f4f6] hover:bg-primary-700 rounded-md px-4 shadow-[4px_4px_8px_#d1d9e6,_-4px_-4px_8px_#ffffff] 
         active:shadow-[inset_4px_4px_8px_#d1d9e6,_inset_-4px_-4px_8px_#ffffff] 
         border-2 border-[#f3f4f6] hover:border-2 transition-all duration-300 ease-in-out hover:border-teal-300"
        >
          Add to Cart
        </button>
        <button
          className="font-info-text! text-2xl text-body-text bg-[#f3f4f6] hover:bg-primary-700 rounded-md px-4 shadow-[4px_4px_8px_#d1d9e6,_-4px_-4px_8px_#ffffff] 
         active:shadow-[inset_4px_4px_8px_#d1d9e6,_inset_-4px_-4px_8px_#ffffff] 
         border-2 border-[#f3f4f6] hover:border-2 transition-all duration-300 ease-in-out hover:border-teal-300"
          onClick={handleDone}
        >
          Done
        </button>
        <button
          className="font-info-text! text-2xl text-body-text bg-[#f3f4f6] hover:bg-primary-700 rounded-md px-4 shadow-[4px_4px_8px_#d1d9e6,_-4px_-4px_8px_#ffffff] 
         active:shadow-[inset_4px_4px_8px_#d1d9e6,_inset_-4px_-4px_8px_#ffffff] 
         border-2 border-[#f3f4f6] hover:border-2 transition-all duration-300 ease-in-out hover:border-teal-300"
          onClick={() => setCartData([])}
        >
          Clear
        </button>
        <button
          className="font-info-text! text-2xl text-body-text bg-[#f3f4f6] hover:bg-primary-700 rounded-md px-4 shadow-[4px_4px_8px_#d1d9e6,_-4px_-4px_8px_#ffffff] 
         active:shadow-[inset_4px_4px_8px_#d1d9e6,_inset_-4px_-4px_8px_#ffffff] 
         border-2 border-[#f3f4f6] hover:border-2 transition-all duration-300 ease-in-out hover:border-teal-300"
        >
          Sync
        </button>
        <button
          className="font-info-text! text-2xl text-body-text bg-[#f3f4f6] hover:bg-primary-700 rounded-md px-4 shadow-[4px_4px_8px_#d1d9e6,_-4px_-4px_8px_#ffffff] 
         active:shadow-[inset_4px_4px_8px_#d1d9e6,_inset_-4px_-4px_8px_#ffffff] 
         border-2 border-[#f3f4f6] hover:border-2 transition-all duration-300 ease-in-out hover:border-teal-300"
          onClick={() => {
            setToggleTheme();
          }}
        >
          Settings
        </button>
      </div>

      <CartTable />
    </div>
  );
}

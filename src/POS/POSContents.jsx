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
    <div className="bg-accent-200/20 rounded-lg border border-accent-800 shadow-md p-3">
      <header className="flex flex-col items-center mb-1">
        <h1 className="text-4xl font-bold font-info-text! text-accent-300 ">
          POINT OF SALE
        </h1>
        <p className="text-sm text-accent-600">Made for: GREEN SECRETS</p>
        <p className="text-xs italic text-accent-600">Property of JunFue</p>
      </header>

      <CounterForm
        cartData={cartData}
        setCartData={setCartData}
        ref={counterFormRef}
      />

      <div className="grid grid-cols-3 gap-4 mt-6">
        <button
          className="font-info-text! text-2xl text-accent-300 bg-primary-600 hover:bg-primary-700 rounded-md py-1 px-4 border border-primary-400 shadow-lg transition-all active:scale-95"
          onClick={() => {
            setCartData([]);
            counterFormRef.current?.regenerateTransactionNo();
          }}
        >
          New Customer
        </button>
        <button className="font-info-text! text-2xl text-accent-300 bg-primary-600 hover:bg-primary-700 rounded-md py-1 px-4 border border-primary-400 shadow-lg transition-all active:scale-95">
          Add to Cart
        </button>
        <button
          className="font-info-text! text-2xl text-accent-300 bg-primary-600 hover:bg-primary-700 rounded-md py-1 px-4 border border-primary-400 shadow-lg transition-all active:scale-95"
          onClick={handleDone}
        >
          Done
        </button>
        <button
          className="font-info-text! text-2xl text-accent-300 bg-primary-600 hover:bg-primary-700 rounded-md py-1 px-4 border border-primary-400 shadow-lg transition-all active:scale-95"
          onClick={() => setCartData([])}
        >
          Clear
        </button>
        <button className="font-info-text! text-2xl text-accent-300 bg-primary-600 hover:bg-primary-700 rounded-md py-1 px-4 border border-primary-400 shadow-lg transition-all active:scale-95">
          Sync
        </button>
        <button className="font-info-text! text-2xl text-accent-300 bg-primary-600 hover:bg-primary-700 rounded-md py-1 px-4 border border-primary-400 shadow-lg transition-all active:scale-95">
          Settings
        </button>
      </div>

      <CartTable />
    </div>
  );
}

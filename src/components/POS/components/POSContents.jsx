import { useContext, useEffect, useRef, useState } from "react";
import { CartTable } from "../../../shared-components/tables/CartTable";
import { CounterForm } from "../../../shared-components/forms/CounterForm";
import { CartContext } from "../../../context/CartContext";
import { SettingsContext } from "../../../context/SettingsContext";
import { Settings } from "../../../features/pos-features/settings/Settings";
import Auth from "../../../features/pos-features/authentication/Auth";

// Import the new button components

import { AddToCartBtn } from "./buttons/AddToCartBtn";
import { DoneBtn } from "./buttons/DoneBtn";
import { ClearBtn } from "./buttons/ClearBtn";
import { LoginBtn } from "./buttons/LoginBtn";
import { NewCustomerBtn } from "./buttons/NewCostumerBtn";
import { SettingsBtn } from "./buttons/SettingsBtn";

export function POSContents() {
  const { cartData, setCartData } = useContext(CartContext);
  const counterFormRef = useRef(null);
  const { showSettings, setShowSettings } = useContext(SettingsContext);
  const [isShowForm, setIsShowForm] = useState(false);

  useEffect(() => {
    setIsShowForm(true);
  }, []);

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

  const handleAddToCart = () => {
    // Programmatically trigger the form submission in CounterForm
    counterFormRef.current?.submitAddToCart();
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
        <NewCustomerBtn
          onClick={() => {
            setCartData([]);
            counterFormRef.current?.regenerateTransactionNo();
          }}
        />
        <AddToCartBtn onClick={handleAddToCart} />
        <DoneBtn onClick={handleDone} />
        <ClearBtn onClick={() => setCartData([])} />
        <LoginBtn onClick={() => setIsShowForm((prev) => !prev)} />

        {isShowForm ? <Auth /> : null}

        <SettingsBtn onClick={() => setShowSettings((prev) => !prev)} />

        {showSettings ? <Settings /> : null}
      </div>

      <CartTable />
    </div>
  );
}

import { useContext, useRef, useState } from "react";
import { CounterForm } from "./components/forms/CounterForm";
import { CartContext } from "../../context/CartContext";
import { SettingsContext } from "../../context/SettingsContext";
import { Settings } from "../SETTINGS/Settings";
import Auth from "../AUTHENTICATION/Auth";
import { AddToCartBtn } from "./components/buttons/AddToCartBtn";
import { DoneBtn } from "./components/buttons/DoneBtn";
import { ClearBtn } from "./components/buttons/ClearBtn";
import { LoginBtn } from "./components/buttons/LoginBtn";
import { SettingsBtn } from "./components/buttons/SettingsBtn";

import { LogoutButton } from "./components/buttons/LogoutButton";
import { useAuth } from "../AUTHENTICATION/hooks/useAuth";
import { NewCustomerBtn } from "./components/buttons/NewCostumerBtn";
import { CartTable } from "./components/CartTable";

export function POSContents() {
  const { cartData, setCartData } = useContext(CartContext);
  const counterFormRef = useRef(null);
  const { showSettings, setShowSettings } = useContext(SettingsContext);
  const [isShowAuth, setIsShowAuth] = useState(false);

  const { user } = useAuth();

  const handleDone = () => {
    counterFormRef.current?.completeTransaction();
  };

  const handleAddToCart = () => {
    counterFormRef.current?.submitAddToCart();
  };

  // --- 1. Create a handler for the New Customer button ---
  const handleNewCustomer = () => {
    // This calls the function exposed by CounterForm via its ref
    counterFormRef.current?.regenerateTransactionNo();
  };

  return (
    <div className="rounded-[20px] bg-background shadow-neumorphic p-3">
      <header className="flex flex-col items-center mb-1">
        {user ? (
          <p className="text-xs md:text-[16px] text-head-text font-bold">
            Welcome, {user.email}!
          </p>
        ) : (
          <p className="text-sm text-body-text">Please sign in.</p>
        )}
        <h1 className="sm:text-2xl lg:text-3xl 2xl:text-4xl font-bold text-head-text">
          POINT OF SALE
        </h1>
      </header>

      <CounterForm
        cartData={cartData}
        setCartData={setCartData}
        ref={counterFormRef}
      />

      <div className="grid grid-cols-3 gap-4 mt-6">
        {/* --- 2. Pass the new handler to the NewCustomerBtn --- */}
        <NewCustomerBtn onClick={handleNewCustomer} />
        <AddToCartBtn onClick={handleAddToCart} />
        {/* The DoneBtn now correctly triggers the transaction logic */}
        <DoneBtn onClick={handleDone} />
        <ClearBtn onClick={() => setCartData([])} />

        {user ? (
          <LogoutButton />
        ) : (
          <LoginBtn onClick={() => setIsShowAuth((prev) => !prev)} />
        )}

        {isShowAuth && !user ? <Auth /> : null}

        <SettingsBtn onClick={() => setShowSettings((prev) => !prev)} />
        {showSettings ? <Settings /> : null}
      </div>

      <CartTable />
    </div>
  );
}

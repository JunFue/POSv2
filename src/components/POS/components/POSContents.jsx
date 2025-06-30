import { useContext, useRef, useState } from "react";
import { CartTable } from "../../../shared-components/tables/CartTable";
import { CounterForm } from "../../../shared-components/forms/CounterForm";
import { CartContext } from "../../../context/CartContext";
import { SettingsContext } from "../../../context/SettingsContext";
import { Settings } from "../../../features/pos-features/settings/Settings";
import Auth from "../../../features/pos-features/authentication/Auth";
import { AddToCartBtn } from "./buttons/AddToCartBtn";
import { DoneBtn } from "./buttons/DoneBtn";
import { ClearBtn } from "./buttons/ClearBtn";
import { LoginBtn } from "./buttons/LoginBtn";
import { NewCustomerBtn } from "./buttons/NewCostumerBtn";
import { SettingsBtn } from "./buttons/SettingsBtn";

import { LogoutButton } from "./buttons/LogoutButton";
import { useAuth } from "../../../features/pos-features/authentication/hooks/Useauth";

export function POSContents() {
  const { cartData, setCartData } = useContext(CartContext);
  const counterFormRef = useRef(null);
  const { showSettings, setShowSettings } = useContext(SettingsContext);
  const [isShowAuth, setIsShowAuth] = useState(false);

  const { user } = useAuth();

  // --- REVISED handleDone FUNCTION ---
  // It now calls the completeTransaction function exposed by the CounterForm ref.
  const handleDone = () => {
    counterFormRef.current?.completeTransaction();
  };

  const handleAddToCart = () => {
    counterFormRef.current?.submitAddToCart();
  };

  return (
    <div className="rounded-[20px] bg-background shadow-neumorphic p-3">
      <header className="flex flex-col items-center mb-1">
        {user ? (
          <p className="text-sm text-green-600 font-bold">
            Welcome, {user.email}!
          </p>
        ) : (
          <p className="text-sm text-body-text">Please sign in.</p>
        )}
        <h1 className="text-4xl font-bold text-head-text">POINT OF SALE</h1>
      </header>

      <CounterForm
        cartData={cartData}
        setCartData={setCartData}
        ref={counterFormRef}
      />

      <div className="grid grid-cols-3 gap-4 mt-6">
        <NewCustomerBtn /* ... */ />
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

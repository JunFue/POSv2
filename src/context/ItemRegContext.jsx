import { createContext, useContext, useMemo } from "react";
import { AuthContext } from "./AuthContext";
import { useItemSynchronization } from "../hooks/useItemSynchronization";

const ItemRegData = createContext();

export function ItemRegProvider({ children }) {
  const { user } = useContext(AuthContext);
  const userId = user?.id;

  // --- Step 1: Get `refreshItems` back from the hook ---
  const {
    items,
    loading,
    serverOnline,
    addItem,
    deleteItem,
    refreshItems, // Get the refresh function
  } = useItemSynchronization(userId);

  // The context value now includes the deleteItem function
  const contextValue = useMemo(
    () => ({
      items,
      loading,
      serverOnline,
      addItem,
      deleteItem,
      refreshItems, // --- Step 2: Provide it to the rest of the app ---
    }),
    [
      items,
      loading,
      serverOnline,
      addItem,
      deleteItem,
      refreshItems, // --- Step 3: Add to dependency array ---
    ]
  );

  return (
    <ItemRegData.Provider value={contextValue}>{children}</ItemRegData.Provider>
  );
}

export { ItemRegData };

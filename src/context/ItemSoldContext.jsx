import { createContext, useEffect, useState } from "react";

const ItemSoldContext = createContext();

export function ItemSoldProvider({ children }) {
  const [itemSold, setItemSold] = useState(() => {
    const storedItems = localStorage.getItem("itemSold");
    return storedItems ? JSON.parse(storedItems) : [];
  });
  useEffect(() => {
    localStorage.setItem("itemSold", JSON.stringify(itemSold));
  }, [itemSold]);
  return (
    <ItemSoldContext.Provider value={{ itemSold, setItemSold }}>
      {children}
    </ItemSoldContext.Provider>
  );
}

// Export the context so it can be used elsewhere.
export { ItemSoldContext };

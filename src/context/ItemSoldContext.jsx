import { createContext, useEffect, useState } from "react";

const ItemSoldContext = createContext();

export function ItemSoldProvider({ children }) {
  const [itemSold, setItemSold] = useState(() => {
    const storedItems = localStorage.getItem("itemSold");
    return storedItems ? JSON.parse(storedItems) : [];
  });
  const [serverOnline, setServerOnline] = useState(true);

  useEffect(() => {
    localStorage.setItem("itemSold", JSON.stringify(itemSold));
  }, [itemSold]);

  return (
    <ItemSoldContext.Provider
      value={{ itemSold, setItemSold, serverOnline, setServerOnline }}
    >
      {children}
    </ItemSoldContext.Provider>
  );
}

export { ItemSoldContext };

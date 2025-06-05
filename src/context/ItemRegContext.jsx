import { useState, useEffect, createContext } from "react";

const ItemRegData = createContext();

export function ItemRegProvider({ children }) {
  const [items, setItems] = useState(() => {
    const storedItems = localStorage.getItem("inventoryItems");
    return storedItems ? JSON.parse(storedItems) : [];
  });

  useEffect(() => {
    localStorage.setItem("inventoryItems", JSON.stringify(items));
  }, [items]);

  return (
    <ItemRegData.Provider value={{ items, setItems }}>
      {children}
    </ItemRegData.Provider>
  );
}

export { ItemRegData };

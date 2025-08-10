import { createContext, useEffect, useState } from "react";

const ItemSoldContext = createContext();

const getTodaysDateString = () => new Date().toISOString().split("T")[0];

export function ItemSoldProvider({ children }) {
  // State for historical/multi-date filtered data (no caching)
  const [itemSold, setItemSold] = useState([]);

  // State for today's sales data, cached by date
  const [todaysItemSold, setTodaysItemSold] = useState(() => {
    const today = getTodaysDateString();
    const storedItems = localStorage.getItem(`todaysItemSold_${today}`);
    return storedItems ? JSON.parse(storedItems) : [];
  });

  const [serverOnline, setServerOnline] = useState(true);

  // Effect to cache today's items whenever they change
  useEffect(() => {
    const today = getTodaysDateString();
    localStorage.setItem(
      `todaysItemSold_${today}`,
      JSON.stringify(todaysItemSold)
    );
  }, [todaysItemSold]);

  return (
    <ItemSoldContext.Provider
      value={{
        itemSold,
        setItemSold,
        todaysItemSold,
        setTodaysItemSold,
        serverOnline,
        setServerOnline,
      }}
    >
      {children}
    </ItemSoldContext.Provider>
  );
}

export { ItemSoldContext };

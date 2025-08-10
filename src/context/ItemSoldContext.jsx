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
    const initialValue = storedItems ? JSON.parse(storedItems) : [];
    // Log the initial state loaded from localStorage
    console.log(
      "LOG (Context): Initializing 'todaysItemSold' state:",
      initialValue
    );
    return initialValue;
  });

  const [serverOnline, setServerOnline] = useState(true);

  // Effect to cache today's items whenever they change
  useEffect(() => {
    // Log when the state changes and what the new value is
    console.log(
      "LOG (Context): 'todaysItemSold' state changed, updating localStorage.",
      todaysItemSold
    );
    const today = getTodaysDateString();
    localStorage.setItem(
      `todaysItemSold_${today}`,
      JSON.stringify(todaysItemSold)
    );
  }, [todaysItemSold]);

  // Log every time the provider component renders
  console.log(
    "LOG (Context): ItemSoldProvider is rendering. Current 'todaysItemSold':",
    todaysItemSold
  );

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

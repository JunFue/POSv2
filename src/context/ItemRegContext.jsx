import { useState, useEffect, createContext } from "react";

// It's common practice to export the context right away
const ItemRegData = createContext();

export function ItemRegProvider({ children }) {
  const [items, setItems] = useState([]);

  // Function to fetch items from the new, correct API endpoint
  const refreshItems = async () => {
    try {
      // 1. Use the new /api/items endpoint
      const res = await fetch("http://localhost:3000/api/items");
      if (!res.ok) {
        throw new Error(`Failed to fetch items. Status: ${res.status}`);
      }
      const data = await res.json(); // This will now be an array of items
      console.log("Fetched items:", data);

      // 2. The API now reliably returns an array, so we can simplify this
      setItems(data);
    } catch (error) {
      console.error("Error in refreshItems:", error.message);
    }
  };

  useEffect(() => {
    refreshItems();
  }, []);

  return (
    // 3. Don't pass down the raw `setItems` function
    <ItemRegData.Provider value={{ items, refreshItems }}>
      {children}
    </ItemRegData.Provider>
  );
}

export { ItemRegData };

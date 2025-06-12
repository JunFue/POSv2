import { useState, useEffect, createContext } from "react";

// It's common practice to export the context right away
const ItemRegData = createContext();

export function ItemRegProvider({ children }) {
  // Initialize items state with data from localStorage, if available.
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem("items");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading items from localStorage:", error);
      return [];
    }
  });

  const [serverOnline, setServerOnline] = useState(true);

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

      // 2. The API now reliably returns an array, so we update state...
      setItems(data);

      // ...and save the new data into localStorage for offline access.
      localStorage.setItem("items", JSON.stringify(data));
    } catch (error) {
      console.error("Error in refreshItems:", error.message);
      alert("SERVER IS OFFLINE");
      setServerOnline(false);
      throw new Error("Server is Offline");
    }
  };

  useEffect(() => {
    refreshItems();
  }, []);

  return (
    // 3. Even though we're not encouraged to pass down the raw `setItems`,
    // we leave it available here if needed. Otherwise, you can remove it from context.
    <ItemRegData.Provider
      value={{ items, refreshItems, setItems, serverOnline }}
    >
      {children}
    </ItemRegData.Provider>
  );
}

export { ItemRegData };

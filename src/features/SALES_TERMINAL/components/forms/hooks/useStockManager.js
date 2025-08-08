import { useInventory } from "../../../../../context/InventoryContext";

/**
 * A hook that provides a function to get the net quantity of an item
 * directly from the live, centralized inventory context.
 */
export const useStockManager = () => {
  // Consume the new context to get the live quantity function.
  const { getLiveQuantity } = useInventory();

  /**
   * Retrieves the definitive quantity for a given item name from the global inventory state.
   * @param {string} itemName - The name of the item.
   * @returns {number|string} The available quantity or a status message.
   */
  const getNetQuantity = (itemName) => {
    return getLiveQuantity(itemName);
  };

  return { getNetQuantity };
};

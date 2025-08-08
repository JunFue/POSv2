import { useState, useContext } from "react";
import { useStockManager } from "./useStockManager";
import { ItemRegData } from "../../../../../context/ItemRegContext";

export const useItemSuggestions = (setValue, quantityRef) => {
  const { items: regItems } = useContext(ItemRegData);
  const { getNetQuantity } = useStockManager();
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const resetSuggestions = () => {
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  const handleBarcodeChange = (e) => {
    const input = e.target.value;
    if (input) {
      const filtered = regItems.filter((item) =>
        item.name.toLowerCase().startsWith(input.toLowerCase())
      );
      setSuggestions(filtered);
      if (
        filtered.length === 1 &&
        filtered[0].name.toLowerCase() === input.toLowerCase()
      ) {
        setValue("availableStocks", getNetQuantity(filtered[0].name));
      } else {
        setValue("availableStocks", "");
      }
    } else {
      resetSuggestions();
      setValue("availableStocks", "");
    }
  };

  const handleBarcodeKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();

      // --- REVISED LOGIC FOR "ENTER" KEY ---
      let itemToSelect = null;

      // First, check if an item is highlighted with the arrow keys.
      if (highlightedIndex > -1) {
        itemToSelect = suggestions[highlightedIndex];
      }
      // If not highlighted, but there's exactly one suggestion, select it.
      else if (suggestions.length === 1) {
        itemToSelect = suggestions[0];
      }

      // If an item was determined to be selected, handle it.
      if (itemToSelect) {
        handleSelectSuggestion(itemToSelect);
      }
      // Otherwise, if there's text in the input, move focus to quantity.
      else if (e.target.value) {
        quantityRef.current?.focus();
      }
    }
  };

  const handleSelectSuggestion = (item) => {
    setValue("barcode", item.barcode, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("availableStocks", getNetQuantity(item.name));
    quantityRef.current?.focus();
    resetSuggestions();
  };

  return {
    suggestions,
    highlightedIndex,
    handleBarcodeChange,
    handleBarcodeKeyDown,
    handleSelectSuggestion,
  };
};

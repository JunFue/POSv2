import { useState, useContext } from "react";

import { useStockManager } from "./useStockManager";
import { ItemRegData } from "../../../context/ItemRegContext";

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
      let selectedItem = suggestions[highlightedIndex];
      if (selectedItem) {
        handleSelectSuggestion(selectedItem);
      } else if (e.target.value) {
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

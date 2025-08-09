// useAddToCart.js
import { useContext } from "react";
import { CartContext } from "../../../context/CartContext";
import { ItemRegData } from "../../../context/ItemRegContext";
import { useStockManager } from "./useStockManager";

export function useAddToCart(form, inputRefs) {
  const { setCartData } = useContext(CartContext);
  const { items: regItems } = useContext(ItemRegData);
  const { getNetQuantity } = useStockManager();
  const { setValue } = form;
  const { barcodeRef, quantityRef } = inputRefs;

  return function addToCart(data) {
    // ✅ now this part does not call hooks; safe to use in event handlers
    if (!data.barcode || !data.quantity) {
      alert("Please enter barcode and quantity.");
      return;
    }

    const currentItem = regItems.find((item) => item.barcode === data.barcode);
    if (!currentItem) {
      alert(`Item with barcode "${data.barcode}" not found.`);
      setValue("barcode", "");
      barcodeRef.current?.focus();
      return;
    }

    const quantity = parseInt(data.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity.");
      setValue("quantity", "");
      quantityRef.current?.focus();
      return;
    }

    const availableStock = getNetQuantity(currentItem.name);
    if (availableStock !== "N/A" && quantity > availableStock) {
      alert(
        `Not enough stock for ${currentItem.name}. Available: ${availableStock}`
      );
      setValue(
        "quantity",
        availableStock > 0 ? availableStock.toString() : "0"
      );
      quantityRef.current?.focus();
      return;
    }

    setCartData((prev) => [
      ...prev,
      {
        barcode: data.barcode,
        item: currentItem.name,
        price: currentItem.price,
        quantity: quantity,
        total() {
          return this.price * this.quantity;
        },
      },
    ]);

    setValue("barcode", "");
    setValue("quantity", "");
    setValue("availableStocks", "");
    barcodeRef.current?.focus();
  };
}

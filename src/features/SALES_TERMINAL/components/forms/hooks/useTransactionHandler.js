import { useContext } from "react";
import { useStockManager } from "./useStockManager";
import { supabase } from "../../../../../utils/supabaseClient";
import { CartContext } from "../../../../../context/CartContext";
import { ItemRegData } from "../../../../../context/ItemRegContext";
import { PaymentContext } from "../../../../../context/PaymentContext";
import { ItemSoldContext } from "../../../../../context/ItemSoldContext";
import { useInventory } from "../../../../../context/InventoryContext"; // Import InventoryContext
import { generateTransactionNo } from "../../../../../utils/transactionNumberGenerator";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const useTransactionHandler = (formMethods, refs) => {
  const { cartData, setCartData } = useContext(CartContext);
  const { items: regItems } = useContext(ItemRegData);
  const { setItemSold, setServerOnline: setSoldServerOnline } =
    useContext(ItemSoldContext);
  const { setPaymentData } = useContext(PaymentContext);
  // Consume the inventory context to get the current state and the setter function
  const { inventory, setInventory } = useInventory();

  const { getNetQuantity } = useStockManager();

  const { getValues, setValue, reset } = formMethods;
  const { barcodeRef, costumerNameRef, quantityRef } = refs;

  const addToCart = (data) => {
    // ... existing addToCart logic remains the same ...
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

  const handleDone = async () => {
    // --- 1. Perform standard validation and data prep ---
    const {
      transactionNo,
      cashierName,
      costumerName,
      transactionTime,
      payment,
      discount,
    } = getValues();
    const calculatedGrandTotal = cartData.reduce(
      (sum, item) => sum + item.total(),
      0
    );
    const paymentValue = parseFloat(payment);
    const discountValue = parseFloat(discount) || 0;
    const computedChange =
      (paymentValue || 0) + discountValue - calculatedGrandTotal;

    if (cartData.length === 0) {
      alert("Cart is empty. Add items to proceed.");
      return;
    }
    if (!payment || isNaN(paymentValue)) {
      alert("Enter a valid payment amount.");
      return;
    }
    if (computedChange < 0) {
      alert("Insufficient payment. Change is negative.");
      return;
    }

    // --- 2. OPTIMISTIC UI UPDATE ---
    // Create a deep copy of the inventory to avoid direct state mutation.
    const optimisticInventory = JSON.parse(JSON.stringify(inventory));

    // For each item in the cart, find it in our copied inventory and subtract the quantity.
    for (const cartItem of cartData) {
      const itemIndex = optimisticInventory.findIndex(
        (invItem) => invItem.item_name === cartItem.item
      );
      if (itemIndex > -1) {
        optimisticInventory[itemIndex].quantity_available -= cartItem.quantity;
      }
    }

    // Immediately update the UI with the new, predicted inventory state.
    // Any component using the InventoryContext (like StocksMonitor) will re-render instantly.
    setInventory(optimisticInventory);
    // --- END OF OPTIMISTIC UPDATE ---

    // --- 3. Clear local UI state for the next transaction ---
    const soldItems = cartData.map((item) => {
      const regItem = regItems.find((ri) => ri.barcode === item.barcode);
      return {
        barcode: item.barcode,
        itemName: item.item,
        price: item.price,
        quantity: item.quantity,
        totalPrice: (item.price * item.quantity).toFixed(2),
        transactionDate: transactionTime,
        transactionNo: transactionNo,
        inCharge: cashierName,
        costumer: costumerName || "N/A",
        classification: regItem ? regItem.category : "",
      };
    });

    const paymentRecord = {
      transactionDate: transactionTime,
      transactionNumber: transactionNo,
      costumerName: costumerName || "N/A",
      amountToPay: calculatedGrandTotal.toFixed(2),
      amountRendered: paymentValue.toFixed(2),
      discount: discountValue.toFixed(2),
      change: computedChange.toFixed(2),
      inCharge: cashierName,
    };

    setCartData([]);
    reset({
      ...getValues(),
      payment: "",
      discount: "",
      costumerName: "",
      barcode: "",
      quantity: "",
      availableStocks: "",
      grandTotal: "0.00",
      change: "0.00",
      transactionNo: generateTransactionNo(),
    });
    costumerNameRef.current?.focus();

    // Update other local contexts
    setItemSold((prev) => [...prev, ...soldItems]);
    setPaymentData((prev) => [...prev, paymentRecord]);

    // --- 4. Perform network requests in the background ---
    const sendDataToServer = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        alert("Authentication error. Please sign in again.");
        return;
      }
      const token = session.access_token;

      let offline = false;
      try {
        const requests = soldItems.map((item) =>
          fetch(`${BACKEND_URL}/api/transactions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(item),
          })
        );

        requests.push(
          fetch(`${BACKEND_URL}/api/payments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(paymentRecord),
          })
        );

        const responses = await Promise.all(requests);
        if (responses.some((res) => !res.ok)) {
          offline = true;
        }
      } catch (error) {
        offline = true;
        console.error("API error during transaction finalization:", error);
      }

      setSoldServerOnline(!offline);
      if (offline) {
        alert("SERVER IS OFFLINE. Some data may not have been saved.");
      }
    };

    sendDataToServer();
  };

  return { addToCart, handleDone };
};

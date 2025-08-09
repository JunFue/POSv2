import { useContext } from "react"; // Core React hook for accessing context.
import { ItemRegData } from "../../../context/ItemRegContext"; // Provides access to the master list of all registered items.
import { PaymentContext } from "../../../context/PaymentContext"; // Manages the state of payment records for transactions.
import { ItemSoldContext } from "../../../context/ItemSoldContext"; // Manages the state of items that have been sold.
import { useInventory } from "../../../context/InventoryContext"; // Custom hook providing access to the live inventory state.
import { generateTransactionNo } from "../../../utils/transactionNumberGenerator"; // Utility function to create unique transaction numbers.
import { finalizeTransaction } from "../services/transactionService"; // Service that handles all backend API communication for finalizing a sale.
import { CartContext } from "../../../context/CartContext";

export const useTransactionHandler = (formMethods, refs) => {
  const { cartData, setCartData } = useContext(CartContext);
  const { items: regItems } = useContext(ItemRegData);
  const { setItemSold, setServerOnline: setSoldServerOnline } =
    useContext(ItemSoldContext);
  const { setPaymentData } = useContext(PaymentContext);
  const { inventory, setInventory } = useInventory();

  const { getValues, reset } = formMethods;
  const { costumerNameRef } = refs;

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
    const optimisticInventory = JSON.parse(JSON.stringify(inventory));
    for (const cartItem of cartData) {
      const itemIndex = optimisticInventory.findIndex(
        (invItem) => invItem.item_name === cartItem.item
      );
      if (itemIndex > -1) {
        optimisticInventory[itemIndex].quantity_available -= cartItem.quantity;
      }
    }
    setInventory(optimisticInventory);

    // --- 3. Prepare data and clear local UI state ---
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
    setItemSold((prev) => [...prev, ...soldItems]);
    setPaymentData((prev) => [...prev, paymentRecord]);
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

    // --- 4. Perform network request via the service ---
    console.log("Sending transaction to the server...");
    const result = await finalizeTransaction(paymentRecord, soldItems);

    setSoldServerOnline(result.success);

    if (!result.success) {
      alert(
        "SERVER IS OFFLINE. Data has been saved locally but failed to sync."
      );
    } else {
      console.log("Transaction successfully synced with the server.");
    }
  };

  return { handleDone };
};

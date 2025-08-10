import { useContext } from "react";
import { ItemRegData } from "../../../context/ItemRegContext";
import { PaymentContext } from "../../../context/PaymentContext";
import { ItemSoldContext } from "../../../context/ItemSoldContext";
import { useInventory } from "../../../context/InventoryContext";
import { generateTransactionNo } from "../../../utils/transactionNumberGenerator";
import { finalizeTransaction } from "../services/transactionService";
import { CartContext } from "../../../context/CartContext";

export const useTransactionHandler = (formMethods, refs) => {
  const { cartData, setCartData } = useContext(CartContext);
  const { items: regItems } = useContext(ItemRegData);
  const { setTodaysItemSold, setServerOnline: setSoldServerOnline } =
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

    const now = new Date();
    const todaysDateString = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // ✅ FIX: Split the transactionTime string by the space to get only the date part.
    const transactionDateString = transactionTime.split(" ")[0];

    if (transactionDateString === todaysDateString) {
      console.log("LOG: New items to be added:", soldItems);
      setTodaysItemSold((prev) => {
        console.log("LOG: Previous 'todaysItemSold' state:", prev);
        const prevData = Array.isArray(prev?.data) ? prev.data : [];
        const newData = { data: [...soldItems, ...prevData] };
        console.log("LOG: New state being set:", newData);
        return newData;
      });
    } else {
      console.log(
        `LOG: Transaction date (${transactionDateString}) does not match today's date (${todaysDateString}). Skipping update.`
      );
    }

    setCartData([]);
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
    const result = await finalizeTransaction(paymentRecord, soldItems);

    setSoldServerOnline(result.success);

    if (!result.success) {
      alert(
        "SERVER IS OFFLINE. Data has been saved locally but failed to sync."
      );
    }
  };

  return { handleDone };
};

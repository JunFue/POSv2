import { useContext } from "react";
import { useStockManager } from "./useStockManager";

import { CartContext } from "../../../context/CartContext";
import { ItemRegData } from "../../../context/ItemRegContext";
import { PaymentContext } from "../../../context/PaymentContext";
import { ItemSoldContext } from "../../../context/ItemSoldContext";
import { generateTransactionNo } from "../../../utils/transactionNumberGenerator";

export const useTransactionHandler = (formMethods, refs) => {
  // CONTEXTS
  const { cartData, setCartData } = useContext(CartContext);
  const { items: regItems } = useContext(ItemRegData);
  const { setItemSold, setServerOnline: setSoldServerOnline } =
    useContext(ItemSoldContext);
  const { setPaymentData } = useContext(PaymentContext);

  // HOOKS
  const { getNetQuantity } = useStockManager();

  // PROPS
  const { getValues, setValue, reset } = formMethods;
  const { barcodeRef, costumerNameRef, quantityRef } = refs;

  /**
   * Validates and adds an item to the cart.
   * @param {object} data - The form data, containing barcode and quantity.
   */
  const addToCart = (data) => {
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

  /**
   * Finalizes the transaction, sending data to contexts and the server, and resetting the form.
   */
  const handleDone = async () => {
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

    setItemSold((prev) => [...prev, ...soldItems]);
    setPaymentData((prev) => [...prev, paymentRecord]);

    let offline = false;
    for (const transaction of soldItems) {
      try {
        const response = await fetch("http://localhost:3000/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transaction),
        });
        if (!response.ok) {
          offline = true;
        }
      } catch (error) {
        offline = true;
        console.error("Transaction API error:", error);
      }
    }
    setSoldServerOnline(!offline);
    if (offline) {
      alert("SERVER IS OFFLINE. Data saved locally.");
    }

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
  };

  return { addToCart, handleDone };
};

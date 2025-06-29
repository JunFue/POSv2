import React, {
  useImperativeHandle,
  forwardRef,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";

import { CounterFormFields } from "./CounterFormFields";
import { SuggestionList } from "./SuggestionList";
import { useItemSuggestions } from "./hooks/useItemSuggestions";
import { useTransactionHandler } from "./hooks/useTransactionHandler";
import { generateTransactionNo } from "../../utils/transactionNumberGenerator";
import { CartContext } from "../../context/CartContext";
import { ItemRegData } from "../../context/ItemRegContext";

/**
 * A container component that manages the state and logic for the point-of-sale form.
 * It uses custom hooks to separate concerns and renders presentational child components.
 */
export const CounterForm = forwardRef((props, ref) => {
  const { cartData } = useContext(CartContext);
  const { items: regItems } = useContext(ItemRegData);

  const form = useForm({
    defaultValues: {
      cashierName: "Junel Fuentes",
      transactionTime: "",
      payment: "",
      costumerName: "",
      transactionNo: "",
      discount: "",
      barcode: "",
      availableStocks: "",
      change: "",
      quantity: "",
      additionalInfo: "",
      grandTotal: "0.00",
    },
  });
  const { register, handleSubmit, setValue, watch, getValues, reset } = form;

  // Refs for direct DOM access and focus management
  const costumerNameRef = useRef(null);
  const barcodeRef = useRef(null);
  const quantityRef = useRef(null);
  const discountRef = useRef(null);
  const inputRefs = { costumerNameRef, barcodeRef, quantityRef, discountRef };

  // Initialize custom hooks to handle complex logic
  const {
    suggestions,
    highlightedIndex,
    handleBarcodeChange,
    handleBarcodeKeyDown,
    handleSelectSuggestion,
  } = useItemSuggestions(setValue, quantityRef);

  const { addToCart, handleDone } = useTransactionHandler(
    { getValues, setValue, reset },
    inputRefs
  );

  // Expose functions to the parent component (POSContents)
  useImperativeHandle(ref, () => ({
    regenerateTransactionNo: () =>
      setValue("transactionNo", generateTransactionNo()),
    completeTransaction: handleDone,
    getTransactionData: () => {
      const { transactionNo, cashierName, costumerName, transactionTime } =
        getValues();
      return cartData.map((item) => {
        const regItem = regItems.find((ri) => ri.barcode === item.barcode);
        return {
          barcode: item.barcode,
          itemName: item.item,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.total(),
          transactionDate: transactionTime,
          transactionNo: transactionNo,
          inCharge: cashierName,
          costumer: costumerName || "N/A",
          classification: regItem ? regItem.category : "",
        };
      });
    },
    submitAddToCart: handleSubmit(addToCart),
  }));

  // Watch for changes in form fields to compute other values
  const payment = watch("payment");
  const discount = watch("discount");
  const barcodeValue = watch("barcode");

  // Effect for initial setup
  useEffect(() => {
    setValue("transactionNo", generateTransactionNo());
    costumerNameRef.current?.focus();
  }, [setValue]);

  // Effect for the running transaction timer
  useEffect(() => {
    const interval = setInterval(() => {
      setValue("transactionTime", dayjs().format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, [setValue]);

  // Effect to recalculate totals and change whenever relevant data changes
  useEffect(() => {
    const total = cartData.reduce((sum, item) => sum + item.total(), 0);
    setValue("grandTotal", total.toFixed(2));

    const paymentValue = parseFloat(payment) || 0;
    const discountValue = parseFloat(discount) || 0;
    const changeValue = paymentValue + discountValue - total;
    setValue("change", changeValue.toFixed(2));
  }, [cartData, discount, payment, setValue]);

  const matchedItem = regItems.find(
    (item) => item.barcode === barcodeValue?.trim()
  );

  return (
    <div className="shiny-gradient p-1 text-accent-100">
      <CounterFormFields
        // The ref object contains all individual input refs
        ref={{ costumerNameRef, barcodeRef, quantityRef, discountRef }}
        register={register}
        handleSubmit={handleSubmit(addToCart)}
        onBarcodeChange={handleBarcodeChange}
        onBarcodeKeyDown={handleBarcodeKeyDown}
      />
      <SuggestionList
        suggestions={suggestions}
        highlightedIndex={highlightedIndex}
        onSelect={handleSelectSuggestion}
      />
      <div
        id="item-description"
        className="text-center text-[1.2vw] shadow-input rounded-sm"
      >
        {barcodeValue && matchedItem ? (
          <p>
            {matchedItem.barcode} / {matchedItem.name} / {matchedItem.price} /{" "}
            {matchedItem.category}
          </p>
        ) : (
          <p>NO PRODUCTS AVAILABLE</p>
        )}
      </div>
    </div>
  );
});

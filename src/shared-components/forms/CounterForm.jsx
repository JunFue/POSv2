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
// 1. Import the SuggestionList component
import { SuggestionList } from "./SuggestionList";
import { useItemSuggestions } from "./hooks/useItemSuggestions";
import { useTransactionHandler } from "./hooks/useTransactionHandler";
import { generateTransactionNo } from "../../utils/transactionNumberGenerator";
import { CartContext } from "../../context/CartContext";
import { ItemRegData } from "../../context/ItemRegContext";
import { useAuth } from "../../features/pos-features/authentication/hooks/useAuth";

export const CounterForm = forwardRef((props, ref) => {
  const { cartData } = useContext(CartContext);
  const { items: regItems } = useContext(ItemRegData);
  const { user } = useAuth();

  const form = useForm({
    defaultValues: {
      cashierName: "",
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

  const costumerNameRef = useRef(null);
  const barcodeRef = useRef(null);
  const quantityRef = useRef(null);
  const discountRef = useRef(null);
  const inputRefs = { costumerNameRef, barcodeRef, quantityRef, discountRef };

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

  const payment = watch("payment");
  const discount = watch("discount");
  const barcodeValue = watch("barcode");

  useEffect(() => {
    setValue("transactionNo", generateTransactionNo());
    costumerNameRef.current?.focus();
  }, [setValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue("transactionTime", dayjs().format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, [setValue]);

  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.fullName || user.email;
      setValue("cashierName", name);
    } else {
      setValue("cashierName", "");
    }
  }, [user, setValue]);

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
    <div className="relative shiny-gradient p-1 text-accent-100">
      <CounterFormFields
        ref={{ costumerNameRef, barcodeRef, quantityRef, discountRef }}
        register={register}
        handleSubmit={handleSubmit(addToCart)}
        onBarcodeChange={handleBarcodeChange}
        onBarcodeKeyDown={handleBarcodeKeyDown}
        suggestions={suggestions}
        highlightedIndex={highlightedIndex}
        onSelectSuggestion={handleSelectSuggestion}
      />
      {/* 2. Render the SuggestionList when there are suggestions */}
      {suggestions.length > 0 && (
        <SuggestionList
          suggestions={suggestions}
          highlightedIndex={highlightedIndex}
          onSelect={handleSelectSuggestion}
          // 3. Pass different classes for a dark theme that matches the counter form
          className="w-fit px-1 absolute z-1 top-[60%] left-[19%] md:top-[60%] md:left-[18%] lg:top-[60%] lg:left-[17%] xl:top-[60%] xl:left-[18%] bg-background shadow-neumorphic rounded max-h-40 overflow-y-auto no-scrollbar"
        />
      )}
      <div
        id="item-description"
        className="text-center body-text-media shadow-input rounded-sm"
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

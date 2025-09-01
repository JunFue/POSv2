import React, {
  useImperativeHandle,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";

import { CounterFormFields } from "./CounterFormFields";
import { SuggestionList } from "./SuggestionList";
import { useItemSuggestions } from "../../hooks/useItemSuggestions";
import { useTransactionHandler } from "../../hooks/useTransactionHandler";
import { generateTransactionNo } from "../../../../utils/transactionNumberGenerator";
import { CartContext } from "../../../../context/CartContext";
import { ItemRegData } from "../../../../context/ItemRegContext";
import { useAuth } from "../../../AUTHENTICATION/hooks/useAuth";
import { useAddToCart } from "../../hooks/useAddtoCart";

export const CounterForm = forwardRef((props, ref) => {
  const { cartData } = useContext(CartContext);
  const { items: regItems } = useContext(ItemRegData);
  const { user } = useAuth();
  const [alertMessage, setAlertMessage] = useState(null);

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
      customPrice: "",
      grandTotal: "0.00",
    },
  });
  const { register, handleSubmit, setValue, watch, getValues, reset } = form;

  const costumerNameRef = useRef(null);
  const barcodeRef = useRef(null);
  const quantityRef = useRef(null);
  const discountRef = useRef(null);
  const customPriceRef = useRef(null);
  const inputRefs = {
    costumerNameRef,
    barcodeRef,
    quantityRef,
    discountRef,
    customPriceRef,
  };

  const addToCart = useAddToCart(form, inputRefs);

  const {
    suggestions,
    highlightedIndex,
    handleBarcodeChange,
    handleBarcodeKeyDown,
    handleSelectSuggestion,
  } = useItemSuggestions(setValue, quantityRef);

  const { handleDone } = useTransactionHandler(
    { getValues, setValue, reset },
    inputRefs
  );

  const handleAddToCartWithStockCheck = (data) => {
    const stockValue = getValues("availableStocks");
    const stockNumber = parseFloat(stockValue);

    if (isNaN(stockNumber) || stockNumber <= 0) {
      setAlertMessage(
        "This item is out of stock and cannot be added to the cart."
      );
      return;
    }

    addToCart(data);
  };

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
          costumerName: costumerName || "N/A",
          classification: regItem ? regItem.category : "",
        };
      });
    },
    submitAddToCart: handleSubmit(handleAddToCartWithStockCheck),
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
        ref={{
          costumerNameRef,
          barcodeRef,
          quantityRef,
          discountRef,
          customPriceRef,
        }}
        register={register}
        handleSubmit={handleSubmit(handleAddToCartWithStockCheck)}
        onBarcodeChange={handleBarcodeChange}
        onBarcodeKeyDown={handleBarcodeKeyDown}
        suggestions={suggestions}
        highlightedIndex={highlightedIndex}
        onSelectSuggestion={handleSelectSuggestion}
      />
      {suggestions.length > 0 && (
        <SuggestionList
          suggestions={suggestions}
          highlightedIndex={highlightedIndex}
          onSelect={handleSelectSuggestion}
          className="w-fit px-1 absolute z-10 top-[60%] left-[19%] md:top-[60%] md:left-[18%] lg:top-[60%] lg:left-[17%] xl:top-[60%] xl:left-[18%] bg-background shadow-neumorphic rounded max-h-40 overflow-y-auto no-scrollbar"
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

      {alertMessage && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-teal-500 p-6 rounded-lg shadow-lg text-white max-w-sm text-center">
            <h3 className="font-bold text-xl mb-4">Out of Stock</h3>
            <p className="py-2">{alertMessage}</p>
            <button
              onClick={() => setAlertMessage(null)}
              className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

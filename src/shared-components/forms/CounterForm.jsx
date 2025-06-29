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

import { generateTransactionNo } from "../../utils/transactionNumberGenerator";
import { ItemSoldContext } from "../../context/ItemSoldContext";
import { SuggestionList } from "./SuggestionList";
import { StocksMgtContext } from "../../context/StocksManagement"; // New import
import { ItemRegData } from "../../context/ItemRegContext";
import { PaymentContext } from "../../context/PaymentContext";

// Wrap component with forwardRef
export const CounterForm = forwardRef(({ cartData, setCartData }, ref) => {
  const { items: regItems } = useContext(ItemRegData);
  const { setItemSold, setServerOnline: setSoldServerOnline } =
    useContext(ItemSoldContext);
  const { stockRecords } = useContext(StocksMgtContext); // Get stocks data
  const { setPaymentData } = useContext(PaymentContext); // Corrected context name

  const form = useForm({
    defaultValues: {
      cashierName: "",
      transactionTime: "",
      payment: "",
      costumerName: "",
      transactionNo: "", // will be set on mount or via regenerateTransactionNo
      discount: "",
      barcode: "",
      availableStocks: "",
      change: "",
      quantity: "",
      additionalInfo: "",
      grandTotal: "",
    },
  });
  const { register, handleSubmit, setValue, watch, getValues } = form;

  // Set initial values
  setValue("cashierName", "Junel Fuentes");
  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    regenerateTransactionNo: () => {
      setValue("transactionNo", generateTransactionNo());
    },
    completeTransaction: () => done(),
    getTransactionData: () => {
      const transactionNo = getValues("transactionNo");
      const cashierName = getValues("cashierName");
      const costumerName = getValues("costumerName");
      const transactionTime = getValues("transactionTime");

      return cartData.map((item) => {
        const regItem = Array.isArray(regItems)
          ? regItems.find((ri) => ri.barcode === item.barcode)
          : undefined;
        const classification = regItem ? regItem.category : "";

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
          classification,
        };
      });
    },
    // Expose the addToCart handler for the external button
    submitAddToCart: handleSubmit(addToCart),
  }));

  useEffect(() => {
    // Set initial transactionNo on mount
    setValue("transactionNo", generateTransactionNo());
  }, [setValue]);

  const [results, setResults] = useState([]);
  const [index, setIndex] = useState(-1);

  const costumerNameRef = useRef(null);
  const barcodeRef = useRef(null);
  const quantityRef = useRef(null);
  const discountRef = useRef(null);

  const { ref: costumerNameFormRef, ...costumerNameRegisterProps } =
    register("costumerName");
  const { ref: barcodeFormRef, ...barcodeRegisterProps } = register("barcode");
  const { ref: quantityFormRef, ...quantityRegisterProps } =
    register("quantity");
  const { ref: discountFormRef, ...discountRegisterProps } =
    register("discount");

  const discount = watch("discount");
  const payment = watch("payment");

  useEffect(() => {
    costumerNameRef.current?.focus();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const timer = dayjs().format("YYYY-MM-DD HH:mm:ss");
      setValue("transactionTime", timer);
    }, 1000);
    return () => clearInterval(interval);
  }, [setValue]);

  useEffect(() => {
    // Calculate grand total safely
    const total = Array.isArray(cartData)
      ? cartData.reduce((sum, item) => sum + item.total(), 0)
      : 0;
    setValue("grandTotal", total.toFixed(2));

    // Calculate change
    const discountValue = parseFloat(discount) || 0;
    const paymentValue = parseFloat(payment) || 0;
    const changeValue = paymentValue + discountValue - total;
    setValue("change", changeValue.toFixed(2));
  }, [cartData, discount, payment, setValue]);

  // Helper: compute net quantity for an item using stockRecords
  const getNetQuantity = (itemName) => {
    const filtered = stockRecords.filter(
      (r) => r.item.toLowerCase() === itemName.toLowerCase()
    );
    const stockIn = filtered
      .filter((r) => r.stockFlow === "Stock In")
      .reduce((sum, r) => sum + r.quantity, 0);
    const stockOut = filtered
      .filter((r) => r.stockFlow === "Stock Out")
      .reduce((sum, r) => sum + r.quantity, 0);
    return filtered.length ? stockIn - stockOut : "N/A";
  };

  function barcodeChange(e) {
    const input = e.target.value;

    if (input) {
      const filteredResults = regItems.filter((item) =>
        item.name.toLocaleLowerCase().startsWith(input.toLocaleLowerCase())
      );
      setResults(filteredResults);

      if (filteredResults.length === 0) {
        setIndex(-1);
        setValue("availableStocks", "");
      } else {
        setIndex((prevIndex) => {
          if (prevIndex >= filteredResults.length || prevIndex < 0) return 0;
          return prevIndex;
        });
        if (
          filteredResults.length === 1 &&
          filteredResults[0].name.toLocaleLowerCase() ===
            input.toLocaleLowerCase()
        ) {
          setValue("availableStocks", getNetQuantity(filteredResults[0].name));
        } else {
          setValue("availableStocks", "");
        }
      }
    } else {
      setResults([]);
      setIndex(-1);
      setValue("availableStocks", "");
    }
  }

  function barcodeKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setIndex((prevIndex) => (prevIndex + 1) % results.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setIndex(
          (prevIndex) => (prevIndex - 1 + results.length) % results.length
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      let selectedItem = null;

      if (index >= 0 && index < results.length && results[index]) {
        selectedItem = results[index];
      } else if (results.length === 1) {
        selectedItem = results[0];
      } else {
        const currentBarcodeValue = e.target.value;
        const directMatch = Array.isArray(regItems)
          ? regItems.find((item) => item.barcode === currentBarcodeValue)
          : undefined;
        if (directMatch) {
          selectedItem = directMatch;
        }
      }

      if (selectedItem) {
        setValue("barcode", selectedItem.barcode, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("availableStocks", getNetQuantity(selectedItem.name));
        quantityRef.current?.focus();
        setResults([]);
        setIndex(-1);
      } else {
        if (e.target.value) {
          quantityRef.current?.focus();
        }
      }
    }
  }

  function handleSelectSuggestion(item) {
    setValue("barcode", item.barcode, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("availableStocks", getNetQuantity(item.name));
    quantityRef.current?.focus();
    setResults([]);
    setIndex(-1);
  }

  function addToCart(data) {
    if (!data.barcode || !data.quantity) {
      alert("Please enter barcode and quantity.");
      return;
    }
    const currentItem = Array.isArray(regItems)
      ? regItems.find((item) => item.barcode === data.barcode)
      : undefined;
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
    // Use getNetQuantity to check available stock before adding to cart
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
    setResults([]);
    setIndex(-1);
  }

  // ------------- MODIFIED done() FUNCTION -------------
  async function done() {
    // Retrieve form values needed for the payment record
    const transactionNo = getValues("transactionNo");
    const cashierName = getValues("cashierName"); // Will be used for 'inCharge'
    const costumerName = getValues("costumerName");
    const transactionTime = getValues("transactionTime");
    const paymentField = getValues("payment"); // This corresponds to 'amountRendered'
    const discountField = getValues("discount");

    // Calculate the definitive grandTotal (amountToPay) from cartData
    const calculatedGrandTotal = Array.isArray(cartData)
      ? cartData.reduce((sum, item) => sum + item.total(), 0)
      : 0;

    // Parse payment and discount values
    const paymentValue = parseFloat(paymentField); // This is amountRendered
    const discountValue = parseFloat(discountField) || 0;

    // Calculate change based on the definitive grandTotal
    const computedChange =
      (paymentValue || 0) + discountValue - calculatedGrandTotal;

    // Validation: Prevent transaction if payment is missing or change is negative
    if (cartData.length === 0) {
      alert("Cart is empty. Add items to proceed.");
      return;
    }
    if (!paymentField || isNaN(paymentValue)) {
      alert("Enter a valid payment amount.");
      return;
    }
    if (computedChange < 0) {
      alert("Insufficient payment. Change is negative.");
      return;
    }

    // Build sold items array for ItemSoldContext (remains the same)
    const soldItems = cartData.map((item) => {
      const regItem = Array.isArray(regItems)
        ? regItems.find((ri) => ri.barcode === item.barcode)
        : undefined;
      const classification = regItem ? regItem.category : "";
      return {
        barcode: item.barcode,
        itemName: item.item,
        price: item.price,
        quantity: item.quantity,
        totalPrice: (item.price * item.quantity).toFixed(2),
        transactionDate: transactionTime,
        transactionNo: transactionNo,
        inCharge: cashierName,
        costumer: costumerName,
        classification,
      };
    });
    setItemSold((prev) => [...prev, ...soldItems]);

    // Construct the single payment record for PaymentContext
    const paymentRecord = {
      transactionDate: transactionTime,
      transactionNumber: transactionNo,
      costumerName: costumerName || "N/A", // Ensure customerName is not empty
      amountToPay: calculatedGrandTotal.toFixed(2), // grandTotal
      amountRendered: paymentValue.toFixed(2), // payment from form
      discount: discountValue.toFixed(2),
      change: computedChange.toFixed(2),
      inCharge: cashierName, // As per your original structure for sold items
    };

    // Update PaymentContext with the single transaction payment record
    setPaymentData((prev) => [...prev, paymentRecord]);

    // Send each sold transaction to the /api/transactions endpoint
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
        console.log(error);
      }
    }
    // Update the sold context server flag for offline display
    setSoldServerOnline(!offline);
    if (offline) {
      alert("SERVER IS OFFLINE");
    }

    // Clear cart and reset form fields as before
    setCartData([]);
    setValue("payment", "");
    setValue("discount", "");
    setValue("costumerName", "");
    setValue("grandTotal", "0.00");
    setValue("change", "0.00");
    setValue("transactionNo", generateTransactionNo());
    costumerNameRef.current?.focus();
  }
  // ------------- END OF MODIFIED done() FUNCTION -------------

  const barcodeValue = watch("barcode");
  const matchedItem = Array.isArray(regItems)
    ? regItems.find((item) => item.barcode === barcodeValue.trim())
    : undefined;

  return (
    <div className="shiny-gradient p-1 text-accent-100">
      <form
        onSubmit={handleSubmit(addToCart)}
        className="[&>*]:text-[1.2vw] [&>*]:font-info-text! grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-[0.5vw] [&>*]:overflow-hidden [&>*]:text-ellipsis [&>*]:text-nowrap p-[0.3vh]"
      >
        <label title="Cashier Name">Cashier Name:</label>
        <input
          className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
          {...register("cashierName")}
          type="text"
          autoComplete="off"
          readOnly
        />

        <label title="Transaction Time">Transaction Time:</label>
        <input
          className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
          {...register("transactionTime")}
          type="text"
          autoComplete="off"
          readOnly
        />

        <label title="Payment">Payment:</label>
        <input
          className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
          {...register("payment")}
          type="number"
          step="any"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Prevent form submission if any
              discountRef.current?.focus();
            }
          }}
          autoComplete="off"
        />

        <label title="Costumer Name">Costumer Name:</label>
        <input
          className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
          {...costumerNameRegisterProps}
          type="text"
          ref={(e) => {
            costumerNameFormRef(e);
            costumerNameRef.current = e;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              barcodeRef.current?.focus();
            }
          }}
          autoComplete="off"
        />

        <label title="Transaction No.">Transaction No.:</label>
        <input
          className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
          {...register("transactionNo")}
          type="text"
          readOnly
          autoComplete="off"
        />

        <label title="Discount">Discount:</label>
        <input
          className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
          {...discountRegisterProps}
          type="number"
          step="any"
          ref={(e) => {
            discountFormRef(e);
            discountRef.current = e;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              // Potentially trigger done() or move to another relevant field
              // For now, let's assume direct completion or manual click for 'Done' button after discount.
              // If you have a "Complete Transaction" button that calls `done()`,
              // this Enter key could programmatically click it or call `done()`.
            }
          }}
          autoComplete="off"
        />

        <label title="Barcode">Barcode:</label>
        <input
          className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
          {...barcodeRegisterProps}
          type="text"
          ref={(e) => {
            barcodeFormRef(e);
            barcodeRef.current = e;
          }}
          onChange={barcodeChange}
          onKeyDown={barcodeKeyDown}
          autoComplete="off"
        />

        <label title="Available Stocks">Available Stocks:</label>
        <input
          className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
          {...register("availableStocks")}
          type="text"
          placeholder="Stocks Available"
          readOnly
          autoComplete="off"
        />

        <label title="Grand Total">Grand Total:</label>
        <input
          className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
          {...register("grandTotal")}
          type="text"
          readOnly
          autoComplete="off"
        />
        <label title="Quantity">Quantity:</label>
        <input
          className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
          {...quantityRegisterProps}
          type="number"
          ref={(e) => {
            quantityFormRef(e);
            quantityRef.current = e;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(addToCart)();
            }
          }}
          autoComplete="off"
        />

        <label title="Additional Info">Additional Info:</label>
        <input
          className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
          {...register("additionalInfo")}
          type="text"
          placeholder="additional info..."
          readOnly // Assuming this should remain readOnly as per original
          autoComplete="off"
        />
        <label title="Change">Change:</label>
        <input
          className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
          {...register("change")}
          type="text"
          readOnly
          autoComplete="off"
        />
      </form>
      <SuggestionList
        suggestions={results}
        highlightedIndex={index}
        onSelect={handleSelectSuggestion}
      />
      <div
        id="item-description"
        className="text-center text-[1.2vw]  shadow-input rounded-sm "
      >
        {barcodeValue && matchedItem ? (
          <p>
            {matchedItem.barcode} / {matchedItem.name} / {matchedItem.price} /{" "}
            {matchedItem.category}
          </p>
        ) : (
          "NO PRODUCTS AVAILABLE"
        )}
      </div>
    </div>
  );
});

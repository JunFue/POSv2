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
import { ItemRegData } from "../../context/ItemRegContext";
import { generateTransactionNo } from "../../utils/transactionNumberGenerator";

// Wrap component with forwardRef
export const CounterForm = forwardRef(({ cartData, setCartData }, ref) => {
  const { items } = useContext(ItemRegData);
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
  const { register, handleSubmit, setValue, watch } = form;

  // Set initial values
  setValue("cashierName", "Junel Fuentes");

  // Expose a method to regenerate transactionNo
  useImperativeHandle(ref, () => ({
    regenerateTransactionNo: () => {
      setValue("transactionNo", generateTransactionNo());
    },
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

  // Ref for highlighted suggestion in flyout
  const suggestionRef = useRef(null);

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

  // Auto-scroll highlighted suggestion into view when index changes
  useEffect(() => {
    suggestionRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [index]);

  function barcodeChange(e) {
    const input = e.target.value;

    if (input) {
      const filteredResults = items.filter((item) =>
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
          setValue(
            "availableStocks",
            filteredResults[0].stock !== undefined
              ? filteredResults[0].stock
              : "N/A"
          );
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
        const directMatch = items.find(
          (item) => item.barcode === currentBarcodeValue
        );
        if (directMatch) {
          selectedItem = directMatch;
        }
      }

      if (selectedItem) {
        setValue("barcode", selectedItem.barcode, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue(
          "availableStocks",
          selectedItem.stock !== undefined ? selectedItem.stock : "N/A"
        );
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
    setValue("availableStocks", item.stock !== undefined ? item.stock : "N/A");
    quantityRef.current?.focus();
    setResults([]);
    setIndex(-1);
  }

  function addToCart(data) {
    if (!data.barcode || !data.quantity) {
      alert("Please enter barcode and quantity.");
      return;
    }
    const currentItem = items.find((item) => item.barcode === data.barcode);
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
    if (currentItem.stock !== undefined && quantity > currentItem.stock) {
      alert(
        `Not enough stock for ${currentItem.name}. Available: ${currentItem.stock}`
      );
      setValue(
        "quantity",
        currentItem.stock > 0 ? currentItem.stock.toString() : "0"
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

  function done() {
    setCartData([]);
  }

  return (
    <div className="bg-[#e0e0e0] rounded-lg">
      <form
        onSubmit={handleSubmit(addToCart)}
        className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-[0.5vw] [&>*]:text-[0.8vw] [&>*]:overflow-hidden [&>*]:text-ellipsis [&>*]:text-nowrap p-[0.3vw]"
      >
        <label title="Cashier Name">Cashier Name:</label>
        <input
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:300ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          {...register("cashierName")}
          type="text"
          autoComplete="off"
          readOnly
        />

        <label>Transaction Time:</label>
        <input
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:300ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          {...register("transactionTime")}
          type="text"
          autoComplete="off"
          readOnly
        />

        <label>Payment:</label>
        <input
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:300ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          {...register("payment")}
          type="number"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              discountRef.current?.focus();
            }
          }}
          autoComplete="off"
        />

        <label title="Costumer Name">Costumer Name:</label>
        <input
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:300ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
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

        <label>Transaction No.:</label>
        <input
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:300ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          {...register("transactionNo")}
          type="text"
          readOnly
          autoComplete="off"
        />

        <label>Discount:</label>
        <input
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:300ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          {...discountRegisterProps}
          type="number"
          step="any"
          ref={(e) => {
            discountFormRef(e);
            discountRef.current = e;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") done();
          }}
          autoComplete="off"
        />

        <label>Barcode:</label>
        <input
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:300ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
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

        {/* Redesigned suggestion flyout with auto-scroll */}
        <div className="w-fit absolute z-1 top-[11vw] left-[9vw] bg-white border border-gray-300 rounded shadow-md max-h-40 overflow-y-auto">
          {results.map((item, idx) => (
            <p
              key={item.id || item.barcode || idx}
              ref={index === idx ? suggestionRef : null}
              className={`text-[1vw] ${index === idx ? "bg-gray-200" : ""}`}
              onClick={() => handleSelectSuggestion(item)}
              style={{ cursor: "pointer" }}
            >
              {item.name}
            </p>
          ))}
        </div>

        <label>Available Stocks:</label>
        <input
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:300ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          {...register("availableStocks")}
          type="text"
          placeholder="Stocks Available"
          readOnly
          autoComplete="off"
        />

        <label>Grand Total:</label>
        <input
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:300ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          {...register("grandTotal")}
          type="text"
          readOnly
          autoComplete="off"
        />
        <label>Quantity:</label>
        <input
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:300ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
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

        <label>Additional Info:</label>
        <input
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:300ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          {...register("additionalInfo")}
          type="text"
          placeholder="additional info..."
          readOnly
          autoComplete="off"
        />
        <label>Change:</label>
        <input
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:300ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          {...register("change")}
          type="text"
          readOnly
          autoComplete="off"
        />
      </form>
      <div
        id="item-description"
        className="text-center text-[1.2vw] border border-[#DDDDDD] shadow-inner rounded-sm bg-[#FAF9F3]"
      >
        NO PRODUCTS AVAILABLE
      </div>
    </div>
  );
});

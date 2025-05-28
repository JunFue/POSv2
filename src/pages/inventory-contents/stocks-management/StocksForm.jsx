import { useForm } from "react-hook-form";
import { useState, useRef, useEffect, useContext } from "react";
import dayjs from "dayjs";
import { ItemRegData } from "../../../context/ItemRegContext";
// Updated import: use the actual context instead of the provider component.
import { StocksMgtContext } from "../../../context/StocksManagement";

export function StocksForm() {
  // Updated: destructure only setStockRecords.
  const { setStockRecords } = useContext(StocksMgtContext);

  // Updated: destructure items from the provided context object.
  const { items } = useContext(ItemRegData);
  const { register, handleSubmit, setValue, reset, setFocus } = useForm({
    defaultValues: {
      item: "",
      stockFlow: "Stock In",
      quantity: "",
      notes: "",
    },
  });
  const [results, setResults] = useState([]);
  const [index, setIndex] = useState(-1);
  const itemInputRef = useRef(null);
  const highlightRef = useRef(null);

  useEffect(() => {
    setFocus("item");
  }, [setFocus]);

  useEffect(() => {
    highlightRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [index]);

  // Updated: change onRecord to accept the new record and add it to stockRecords.
  function onRecord(newRecord) {
    setStockRecords((prev) => [...prev, newRecord]);
  }

  const onSubmit = (data) => {
    // Prevent submission if item field is empty
    if (!data.item || data.item.trim() === "") {
      alert("Item field is required.");
      return;
    }
    // Prevent submission if quantity is empty or not a positive number
    if (
      !data.quantity ||
      data.quantity === "" ||
      isNaN(parseInt(data.quantity)) ||
      parseInt(data.quantity) <= 0
    ) {
      alert("Quantity must be a positive number.");
      return;
    }
    const selectedItem = items.find(
      (item) => item.name.toLowerCase() === data.item.toLowerCase()
    );
    if (!selectedItem) {
      alert("Item not found in the inventory.");
      return;
    }
    const newRecord = {
      item: data.item,
      packaging: selectedItem.packaging || "N/A",
      stockFlow: data.stockFlow,
      quantity: parseInt(data.quantity),
      notes: data.notes,
      date: dayjs().format("MM/DD/YYYY HH:mm:ss"),
    };
    onRecord(newRecord);
    reset();
    setResults([]);
    setIndex(-1);
    setFocus("item");
  };

  const handleItemChange = (e) => {
    const input = e.target.value;
    if (input) {
      const filteredResults = items.filter((item) =>
        item.name.toLowerCase().startsWith(input.toLowerCase())
      );
      setResults(filteredResults);
      if (filteredResults.length === 0) {
        setIndex(-1);
      } else {
        setIndex((prev) =>
          prev < 0 || prev >= filteredResults.length ? 0 : prev
        );
      }
    } else {
      setResults([]);
      setIndex(-1);
    }
  };

  const handleItemKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === "Enter") {
      if (results.length > 0 && index >= 0 && index < results.length) {
        e.preventDefault();
        setValue("item", results[index].name, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setResults([]);
        setIndex(-1);
      } else {
        // Prevent form submission and move focus to the "stockFlow" field.
        e.preventDefault();
        setFocus("stockFlow");
      }
    }
  };

  const handleSelectSuggestion = (item) => {
    setValue("item", item.name, { shouldValidate: true, shouldDirty: true });
    setResults([]);
    setIndex(-1);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-[1vw] items-center [&>*]:border [&>*]:border-gray-300"
    >
      <div className="relative flex flex-col gap-1 items-center">
        <label className="text-[1vw] font-medium">Item</label>
        <input
          className="text-[1vw] h-[1.5vw] w-full max-w-[150px] border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          {...register("item")}
          onChange={handleItemChange}
          onKeyDown={handleItemKeyDown}
          autoComplete="off"
          ref={(e) => {
            register("item").ref(e);
            itemInputRef.current = e;
          }}
        />
        {results.length > 0 && (
          <div className="text-[1vw] absolute z-10 bg-white border border-gray-300 rounded shadow-md max-h-40 overflow-y-auto w-full">
            {results.map((item, idx) => (
              <div
                key={item.barcode}
                ref={index === idx ? highlightRef : null}
                className={`px-2 py-1 cursor-pointer ${
                  index === idx ? "bg-gray-200" : ""
                }`}
                onClick={() => handleSelectSuggestion(item)}
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="relative flex flex-col gap-1 items-center">
        <label className="text-[1vw] font-medium">Stock Flow</label>
        <select
          className="text-[1vw] h-[1.5vw] w-full max-w-[150px] border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          {...register("stockFlow")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setFocus("quantity");
            }
          }}
        >
          <option value="Stock In">Stock In</option>
          <option value="Stock Out">Stock Out</option>
        </select>
      </div>
      <div className="relative flex flex-col gap-1 items-center">
        <label className="text-[1vw] font-medium">Quantity</label>
        <input
          type="number"
          className="text-[1vw] h-[1.5vw] w-full max-w-[150px] border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          {...register("quantity")}
          min={1}
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setFocus("notes");
            }
          }}
        />
      </div>
      <div className="relative flex flex-col gap-1 items-center">
        <label className="text-[1vw] font-medium">Notes</label>
        <input
          type="text"
          className="text-[1vw] h-[1.5vw] w-full max-w-[150px] border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          {...register("notes")}
          autoComplete="off"
        />
      </div>
      <button
        type="submit"
        className="bg-emerald-700 text-white px-4 py-2 rounded shadow hover:bg-emerald-600"
      >
        Record
      </button>
    </form>
  );
}

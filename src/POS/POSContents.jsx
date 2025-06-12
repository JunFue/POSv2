import { useContext, useRef } from "react";
import { CartTable } from "../shared-components/tables/CartTable";
import { CounterForm } from "../shared-components/forms/CounterForm";
import { CartContext } from "../context/CartContext";
import { ItemRegData } from "../context/ItemRegContext";
import { ItemSoldContext } from "../context/ItemSoldContext";

export function POSContents() {
  const { cartData, setCartData } = useContext(CartContext);
  const { items: registeredItems, setItems } = useContext(ItemRegData);
  const { itemSold, setItemSold } = useContext(ItemSoldContext);
  const counterFormRef = useRef(null);

  // --- Use only one API endpoint for your consolidated sheet ---
  const sheetDbApiEndpoint = "https://sheetdb.io/api/v1/0g0ycahx0c16d";

  const playButtonSound = {
    onPointerDown: () => {
      try {
        const audio = new Audio("/sounds/click.mp3");
        audio.play().catch((err) => console.warn("Audio play failed:", err));
      } catch (err) {
        console.warn("Audio error:", err);
      }
    },
  };

  // --- Updated handleSync to use a single endpoint ---
  const handleSync = async () => {
    let errors = [];
    let successes = [];

    // Part 1: Sync Registered Items
    // This part ensures data goes into columns A-E
    if (registeredItems && registeredItems.length > 0) {
      const regItemsToSync = registeredItems.map((item) => ({
        // Keys here MUST match headers in columns A-E
        Barcode: item.barcode,
        Name: item.name,
        Price: item.price,
        Packaging: item.packaging,
        Category: item.category,
      }));
      try {
        const response = await fetch(sheetDbApiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: regItemsToSync }),
        });
        if (response.ok) {
          successes.push("Registered items synced successfully.");
        } else {
          errors.push(`Registered items sync failed: ${response.statusText}`);
        }
      } catch (error) {
        errors.push(`Registered items sync error: ${error.message}`);
      }
    }

    // Part 2: Sync Sold Items (Transactions)
    // This part ensures data goes into columns G-P
    if (itemSold && itemSold.length > 0) {
      const soldDataToSync = itemSold.map((item) => ({
        // Keys here MUST match headers in columns G-P
        "Barcode T": item.barcode,
        "Item Name": item.itemName,
        "Unit Price": item.price,
        Quantity: item.quantity,
        "Total Price": item.totalPrice,
        "Transaction Date": item.transactionDate,
        "Transaction No.": item.transactionNo,
        "In Charge": item.inCharge,
        "Customer Name": item.costumer,
        Classification: item.classification,
      }));
      try {
        const response = await fetch(sheetDbApiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: soldDataToSync }),
        });
        if (response.ok) {
          successes.push("Transaction data synced successfully.");
        } else {
          errors.push(`Transactions sync failed: ${response.statusText}`);
        }
      } catch (error) {
        errors.push(`Transactions sync error: ${error.message}`);
      }
    }

    // --- Final Alert ---
    if (successes.length === 0 && errors.length === 0) {
      alert("No new data to sync.");
    } else {
      alert(
        `Sync Complete:\n\nSuccesses:\n- ${successes.join(
          "\n- "
        )}\n\nErrors:\n- ${errors.join("\n- ")}`
      );
    }
  };

  // --- Updated handleDownloadData to parse data from a single endpoint ---
  const handleDownloadData = async () => {
    try {
      const response = await fetch(sheetDbApiEndpoint);
      if (!response.ok) {
        throw new Error(
          `Failed to download data: ${response.status} ${response.statusText}`
        );
      }

      const dataFromSheet = await response.json();

      if (Array.isArray(dataFromSheet)) {
        const downloadedRegItems = [];
        const downloadedSoldItems = [];

        // Iterate through each row and check if it's an item or a transaction
        dataFromSheet.forEach((row) => {
          // Check for registered item: if "Barcode" (column A) has a value
          if (row.Barcode) {
            downloadedRegItems.push({
              barcode: row.Barcode || "",
              name: row.Name || "",
              price: row.Price !== undefined ? String(row.Price) : "",
              packaging: row.Packaging || "",
              category: row.Category || "",
              remove: "",
            });
          }
          // Check for transaction: if "Transaction No." (column M) has a value
          if (row["Transaction No."]) {
            downloadedSoldItems.push({
              barcode: row["Barcode T"] || "",
              itemName: row["Item Name"] || "",
              price: row["Unit Price"] || "0",
              quantity: row["Quantity"] || "0",
              totalPrice: row["Total Price"] || "0",
              transactionDate: row["Transaction Date"] || "",
              transactionNo: row["Transaction No."] || "",
              inCharge: row["In Charge"] || "",
              costumer: row["Customer Name"] || "",
              classification: row["Classification"] || "",
            });
          }
        });

        // Update local contexts with the sorted data
        setItems(downloadedRegItems);
        setItemSold(downloadedSoldItems);

        alert(
          `Download complete.\n- ${downloadedRegItems.length} registered items loaded.\n- ${downloadedSoldItems.length} transactions loaded.`
        );
      } else {
        alert("Downloaded data is not in the expected format.");
      }
    } catch (error) {
      alert(`Download error: ${error.message}`);
    }
  };

  return (
    <>
      <div>
        <div
          id="pos-header-container"
          className="relative flex flex-row h-fit items-center"
        >
          <img
            src="logo.png"
            alt=""
            className="absolute top-1 left-1 w-[4vw] aspect-auto"
          />
          <div className="flex flex-col w-full items-center">
            <h1 className="text-[2vw] font-bold">POINT OF SALE</h1>
            <p className="text-[1vw]">made for: GREEN SECRETS</p>
            <p className="italic text-[0.5vw]">Property of JunFue</p>
          </div>
        </div>

        <CounterForm
          cartData={cartData}
          setCartData={setCartData}
          ref={counterFormRef}
        ></CounterForm>

        <div
          id="buttons-container"
          className="grid grid-cols-6 h-[2.6vw] gap-[1vw] [&>*]:text-[0.8vw] backdrop-blur-md rounded-[0.4vw] shadow-inner p-[0.4vw] [&>*]:whitespace-nowrap [&>*]:transition-all"
        >
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            onClick={() => {
              setCartData([]);
              counterFormRef.current?.regenerateTransactionNo();
            }}
            {...playButtonSound}
          >
            NEW COSTUMER
          </button>
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            {...playButtonSound}
          >
            ADD TO CART
          </button>
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            onClick={() => counterFormRef.current?.completeTransaction()}
            {...playButtonSound}
          >
            DONE
          </button>
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            onClick={() => setCartData([])}
            {...playButtonSound}
          >
            CLEAR
          </button>
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            onClick={handleSync}
            {...playButtonSound}
          >
            SYNC
          </button>
          <button
            className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
            onClick={handleDownloadData}
            {...playButtonSound}
          >
            DOWNLOAD DATA
          </button>
        </div>
      </div>

      <CartTable></CartTable>
    </>
  );
}

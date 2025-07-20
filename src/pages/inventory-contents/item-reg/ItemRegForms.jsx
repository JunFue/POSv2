import { useForm } from "react-hook-form";
import { useContext, useEffect, useRef } from "react";
import { ItemRegData } from "../../../context/ItemRegContext";
import { supabase } from "../../../utils/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const ItemRegForm = () => {
  const { serverOnline, refreshItems, items } = useContext(ItemRegData);
  const form = useForm();
  const { register, handleSubmit, formState, reset } = form;
  const { errors } = formState;

  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const packagingRef = useRef(null);
  const categoryRef = useRef(null);

  // This useEffect is for focus management and can be kept as is.
  useEffect(() => {
    if (nameRef.current) {
      register("name").ref(nameRef.current);
    }
    if (priceRef.current) {
      register("price").ref(priceRef.current);
    }
    if (packagingRef.current) {
      register("packaging").ref(packagingRef.current);
    }
    if (categoryRef.current) {
      register("category").ref(categoryRef.current);
    }
  }, [register]);

  // --- 1. Add a useEffect to listen for the 'Shift + Enter' key combination ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Shift and Enter are pressed simultaneously
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault(); // Prevent default browser actions
        // Programmatically trigger the form submission
        handleSubmit(addToRegistry)();
      }
    };

    // Add the event listener to the whole document
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSubmit]); // Rerun effect if handleSubmit changes

  const addToRegistry = async (data) => {
    if (!serverOnline) {
      alert("SERVER IS OFFLINE");
      return;
    }
    const duplicate = items.find(
      (item) =>
        item.barcode === data.barcode ||
        item.name.toLowerCase() === data.name.toLowerCase()
    );
    if (duplicate) {
      alert("An item with the same barcode or name already exists.");
      return;
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        alert("You must be logged in to register an item.");
        return;
      }
      const token = session.access_token;

      const res = await fetch(`${BACKEND_URL}/api/item-reg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to register item");

      await refreshItems();
      reset({ barcode: "", name: "", price: "", packaging: "", category: "" });
      setTimeout(() => {
        document.getElementById("barcode")?.focus();
      }, 0);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="bg-background p-4 rounded-lg shadow-neumorphic">
      {!serverOnline && (
        <div className="text-red-500 font-bold mb-2">SERVER IS OFFLINE</div>
      )}
      {/* --- 2. The onKeyDownCapture can be removed from the form tag --- */}
      <form
        onSubmit={handleSubmit(addToRegistry)}
        noValidate
        className="gap-[1vw] [&>*]:text-[0.8vw] p-[1vw] mt-[1vw] mx-auto grid grid-cols-[0.3fr_0.5fr_0.3fr_0.5fr] rounded-lg bg-background shadow-neumorphic"
      >
        <label>Barcode:</label>
        <input
          autoComplete="off"
          type="text"
          id="barcode"
          {...register("barcode", { required: "Please set a barcode" })}
          placeholder={errors.barcode ? errors.barcode.message : undefined}
          className={`traditional-input
            ${errors.barcode ? "border-red-500" : ""}`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              nameRef.current?.focus();
            }
          }}
        />

        <label>Name:</label>
        <input
          autoComplete="off"
          type="text"
          id="name"
          {...register("name", { required: "Please set a product name" })}
          placeholder={errors.name ? errors.name.message : undefined}
          className={`traditional-input
            ${errors.name ? "border-red-500" : ""}`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              priceRef.current?.focus();
            }
          }}
          ref={nameRef}
        />

        <label>Price:</label>
        <input
          autoComplete="off"
          type="number"
          id="price"
          {...register("price", { required: "Please set a price" })}
          placeholder={errors.price ? errors.price.message : undefined}
          className={`traditional-input
            ${errors.price ? "border-red-500" : ""}`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              packagingRef.current?.focus();
            }
          }}
          ref={priceRef}
        />

        <label>Packaging:</label>
        <input
          autoComplete="off"
          type="text"
          id="packaging"
          {...register("packaging", { required: "Identify a packaging type" })}
          placeholder={errors.packaging ? errors.packaging.message : undefined}
          className={`traditional-input
            ${errors.packaging ? "border-red-500" : ""}`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              categoryRef.current?.focus();
            }
          }}
          ref={packagingRef}
        />

        <label>Category:</label>
        <select
          id="category"
          {...register("category", { required: "Categorize your product" })}
          ref={categoryRef}
          title={errors.category ? errors.category.message : undefined}
          className={`traditional-input
            ${errors.category ? "border-red-500" : ""}`}
        >
          <option value="">Select category</option>
          <option value="DETOX">DETOX</option>
          <option value="OTC">OTC</option>
          <option value="Services">Services</option>
          <option value="Others">Others</option>
        </select>

        <button
          type="button"
          className="traditional-button"
          onClick={() => {
            reset({
              barcode: "",
              name: "",
              price: "",
              packaging: "",
              category: "",
            });
            setTimeout(() => {
              document.getElementById("barcode")?.focus();
            }, 0);
          }}
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={!serverOnline}
          className="traditional-button"
        >
          Register
        </button>
      </form>
    </div>
  );
};

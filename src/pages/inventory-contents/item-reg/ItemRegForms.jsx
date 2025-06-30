import { useForm } from "react-hook-form";
import { useContext, useEffect, useRef } from "react";
import { ItemRegData } from "../../../context/ItemRegContext";
// --- 1. Import the Supabase client ---
import { supabase } from "../../../utils/supabaseClient"; // Adjust path if needed

export const ItemRegForm = () => {
  const { serverOnline, refreshItems, items } = useContext(ItemRegData);
  const form = useForm();
  const { register, handleSubmit, formState, reset } = form;
  const { errors } = formState;

  // Refs for focus control only
  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const packagingRef = useRef(null);
  const categoryRef = useRef(null);

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
      // --- 2. Get the user's session token ---
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        alert("You must be logged in to register an item.");
        return;
      }
      const token = session.access_token;

      // --- 3. Add the Authorization header to the fetch request ---
      const res = await fetch("http://localhost:3000/api/item-reg", {
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

  // ... (Rest of the JSX form remains the same) ...
  return (
    <div className="bg-background p-4 rounded-lg shadow-neumorphic">
      {/* Alert message when server is offline */}
      {!serverOnline && (
        <div className="text-red-500 font-bold mb-2">SERVER IS OFFLINE</div>
      )}
      <form
        onSubmit={handleSubmit(addToRegistry)}
        onKeyDownCapture={(e) => {
          if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(addToRegistry)();
          }
        }}
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

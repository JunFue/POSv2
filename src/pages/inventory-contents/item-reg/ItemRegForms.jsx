import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useContext } from "react";
import { ItemRegData } from "../../../context/ItemRegContext";

export const ItemRegForm = () => {
  const { serverOnline, refreshItems } = useContext(ItemRegData); // destructured refreshItems
  const form = useForm();
  const { register, handleSubmit, formState, reset } = form; // control is still needed for DevTool
  const { errors } = formState;

  // Refs for focus control only
  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const packagingRef = useRef(null);
  const categoryRef = useRef(null);

  // Reinstated useEffect block:
  // This is necessary to ensure react-hook-form correctly registers and tracks
  // inputs when you provide your own `ref` prop (for focus, etc.) alongside
  // spreading {...register("fieldName")}.
  // It calls the `ref` callback from `register()` with your specific DOM element.

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
    // The empty dependency array [] ensures this effect runs once after the initial mount.
    // The `register` function from useForm is stable, so it doesn't need to be a dependency
    // for this specific setup pattern if the intent is a one-time registration.
  }, []); // Using the original empty dependency array

  // Modified addToCart function to send POST request to the API
  const addToCart = async (data) => {
    if (!serverOnline) {
      alert("SERVER IS OFFLINE");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/item-reg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to register item");
      // After successful registration, refresh items instead of optimistically updating state
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
    <div className="">
      {/* Alert message when server is offline */}
      {!serverOnline && (
        <div className="text-red-500 font-bold mb-2">SERVER IS OFFLINE</div>
      )}
      <form
        onSubmit={handleSubmit(addToCart)}
        onKeyDownCapture={(e) => {
          if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(addToCart)();
          }
        }}
        noValidate
        className="gap-[1vw] [&>*]:text-[0.8vw] p-[1vw] mt-[1vw] mx-auto grid grid-cols-[0.3fr_0.5fr_0.3fr_0.5fr] bg-[#e0e0e0] rounded-lg shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff][&>*]:bg-gray-100"
      >
        <label>Barcode:</label>
        <input
          autoComplete="off"
          type="text"
          id="barcode"
          {...register("barcode", { required: "Please set a barcode" })}
          placeholder={errors.barcode ? errors.barcode.message : undefined}
          className={`w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] 
            [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] 
            focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]
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
          className={`w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] 
            [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] 
            focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]
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
          className={`w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] 
            [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] 
            focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]
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
          className={`w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] 
            [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] 
            focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]
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
          className={`w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] 
            [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] 
            focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]
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
          className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
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
          className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
        >
          Clear
        </button>
        <button
          type="submit"
<<<<<<< HEAD
          disabled={!serverOnline}
=======
>>>>>>> 87a6d641fdeace0181e77bd24bba508553cd9db1
          className="bg-[#e0e0e0] text-gray-700 rounded-[0.6vw] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] border-none focus:outline-none transition-all duration-100 ease-in-out active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] active:scale-95"
        >
          Register
        </button>
      </form>
    </div>
  );
};

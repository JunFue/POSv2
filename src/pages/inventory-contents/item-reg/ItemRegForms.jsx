import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useContext } from "react";
import { ItemRegData } from "../../../context/ItemRegContext";

export const ItemRegForm = () => {
  const { items, setItems } = useContext(ItemRegData);
  // Using useForm from react-hook-form to manage form state and validation
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

  const addToCart = (data) => {
    const barcodeExists = items.some((item) => item.barcode === data.barcode);
    const nameExists = items.some((item) => item.name === data.name);

    if (barcodeExists) {
      alert("Barcode already exists");
      return;
    }

    if (nameExists) {
      alert("Product already exists");
      return;
    }

    setItems((c) => [
      ...c,
      {
        barcode: data.barcode,
        name: data.name,
        price: data.price,
        packaging: data.packaging,
        category: data.category,
        remove: "",
      },
    ]);

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
  };

  return (
    <div className="">
      <form
        onSubmit={handleSubmit(addToCart)}
        noValidate
        className="gap-[1vw] [&>*]:text-[0.8vw] p-[1vw] mt-[1vw] mx-auto grid grid-cols-[0.3fr_0.5fr_0.3fr_0.5fr] bg-[#e0e0e0] rounded-lg shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff][&>*]:bg-gray-100"
      >
        <label>Barcode:</label>
        <input
          autoComplete="off"
          type="text"
          id="barcode"
          {...register("barcode", { required: "Please set a barcode" })}
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              nameRef.current?.focus();
            }
          }}
        />
        <p className="text-[0.5vw] text-red-400! absolute">
          {errors.barcode?.message}
        </p>

        <label>Name:</label>
        <input
          autoComplete="off"
          type="text"
          id="name"
          {...register("name", { required: "Please set a product name" })}
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              priceRef.current?.focus();
            }
          }}
          ref={nameRef}
        />
        <p className="text-[0.5vw] text-red-400! absolute">
          {errors.name?.message}
        </p>

        <label>Price:</label>
        <input
          autoComplete="off"
          type="number"
          id="price"
          {...register("price", { required: "Please set a price" })}
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              packagingRef.current?.focus();
            }
          }}
          ref={priceRef}
        />
        <p className="text-[0.5vw] text-red-400! absolute">
          {errors.price?.message}
        </p>

        <label>Packaging:</label>
        <input
          autoComplete="off"
          type="text"
          id="packaging"
          {...register("packaging", {
            required: "Identify a packaging type",
          })}
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              categoryRef.current?.focus();
            }
          }}
          ref={packagingRef}
        />
        <p className="text-[0.5vw] text-red-400! absolute">
          {errors.packaging?.message}
        </p>
        <label>Category:</label>
        <select
          id="category"
          {...register("category", { required: "Categorize your product" })}
          ref={categoryRef}
          className="w-full border-[none] outline-[none] rounded-[15px] pl-[0.6vw] bg-[#ccc] [box-shadow:inset_2px_5px_10px_rgba(0,0,0,0.3)] [transition:100ms_ease-in-out] focus:bg-[white] focus:scale-105 focus:[box-shadow:13px_13px_100px_#969696,_-13px_-13px_100px_#ffffff]"
        >
          <option value="">Select category</option>
          <option value="DETOX">DETOX</option>
          <option value="OTC">OTC</option>
          <option value="Services">Services</option>
          <option value="Others">Others</option>
        </select>
        <p className="text-[0.5vw] text-red-400! absolute">
          {errors.category?.message}
        </p>
        <button
          type="button"
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

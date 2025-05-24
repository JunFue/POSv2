import { DevTool } from "@hookform/devtools";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

export const ItemRegForm = ({ items, setItems }) => {
  const form = useForm();
  const { register, control, handleSubmit, formState, reset } = form;
  const { errors } = formState;

  // Refs for focus control only

  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const packagingRef = useRef(null);
  const categoryRef = useRef(null);
  useEffect(() => {
    if (nameRef.current) register("name").ref(nameRef.current);
    if (priceRef.current) register("price").ref(priceRef.current);
    if (packagingRef.current) register("packaging").ref(packagingRef.current);
    if (categoryRef.current) register("category").ref(categoryRef.current);
  }, []);

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
    <div className="m-[2vw]">
      <form
        onSubmit={handleSubmit(addToCart)}
        noValidate
        className="border border-amber-50 flex flex-row [&>*]:text-[1vw] [&>*]:border [&>*]:border-amber-300"
      >
        <div className="grow">
          <label>Barcode</label>
          <input
            autoComplete="off"
            type="text"
            id="barcode"
            {...register("barcode", { required: "Please set a barcode" })}
            className="block w-[9vw]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                nameRef.current?.focus();
              }
            }}
          />
          <p className="text-[0.5vw] text-red-400!">
            {errors.barcode?.message}
          </p>

          <label>Name</label>
          <input
            autoComplete="off"
            type="text"
            id="name"
            {...register("name", { required: "Please set a product name" })}
            className="block w-[9vw]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                priceRef.current?.focus();
              }
            }}
            ref={nameRef}
          />
          <p className="text-[0.5vw] text-red-400!">{errors.name?.message}</p>

          <label>Price</label>
          <input
            autoComplete="off"
            type="number"
            id="price"
            {...register("price", { required: "Please set a price" })}
            className="block w-[9vw]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                packagingRef.current?.focus();
              }
            }}
            ref={priceRef}
          />
          <p className="text-[0.5vw] text-red-400!">{errors.price?.message}</p>
        </div>
        <div className="grow">
          <label>Packaging</label>
          <input
            autoComplete="off"
            type="text"
            id="packaging"
            {...register("packaging", {
              required: "Identify a packaging type",
            })}
            className="block w-[9vw]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                categoryRef.current?.focus();
              }
            }}
            ref={packagingRef}
          />
          <p className="text-[0.5vw] text-red-400!">
            {errors.packaging?.message}
          </p>

          <label>Category</label>
          <input
            autoComplete="off"
            type="text"
            id="category"
            {...register("category", { required: "Categorize your product" })}
            className="block w-[9vw]"
            ref={categoryRef}
          />
          <p className="text-[0.5vw] text-red-400!">
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
              // Focus on first field after reset
              setTimeout(() => {
                document.getElementById("barcode")?.focus();
              }, 0);
            }}
          >
            Clear
          </button>
          <button type="submit">Register</button>
        </div>
      </form>
      <DevTool control={control} />
    </div>
  );
};

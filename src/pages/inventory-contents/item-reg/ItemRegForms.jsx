import { useForm } from "react-hook-form";
import { useContext, useEffect, useRef, useState } from "react"; // updated import
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

  // New state for editable categories
  const [categories, setCategories] = useState([
    "DETOX",
    "OTC",
    "Services",
    "Others",
  ]);
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [newCategory, setNewCategory] = useState("");

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

  // Handler to add a new category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      alert("Category already exists.");
      return;
    }
    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    console.log("Placeholder API call to add category:", newCategory.trim());
    setNewCategory("");
  };

  // Handler to delete a category
  const handleDeleteCategory = (cat) => {
    const updatedCategories = categories.filter((c) => c !== cat);
    setCategories(updatedCategories);
    console.log("Placeholder API call to delete category:", cat);
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
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
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

        {/* New button to toggle category management */}
        <button
          type="button"
          className="traditional-button mt-2 w-fit h-fit"
          onClick={() => setIsEditingCategories(!isEditingCategories)}
        >
          {isEditingCategories
            ? "Close Categories Manager"
            : "Manage Categories"}
        </button>

        {/* Conditionally render the editable categories section */}
        {isEditingCategories && (
          <div className="mt-2 p-2 border rounded">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                placeholder="New category"
                className="traditional-input"
              />
              <button
                type="button"
                className="traditional-button"
                onClick={handleAddCategory}
              >
                Add Category
              </button>
            </div>
            <div>
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="grid grid-cols-2 gap-2 place-items-center"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    className="traditional-button text-sm"
                    onClick={() => handleDeleteCategory(cat)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

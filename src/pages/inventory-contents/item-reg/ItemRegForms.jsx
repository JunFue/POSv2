import { useForm } from "react-hook-form";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { ItemRegData } from "../../../context/ItemRegContext";
import { supabase } from "../../../utils/supabaseClient";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";

// A small helper to generate a temporary ID for optimistic updates
const generateTemporaryId = () =>
  `temp_${Math.random().toString(36).substr(2, 9)}`;

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper component for status icons
const StatusIcon = ({ status }) => {
  switch (status) {
    case "pending":
      return (
        <FaSpinner className="animate-spin text-gray-500" title="Sending..." />
      );
    case "synced":
      return <FaCheckCircle className="text-green-500" title="Synced" />;
    case "failed":
      return (
        <FaExclamationTriangle
          className="text-red-500"
          title="Failed to save"
        />
      );
    default:
      return null;
  }
};

export const ItemRegForm = () => {
  const { serverOnline, items, addOptimisticItem, updateItemStatus } =
    useContext(ItemRegData);
  const { register, handleSubmit, formState, reset } = useForm();
  const { errors } = formState;

  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const packagingRef = useRef(null);
  const categoryRef = useRef(null);

  // Categories state now holds objects {id, name, status}
  const [categories, setCategories] = useState([]);
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  // --- Function to fetch categories from the backend ---
  const fetchCategories = useCallback(async () => {
    setCategoryLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const token = session.access_token;
      const res = await fetch(`${BACKEND_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not fetch categories");
      const data = await res.json();
      setCategories(data.map((cat) => ({ ...cat, status: "synced" })));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      alert(error.message);
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  // --- Fetch categories when the component mounts ---
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // This useEffect is for focus management and can be kept as is.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        handleSubmit(addToRegistry)();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit]);

  // --- Main form submission logic ---
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

    const tempId = generateTemporaryId();
    addOptimisticItem({ ...data, id: tempId, status: "pending" });
    reset({ barcode: "", name: "", price: "", packaging: "", category: "" });
    setTimeout(() => {
      document.getElementById("barcode")?.focus();
    }, 0);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        updateItemStatus(tempId, { status: "failed" });
        throw new Error("You must be logged in to register an item.");
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

      const savedItem = await res.json();
      updateItemStatus(tempId, {
        ...savedItem,
        status: "synced",
        id: savedItem.id,
      });
    } catch (error) {
      alert(error.message);
      updateItemStatus(tempId, { status: "failed" });
    }
  };

  // --- Optimistic UI for adding a category ---
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const tempId = generateTemporaryId();
    const optimisticCategory = {
      id: tempId,
      name: newCategory.trim(),
      status: "pending",
    };

    setCategories((prev) => [...prev, optimisticCategory]);
    setNewCategory("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in.");
      const token = session.access_token;

      const res = await fetch(`${BACKEND_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: optimisticCategory.name }),
      });

      if (!res.ok) throw new Error("Server failed to save category.");

      const savedCategory = await res.json();
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === tempId ? { ...savedCategory, status: "synced" } : cat
        )
      );
    } catch (error) {
      console.error("Error adding category:", error);
      alert(error.message);
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === tempId ? { ...optimisticCategory, status: "failed" } : cat
        )
      );
    }
  };

  // --- Optimistic UI for deleting a category ---
  const handleDeleteCategory = async (idToDelete) => {
    const originalCategories = [...categories];
    setCategories((prev) => prev.filter((c) => c.id !== idToDelete));

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in.");
      const token = session.access_token;

      const res = await fetch(`${BACKEND_URL}/api/categories/${idToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Server failed to delete category.");
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(error.message);
      setCategories(originalCategories);
    }
  };

  return (
    <div className="bg-background p-4 rounded-lg shadow-neumorphic">
      {!serverOnline && (
        <div className="text-red-500 font-bold mb-2">SERVER IS OFFLINE</div>
      )}
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
          className={`traditional-input ${
            errors.barcode ? "border-red-500" : ""
          }`}
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
          className={`traditional-input ${errors.name ? "border-red-500" : ""}`}
          ref={nameRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              priceRef.current?.focus();
            }
          }}
        />

        <label>Price:</label>
        <input
          autoComplete="off"
          type="number"
          id="price"
          {...register("price", { required: "Please set a price" })}
          placeholder={errors.price ? errors.price.message : undefined}
          className={`traditional-input ${
            errors.price ? "border-red-500" : ""
          }`}
          ref={priceRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              packagingRef.current?.focus();
            }
          }}
        />

        <label>Packaging:</label>
        <input
          autoComplete="off"
          type="text"
          id="packaging"
          {...register("packaging", { required: "Identify a packaging type" })}
          placeholder={errors.packaging ? errors.packaging.message : undefined}
          className={`traditional-input ${
            errors.packaging ? "border-red-500" : ""
          }`}
          ref={packagingRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              categoryRef.current?.focus();
            }
          }}
        />

        <label>Category:</label>
        <select
          id="category"
          {...register("category", { required: "Categorize your product" })}
          ref={categoryRef}
          className={`traditional-input ${
            errors.category ? "border-red-500" : ""
          }`}
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
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

        <button
          type="button"
          className="traditional-button mt-2 w-fit h-fit"
          onClick={() => setIsEditingCategories(!isEditingCategories)}
        >
          {isEditingCategories ? "Close" : "Manage Categories"}
        </button>

        {isEditingCategories && (
          <div className="col-span-full mt-2 p-2 border rounded">
            <div className="flex items-center gap-2 mb-2">
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
                placeholder="New category name"
                className="traditional-input flex-grow"
              />
              <button
                type="button"
                className="traditional-button"
                onClick={handleAddCategory}
              >
                Add
              </button>
            </div>
            <div className="space-y-1">
              {categoryLoading ? (
                <p>Loading categories...</p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-1 rounded hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <StatusIcon status={cat.status} />
                      <span>{cat.name}</span>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 text-xs"
                      onClick={() => handleDeleteCategory(cat.id)}
                      title="Delete category"
                    >
                      ❌
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

import { useState, useEffect } from "react";
import {
  getCategories,
  addCategory,
  deleteCategory,
} from "../../../../api/categoryService";
import { StatusIcon } from "./StatusIcon";

const generateTemporaryId = () =>
  `temp_${Math.random().toString(36).substr(2, 9)}`;

export const CategoryManager = ({ onCategoriesChange }) => {
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- FIX: The data fetching logic is now self-contained in this useEffect hook ---
  useEffect(() => {
    // Define the async function inside the effect to make it self-contained.
    const fetchAndNotify = async () => {
      setIsLoading(true);
      try {
        const data = await getCategories();
        const syncedCategories = data.map((cat) => ({
          ...cat,
          status: "synced",
        }));
        setCategories(syncedCategories);

        if (onCategoriesChange) {
          onCategoriesChange(syncedCategories);
        }
      } catch (error) {
        console.error("[CategoryManager] Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndNotify();
  }, [onCategoriesChange]); // The dependency is now just the stable prop function.

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
      await addCategory(optimisticCategory.name);
      // Re-fetch after adding to get the final state from the server.
      const data = await getCategories();
      const syncedCategories = data.map((cat) => ({
        ...cat,
        status: "synced",
      }));
      setCategories(syncedCategories);
      if (onCategoriesChange) {
        onCategoriesChange(syncedCategories);
      }
    } catch (error) {
      console.error("Error adding category:", error);
      setCategories((prev) => prev.filter((cat) => cat.id !== tempId));
    }
  };

  const handleDeleteCategory = async (idToDelete) => {
    const originalCategories = [...categories];
    setCategories((prev) => prev.filter((c) => c.id !== idToDelete));
    try {
      await deleteCategory(idToDelete);
    } catch (error) {
      console.error("Error deleting category:", error);
      setCategories(originalCategories);
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <button
        type="button"
        className="traditional-button text-sm"
        onClick={() => setIsEditing(!isEditing)}
      >
        {isEditing ? "Close Category Management" : "Manage Categories"}
      </button>
      {isEditing && (
        <div className="mt-4 p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddCategory())
              }
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
          <div className="space-y-2">
            {isLoading ? (
              <p>Loading categories...</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <StatusIcon status={cat.status} />
                    <span>{cat.name}</span>
                  </div>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
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
    </div>
  );
};

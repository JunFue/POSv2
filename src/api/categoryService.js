import { supabase } from "../utils/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * A helper function to get the user's auth token.
 * Throws an error if the user is not authenticated.
 */
const getAuthToken = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error("Authentication required. Please log in.");
  }
  return session.access_token;
};

/**
 * Fetches all categories for the authenticated user.
 * @returns {Promise<Array>} A promise that resolves to an array of category objects.
 */
export const getCategories = async () => {
  const token = await getAuthToken();
  const res = await fetch(`${BACKEND_URL}/api/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Could not fetch categories from the server.");
  }
  return res.json();
};

/**
 * Adds a new category for the authenticated user.
 * @param {string} categoryName - The name of the new category.
 * @returns {Promise<Object>} A promise that resolves to the newly created category object.
 */
export const addCategory = async (categoryName) => {
  const token = await getAuthToken();
  const res = await fetch(`${BACKEND_URL}/api/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: categoryName }),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ error: "Failed to add category." }));
    throw new Error(errorData.error);
  }
  return res.json();
};

/**
 * Deletes a category by its ID for the authenticated user.
 * @param {string|number} categoryId - The ID of the category to delete.
 * @returns {Promise<Object>} A promise that resolves to the response from the server.
 */
export const deleteCategory = async (categoryId) => {
  const token = await getAuthToken();
  const res = await fetch(`${BACKEND_URL}/api/categories/${categoryId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ error: "Failed to delete category." }));
    throw new Error(errorData.error);
  }
  return res.json();
};

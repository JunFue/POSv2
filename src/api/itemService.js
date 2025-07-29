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
 * Fetches all registered items for the authenticated user.
 */
export const getItems = async () => {
  const token = await getAuthToken();
  const res = await fetch(`${BACKEND_URL}/api/items`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch items. Status: ${res.status}`);
  return res.json();
};

/**
 * Registers a new item.
 * @param {object} itemData - The data for the new item.
 */
export const registerItem = async (itemData) => {
  const token = await getAuthToken();
  const res = await fetch(`${BACKEND_URL}/api/item-reg`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });
  if (!res.ok) throw new Error("Failed to register item");
  return res.json();
};

/**
 * Deletes an item by its barcode.
 * @param {string} barcode - The barcode of the item to delete.
 */
export const deleteItem = async (barcode) => {
  const token = await getAuthToken();
  const res = await fetch(`${BACKEND_URL}/api/item-delete/${barcode}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete item ${barcode}`);
  }
  return res.json();
};

/**
 * Fetches the current inventory status for all items.
 */
export const getInventory = async () => {
  const token = await getAuthToken();
  const response = await fetch(`${BACKEND_URL}/api/inventory`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch inventory from server.");
  return response.json();
};

// src/api/itemService.js

// This service handles all communication with your custom backend API.
// It uses Supabase only to get a valid authentication token for the user.

import { supabase } from "../utils/supabaseClient"; // Using the path from your file

// The URL for your custom backend, loaded from environment variables.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * A private helper function to get the current user's session token from Supabase.
 * This token is used to authorize requests to your custom backend.
 * Throws an error if the user is not authenticated.
 * @returns {Promise<string>} The user's access token.
 */
const getAuthToken = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  // If there's an error or the session is null, the user is not logged in.
  if (error || !session) {
    throw new Error("Authentication required. Please log in.");
  }
  return session.access_token;
};

/**
 * Fetches all registered items for the authenticated user from your custom backend.
 * --- UPDATED to match server route: GET /api/items ---
 * @returns {Promise<Array>} A promise that resolves to an array of items.
 */
export const getItems = async () => {
  const token = await getAuthToken();
  // This now correctly calls the GET /api/items endpoint
  const res = await fetch(`${BACKEND_URL}/api/items`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch items. Status: ${res.status}`);
  return res.json();
};

/**
 * Registers a new item by sending the data to your custom backend.
 * --- UPDATED to match server route: POST /api/item-reg ---
 * @param {object} itemData - The data for the new item.
 * @returns {Promise<object>} A promise that resolves to the server's response.
 */
export const registerItem = async (itemData) => {
  const token = await getAuthToken();
  // This now correctly calls the POST /api/item-reg endpoint
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
 * Deletes an item by its barcode by calling the custom backend endpoint.
 * --- UPDATED to match server route: DELETE /api/item-delete/:barcode ---
 * @param {string} barcode - The barcode of the item to delete.
 * @returns {Promise<object>} A promise that resolves to the server's response.
 */
export const deleteItem = async (barcode) => {
  const token = await getAuthToken();
  // This now correctly calls the DELETE /api/item-delete/:barcode endpoint
  const res = await fetch(`${BACKEND_URL}/api/item-delete/${barcode}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    // Attempt to parse error details from the response body if available.
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete item ${barcode}`);
  }
  return res.json();
};

// Note: The getInventory function was present in a previous version of your
// itemService.js but is not defined in the server-side items.js file you provided.
// I am keeping it here for completeness, but you will need a corresponding
// endpoint on your server for it to work.

/**
 * Fetches the current inventory status for all items from the custom backend.
 * @returns {Promise<Array>} A promise that resolves to the inventory data.
 */
export const getInventory = async () => {
  const token = await getAuthToken();
  const response = await fetch(`${BACKEND_URL}/api/inventory`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch inventory from server.");
  return response.json();
};

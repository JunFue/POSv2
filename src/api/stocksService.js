import { supabase } from "../utils/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

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
 * Fetches all stock records for the authenticated user.
 */
export const getStocks = async () => {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/stocks`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Adds a new stock record.
 * @param {object} newRecord - The data for the new stock record.
 */
export const addStockRecord = async (newRecord) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/stocks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newRecord),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Updates an existing stock record.
 * @param {object} updatedRecord - The updated stock record data.
 */
export const updateStockRecord = async (updatedRecord) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/stocks/${updatedRecord.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedRecord),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Deletes a stock record by its ID.
 * @param {string | number} id - The ID of the stock record to delete.
 */
export const deleteStockRecord = async (id) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/stocks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  // DELETE requests might not return a body, so we handle that.
  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : {};
};

import { supabase } from "../utils/supabaseClient";

// This should be your deployed frontend/backend URL from your .env file
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
 * Fetches the daily sales total for a specific classification.
 * @param {string} date - The date in 'YYYY-MM-DD' format.
 * @param {string} classification - The category name.
 * @param {string} userId - The user's UUID.
 */
export const getCategoricalSales = async (date, classification, userId) => {
  const token = await getAuthToken();
  const queryParams = new URLSearchParams({ date, classification, userId });

  // Use the absolute URL, just like your other working services
  const url = `${BACKEND_URL}/api/categorical-sales?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Try to parse error from backend, otherwise throw generic error
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || "Failed to fetch categorical sales data."
    );
  }

  return response.json();
};

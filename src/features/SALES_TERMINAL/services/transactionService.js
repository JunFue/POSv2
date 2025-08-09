import { supabase } from "../../../utils/supabaseClient"; // Provides functions for interacting with the Supabase backend, including authentication.

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Retrieves the authentication token from the current user's session.
 * Throws an error if the session is invalid or not found.
 * @returns {Promise<string>} The user's access token.
 */
const getAuthToken = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error("Authentication error. Please sign in again.");
  }
  return session.access_token;
};

/**
 * Finalizes a transaction by sending payment and sold item data to the backend.
 * It handles authentication and sends all data in parallel.
 * @param {object} paymentRecord - The payment details for the transaction.
 * @param {Array<object>} soldItems - A list of items sold in the transaction.
 * @returns {Promise<{success: boolean, error?: string}>} An object indicating the outcome of the API calls.
 */
export const finalizeTransaction = async (paymentRecord, soldItems) => {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const paymentRequest = fetch(`${BACKEND_URL}/api/payments`, {
      method: "POST",
      headers,
      body: JSON.stringify(paymentRecord),
    });

    const transactionRequests = soldItems.map((item) =>
      fetch(`${BACKEND_URL}/api/transactions`, {
        method: "POST",
        headers,
        body: JSON.stringify(item),
      })
    );

    const responses = await Promise.all([
      paymentRequest,
      ...transactionRequests,
    ]);

    if (responses.some((res) => !res.ok)) {
      throw new Error("One or more server requests failed.");
    }

    return { success: true };
  } catch (error) {
    console.error("API error during transaction finalization:", error);
    return { success: false, error: error.message };
  }
};

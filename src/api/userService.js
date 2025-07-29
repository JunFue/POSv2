import { supabase } from "../utils/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api/admin`;

/**
 * A helper function to get the user's auth token.
 */
const getAuthToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated.");
  return session.access_token;
};

/**
 * Deletes the currently authenticated user's account.
 * @param {string} userId - The ID of the user to delete.
 */
export const deleteUserAccount = async (userId) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete account.");
  }
  return response;
};

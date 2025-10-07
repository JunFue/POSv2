import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../../../../../utils/supabaseClient";

// Get the backend URL from Vite's environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Custom hook to fetch cashout records for a specific date.
 * @param {string} date - The date to fetch records for, in 'YYYY-MM-DD' format.
 * @returns {{data: Array | null, loading: boolean, error: string | null}}
 */
const useCashouts = (date) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no date is provided, clear data and do not fetch.
    if (!date) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the current session from Supabase
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          throw new Error("Not authenticated. Please log in.");
        }

        // The access token is part of the session object
        const token = session.access_token;

        // Construct the full API URL
        const API_URL = `${BACKEND_URL}/api/cashout`;

        const response = await axios.get(API_URL, {
          params: { date }, // Pass date as a query parameter
          headers: {
            // Use the Supabase access token for the Authorization header
            Authorization: `Bearer ${token}`,
          },
        });

        setData(response.data);
      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          "An unexpected error occurred.";
        setError(errorMessage);
        console.error("Error fetching cashouts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]); // Re-run this effect when the date changes

  return { data, loading, error };
};

export default useCashouts;

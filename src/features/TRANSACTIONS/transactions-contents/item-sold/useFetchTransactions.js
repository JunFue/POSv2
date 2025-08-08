import { useState, useCallback } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Custom hook to fetch transactions from the backend.
 * @param {object} session - The user's session object, containing the access token.
 * @returns {object} An object containing the fetchTransactions function and the loading state.
 */
export function useFetchTransactions(session) {
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(
    async (page, limit, startDate, endDate, transNo = "") => {
      if (!session) {
        return null;
      }
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (transNo) {
          params.append("transactionNo", transNo);
        }

        if (startDate && endDate) {
          params.append("startDate", startDate);
          params.append("endDate", endDate);
        }

        const url = `${BACKEND_URL}/api/transactions?${params.toString()}`;

        // --- ADDED ---
        // Log the URL to the console to verify the parameters.
        console.log("Fetching transactions with URL:", url);

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          console.error("Failed to fetch filtered data from the server.", {
            status: response.status,
          });
          return null;
        }
      } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  return { fetchTransactions, loading };
}

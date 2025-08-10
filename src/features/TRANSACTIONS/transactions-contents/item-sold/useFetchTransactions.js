import { useState, useCallback } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Custom hook to fetch historical/paginated transactions from the backend.
 * This is triggered manually by user actions like changing dates or clicking 'Filter'.
 * @param {object} session - The user's session object, containing the access token.
 * @returns {object} An object containing the fetchTransactions function and the loading state.
 */
export function useFetchTransactions(session) {
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(
    async (options) => {
      if (!session) {
        console.error("Fetch aborted: No user session available.");
        return null;
      }

      // The loading indicator is now always active for any fetch using this hook.
      setLoading(true);

      try {
        const { page, limit, startDate, endDate, transNo = "" } = options;

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
        console.log("Fetching historical transactions with URL:", url);

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (response.ok) {
          return await response.json();
        } else {
          console.error("Server Error: Failed to fetch historical data.", {
            status: response.status,
          });
          return null;
        }
      } catch (error) {
        console.error(
          `Network Error fetching historical data: ${error.message}`
        );
        return null;
      } finally {
        // Always turn off the loading indicator when the operation is complete.
        setLoading(false);
      }
    },
    [session]
  );

  return { fetchTransactions, loading };
}

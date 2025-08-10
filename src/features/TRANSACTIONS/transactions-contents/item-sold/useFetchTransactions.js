import { useState, useCallback } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Custom hook to fetch transactions from the backend.
 * @param {object} session - The user's session object, containing the access token.
 * @returns {object} An object containing the fetchTransactions function and the loading state.
 */
export function useFetchTransactions(session) {
  const [loading, setLoading] = useState(false);

  // --- 1. The function now accepts a single options object ---
  const fetchTransactions = useCallback(
    async (options) => {
      if (!session) {
        return null;
      }

      // --- 2. Destructure the options, defaulting isSilent to false ---
      const {
        page,
        limit,
        startDate,
        endDate,
        transNo = "",
        isSilent = false,
      } = options;

      // --- 3. Only set loading to true if the fetch is NOT silent ---
      if (!isSilent) {
        setLoading(true);
      }

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
        console.log("Fetching transactions with URL:", url);

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (response.ok) {
          return await response.json();
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
        // The loading state is always set to false when the operation finishes.
        if (!isSilent) {
          setLoading(false);
        }
      }
    },
    [session]
  );

  return { fetchTransactions, loading };
}

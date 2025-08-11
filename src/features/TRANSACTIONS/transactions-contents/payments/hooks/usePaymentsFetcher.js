import { useCallback } from "react";
import { useAuth } from "../../../../AUTHENTICATION/hooks/useAuth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to format Date objects into YYYY-MM-DD strings
const formatDate = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Custom hook to handle fetching paginated payment data from the backend.
 * @param {object} options - The options for the hook.
 * @param {function} options.onFilter - Callback function to handle the fetched data.
 * @param {function} options.setLoading - Function to set the loading state.
 * @returns {{fetchPayments: function}} - An object containing the fetchPayments function.
 */
export function usePaymentsFetcher({ onFilter, setLoading }) {
  const { session } = useAuth();

  const fetchPayments = useCallback(
    async (page, limit, range, transNo = "") => {
      if (!session) return;
      setLoading(true);
      try {
        const startDate = formatDate(range.from);
        const endDate = formatDate(range.to);

        const params = new URLSearchParams({ page, limit, startDate, endDate });
        if (transNo) {
          params.set("transactionNo", transNo);
        }

        const url = `${BACKEND_URL}/api/payments?${params.toString()}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (response.ok) {
          const filteredData = await response.json();
          onFilter(filteredData);
        } else {
          console.error("Failed to fetch payments from the server.");
        }
      } catch (error) {
        console.error(`Error fetching payments: ${error.message}`);
      } finally {
        setLoading(false);
      }
    },
    [session, onFilter, setLoading]
  );

  return { fetchPayments };
}

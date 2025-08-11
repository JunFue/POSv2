import { useCallback, useContext } from "react";
import { useAuth } from "../../../../AUTHENTICATION/hooks/useAuth";
import { PaymentContext } from "../../../../../context/PaymentContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to format Date objects into YYYY-MM-DD strings
const formatDate = (date) => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};

const getTodaysDateString = () => new Date().toISOString().split("T")[0];

export function usePaymentsFetcher({ setLoading }) {
  const { session } = useAuth();
  const { setTodaysPayments, setPaymentData } = useContext(PaymentContext);

  const fetchPayments = useCallback(
    async (page, limit, range, transNo = "") => {
      if (!session) return;
      setLoading(true);
      try {
        const startDate = formatDate(range.from);
        const endDate = formatDate(range.to);
        const isFetchingToday =
          startDate === getTodaysDateString() &&
          endDate === getTodaysDateString();

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
          if (isFetchingToday) {
            setTodaysPayments(filteredData.data);
          } else {
            setPaymentData(filteredData.data);
          }
          // The onFilter callback in PaymentsFilter will now just pass the whole response up
          return filteredData;
        } else {
          console.error("Failed to fetch payments from the server.");
          return { data: [], totalCount: 0 };
        }
      } catch (error) {
        console.error(`Error fetching payments: ${error.message}`);
        return { data: [], totalCount: 0 };
      } finally {
        setLoading(false);
      }
    },
    [session, setLoading, setTodaysPayments, setPaymentData]
  );

  return { fetchPayments };
}

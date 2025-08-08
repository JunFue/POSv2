import { useState } from "react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useFetchTransactions(session) {
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async (
    page,
    limit,
    startDate,
    endDate,
    transNo = ""
  ) => {
    if (!session) return null;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (transNo) {
        params.append("transactionNo", transNo);
      } else if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      }
      params.append("page", page);
      params.append("limit", limit);

      const url = `${BACKEND_URL}/api/transactions?${params.toString()}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error("Failed to fetch filtered data from the server.");
        return null;
      }
    } catch (error) {
      console.error(`Error fetching data: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchTransactions, loading, setLoading };
}

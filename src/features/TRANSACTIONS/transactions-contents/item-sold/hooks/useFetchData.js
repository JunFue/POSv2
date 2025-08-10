import { useCallback, useState } from "react";
import { useFetchTransactions } from "../useFetchTransactions";

export function useFetchData(
  session,
  setItemSold,
  setServerOnline,
  setTotalItems
) {
  const { fetchTransactions, loading } = useFetchTransactions(session);
  const [lastOptions, setLastOptions] = useState(null);

  const performFetch = useCallback(
    async (options) => {
      setLastOptions(options);
      const response = await fetchTransactions(options);
      if (response?.data) {
        setServerOnline(true);
        setItemSold(response.data);
        setTotalItems(response.totalCount || 0);
      } else {
        setServerOnline(false);
        setItemSold([]);
      }
    },
    [fetchTransactions, setItemSold, setServerOnline, setTotalItems]
  );

  return { performFetch, loading, lastOptions };
}

import { useMemo } from "react";
import { normalizeItemSold } from "../utils/normalizeItemSold";

export function useNormalizedItems(
  isViewingToday,
  todaysItemSold,
  itemSold,
  today
) {
  return useMemo(() => {
    const source = isViewingToday ? todaysItemSold : itemSold;
    const safe = Array.isArray(source) ? source : [];
    return safe.map((tx) => normalizeItemSold(tx, today));
  }, [isViewingToday, todaysItemSold, itemSold, today]);
}

import { useMemo } from "react";
import { normalizeItemSold } from "../utils/normalizeItemSold";

export function useNormalizedItems({ source }) {
  return useMemo(() => {
    if (!Array.isArray(source)) return [];

    return source.map((tx) => {
      return normalizeItemSold(tx);
    });
  }, [source]);
}

import { useMemo } from "react";
import { normalizeItemSold } from "../utils/normalizeItemSold";

export function useNormalizedItems({ source }) {
  return useMemo(() => {
    console.log("Source received in useNormalizedItems:", source);

    if (!Array.isArray(source)) return [];
    console.log("Mapping source:", source);
    return source.map((tx) => {
      console.log("Mapping tx:", tx);
      return normalizeItemSold(tx);
    });
  }, [source]);
}

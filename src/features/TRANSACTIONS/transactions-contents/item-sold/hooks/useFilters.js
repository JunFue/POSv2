import { useMemo } from "react";
import { useFilterState } from "./useFilterState";

import { useFilterWorker } from "../../../../../hooks/useFilterWorker";
import { getUniqueValues } from "../utils/getUniqueVales";

export function useFilters(data) {
  const itemNameFilter = useFilterState();
  const classificationFilter = useFilterState();

  const filteredData = useFilterWorker(
    data,
    itemNameFilter?.filter || "",
    classificationFilter?.filter || ""
  );

  const uniqueItemNames = useMemo(
    () => getUniqueValues(data, "itemName"),
    [data]
  );
  const uniqueClassifications = useMemo(
    () => getUniqueValues(data, "classification"),
    [data]
  );

  const closeAllDropdowns = () => {
    itemNameFilter?.closeDropdown?.();
    classificationFilter?.closeDropdown?.();
  };

  return {
    filteredData,
    itemNameFilter,
    classificationFilter,
    uniqueItemNames,
    uniqueClassifications,
    closeAllDropdowns,
  };
}

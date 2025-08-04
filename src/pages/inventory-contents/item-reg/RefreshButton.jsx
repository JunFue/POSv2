import React, { useContext, useState } from "react";
import { ItemRegData } from "../../../context/ItemRegContext";
import { clearItemsCache } from "../../../services/itemCacheService";

export const RefreshButton = () => {
  const { refreshItems, loading } = useContext(ItemRegData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing || loading) return;

    setIsRefreshing(true);
    // As requested, first clear the local cache
    clearItemsCache();
    // Then call the refresh function from the context
    await refreshItems();
    setIsRefreshing(false);
  };

  return (
    <div className="flex justify-center my-4">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing || loading}
        className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isRefreshing || loading ? "Refreshing..." : "Refresh Data"}
      </button>
    </div>
  );
};

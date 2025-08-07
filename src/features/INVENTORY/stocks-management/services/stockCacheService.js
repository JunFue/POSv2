const CACHE_KEY = "stocksData";

/**
 * Saves the stock records to localStorage.
 * @param {Array} stocks - The array of stock records to cache.
 */
export const saveStocksToCache = (stocks) => {
  try {
    const dataToCache = JSON.stringify(stocks);
    localStorage.setItem(CACHE_KEY, dataToCache);
  } catch (error) {
    console.error("Failed to save stocks to cache", error);
  }
};

/**
 * Loads stock records from localStorage.
 * @returns {Array | null} The cached records or null if none exist.
 */
export const loadStocksFromCache = () => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error("Failed to load stocks from cache", error);
    return null;
  }
};

/**
 * Clears the stock records from localStorage.
 */
export const clearStocksCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error("Failed to clear stocks cache", error);
  }
};

// src/services/itemCacheService.js

// --- CONSTANTS ---
// By centralizing the key and version, we ensure consistency across the app.
const CACHE_KEY = "itemRegistrationData";
const CACHE_VERSION = "1.0"; // Increment this version to invalidate old caches on deployment.

/**
 * Saves item data to localStorage with a version and timestamp.
 * This function is self-contained and has no dependencies on React components.
 *
 * @param {Array} items - The array of items to cache.
 * @param {number} timestamp - The server timestamp associated with this data.
 */
export const saveItemsToCache = (items, timestamp) => {
  try {
    const cacheData = {
      version: CACHE_VERSION,
      timestamp: timestamp,
      value: items,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    // This can happen if localStorage is full or disabled.
    console.error("Failed to save data to cache:", error);
  }
};

/**
 * Loads item data from localStorage.
 * It performs a critical check to ensure the cache version matches the
 * application's expected version, preventing bugs from outdated data structures.
 *
 * @returns {Object|null} The cached data { value, timestamp } or null if not found or invalid.
 */
export const loadItemsFromCache = () => {
  try {
    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (!cachedItem) {
      return null;
    }

    const data = JSON.parse(cachedItem);

    // --- Cache Invalidation Logic ---
    // If the cache doesn't have a version or the version doesn't match,
    // it's considered stale. We remove it to prevent the app from using it.
    if (data.version !== CACHE_VERSION) {
      console.warn(
        `Old cache version detected (found ${data.version}, expected ${CACHE_VERSION}). Discarding cache.`
      );
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return { value: data.value, timestamp: data.timestamp };
  } catch (error) {
    // This can happen if the data in localStorage is corrupted.
    console.error("Failed to read or parse data from cache:", error);
    // Clear the corrupted cache to prevent future errors.
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

/**
 * Clears the item cache from localStorage.
 * Useful for logout procedures or manual cache clearing.
 */
export const clearItemsCache = () => {
  localStorage.removeItem(CACHE_KEY);
};

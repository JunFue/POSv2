// src/services/mutationQueueService.js

// --- CONSTANTS ---
const QUEUE_KEY = "mutationQueue";

/**
 * Retrieves the mutation queue from localStorage.
 * @returns {Array} The array of queued mutations.
 */
const getQueue = () => {
  try {
    const queueJson = localStorage.getItem(QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error("Error reading mutation queue:", error);
    return [];
  }
};

/**
 * Saves the mutation queue to localStorage.
 * @param {Array} queue - The queue array to save.
 */
const saveQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Error saving mutation queue:", error);
  }
};

/**
 * Adds a new mutation to the end of the queue.
 * A mutation should be an object with a 'type' and 'payload'.
 * e.g., { type: 'CREATE_ITEM', payload: { ...itemData } }
 *
 * @param {object} mutation - The mutation object to add.
 */
export const addToQueue = (mutation) => {
  const queue = getQueue();
  queue.push(mutation);
  saveQueue(queue);
};

/**
 * Returns the entire mutation queue.
 * @returns {Array} The array of queued mutations.
 */
export const getFullQueue = () => {
  return getQueue();
};

/**
 * Clears the entire mutation queue from localStorage.
 * This should be called after the queue has been successfully processed.
 */
export const clearQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};

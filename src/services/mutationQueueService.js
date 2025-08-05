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
 */
export const clearQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};

/**
 * Processes the queued mutations by calling the provided API functions.
 * This function is now exported to be used by our synchronization hook.
 * @param {{ registerItem: Function, deleteItem: Function }} api - An object with the API functions to execute.
 */
export const processMutationQueue = async (api) => {
  const { registerItem, deleteItem } = api;
  const queuedMutations = getFullQueue();

  if (queuedMutations.length === 0) {
    return; // Nothing to do
  }

  console.log(`Processing ${queuedMutations.length} queued mutations.`);

  for (const mutation of queuedMutations) {
    try {
      if (mutation.type === "CREATE_ITEM") {
        await registerItem(mutation.payload);
      }
      if (mutation.type === "DELETE_ITEM") {
        await deleteItem(mutation.payload.barcode);
      }
    } catch (error) {
      console.error("Failed to process a queued mutation:", error);
      // If one mutation fails, we stop and throw an error to prevent
      // further actions from running out of order. The queue is NOT cleared.
      throw new Error("Mutation processing failed");
    }
  }

  // If all mutations succeed, clear the queue.
  clearQueue();
  console.log("Mutation queue successfully processed and cleared.");
};

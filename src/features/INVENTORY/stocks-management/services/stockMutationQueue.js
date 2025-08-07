const QUEUE_KEY = "stockMutationQueue";

/**
 * Adds a mutation (CREATE, UPDATE, DELETE) to the offline queue.
 * @param {object} mutation - The mutation object { type, payload }.
 */
export const addToStockQueue = (mutation) => {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  queue.push(mutation);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

/**
 * Processes all mutations in the queue.
 * @param {object} api - An object containing the API functions { addStockRecord, updateStockRecord, deleteStockRecord }.
 */
export const processStockMutationQueue = async (api) => {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  if (queue.length === 0) return;

  console.log(`Processing ${queue.length} queued stock mutations.`);

  for (const mutation of queue) {
    try {
      switch (mutation.type) {
        case "CREATE":
          await api.addStockRecord(mutation.payload);
          break;
        case "UPDATE":
          await api.updateStockRecord(mutation.payload);
          break;
        case "DELETE":
          await api.deleteStockRecord(mutation.payload.id);
          break;
        default:
          console.warn(`Unknown mutation type: ${mutation.type}`);
      }
    } catch (error) {
      console.error(`Failed to process mutation: ${mutation.type}`, error);
      // If a mutation fails, stop processing to maintain order.
      // The failed mutation remains in the queue for the next attempt.
      return;
    }
  }

  // If all mutations were successful, clear the queue.
  clearStockQueue();
  console.log("Stock mutation queue processed successfully.");
};

/**
 * Clears the mutation queue from localStorage.
 */
export const clearStockQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};

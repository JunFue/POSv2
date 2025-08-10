/**
 * Normalizes a transaction object to ensure all required fields are present
 * and data types are correct for the table.
 * @param {object} tx - The raw transaction object from the API.
 * @returns {object|null} A normalized object ready for the table, or null if input is invalid.
 */
export function normalizeItemSold(tx) {
  try {
    // Check if the input is a valid object
    if (!tx || typeof tx !== "object") {
      console.error("Invalid input to normalizeItemSold:", tx);
      return null;
    }

    // The raw data from the server has all the fields we need.
    // This function will now ensure the data types are correct and pass all fields through.
    return {
      // Direct pass-through fields
      barcode: tx.barcode,
      itemName: tx.itemName,
      transactionDate: tx.transactionDate,
      transactionNo: tx.transactionNo,
      inCharge: tx.inCharge,
      customer: tx.customer, // Corrected from 'costumer'
      classification: tx.classification,

      // Fields that need type conversion to Number
      price: Number(tx.price) || 0,
      quantity: Number(tx.quantity) || 0,
      totalPrice: Number(tx.totalPrice) || 0,
    };
  } catch (e) {
    console.error("Error in normalizeItemSold:", e, "Original item:", tx);
    return null; // Return null on error to prevent crashes
  }
}

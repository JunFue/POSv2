export function normalizeItemSold(tx, today) {
  return {
    barcode: tx.barcode || "",
    itemName: tx.itemName || "",
    price: parseFloat(tx.price || 0),
    quantity: parseInt(tx.quantity || 0, 10),
    totalPrice: parseFloat(tx.totalPrice || 0),
    transactionDate: tx.transactionDate || today,
    transactionNo: tx.transactionNo || "—",
    inCharge: tx.inCharge || "—",
    costumer: tx.costumer || "Walk-in",
    classification: tx.classification || "General",
  };
}

// Dummy data for today's sales table (can be used elsewhere in the app)
export const salesTodayData = [
  { id: 1, item: "Product A", unitsSold: 10, totalSales: 1500 },
  { id: 2, item: "Product B", unitsSold: 5, totalSales: 2500 },
  { id: 3, item: "Service X", unitsSold: 2, totalSales: 5000 },
  { id: 4, item: "Product C", unitsSold: 12, totalSales: 600 },
];

// Dummy data for the monthly log table, representing 31 days
export const monthlyLogData = Array.from({ length: 31 }, (_, i) => ({
  id: i + 1,
  date: `July ${i + 1}, 2025`,
  forwarded: 10000 + i * 500,
  cashIn: Math.floor(Math.random() * 5000) + 1000,
  cashOut: Math.floor(Math.random() * 2000),
  get balance() {
    return this.forwarded + this.cashIn - this.cashOut;
  },
}));

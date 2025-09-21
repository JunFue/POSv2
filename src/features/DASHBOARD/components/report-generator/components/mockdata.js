/**
 * This file contains mock financial data for two different categories.
 * It's used to populate the report components for demonstration purposes.
 */

// Helper function to generate random daily cash flow data for a 30-day period.
const generateDailyData = () => {
  const data = [];
  for (let i = 1; i <= 30; i++) {
    const cashIn = Math.random() > 0.3 ? Math.random() * 2000 : 0;
    const cashOut = Math.random() > 0.8 ? Math.random() * 750 : 0;
    data.push({ day: i, cashIn, cashOut });
  }
  return data;
};

// Mock data for the first category.
export const cat1Data = {
  initialSales: 85000,
  topSellingItem: "Product A",
  initialCashFlow: 55000,
  expenseData: {
    labels: ["Rent", "Salaries", "Supplies", "Utilities"],
    values: [10000, 12000, 5000, 3000],
  },
  dailyData: generateDailyData(),
  startingBalance: 25000,
};

// Mock data for the second category.
export const cat2Data = {
  initialSales: 72000,
  topSellingItem: "Service B",
  initialCashFlow: 47000,
  expenseData: {
    labels: ["Marketing", "Transport", "Supplies", "Utilities"],
    values: [8000, 7000, 6000, 4000],
  },
  dailyData: generateDailyData(),
  startingBalance: 18500,
};

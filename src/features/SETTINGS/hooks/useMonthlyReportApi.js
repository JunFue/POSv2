// This is a placeholder API module.
// In a real application, you would replace the setTimeout calls
// with actual fetch requests to your backend.

const fetchTableOneData = async (range, token) => {
  console.log(
    "Fetching data for Table One with range:",
    range,
    "and token:",
    token
  );
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  // Return mock data
  return [
    { id: 1, name: "Item A", sales: 150 },
    { id: 2, name: "Item B", sales: 250 },
  ];
};

const fetchTableTwoData = async (range, token) => {
  console.log(
    "Fetching data for Table Two with range:",
    range,
    "and token:",
    token
  );
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));
  // Return mock data
  return [
    { id: 1, category: "Food", expenses: 120 },
    { id: 2, category: "Supplies", expenses: 80 },
  ];
};

export const fetchMonthlyReportApi = async (range, token) => {
  // Use Promise.all to fetch data from both tables concurrently
  const [tableOneData, tableTwoData] = await Promise.all([
    fetchTableOneData(range, token),
    fetchTableTwoData(range, token),
  ]);

  return { tableOneData, tableTwoData };
};

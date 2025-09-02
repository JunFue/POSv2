import { format } from "date-fns";

// Helper to format date objects into 'YYYY-MM-DD' strings for the API query
const toApiDateString = (date) => {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
};

export const fetchMonthlyReportApi = async (range, token) => {
  const { from, to } = range;

  // Construct the URL with query parameters for the date range
  const startDate = toApiDateString(from);
  const endDate = toApiDateString(to);

  // Use import.meta.env for Vite and match the variable from your .env file
  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const url = `${API_BASE_URL}/api/monthly-report?startDate=${startDate}&endDate=${endDate}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // The token is sent in the header for authentication
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If the server response is not OK (e.g., 401, 500), throw an error
      const errorData = await response.json();
      throw new Error(errorData.msg || "Failed to fetch report data.");
    }

    const data = await response.json();

    // The backend returns an object with `transactions` and `cashouts` properties
    // We rename them here to match the original placeholder structure
    return {
      tableOneData: data.transactions,
      tableTwoData: data.cashouts,
    };
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    // Re-throw the error so it can be caught by the calling function in the context
    throw error;
  }
};

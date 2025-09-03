import { format } from "date-fns";

const toApiDateString = (date) => {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
};

export const fetchMonthlyReportApi = async (range, token) => {
  const { from, to } = range;
  const startDate = toApiDateString(from);
  const endDate = toApiDateString(to);

  const API_URL = import.meta.env.VITE_BACKEND_URL || "";
  // --- FIX: Added /api to the URL path ---
  const url = `${API_URL}/api/monthly-report?startDate=${startDate}&endDate=${endDate}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Failed to fetch report data.");
    }

    const data = await response.json();

    return {
      tableOneData: data.transactions,
      tableTwoData: data.cashouts,
      paymentsData: data.payments,
    };
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    throw error;
  }
};

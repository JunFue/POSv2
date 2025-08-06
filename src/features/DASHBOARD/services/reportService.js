import { format } from "date-fns";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_BASE_URL = `${BACKEND_URL}/api/reports`;

/**
 * A helper function to handle authenticated fetch requests.
 * @param {string} endpoint - The API endpoint to call.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<any>} The JSON response from the API.
 */
const apiFetch = async (endpoint, token) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    // Attempt to get more specific error info from the response body
    const errorBody = await response.text();
    console.error("API Error Response:", errorBody);
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

/**
 * Fetches the total expenses for a given date range.
 * @param {string} token - The user's auth token.
 * @param {object} range - An object with 'from' and 'to' Date objects.
 * @returns {Promise<object>} The total expenses data.
 */
export const getMonthlyTotalExpenses = async (token, range) => {
  if (!token || !range.from || !range.to) return { totalExpenses: 0 };
  const startDate = format(range.from, "yyyy-MM-dd");
  const endDate = format(range.to, "yyyy-MM-dd");
  return await apiFetch(
    `/total-expenses-range?startDate=${startDate}&endDate=${endDate}`,
    token
  );
};

/**
 * Fetches the expense breakdown by category for a given date range.
 * @param {string} token - The user's auth token.
 * @param {object} range - An object with 'from' and 'to' Date objects.
 * @returns {Promise<Array>} The expense breakdown data.
 */
export const getMonthlyBreakdown = async (token, range) => {
  if (!token || !range.from || !range.to) return [];
  const startDate = format(range.from, "yyyy-MM-dd");
  const endDate = format(range.to, "yyyy-MM-dd");
  return await apiFetch(
    `/expense-breakdown-range?startDate=${startDate}&endDate=${endDate}`,
    token
  );
};

/**
 * Fetches all cashout records for a single day.
 * @param {string} token - The user's auth token.
 * @param {Date} date - The date to fetch records for.
 * @returns {Promise<Array>} A list of cashout records.
 */
export const getDailyCashouts = async (token, date) => {
  if (!token) return [];
  const formattedDate = format(date, "yyyy-MM-dd");
  return await apiFetch(`/cashouts-by-date?date=${formattedDate}`, token);
};

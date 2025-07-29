import { supabase } from "../utils/supabaseClient";
import { format } from "date-fns";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api/flash-info`;

/**
 * A helper function to get the user's auth token.
 */
const getAuthToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated.");
  return session.access_token;
};

/**
 * A generic fetch function for the dashboard API endpoints.
 * @param {string} endpoint - The specific API endpoint to call.
 */
const apiFetch = async (endpoint) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json();
};

/**
 * Fetches today's gross sales.
 */
export const getTodaysGrossSales = () => {
  const today = new Date().toISOString().slice(0, 10);
  return apiFetch(`today-gross-sales?date=${today}`);
};

/**
 * Fetches today's net income.
 */
export const getDailyIncome = () => {
  const today = new Date().toISOString().slice(0, 10);
  return apiFetch(`today-daily-income?date=${today}`);
};

/**
 * Fetches today's total expenses.
 */
export const getDailyExpenses = () => {
  const today = new Date().toISOString().slice(0, 10);
  return apiFetch(`today-daily-expenses?date=${today}`);
};

/**
 * Fetches net income for a given date range.
 * @param {object} range - An object with `from` and `to` date properties.
 */
export const getMonthlyIncome = (range) => {
  const startDate = format(range.from, "yyyy-MM-dd");
  const endDate = format(range.to, "yyyy-MM-dd");
  return apiFetch(`net-income-range?startDate=${startDate}&endDate=${endDate}`);
};

/**
 * Fetches items that are low in stock.
 * @param {number} limit - The number of items to fetch.
 */
export const getLowStocks = (limit) => {
  return apiFetch(`low-stocks?limit=${limit}`);
};

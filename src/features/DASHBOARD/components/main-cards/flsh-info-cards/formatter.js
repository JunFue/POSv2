/**
 * A simple utility function for formatting numbers as PHP currency.
 * Using a plain function instead of a hook can resolve complex
 * dependency issues in production builds.
 */
export const formatCurrency = (value) => {
  // Guard against non-numeric inputs to prevent errors.
  if (typeof value !== "number" || isNaN(value)) {
    // Return a default formatted value for zero or invalid input
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(0);
  }
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
};

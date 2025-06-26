// --- useAuth.js ---
// This new conceptual file contains only the custom hook.

import { useContext } from "react";

// Custom hook for consuming the auth context
export function useAuth() {
  return useContext(AuthContext);
}

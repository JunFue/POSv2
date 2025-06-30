import { useState } from "react";

export function useToggleSwitch() {
  const [on, setOn] = useState(false);
  return [on, setOn]; // ✅ Proper return syntax
}

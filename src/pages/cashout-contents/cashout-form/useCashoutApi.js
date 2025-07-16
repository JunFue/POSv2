import { useAuth } from "../../../features/pos-features/authentication/hooks/Useauth";

/**
 * Custom hook to manage API interactions for cashouts using a robust
 * optimistic UI + refetch pattern.
 * @param {object} props
 * @param {function} props.onAddCashout - Callback to add a temporary record to the UI.
 * @param {function} props.updateCashoutStatus - Callback to update the record on success.
 * @param {function} props.setCashoutFailed - Callback to handle a failed submission.
 * @returns {{addCashout: function}} - Function to trigger the cashout submission.
 */
export function useCashoutApi({
  onAddCashout,
  updateCashoutStatus,
  setCashoutFailed,
}) {
  const { session } = useAuth();

  const addCashout = async (data, selection) => {
    if (!selection || !selection.date) {
      alert(
        "Please select a single date from the calendar to record a cashout."
      );
      return;
    }

    // Manually format the date to YYYY-MM-DD to avoid timezone issues.
    const date = selection.date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    const tempId = `temp-${Date.now()}`;
    const payload = {
      ...data,
      cashout_date: formattedDate,
    };

    // 1. Optimistically add the new cashout to the UI with a "pending" status.
    // FIX: Check if the function exists before calling it.
    if (typeof onAddCashout === "function") {
      onAddCashout({ ...payload, id: tempId, status: "pending" });
    }

    try {
      if (!session) throw new Error("Not authenticated");

      const response = await fetch("http://localhost:3000/api/cashout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const savedRecord = await response.json();
      // 2. On success, call the update callback to replace the temp record.
      // FIX: Check if the function exists before calling it.
      if (typeof updateCashoutStatus === "function") {
        updateCashoutStatus(tempId, savedRecord);
      }
    } catch (error) {
      console.error("Failed to save cashout:", error);
      // 3. On failure, notify the parent to handle the failed optimistic update.
      // FIX: Check if the function exists before calling it.
      if (typeof setCashoutFailed === "function") {
        setCashoutFailed(tempId);
      }
    }
  };

  return { addCashout };
}
